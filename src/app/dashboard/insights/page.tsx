"use client";

import { BarChart3, Calendar, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingInsights {
	totalBookings: number;
	thisWeekBookings: number;
	thisMonthBookings: number;
	bookingsByFacility: Array<{ name: string; bookings: number }>;
	bookingsByDay: Array<{ day: string; bookings: number }>;
	recentBookings: Array<{ user: string; facility: string; time: string; status: string }>;
}

export default function BookingInsightsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [insights, setInsights] = useState<BookingInsights | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
		if (!["admin", "coach"].includes(session?.user?.role || "")) {
			router.push("/unauthorized");
		}
	}, [session, status, router]);

	useEffect(() => {
		const fetchInsights = async () => {
			try {
				setInsights({
					totalBookings: 342,
					thisWeekBookings: 28,
					thisMonthBookings: 124,
					bookingsByFacility: [
						{ name: "Tennis Court 1", bookings: 45 },
						{ name: "Swimming Pool", bookings: 38 },
						{ name: "Basketball Court", bookings: 32 },
						{ name: "Gym Room A", bookings: 29 },
						{ name: "Badminton Court", bookings: 25 },
					],
					bookingsByDay: [
						{ day: "Mon", bookings: 12 },
						{ day: "Tue", bookings: 19 },
						{ day: "Wed", bookings: 15 },
						{ day: "Thu", bookings: 22 },
						{ day: "Fri", bookings: 18 },
						{ day: "Sat", bookings: 25 },
						{ day: "Sun", bookings: 20 },
					],
					recentBookings: [
						{
							user: "John Doe",
							facility: "Tennis Court 1",
							time: "2024-12-15 14:00",
							status: "confirmed",
						},
						{
							user: "Jane Smith",
							facility: "Swimming Pool",
							time: "2024-12-15 16:00",
							status: "pending",
						},
						{
							user: "Mike Johnson",
							facility: "Basketball Court",
							time: "2024-12-15 18:00",
							status: "confirmed",
						},
						{
							user: "Sarah Wilson",
							facility: "Gym Room A",
							time: "2024-12-16 10:00",
							status: "pending",
						},
					],
				});
			} catch (error) {
				console.error("Error fetching insights:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (["admin", "coach"].includes(session?.user?.role || "")) {
			fetchInsights();
		}
	}, [session]);

	const exportToCSV = () => {
		if (!insights) return;

		const csvData = [
			["Facility", "Bookings"],
			...insights.bookingsByFacility.map((f) => [f.name, f.bookings.toString()]),
		];

		const csvContent = csvData.map((row) => row.join(",")).join("\n");
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `booking-insights-${new Date().toISOString().split("T")[0]}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	};

	if (status === "loading" || isLoading) {
		return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
	}

	if (!session || !["admin", "coach"].includes(session.user?.role || "")) {
		return null;
	}

	if (!insights) {
		return (
			<div className="min-h-screen flex items-center justify-center">Failed to load insights</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
							<BarChart3 className="h-8 w-8" />
							Booking Insights
						</h1>
						<p className="text-gray-600">Analytics and reports for facility bookings</p>
					</div>
					<Button onClick={exportToCSV} variant="outline">
						Export CSV
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{insights.totalBookings}</div>
							<p className="text-xs text-muted-foreground">All time bookings</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">This Week</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{insights.thisWeekBookings}</div>
							<p className="text-xs text-muted-foreground">Bookings this week</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">This Month</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{insights.thisMonthBookings}</div>
							<p className="text-xs text-muted-foreground">Bookings this month</p>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					<Card>
						<CardHeader>
							<CardTitle>Bookings by Facility</CardTitle>
							<CardDescription>Total bookings per facility</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={insights.bookingsByFacility}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="bookings" fill="#3b82f6" />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Weekly Booking Trend</CardTitle>
							<CardDescription>Bookings by day of week</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={insights.bookingsByDay}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="day" />
									<YAxis />
									<Tooltip />
									<Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} />
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Recent Bookings</CardTitle>
						<CardDescription>Latest facility bookings</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b">
										<th className="text-left py-2">User</th>
										<th className="text-left py-2">Facility</th>
										<th className="text-left py-2">Time</th>
										<th className="text-left py-2">Status</th>
									</tr>
								</thead>
								<tbody>
									{insights.recentBookings.map((booking, index) => (
										<tr key={index} className="border-b">
											<td className="py-2">{booking.user}</td>
											<td className="py-2">{booking.facility}</td>
											<td className="py-2">{booking.time}</td>
											<td className="py-2">
												<span
													className={`px-2 py-1 rounded text-xs ${
														booking.status === "confirmed"
															? "bg-green-100 text-green-800"
															: booking.status === "pending"
																? "bg-yellow-100 text-yellow-800"
																: "bg-gray-100 text-gray-800"
													}`}
												>
													{booking.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
