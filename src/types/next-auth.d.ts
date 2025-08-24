import "next-auth";
import { UserRole } from "../models/User";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			role: UserRole;
			membershipPlan?: string | null;
		};
	}

	interface User {
		id: string;
		role: UserRole;
		membershipPlan?: string | null;
	}
}
