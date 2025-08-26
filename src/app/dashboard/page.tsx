"use client";

import { Building2, MapPin, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
	}, [status, router]);

	if (status === "loading") {
		return <div>Loading...</div>;
	}

	if (!session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
					<p className="text-gray-600">Welcome back, {session.user?.name}!</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Profile</CardTitle>
							<CardDescription>Manage your account information</CardDescription>
						</CardHeader>
						<CardContent>
							<Link href="/profile">
								<Button className="w-full">View Profile</Button>
							</Link>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Facilities</CardTitle>
							<CardDescription>Browse and book facilities</CardDescription>
						</CardHeader>
						<CardContent>
							<Link href="/facilities">
								<Button className="w-full">
									<MapPin className="h-4 w-4 mr-2" />
									View Facilities
								</Button>
							</Link>
						</CardContent>
					</Card>

					{session.user?.role === "admin" && (
						<Card>
							<CardHeader>
								<CardTitle>Admin Panel</CardTitle>
								<CardDescription>Manage facilities and system</CardDescription>
							</CardHeader>
							<CardContent>
								<Link href="/admin/facilities">
									<Button className="w-full">
										<Building2 className="h-4 w-4 mr-2" />
										Manage Facilities
									</Button>
								</Link>
							</CardContent>
						</Card>
					)}

					{session.user?.role === "coach" && (
						<Card>
							<CardHeader>
								<CardTitle>Training Logs</CardTitle>
								<CardDescription>Manage training sessions</CardDescription>
							</CardHeader>
							<CardContent>
								<Link href="/coach/training-logs">
									<Button className="w-full">
										<ClipboardList className="h-4 w-4 mr-2" />
										Manage Training Logs
									</Button>
								</Link>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>Your Role</CardTitle>
							<CardDescription>Current access level</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold capitalize">{session.user?.role}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Membership</CardTitle>
							<CardDescription>Your current plan</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-lg">{session.user?.membershipPlan || "No active plan"}</div>
						</CardContent>
					</Card>
				</div>

				<div className="mt-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Training Sessions</h2>
					<TrainingSessionHistory userId={session.user.id} />
				</div>
			</div>
		</div>
	);
}

interface TrainingLogData {
	_id: string;
	activityType: string;
	sessionDate: string;
	notes?: string;
	performanceMetrics?: {
		duration?: number;
		rating?: number;
	};
}

function TrainingSessionHistory({ userId }: { userId: string }) {
	const [trainingLogs, setTrainingLogs] = useState<TrainingLogData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchTrainingLogs = async () => {
			try {
				const response = await fetch(`/api/training-logs?userId=${userId}`);
				const data = await response.json();
				setTrainingLogs(data.trainingLogs || []);
			} catch (error) {
				console.error("Error fetching training logs:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTrainingLogs();
	}, [userId]);

	if (isLoading) {
		return <div>Loading training sessions...</div>;
	}

	if (trainingLogs.length === 0) {
		return (
			<Card>
				<CardContent className="pt-6">
					<p className="text-gray-500 text-center">No training sessions recorded yet.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{trainingLogs.slice(0, 6).map((log) => (
				<Card key={log._id}>
					<CardHeader>
						<CardTitle className="text-lg">{log.activityType}</CardTitle>
						<CardDescription>
							{new Date(log.sessionDate).toLocaleDateString()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{log.notes && <p className="text-sm text-gray-600 mb-2">{log.notes}</p>}
						{log.performanceMetrics && (
							<div className="flex gap-4 text-sm text-gray-500">
								{log.performanceMetrics.duration && <span>{log.performanceMetrics.duration} min</span>}
								{log.performanceMetrics.rating && <span>{log.performanceMetrics.rating}/5 ⭐</span>}
							</div>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
