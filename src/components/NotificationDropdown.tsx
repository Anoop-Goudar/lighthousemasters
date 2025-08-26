"use client";

import React, { useEffect, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
	_id: string;
	type: string;
	title?: string;
	message: string;
	status: "read" | "unread";
	actionUrl?: string;
	createdAt: string;
}

export function NotificationDropdown() {
	const { data: session } = useSession();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const fetchNotifications = async () => {
		if (!session) return;

		setIsLoading(true);
		try {
			const response = await fetch("/api/notifications?limit=10");
			const data = await response.json();
			setNotifications(data.notifications || []);
			setUnreadCount(data.unreadCount || 0);
		} catch (error) {
			console.error("Error fetching notifications:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchNotifications();
	}, [session]);

	const markAsRead = async (notificationId: string) => {
		try {
			await fetch(`/api/notifications/${notificationId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "read" }),
			});

			setNotifications((prev) =>
				prev.map((n) => (n._id === notificationId ? { ...n, status: "read" as const } : n))
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	const deleteNotification = async (notificationId: string) => {
		try {
			await fetch(`/api/notifications/${notificationId}`, {
				method: "DELETE",
			});

			const deletedNotification = notifications.find((n) => n._id === notificationId);
			setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

			if (deletedNotification?.status === "unread") {
				setUnreadCount((prev) => Math.max(0, prev - 1));
			}
		} catch (error) {
			console.error("Error deleting notification:", error);
		}
	};

	const markAllAsRead = async () => {
		try {
			const unreadNotifications = notifications.filter((n) => n.status === "unread");

			await Promise.all(
				unreadNotifications.map((n) =>
					fetch(`/api/notifications/${n._id}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ status: "read" }),
					})
				)
			);

			setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" as const })));
			setUnreadCount(0);
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
		}
	};

	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
		return `${Math.floor(diffInMinutes / 1440)}d ago`;
	};

	if (!session) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="relative">
					<Bell className="h-4 w-4" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
						>
							{unreadCount > 99 ? "99+" : unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-80">
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>Notifications</span>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={markAllAsRead}
							className="h-auto p-1 text-xs"
						>
							<Check className="h-3 w-3 mr-1" />
							Mark all read
						</Button>
					)}
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				{isLoading ? (
					<div className="p-4 text-center text-sm text-muted-foreground">
						Loading notifications...
					</div>
				) : notifications.length === 0 ? (
					<div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
				) : (
					<div className="max-h-96 overflow-y-auto">
						{notifications.map((notification) => (
							<div
								key={notification._id}
								className={`p-3 border-b last:border-b-0 ${
									notification.status === "unread" ? "bg-blue-50 dark:bg-blue-950/20" : ""
								}`}
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										{notification.title && (
											<div className="font-medium text-sm truncate">{notification.title}</div>
										)}
										<div className="text-sm text-muted-foreground line-clamp-2">
											{notification.message}
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											{formatTimeAgo(notification.createdAt)}
										</div>
									</div>

									<div className="flex items-center gap-1">
										{notification.status === "unread" && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => markAsRead(notification._id)}
												className="h-6 w-6 p-0"
											>
												<Check className="h-3 w-3" />
											</Button>
										)}
										<Button
											variant="ghost"
											size="sm"
											onClick={() => deleteNotification(notification._id)}
											className="h-6 w-6 p-0 text-destructive hover:text-destructive"
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								</div>

								{notification.actionUrl && (
									<Button
										variant="link"
										size="sm"
										className="h-auto p-0 mt-2 text-xs"
										onClick={() => window.open(notification.actionUrl, "_blank")}
									>
										View Details →
									</Button>
								)}
							</div>
						))}
					</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
