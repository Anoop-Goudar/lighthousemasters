import { z } from "zod";

export const UserRoleEnum = z.enum(["student", "coach", "parent", "admin"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const UserSchema = z.object({
	_id: z.string().optional(),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	role: UserRoleEnum,
	membershipPlan: z.string().optional(),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.partial().omit({ _id: true, createdAt: true });
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
