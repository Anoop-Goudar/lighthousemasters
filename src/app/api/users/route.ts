import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
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

		const client = await clientPromise;
		const db = client.db();

		const users = await db
			.collection("users")
			.find({}, { projection: { _id: 1, name: 1, email: 1, role: 1 } })
			.toArray();

		return NextResponse.json({ users });
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || session.user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
		}

		const body = await request.json();
		const { userId, role } = body;

		if (!userId || !role || !["student", "coach", "parent", "admin"].includes(role)) {
			return NextResponse.json({ error: "Invalid userId or role" }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db();

		const result = await db
			.collection("users")
			.updateOne({ _id: new ObjectId(userId) }, { $set: { role, updatedAt: new Date() } });

		if (result.matchedCount === 0) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ message: "User role updated successfully" });
	} catch (error) {
		console.error("Error updating user role:", error);
		return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
	}
}
