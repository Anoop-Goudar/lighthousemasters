import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { CreateFacilitySchema } from "@/models/Facility";

export async function GET() {
	try {
		const client = await clientPromise;
		const db = client.db();

		const facilities = await db.collection("facilities").find({}).toArray();

		return NextResponse.json({ facilities });
	} catch (error) {
		console.error("Error fetching facilities:", error);
		return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || session.user?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
		}

		const body = await request.json();
		const validatedData = CreateFacilitySchema.parse(body);

		const client = await clientPromise;
		const db = client.db();

		const facility = {
			...validatedData,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await db.collection("facilities").insertOne(facility);

		return NextResponse.json(
			{
				message: "Facility created successfully",
				facilityId: result.insertedId,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating facility:", error);
		return NextResponse.json({ error: "Failed to create facility" }, { status: 500 });
	}
}
