"use client";

import { CreditCard, DollarSign } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentFormProps {
	bookingId: string;
	amount: number;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function PaymentForm({ bookingId, amount, onSuccess, onCancel }: PaymentFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState<"stripe" | "razorpay">("stripe");
	const cardNumberId = useId();
	const expiryId = useId();
	const cvvId = useId();

	const handlePayment = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/payments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					bookingId,
					amount,
					paymentMethod,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				console.log("Payment successful:", data);
				onSuccess?.();
			} else {
				console.error("Payment failed:", data.error);
			}
		} catch (error) {
			console.error("Payment error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CreditCard className="h-5 w-5" />
					Payment
				</CardTitle>
				<CardDescription>Complete your booking payment</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-2 text-lg font-semibold">
					<DollarSign className="h-5 w-5" />
					<span>${amount.toFixed(2)}</span>
				</div>

				<div className="space-y-2">
					<Label>Payment Method</Label>
					<div className="flex gap-2">
						<Button
							type="button"
							variant={paymentMethod === "stripe" ? "default" : "outline"}
							onClick={() => setPaymentMethod("stripe")}
							className="flex-1"
						>
							Stripe
						</Button>
						<Button
							type="button"
							variant={paymentMethod === "razorpay" ? "default" : "outline"}
							onClick={() => setPaymentMethod("razorpay")}
							className="flex-1"
						>
							Razorpay
						</Button>
					</div>
				</div>

				<div className="space-y-4 p-4 bg-gray-50 rounded-lg">
					<div className="space-y-2">
						<Label htmlFor={cardNumberId}>Card Number</Label>
						<Input id={cardNumberId} placeholder="1234 5678 9012 3456" disabled />
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor={expiryId}>Expiry</Label>
							<Input id={expiryId} placeholder="MM/YY" disabled />
						</div>
						<div className="space-y-2">
							<Label htmlFor={cvvId}>CVV</Label>
							<Input id={cvvId} placeholder="123" disabled />
						</div>
					</div>
					<p className="text-xs text-gray-500">
						This is a placeholder form. In production, use actual payment provider SDKs.
					</p>
				</div>

				<div className="flex gap-4">
					<Button onClick={handlePayment} disabled={isLoading} className="flex-1">
						{isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
					</Button>
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
