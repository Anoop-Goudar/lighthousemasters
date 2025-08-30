import { type Document, ObjectId, type WithId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { CreateNotificationSchema } from "@/models/Notification";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const limit = parseInt(searchParams.get("limit") || "20", 10);
		const skip = parseInt(searchParams.get("skip") || "0", 10);

		const client = await clientPromise;
		const db = client.db();

		const dbUser = await db.collection("users").findOne({ email: session.user.email });
		if (!dbUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const query: Record<string, unknown> = { userId: dbUser._id.toString() };

		if (status && ["read", "unread"].includes(status)) {
			query.status = status;
		}

		query.$or = [
			{ expiresAt: { $exists: false } },
			{ expiresAt: null },
			{ expiresAt: { $gt: new Date() } },
		];

		const notifications = await db
			.collection("notifications")
			.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.toArray();

		const unreadCount = await db.collection("notifications").countDocuments({
			userId: session.user.id,
			status: "unread",
			$or: [
				{ expiresAt: { $exists: false } },
				{ expiresAt: null },
				{ expiresAt: { $gt: new Date() } },
			],
		});

		return NextResponse.json({
			notifications,
			unreadCount,
			total: notifications.length,
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!["coach", "admin"].includes(session.user.role)) {
			return NextResponse.json(
				{ error: "Unauthorized - Coach or Admin access required" },
				{ status: 403 }
			);
		}

		const body = await request.json();
		const validatedData = CreateNotificationSchema.parse(body);

		const client = await clientPromise;
		const db = client.db();

		let targetUser: WithId<Document> | null = null;
		try {
			targetUser = await db.collection("users").findOne({
				_id: new ObjectId(validatedData.userId),
			});
		} catch {
			targetUser = await db.collection("users").findOne({
				email: validatedData.userId,
			});
		}

		if (!targetUser) {
			return NextResponse.json({ error: "Target user not found" }, { status: 404 });
		}

		const notificationUserId = targetUser._id.toString();

		const notification = {
			...validatedData,
			userId: notificationUserId,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await db.collection("notifications").insertOne(notification);

		return NextResponse.json(
			{
				message: "Notification created successfully",
				notificationId: result.insertedId,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating notification:", error);
		return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
	}
}
