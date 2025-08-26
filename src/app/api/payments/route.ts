import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { bookingId, amount, currency = "USD", paymentMethod = "stripe" } = body;

		if (!bookingId || !amount) {
			return NextResponse.json(
				{ error: "Missing required fields: bookingId, amount" },
				{ status: 400 }
			);
		}

		if (paymentMethod === "stripe") {
			const paymentIntent = {
				id: `pi_${Date.now()}`,
				amount: amount * 100,
				currency: currency.toLowerCase(),
				status: "succeeded",
				client_secret: `pi_${Date.now()}_secret_mock`,
			};

			return NextResponse.json({
				success: true,
				paymentIntent,
				message: "Payment processed successfully (Stripe placeholder)",
			});
		} else if (paymentMethod === "razorpay") {
			const order = {
				id: `order_${Date.now()}`,
				amount: amount * 100,
				currency: currency.toUpperCase(),
				status: "paid",
				receipt: `receipt_${bookingId}`,
			};

			return NextResponse.json({
				success: true,
				order,
				message: "Payment processed successfully (Razorpay placeholder)",
			});
		} else {
			return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
		}
	} catch (error) {
		console.error("Error processing payment:", error);
		return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const mockPayments = [
			{
				id: "pay_123",
				bookingId: "booking_456",
				amount: 50.0,
				currency: "USD",
				status: "completed",
				createdAt: new Date().toISOString(),
			},
		];

		return NextResponse.json({ payments: mockPayments });
	} catch (error) {
		console.error("Error fetching payments:", error);
		return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
	}
}
