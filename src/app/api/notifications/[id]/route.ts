import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		if (!ObjectId.isValid(id)) {
			return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
		}

		const body = await request.json();
		const { status } = body;

		if (!["read", "unread"].includes(status)) {
			return NextResponse.json(
				{ error: "Invalid status. Must be 'read' or 'unread'" },
				{ status: 400 }
			);
		}

		const client = await clientPromise;
		const db = client.db();

		const dbUser = await db.collection("users").findOne({ email: session.user.email });
		if (!dbUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const notification = await db.collection("notifications").findOne({
			_id: new ObjectId(id),
			userId: dbUser._id.toString(),
		});

		if (!notification) {
			return NextResponse.json({ error: "Notification not found" }, { status: 404 });
		}

		await db.collection("notifications").updateOne(
			{ _id: new ObjectId(id) },
			{
				$set: {
					status,
					updatedAt: new Date(),
				},
			}
		);

		return NextResponse.json({
			message: "Notification updated successfully",
		});
	} catch (error) {
		console.error("Error updating notification:", error);
		return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		if (!ObjectId.isValid(id)) {
			return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db();

		const dbUser = await db.collection("users").findOne({ email: session.user.email });
		if (!dbUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const query: Record<string, unknown> = { _id: new ObjectId(id) };

		if (session.user.role !== "admin") {
			query.userId = dbUser._id.toString();
		}

		const result = await db.collection("notifications").deleteOne(query);

		if (result.deletedCount === 0) {
			return NextResponse.json({ error: "Notification not found" }, { status: 404 });
		}

		return NextResponse.json({
			message: "Notification deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting notification:", error);
		return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
	}
}
