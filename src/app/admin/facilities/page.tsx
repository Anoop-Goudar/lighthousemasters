"use client";

import { Building2, Edit, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type React from "react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateFacility, Facility } from "@/models/Facility";

export default function AdminFacilitiesPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
	const nameId = useId();
	const typeId = useId();
	const descriptionId = useId();
	const capacityId = useId();

	const [formData, setFormData] = useState<CreateFacility>({
		name: "",
		type: "court",
		description: "",
		capacity: 1,
		availabilitySchedule: [],
	});

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
		if (session?.user?.role !== "admin") {
			router.push("/unauthorized");
		}
	}, [session, status, router]);

	useEffect(() => {
		const fetchFacilities = async () => {
			try {
				const response = await fetch("/api/facilities");
				const data = await response.json();
				setFacilities(data.facilities || []);
			} catch (error) {
				console.error("Error fetching facilities:", error);
			}
		};

		fetchFacilities();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const response = await fetch("/api/facilities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setFormData({
					name: "",
					type: "court",
					description: "",
					capacity: 1,
					availabilitySchedule: [],
				});
				setShowCreateForm(false);
				const facilitiesResponse = await fetch("/api/facilities");
				const facilitiesData = await facilitiesResponse.json();
				setFacilities(facilitiesData.facilities || []);
			} else {
				const error = await response.json();
				console.error("Error creating facility:", error);
				alert(`Failed to create facility: ${error.error}`);
			}
		} catch (error) {
			console.error("Error creating facility:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const editFacility = (facility: Facility) => {
		setEditingFacility(facility);
		setFormData({
			name: facility.name,
			type: facility.type,
			description: facility.description || "",
			capacity: facility.capacity,
			availabilitySchedule: facility.availabilitySchedule || [],
		});
		setShowCreateForm(true);
	};

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingFacility) return;
		
		setIsLoading(true);
		try {
			const response = await fetch(`/api/facilities/${editingFacility._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setFormData({
					name: "",
					type: "court",
					description: "",
					capacity: 1,
					availabilitySchedule: [],
				});
				setShowCreateForm(false);
				setEditingFacility(null);
				const facilitiesResponse = await fetch("/api/facilities");
				const facilitiesData = await facilitiesResponse.json();
				setFacilities(facilitiesData.facilities || []);
			} else {
				const error = await response.json();
				console.error("Error updating facility:", error);
				alert(`Failed to update facility: ${error.error}`);
			}
		} catch (error) {
			console.error("Error updating facility:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const deleteFacility = async (id: string) => {
		if (!confirm("Are you sure you want to delete this facility?")) return;

		try {
			const response = await fetch(`/api/facilities/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				const facilitiesResponse = await fetch("/api/facilities");
				const facilitiesData = await facilitiesResponse.json();
				setFacilities(facilitiesData.facilities || []);
			} else {
				const error = await response.json();
				console.error("Error deleting facility:", error);
				alert(`Failed to delete facility: ${error.error}`);
			}
		} catch (error) {
			console.error("Error deleting facility:", error);
		}
	};

	if (status === "loading") {
		return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
	}

	if (!session || session.user?.role !== "admin") {
		return null;
	}

	return (
		<div className="min-h-screen bg-muted py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
							<Building2 className="h-8 w-8" />
							Facility Management
						</h1>
						<p className="text-muted-foreground">Manage courts, grounds, and rooms</p>
					</div>
					<Button onClick={() => setShowCreateForm(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add Facility
					</Button>
				</div>

				{showCreateForm && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>{editingFacility ? "Edit Facility" : "Create New Facility"}</CardTitle>
							<CardDescription>{editingFacility ? "Update facility information" : "Add a new facility to the system"}</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={editingFacility ? handleUpdate : handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor={nameId}>Name</Label>
										<Input
											id={nameId}
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											placeholder="Tennis Court 1"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor={typeId}>Type</Label>
										<select
											id={typeId}
											value={formData.type}
											onChange={(e) =>
												setFormData({
													...formData,
													type: e.target.value as "court" | "ground" | "room",
												})
											}
											className="w-full h-9 px-3 rounded-md border border-input bg-background"
										>
											<option value="court">Court</option>
											<option value="ground">Ground</option>
											<option value="room">Room</option>
										</select>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor={descriptionId}>Description</Label>
									<Input
										id={descriptionId}
										value={formData.description || ""}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
										placeholder="Optional description"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor={capacityId}>Capacity</Label>
									<Input
										id={capacityId}
										type="number"
										min="1"
										value={formData.capacity}
										onChange={(e) =>
											setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 1 })
										}
									/>
								</div>

								<div className="flex gap-4">
									<Button type="submit" disabled={isLoading}>
										{isLoading ? (editingFacility ? "Updating..." : "Creating...") : (editingFacility ? "Update Facility" : "Create Facility")}
									</Button>
									<Button type="button" variant="outline" onClick={() => {
										setShowCreateForm(false);
										setEditingFacility(null);
										setFormData({
											name: "",
											type: "court",
											description: "",
											capacity: 1,
											availabilitySchedule: [],
										});
									}}>
										Cancel
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{facilities.map((facility) => (
						<Card key={facility._id}>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									{facility.name}
									<div className="flex gap-2">
										<Button size="sm" variant="outline" onClick={() => editFacility(facility)}>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => deleteFacility(facility._id!)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</CardTitle>
								<CardDescription>
									{facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}
									{facility.capacity && ` • Capacity: ${facility.capacity}`}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{facility.description && (
									<p className="text-sm text-muted-foreground">{facility.description}</p>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
