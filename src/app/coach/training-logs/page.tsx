"use client";

import { ClipboardList, Edit, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type React from "react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateTrainingLog, TrainingLog } from "@/models/TrainingLog";

interface User {
	_id: string;
	name: string;
	email: string;
	role: string;
}

export default function CoachTrainingLogsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const userSelectId = useId();
	const activityTypeId = useId();
	const sessionDateId = useId();
	const notesId = useId();
	const durationId = useId();
	const intensityId = useId();
	const ratingId = useId();

	const [formData, setFormData] = useState<CreateTrainingLog>({
		userId: "",
		coachId: "",
		activityType: "",
		notes: "",
		sessionDate: new Date(),
		performanceMetrics: {
			skillsWorkedOn: [],
			improvementAreas: [],
			duration: undefined,
			intensity: undefined,
			rating: undefined,
		},
	});

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
		if (session?.user?.role !== "coach" && session?.user?.role !== "admin") {
			router.push("/unauthorized");
		}
	}, [session, status, router]);

	const fetchTrainingLogs = async () => {
		try {
			const response = await fetch("/api/training-logs");
			const data = await response.json();
			setTrainingLogs(data.trainingLogs || []);
		} catch (error) {
			console.error("Error fetching training logs:", error);
		}
	};

	const fetchUsers = async () => {
		try {
			const response = await fetch("/api/users");
			const data = await response.json();
			setUsers(data.users || []);
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	};

	useEffect(() => {
		fetchTrainingLogs();
		fetchUsers();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const response = await fetch("/api/training-logs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setFormData({
					userId: "",
					coachId: "",
					activityType: "",
					notes: "",
					sessionDate: new Date(),
					performanceMetrics: {
						skillsWorkedOn: [],
						improvementAreas: [],
						duration: undefined,
						intensity: undefined,
						rating: undefined,
					},
				});
				setShowCreateForm(false);
				fetchTrainingLogs();
			} else {
				const error = await response.json();
				console.error("Error creating training log:", error);
				alert(
					`Failed to create training log: ${error.error || "Please check your input and try again."}`
				);
			}
		} catch (error) {
			console.error("Error creating training log:", error);
			alert("Failed to create training log. Please check your connection and try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (status === "loading") {
		return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
	}

	if (!session || !["coach", "admin"].includes(session.user?.role)) {
		return null;
	}

	return (
		<div className="min-h-screen bg-muted py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
							<ClipboardList className="h-8 w-8" />
							Training Log Management
						</h1>
						<p className="text-muted-foreground">Record training sessions and performance notes</p>
					</div>
					<Button onClick={() => setShowCreateForm(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add Training Log
					</Button>
				</div>

				{showCreateForm && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Create New Training Log</CardTitle>
							<CardDescription>Record a training session</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor={userSelectId}>Student</Label>
										<select
											id={userSelectId}
											value={formData.userId}
											onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
											className="w-full h-9 px-3 rounded-md border border-input bg-background"
											required
										>
											<option value="">Select Student</option>
											{users.map((user) => (
												<option key={user._id} value={user._id}>
													{user.name}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<Label htmlFor={activityTypeId}>Activity Type</Label>
										<Input
											id={activityTypeId}
											value={formData.activityType}
											onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
											placeholder="Tennis Practice, Swimming, etc."
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor={sessionDateId}>Session Date</Label>
									<Input
										id={sessionDateId}
										type="datetime-local"
										value={
											formData.sessionDate
												? new Date(
														formData.sessionDate.getTime() -
															formData.sessionDate.getTimezoneOffset() * 60000
													)
														.toISOString()
														.slice(0, 16)
												: ""
										}
										onChange={(e) =>
											setFormData({ ...formData, sessionDate: new Date(e.target.value) })
										}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor={notesId}>Notes</Label>
									<textarea
										id={notesId}
										value={formData.notes || ""}
										onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
										placeholder="Training notes, observations, feedback..."
										className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor={durationId}>Duration (minutes)</Label>
										<Input
											id={durationId}
											type="number"
											min="1"
											value={formData.performanceMetrics?.duration || ""}
											onChange={(e) =>
												setFormData({
													...formData,
													performanceMetrics: {
														skillsWorkedOn: formData.performanceMetrics?.skillsWorkedOn || [],
														improvementAreas: formData.performanceMetrics?.improvementAreas || [],
														...formData.performanceMetrics,
														duration: parseInt(e.target.value, 10) || undefined,
													},
												})
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor={intensityId}>Intensity (1-10)</Label>
										<Input
											id={intensityId}
											type="number"
											min="1"
											max="10"
											value={formData.performanceMetrics?.intensity || ""}
											onChange={(e) =>
												setFormData({
													...formData,
													performanceMetrics: {
														skillsWorkedOn: formData.performanceMetrics?.skillsWorkedOn || [],
														improvementAreas: formData.performanceMetrics?.improvementAreas || [],
														...formData.performanceMetrics,
														intensity: parseInt(e.target.value, 10) || undefined,
													},
												})
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor={ratingId}>Rating (1-5 stars)</Label>
										<Input
											id={ratingId}
											type="number"
											min="1"
											max="5"
											value={formData.performanceMetrics?.rating || ""}
											onChange={(e) =>
												setFormData({
													...formData,
													performanceMetrics: {
														skillsWorkedOn: formData.performanceMetrics?.skillsWorkedOn || [],
														improvementAreas: formData.performanceMetrics?.improvementAreas || [],
														...formData.performanceMetrics,
														rating: parseInt(e.target.value, 10) || undefined,
													},
												})
											}
										/>
									</div>
								</div>

								<div className="flex gap-4">
									<Button type="submit" disabled={isLoading}>
										{isLoading ? "Creating..." : "Create Training Log"}
									</Button>
									<Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
										Cancel
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				)}

				<div className="grid grid-cols-1 gap-4">
					{trainingLogs.map((log) => (
						<Card key={log._id}>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									{log.activityType}
									<div className="flex gap-2">
										<Button size="sm" variant="outline">
											<Edit className="h-4 w-4" />
										</Button>
									</div>
								</CardTitle>
								<CardDescription>
									{new Date(log.sessionDate).toLocaleDateString()} • Duration:{" "}
									{log.performanceMetrics?.duration || "N/A"} min
								</CardDescription>
							</CardHeader>
							<CardContent>
								{log.notes && <p className="text-sm text-muted-foreground mb-2">{log.notes}</p>}
								{log.performanceMetrics && (
									<div className="flex gap-4 text-sm text-muted-foreground">
										{log.performanceMetrics.intensity && (
											<span>Intensity: {log.performanceMetrics.intensity}/10</span>
										)}
										{log.performanceMetrics.rating && (
											<span>Rating: {log.performanceMetrics.rating}/5 ⭐</span>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
