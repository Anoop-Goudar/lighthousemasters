"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/models/User";

export default function AdminUsersPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [users, setUsers] = useState<User[]>([]);
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
		const fetchUsers = async () => {
			try {
				const response = await fetch("/api/users");
				const data = await response.json();
				setUsers(data.users || []);
			} catch (error) {
				console.error("Error fetching users:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (session?.user?.role === "admin") {
			fetchUsers();
		}
	}, [session]);

	const updateUserRole = async (userId: string, newRole: string) => {
		try {
			const response = await fetch("/api/users", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId, role: newRole }),
			});

			if (response.ok) {
				setUsers((prev) =>
					prev.map((user) =>
						user._id === userId
							? { ...user, role: newRole as "student" | "coach" | "parent" | "admin" }
							: user
					)
				);
			} else {
				const error = await response.json();
				alert(`Failed to update role: ${error.error}`);
			}
		} catch (error) {
			console.error("Error updating user role:", error);
			alert("Failed to update user role");
		}
	};

	if (status === "loading" || isLoading) {
		return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
	}

	if (!session || session.user?.role !== "admin") {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
						<Users className="h-8 w-8" />
						User Management
					</h1>
					<p className="text-gray-600">Manage user roles and permissions</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>All Users</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b">
										<th className="text-left py-2">Name</th>
										<th className="text-left py-2">Email</th>
										<th className="text-left py-2">Current Role</th>
										<th className="text-left py-2">Actions</th>
									</tr>
								</thead>
								<tbody>
									{users.map((user) => (
										<tr key={user._id} className="border-b">
											<td className="py-2">{user.name}</td>
											<td className="py-2">{user.email}</td>
											<td className="py-2">
												<span
													className={`px-2 py-1 rounded text-xs ${
														user.role === "admin"
															? "bg-red-100 text-red-800"
															: user.role === "coach"
																? "bg-blue-100 text-blue-800"
																: user.role === "parent"
																	? "bg-green-100 text-green-800"
																	: "bg-gray-100 text-gray-800"
													}`}
												>
													{user.role}
												</span>
											</td>
											<td className="py-2">
												<select
													value={user.role}
													onChange={(e) => updateUserRole(user._id!, e.target.value)}
													className="border rounded px-2 py-1 text-sm"
												>
													<option value="student">Student</option>
													<option value="coach">Coach</option>
													<option value="parent">Parent</option>
													<option value="admin">Admin</option>
												</select>
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
