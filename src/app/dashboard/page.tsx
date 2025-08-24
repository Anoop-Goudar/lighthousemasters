"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
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
			</div>
		</div>
	);
}
