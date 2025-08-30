"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type React from "react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const nameId = useId();
	const emailId = useId();
	const membershipPlanId = useId();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		membershipPlan: "",
	});

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
		if (session?.user) {
			setFormData({
				name: session.user.name || "",
				email: session.user.email || "",
				membershipPlan: session.user.membershipPlan || "",
			});
		}
	}, [session, status, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			console.log("Profile update:", formData);
		} catch (error) {
			console.error("Profile update error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (status === "loading") {
		return <div>Loading...</div>;
	}

	if (!session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-muted py-8">
			<div className="max-w-2xl mx-auto px-4">
				<Card>
					<CardHeader>
						<CardTitle>Profile</CardTitle>
						<CardDescription>
							Manage your account information and membership details
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor={nameId}>Name</Label>
								<Input
									id={nameId}
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor={emailId}>Email</Label>
								<Input id={emailId} value={formData.email} disabled />
							</div>

							<div className="space-y-2">
								<Label>Role</Label>
								<Input value={session?.user?.role || ""} disabled />
							</div>

							<div className="space-y-2">
								<Label htmlFor={membershipPlanId}>Membership Plan</Label>
								<Input
									id={membershipPlanId}
									value={formData.membershipPlan || "Free"}
									disabled
									className="bg-muted"
								/>
								<p className="text-xs text-muted-foreground">
									Currently on Free plan. Paid plan integration coming soon.
								</p>
							</div>

							<div className="flex gap-4">
								<Button type="submit" disabled={isLoading}>
									{isLoading ? "Updating..." : "Update Profile"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => signOut({ callbackUrl: "/" })}
								>
									Sign Out
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
