import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { CreateBookingSchema } from "@/models/Booking";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const facilityId = searchParams.get("facilityId");
		const userId = searchParams.get("userId");

		const client = await clientPromise;
		const db = client.db();

		const query: Record<string, string> = {};

		if (session.user.role === "admin") {
			if (facilityId) query.facilityId = facilityId;
			if (userId) query.userId = userId;
		} else {
			query.userId = session.user.id;
			if (facilityId) query.facilityId = facilityId;
		}

		const bookings = await db.collection("bookings").find(query).toArray();

		return NextResponse.json({ bookings });
	} catch (error) {
		console.error("Error fetching bookings:", error);
		return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = CreateBookingSchema.parse({
			...body,
			userId: session.user.id,
		});

		const client = await clientPromise;
		const db = client.db();

		const facility = await db
			.collection("facilities")
			.findOne({ _id: new ObjectId(validatedData.facilityId) });
		if (!facility) {
			return NextResponse.json({ error: "Facility not found" }, { status: 404 });
		}

		const conflictingBooking = await db.collection("bookings").findOne({
			facilityId: validatedData.facilityId,
			status: { $in: ["pending", "confirmed"] },
			$or: [
				{
					startTime: { $lt: validatedData.endTime },
					endTime: { $gt: validatedData.startTime },
				},
			],
		});

		if (conflictingBooking) {
			return NextResponse.json({ error: "Time slot is already booked" }, { status: 409 });
		}

		const booking = {
			...validatedData,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await db.collection("bookings").insertOne(booking);

		return NextResponse.json(
			{
				message: "Booking created successfully",
				bookingId: result.insertedId,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating booking:", error);
		return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
	}
}
