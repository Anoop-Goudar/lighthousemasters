import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { UpdateBookingSchema } from "@/models/Booking";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		if (!ObjectId.isValid(id)) {
			return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db();

		const booking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });

		if (!booking) {
			return NextResponse.json({ error: "Booking not found" }, { status: 404 });
		}

		if (session.user.role !== "admin" && booking.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Unauthorized - Cannot access this booking" },
				{ status: 403 }
			);
		}

		return NextResponse.json({ booking });
	} catch (error) {
		console.error("Error fetching booking:", error);
		return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		if (!ObjectId.isValid(id)) {
			return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db();

		const existingBooking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });

		if (!existingBooking) {
			return NextResponse.json({ error: "Booking not found" }, { status: 404 });
		}

		if (session.user.role !== "admin" && existingBooking.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Unauthorized - Cannot update this booking" },
				{ status: 403 }
			);
		}

		const body = await request.json();
		const validatedData = UpdateBookingSchema.parse(body);

		const updateData = {
			...validatedData,
			updatedAt: new Date(),
		};

		await db.collection("bookings").updateOne({ _id: new ObjectId(id) }, { $set: updateData });

		return NextResponse.json({ message: "Booking updated successfully" });
	} catch (error) {
		console.error("Error updating booking:", error);
		return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		if (!ObjectId.isValid(id)) {
			return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db();

		const existingBooking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });

		if (!existingBooking) {
			return NextResponse.json({ error: "Booking not found" }, { status: 404 });
		}

		if (session.user.role !== "admin" && existingBooking.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Unauthorized - Cannot cancel this booking" },
				{ status: 403 }
			);
		}

		await db.collection("bookings").updateOne(
			{ _id: new ObjectId(id) },
			{
				$set: {
					status: "cancelled",
					updatedAt: new Date(),
				},
			}
		);

		return NextResponse.json({ message: "Booking cancelled successfully" });
	} catch (error) {
		console.error("Error cancelling booking:", error);
		return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
	}
}
