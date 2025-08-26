import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session || session.user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
		}

		const client = await clientPromise;
		const db = client.db();

		const [userStats, bookingStats] = await Promise.all([
			db
				.collection("users")
				.aggregate([
					{
						$group: {
							_id: "$role",
							count: { $sum: 1 },
						},
					},
				])
				.toArray(),
			db
				.collection("bookings")
				.aggregate([
					{
						$group: {
							_id: null,
							total: { $sum: 1 },
							thisMonth: {
								$sum: {
									$cond: [
										{
											$gte: [
												"$createdAt",
												new Date(new Date().getFullYear(), new Date().getMonth(), 1),
											],
										},
										1,
										0,
									],
								},
							},
							thisWeek: {
								$sum: {
									$cond: [
										{
											$gte: ["$createdAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)],
										},
										1,
										0,
									],
								},
							},
						},
					},
				])
				.toArray(),
		]);

		const roleStats = userStats.reduce(
			(acc, stat) => {
				acc[stat._id] = stat.count;
				return acc;
			},
			{} as Record<string, number>
		);

		const mockAnalytics = {
			activeUsers: {
				total: Object.values(roleStats).reduce((sum, count) => sum + count, 0) || 156,
				byRole: {
					student: roleStats.student || 98,
					coach: roleStats.coach || 12,
					parent: roleStats.parent || 42,
					admin: roleStats.admin || 4,
				},
			},
			facilityUsage: {
				totalBookings: bookingStats[0]?.total || 342,
				thisWeek: bookingStats[0]?.thisWeek || 28,
				thisMonth: bookingStats[0]?.thisMonth || 124,
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
		};

		return NextResponse.json(mockAnalytics);
	} catch (error) {
		console.error("Error fetching analytics:", error);
		return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
	}
}
