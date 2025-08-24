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
		}),
	],
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
						membershipPlan: null,
						createdAt: new Date(),
						updatedAt: new Date(),
					};

					const validatedUser = UserSchema.parse(newUser);
					await db.collection("users").insertOne(validatedUser as Document);
				}
			}
			return true;
		},
	},
	pages: {
		signIn: "/auth/signin",
	},
	session: {
		strategy: "jwt",
	},
};
