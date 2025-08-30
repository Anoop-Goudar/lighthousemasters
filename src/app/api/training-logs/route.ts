import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { CreateTrainingLogSchema } from "@/models/TrainingLog";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");
		const coachId = searchParams.get("coachId");

		const client = await clientPromise;
		const db = client.db();

		const query: Record<string, unknown> = {};

		if (session.user.role === "admin") {
			if (userId) query.userId = userId;
			if (coachId) query.coachId = coachId;
		} else if (session.user.role === "coach") {
			query.$or = [{ coachId: session.user.id }, { userId: session.user.id }];
			if (userId) query.userId = userId;
		} else {
			query.userId = session.user.id;
		}

		const trainingLogs = await db
			.collection("trainingLogs")
			.find(query)
			.sort({ createdAt: -1 })
			.toArray();

		return NextResponse.json({ trainingLogs });
	} catch (error) {
		console.error("Error fetching training logs:", error);
		return NextResponse.json({ error: "Failed to fetch training logs" }, { status: 500 });
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
		const validatedData = CreateTrainingLogSchema.parse({
			...body,
			sessionDate: new Date(body.sessionDate), // Convert string to Date for Zod validation
			coachId: session.user.id, // Ensure log is created by the authenticated coach
		});

		const client = await clientPromise;
		const db = client.db();

		const user = await db.collection("users").findOne({ _id: new ObjectId(validatedData.userId) });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const trainingLog = {
			...validatedData,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await db.collection("trainingLogs").insertOne(trainingLog);

		return NextResponse.json(
			{
				message: "Training log created successfully",
				trainingLogId: result.insertedId,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating training log:", error);
		return NextResponse.json({ error: "Failed to create training log" }, { status: 500 });
	}
}
