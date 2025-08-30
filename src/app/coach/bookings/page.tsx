"use client";

import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Booking } from "@/models/Booking";

interface BookingWithDetails extends Booking {
	facilityName?: string;
	userName?: string;
}

export default function CoachBookingsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
		if (!["coach", "admin"].includes(session?.user?.role || "")) {
			router.push("/unauthorized");
		}
	}, [session, status, router]);

	useEffect(() => {
		const fetchBookings = async () => {
			try {
				const response = await fetch("/api/bookings");
				const data = await response.json();
				setBookings(data.bookings || []);
			} catch (error) {
				console.error("Error fetching bookings:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (["coach", "admin"].includes(session?.user?.role || "")) {
			fetchBookings();
		}
	}, [session]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			case "completed":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (status === "loading" || isLoading) {
		return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
	}

	if (!session || !["coach", "admin"].includes(session.user?.role || "")) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
						<Calendar className="h-8 w-8" />
						Bookings Management
					</h1>
					<p className="text-gray-600">View and manage facility bookings</p>
				</div>

				{bookings.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Calendar className="h-12 w-12 text-gray-400 mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
							<p className="text-gray-500 text-center">
								When users book facilities, they will appear here for you to manage.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 gap-4">
						{bookings.map((booking) => (
							<Card key={booking._id}>
								<CardHeader>
									<CardTitle className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<MapPin className="h-5 w-5" />
											Facility Booking
										</div>
										<span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
											{booking.status}
										</span>
									</CardTitle>
									<CardDescription>
										{new Date(booking.startTime).toLocaleDateString()} •
										{new Date(booking.startTime).toLocaleTimeString()} -
										{new Date(booking.endTime).toLocaleTimeString()}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
										<div className="flex items-center gap-2">
											<Users className="h-4 w-4 text-gray-500" />
											<span>User ID: {booking.userId}</span>
										</div>
										<div className="flex items-center gap-2">
											<MapPin className="h-4 w-4 text-gray-500" />
											<span>Facility ID: {booking.facilityId}</span>
										</div>
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-gray-500" />
											<span>
												Duration:{" "}
												{Math.round(
													(new Date(booking.endTime).getTime() -
														new Date(booking.startTime).getTime()) /
														(1000 * 60)
												)}{" "}
												min
											</span>
										</div>
									</div>
									{booking.notes && (
										<div className="mt-3 p-3 bg-gray-50 rounded-md">
											<p className="text-sm text-gray-600">{booking.notes}</p>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
