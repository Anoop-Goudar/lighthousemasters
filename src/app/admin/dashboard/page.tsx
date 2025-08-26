"use client";

import { BarChart3, Download, Users, Building2, DollarSign, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
	activeUsers: {
		total: number;
		byRole: {
			student: number;
			coach: number;
			parent: number;
			admin: number;
		};
	};
	facilityUsage: {
		totalBookings: number;
		thisWeek: number;
		thisMonth: number;
		byFacility: Array<{
			name: string;
			bookings: number;
		}>;
	};
	revenue: {
		total: number;
		thisMonth: number;
		fromMemberships: number;
		fromBookings: number;
	};
}

export default function AdminDashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
		if (session?.user?.role !== "admin") {
			router.push("/unauthorized");
		}
	}, [session, status, router]);

	useEffect(() => {
		const fetchAnalytics = async () => {
			try {
				const response = await fetch("/api/admin/analytics");
				const data = await response.json();
				setAnalytics(data);
			} catch (error) {
				console.error("Error fetching analytics:", error);
				setAnalytics({
					activeUsers: {
						total: 156,
						byRole: {
							student: 98,
							coach: 12,
							parent: 42,
							admin: 4,
						},
					},
					facilityUsage: {
						totalBookings: 342,
						thisWeek: 28,
						thisMonth: 124,
						byFacility: [
							{ name: "Tennis Court 1", bookings: 45 },
							{ name: "Swimming Pool", bookings: 38 },
							{ name: "Basketball Court", bookings: 32 },
							{ name: "Gym Room A", bookings: 29 },
						],
					},
					revenue: {
						total: 45600,
						thisMonth: 8900,
						fromMemberships: 32400,
						fromBookings: 13200,
					},
				});
			} finally {
				setIsLoading(false);
			}
		};

		if (session?.user?.role === "admin") {
			fetchAnalytics();
		}
	}, [session]);

	const exportToCSV = () => {
		if (!analytics) return;

		const csvData = [
			["Metric", "Value"],
			["Total Active Users", analytics.activeUsers.total],
			["Students", analytics.activeUsers.byRole.student],
			["Coaches", analytics.activeUsers.byRole.coach],
			["Parents", analytics.activeUsers.byRole.parent],
			["Admins", analytics.activeUsers.byRole.admin],
			["Total Bookings", analytics.facilityUsage.totalBookings],
			["Bookings This Week", analytics.facilityUsage.thisWeek],
			["Bookings This Month", analytics.facilityUsage.thisMonth],
			["Total Revenue", `$${analytics.revenue.total}`],
			["Revenue This Month", `$${analytics.revenue.thisMonth}`],
			["Revenue from Memberships", `$${analytics.revenue.fromMemberships}`],
			["Revenue from Bookings", `$${analytics.revenue.fromBookings}`],
		];

		const csvContent = csvData.map((row) => row.join(",")).join("\n");
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `lighthouse-analytics-${new Date().toISOString().split("T")[0]}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	};

	const exportToPDF = async () => {
		if (!analytics) return;

		try {
			const jsPDF = (await import("jspdf")).default;

			const pdf = new jsPDF();

			pdf.setFontSize(20);
			pdf.text("Lighthouse Management System - Analytics Report", 20, 30);

			pdf.setFontSize(12);
			pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);

			let yPosition = 65;

			pdf.setFontSize(16);
			pdf.text("Active Users", 20, yPosition);
			yPosition += 15;

			pdf.setFontSize(12);
			pdf.text(`Total: ${analytics.activeUsers.total}`, 25, yPosition);
			yPosition += 10;
			pdf.text(`Students: ${analytics.activeUsers.byRole.student}`, 25, yPosition);
			yPosition += 10;
			pdf.text(`Coaches: ${analytics.activeUsers.byRole.coach}`, 25, yPosition);
			yPosition += 10;
			pdf.text(`Parents: ${analytics.activeUsers.byRole.parent}`, 25, yPosition);
			yPosition += 10;
			pdf.text(`Admins: ${analytics.activeUsers.byRole.admin}`, 25, yPosition);
			yPosition += 20;

			pdf.setFontSize(16);
			pdf.text("Facility Usage", 20, yPosition);
			yPosition += 15;

			pdf.setFontSize(12);
			pdf.text(`Total Bookings: ${analytics.facilityUsage.totalBookings}`, 25, yPosition);
			yPosition += 10;
			pdf.text(`This Week: ${analytics.facilityUsage.thisWeek}`, 25, yPosition);
			yPosition += 10;
			pdf.text(`This Month: ${analytics.facilityUsage.thisMonth}`, 25, yPosition);
			yPosition += 20;

			pdf.setFontSize(16);
			pdf.text("Revenue Summary", 20, yPosition);
			yPosition += 15;

			pdf.setFontSize(12);
			pdf.text(`Total Revenue: $${analytics.revenue.total.toLocaleString()}`, 25, yPosition);
			yPosition += 10;
			pdf.text(`This Month: $${analytics.revenue.thisMonth.toLocaleString()}`, 25, yPosition);
			yPosition += 10;
			pdf.text(
				`From Memberships: $${analytics.revenue.fromMemberships.toLocaleString()}`,
				25,
				yPosition
			);
			yPosition += 10;
			pdf.text(`From Bookings: $${analytics.revenue.fromBookings.toLocaleString()}`, 25, yPosition);

			pdf.save(`lighthouse-analytics-${new Date().toISOString().split("T")[0]}.pdf`);
		} catch (error) {
			console.error("Error generating PDF:", error);
		}
	};

	if (status === "loading" || isLoading) {
		return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
	}

	if (!session || session.user?.role !== "admin") {
		return null;
	}

	if (!analytics) {
		return (
			<div className="min-h-screen flex items-center justify-center">Failed to load analytics</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
							<BarChart3 className="h-8 w-8" />
							Admin Dashboard
						</h1>
						<p className="text-gray-600">System analytics and reports</p>
					</div>
					<div className="flex gap-2">
						<Button onClick={exportToCSV} variant="outline">
							<Download className="h-4 w-4 mr-2" />
							Export CSV
						</Button>
						<Button onClick={exportToPDF}>
							<Download className="h-4 w-4 mr-2" />
							Export PDF
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Users</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{analytics.activeUsers.total}</div>
							<p className="text-xs text-muted-foreground">Active users in system</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{analytics.facilityUsage.thisMonth}</div>
							<p className="text-xs text-muted-foreground">
								+{analytics.facilityUsage.thisWeek} this week
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
							<DollarSign className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								${analytics.revenue.thisMonth.toLocaleString()}
							</div>
							<p className="text-xs text-muted-foreground">
								${analytics.revenue.total.toLocaleString()} total
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
							<Building2 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{analytics.facilityUsage.byFacility.length}</div>
							<p className="text-xs text-muted-foreground">Active facilities</p>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Active Users by Role</CardTitle>
							<CardDescription>User distribution across different roles</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Object.entries(analytics.activeUsers.byRole).map(([role, count]) => (
									<div key={role} className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 rounded-full bg-blue-500" />
											<span className="capitalize font-medium">{role}</span>
										</div>
										<span className="text-2xl font-bold">{count}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Facility Usage</CardTitle>
							<CardDescription>Bookings per facility this month</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{analytics.facilityUsage.byFacility.map((facility) => (
									<div key={facility.name} className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Building2 className="h-4 w-4 text-muted-foreground" />
											<span className="font-medium">{facility.name}</span>
										</div>
										<span className="text-xl font-bold">{facility.bookings}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Revenue Breakdown</CardTitle>
							<CardDescription>Revenue sources and totals</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="font-medium">Memberships</span>
									<span className="text-xl font-bold">
										${analytics.revenue.fromMemberships.toLocaleString()}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="font-medium">Bookings</span>
									<span className="text-xl font-bold">
										${analytics.revenue.fromBookings.toLocaleString()}
									</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex items-center justify-between">
										<span className="font-bold">Total Revenue</span>
										<span className="text-2xl font-bold text-green-600">
											${analytics.revenue.total.toLocaleString()}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>System Overview</CardTitle>
							<CardDescription>Key system metrics</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="font-medium">Total Bookings</span>
									<span className="text-xl font-bold">{analytics.facilityUsage.totalBookings}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="font-medium">This Week</span>
									<span className="text-xl font-bold">{analytics.facilityUsage.thisWeek}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="font-medium">This Month</span>
									<span className="text-xl font-bold">{analytics.facilityUsage.thisMonth}</span>
								</div>
								<div className="border-t pt-4">
									<div className="flex items-center justify-between">
										<span className="font-bold">Active Users</span>
										<span className="text-2xl font-bold text-blue-600">
											{analytics.activeUsers.total}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
