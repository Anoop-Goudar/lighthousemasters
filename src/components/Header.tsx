"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
	const { data: session } = useSession();
	const [isOpen, setIsOpen] = useState(false);

	const getBookingsHref = () => {
		if (session?.user?.role === "coach" || session?.user?.role === "admin") {
			return "/coach/bookings";
		}
		return "/facilities";
	};

	const navigation = [
		{ name: "Dashboard", href: "/dashboard" },
		{ name: "Facilities", href: "/facilities" },
		{ name: "Bookings", href: getBookingsHref() },
	];

	return (
		<header className="bg-card shadow-md border-b border-border">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<Link href="/" className="flex items-center">
						<h1 className="text-xl font-bold text-primary">Lighthouse</h1>
					</Link>

					<nav className="hidden md:flex space-x-8">
						{navigation.map((item) => (
							<Link key={item.name} href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
								{item.name}
							</Link>
						))}
					</nav>

					<div className="flex items-center space-x-4">
						{session && <NotificationDropdown />}

						{session ? (
							<div className="flex items-center space-x-2">
								<span className="text-sm text-muted-foreground">Hello, {session.user.name}</span>
								<Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
									Sign out
								</Button>
							</div>
						) : (
							<Link href="/auth/signin">
								<Button size="sm">Sign in</Button>
							</Link>
						)}

						<Sheet open={isOpen} onOpenChange={setIsOpen}>
							<SheetTrigger asChild className="md:hidden">
								<Button variant="ghost" size="sm">
									<Menu className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent side="right">
								<nav className="flex flex-col space-y-4 mt-8">
									{navigation.map((item) => (
										<Link
											key={item.name}
											href={item.href}
											className="text-muted-foreground hover:text-foreground py-2 transition-colors"
											onClick={() => setIsOpen(false)}
										>
											{item.name}
										</Link>
									))}
								</nav>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</header>
	);
}
