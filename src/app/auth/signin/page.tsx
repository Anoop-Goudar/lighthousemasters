"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		try {
			const result = await signIn("google", {
				callbackUrl: "/dashboard",
				redirect: false,
			});
			if (result?.ok) {
				router.push("/dashboard");
			}
		} catch (error) {
			console.error("Sign in error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Sign In</CardTitle>
					<CardDescription>Sign in to your Lighthouse Management account</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button
						onClick={handleGoogleSignIn}
						disabled={isLoading}
						className="w-full"
						variant="outline"
					>
						{isLoading ? "Signing in..." : "Continue with Google"}
					</Button>

					<div className="text-center text-sm text-gray-500">
						Don&apos;t have an account? Contact your administrator.
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
