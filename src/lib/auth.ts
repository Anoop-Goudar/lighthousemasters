import type { Document } from "mongodb";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UserSchema } from "../models/User";
import clientPromise from "./mongodb";

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			authorization: {
				params: {
					prompt: "select_account",
					access_type: "offline",
					response_type: "code",
					ux_mode: "redirect",
				},
			},
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 12 * 60 * 60, // 12 hours
	},
	callbacks: {
		async session({ session, token }) {
			if (session.user && token.sub) {
				session.user.id = token.sub;

				const client = await clientPromise;
				const db = client.db();
				const dbUser = await db.collection("users").findOne({ email: session.user.email });

				if (dbUser) {
					session.user.role = dbUser.role || "student";
					session.user.membershipPlan = dbUser.membershipPlan;
				} else {
					session.user.role = "student";
				}
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) token.id = user.id;
			return token;
		},
		async signIn({ user, account }) {
			if (account?.provider === "google") {
				const client = await clientPromise;
				const db = client.db();

				const existingUser = await db.collection("users").findOne({ email: user.email });

				if (!existingUser) {
					const newUser = {
						name: user.name,
						email: user.email,
						role: "student",
						membershipPlan: "Free",
						createdAt: new Date(),
						updatedAt: new Date(),
					};

					const validatedUser = UserSchema.parse(newUser);
					await db.collection("users").insertOne(validatedUser as Document);
				}
			}
			return true;
		},
		async redirect({ url, baseUrl }) {
			// Allows relative callback URLs
			if (url.startsWith("/")) return `${baseUrl}${url}`;
			// Allows callback URLs on the same origin
			else if (new URL(url).origin === baseUrl) return url;
			return baseUrl;
		},
	},
	// REMOVED: pages configuration that was causing the redirect loop
	// pages: {
	//     signIn: "/auth/signin",
	// },
	secret: process.env.NEXTAUTH_SECRET,
	debug: process.env.NODE_ENV === "development",
};
