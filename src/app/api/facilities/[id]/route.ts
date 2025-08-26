import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { UpdateFacilitySchema } from "@/models/Facility";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

		if (!ObjectId.isValid(id)) {
			return NextResponse.json({ error: "Invalid facility ID" }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db();

		const facility = await db.collection("facilities").findOne({ _id: new ObjectId(id) });

		if (!facility) {
			return NextResponse.json({ error: "Facility not found" }, { status: 404 });
		}

		return NextResponse.json({ facility });
	} catch (error) {
		console.error("Error fetching facility:", error);
		return NextResponse.json({ error: "Failed to fetch facility" }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || session.user?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
		}

		const { id } = await params;

		if (!ObjectId.isValid(id)) {
			return NextResponse.json({ error: "Invalid facility ID" }, { status: 400 });
		}

		const body = await request.json();
		const validatedData = UpdateFacilitySchema.parse(body);

		const client = await clientPromise;
		const db = client.db();

		const updateData = {
			...validatedData,
			updatedAt: new Date(),
		};

		const result = await db
			.collection("facilities")
			.updateOne({ _id: new ObjectId(id) }, { $set: updateData });

		if (result.matchedCount === 0) {
			return NextResponse.json({ error: "Facility not found" }, { status: 404 });
		}

		return NextResponse.json({ message: "Facility updated successfully" });
	} catch (error) {
		console.error("Error updating facility:", error);
		return NextResponse.json({ error: "Failed to update facility" }, { status: 500 });
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || session.user?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
		}

		const { id } = await params;

		if (!ObjectId.isValid(id)) {
			return NextResponse.json({ error: "Invalid facility ID" }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db();

		const result = await db.collection("facilities").deleteOne({ _id: new ObjectId(id) });

		if (result.deletedCount === 0) {
			return NextResponse.json({ error: "Facility not found" }, { status: 404 });
		}

		return NextResponse.json({ message: "Facility deleted successfully" });
	} catch (error) {
		console.error("Error deleting facility:", error);
		return NextResponse.json({ error: "Failed to delete facility" }, { status: 500 });
	}
}
