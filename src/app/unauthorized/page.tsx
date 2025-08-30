import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-muted">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Access Denied</CardTitle>
					<CardDescription>You don&apos;t have permission to access this page.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Please contact your administrator if you believe this is an error.
						</p>
						<Link href="/">
							<Button className="w-full">Return Home</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
