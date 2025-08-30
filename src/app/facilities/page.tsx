"use client";

import { addHours, format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type React from "react";
import { useEffect, useId, useState } from "react";
import Calendar from "react-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Booking, CreateBooking } from "@/models/Booking";
import type { Facility } from "@/models/Facility";
import "react-calendar/dist/Calendar.css";

export default function FacilitiesPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showBookingForm, setShowBookingForm] = useState(false);
	const startTimeId = useId();
	const endTimeId = useId();
	const notesId = useId();

	const [formData, setFormData] = useState<CreateBooking>({
		facilityId: "",
		userId: "",
		startTime: new Date(),
		endTime: addHours(new Date(), 1),
		status: "pending",
		notes: "",
	});

	const fetchFacilities = async () => {
		try {
			const response = await fetch("/api/facilities");
			const data = await response.json();
			setFacilities(data.facilities || []);
		} catch (error) {
			console.error("Error fetching facilities:", error);
		}
	};

	const fetchBookings = async (facilityId: string) => {
		try {
			const response = await fetch(`/api/bookings?facilityId=${facilityId}`);
			const data = await response.json();
			setBookings(data.bookings || []);
		} catch (error) {
			console.error("Error fetching bookings:", error);
		}
	};

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
	}, [status, router]);

	useEffect(() => {
		fetchFacilities();
	}, []);

	useEffect(() => {
		if (selectedFacility) {
			fetchBookings(selectedFacility._id!);
		}
	}, [selectedFacility]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const response = await fetch("/api/bookings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					facilityId: selectedFacility?._id,
				}),
			});

			if (response.ok) {
				setFormData({
					facilityId: "",
					userId: "",
					startTime: new Date(),
					endTime: addHours(new Date(), 1),
					status: "pending",
					notes: "",
				});
				setShowBookingForm(false);
				if (selectedFacility) {
					fetchBookings(selectedFacility._id!);
				}
			} else {
				const error = await response.json();
				console.error("Error creating booking:", error);
				alert(
					`Booking failed: ${error.error || "Please check your booking details and try again."}`
				);
			}
		} catch (error) {
			console.error("Error creating booking:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBookFacility = (facility: Facility) => {
		setSelectedFacility(facility);
		setShowBookingForm(true);
		setFormData({ ...formData, facilityId: facility._id! });
	};

	const getBookingsForDate = (date: Date) => {
		const dateStr = format(date, "yyyy-MM-dd");
		return bookings.filter(
			(booking) =>
				format(new Date(booking.startTime), "yyyy-MM-dd") === dateStr &&
				booking.status !== "cancelled"
		);
	};

	if (status === "loading") {
		return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
	}

	if (!session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-muted py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
						<MapPin className="h-8 w-8" />
						Facilities & Booking
					</h1>
					<p className="text-muted-foreground">Browse and book available facilities</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2">
						<h2 className="text-xl font-semibold mb-4">Available Facilities</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{facilities.map((facility) => (
								<Card
									key={facility._id}
									className="cursor-pointer hover:shadow-md transition-shadow"
								>
									<CardHeader>
										<CardTitle className="flex items-center justify-between">
											{facility.name}
											<Button size="sm" onClick={() => handleBookFacility(facility)}>
												Book Now
											</Button>
										</CardTitle>
										<CardDescription>
											{facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}
											{facility.capacity && ` • Capacity: ${facility.capacity}`}
										</CardDescription>
									</CardHeader>
									<CardContent>
										{facility.description && (
											<p className="text-sm text-muted-foreground mb-2">{facility.description}</p>
										)}
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Users className="h-4 w-4" />
											<span>Available for booking</span>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					<div>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CalendarIcon className="h-5 w-5" />
									Calendar
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Calendar
									onChange={(value) => setSelectedDate(value as Date)}
									value={selectedDate}
									className="w-full"
									tileContent={({ date }) => {
										const dayBookings = selectedFacility ? getBookingsForDate(date) : [];
										return dayBookings.length > 0 ? (
											<div className="text-xs text-blue-600 mt-1">
												{dayBookings.length} booking{dayBookings.length > 1 ? "s" : ""}
											</div>
										) : null;
									}}
								/>
							</CardContent>
						</Card>

						{selectedFacility && (
							<Card className="mt-4">
								<CardHeader>
									<CardTitle>Bookings for {format(selectedDate, "MMM dd, yyyy")}</CardTitle>
								</CardHeader>
								<CardContent>
									{getBookingsForDate(selectedDate).length > 0 ? (
										<div className="space-y-2">
											{getBookingsForDate(selectedDate).map((booking) => (
												<div key={booking._id} className="flex items-center gap-2 text-sm">
													<Clock className="h-4 w-4" />
													<span>
														{format(new Date(booking.startTime), "HH:mm")} -
														{format(new Date(booking.endTime), "HH:mm")}
													</span>
													<span
														className={`px-2 py-1 rounded text-xs ${
															booking.status === "confirmed"
																? "bg-primary/10 text-primary"
																: booking.status === "pending"
																	? "bg-accent/10 text-accent-foreground"
																	: "bg-muted text-muted-foreground"
														}`}
													>
														{booking.status}
													</span>
												</div>
											))}
										</div>
									) : (
										<p className="text-muted-foreground text-sm">No bookings for this date</p>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</div>

				{showBookingForm && selectedFacility && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<Card className="w-full max-w-md">
							<CardHeader>
								<CardTitle>Book {selectedFacility.name}</CardTitle>
								<CardDescription>Schedule your booking</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor={startTimeId}>Start Time</Label>
										<Input
											id={startTimeId}
											type="datetime-local"
											value={
												formData.startTime ? format(formData.startTime, "yyyy-MM-dd'T'HH:mm") : ""
											}
											onChange={(e) =>
												setFormData({ ...formData, startTime: new Date(e.target.value) })
											}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor={endTimeId}>End Time</Label>
										<Input
											id={endTimeId}
											type="datetime-local"
											value={formData.endTime ? format(formData.endTime, "yyyy-MM-dd'T'HH:mm") : ""}
											onChange={(e) =>
												setFormData({ ...formData, endTime: new Date(e.target.value) })
											}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor={notesId}>Notes (Optional)</Label>
										<Input
											id={notesId}
											value={formData.notes || ""}
											onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
											placeholder="Any special requirements..."
										/>
									</div>

									<div className="flex gap-4">
										<Button type="submit" disabled={isLoading}>
											{isLoading ? "Booking..." : "Book Facility"}
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowBookingForm(false)}
										>
											Cancel
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
