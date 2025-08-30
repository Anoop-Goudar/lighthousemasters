"use client";

import { Building2, Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return;
		if (session) {
			router.push("/dashboard");
		}
	}, [session, status, router]);

	if (status === "loading") {
		return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
	}

	if (session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="container mx-auto px-4 py-16">
				<div className="text-center mb-16">
					<h1 className="text-5xl font-bold text-foreground mb-6">Lighthouse Management System</h1>
					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						Streamline your facility bookings, training sessions, and operations with our
						comprehensive management platform.
					</p>
					<Link href="/auth/signin">
						<Button size="lg" className="text-lg px-8 py-3">
							Get Started
						</Button>
					</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
					<Card>
						<CardHeader>
							<Building2 className="h-8 w-8 text-blue-600 mb-2" />
							<CardTitle>Facility Management</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Manage courts, grounds, and rooms with detailed availability scheduling.
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Calendar className="h-8 w-8 text-green-600 mb-2" />
							<CardTitle>Smart Booking</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Easy-to-use booking system with real-time availability and conflict detection.
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Users className="h-8 w-8 text-purple-600 mb-2" />
							<CardTitle>Role-Based Access</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Secure access control for students, coaches, parents, and administrators.
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<MapPin className="h-8 w-8 text-orange-600 mb-2" />
							<CardTitle>Training Logs</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Track training sessions, performance metrics, and progress over time.
							</CardDescription>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
