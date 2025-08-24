import { z } from "zod";

export const NotificationTypeEnum = z.enum([
	"booking_confirmation",
	"booking_reminder",
	"booking_cancellation",
	"training_scheduled",
	"payment_due",
	"system_announcement",
	"general",
]);
export type NotificationType = z.infer<typeof NotificationTypeEnum>;

export const NotificationStatusEnum = z.enum(["read", "unread"]);
export type NotificationStatus = z.infer<typeof NotificationStatusEnum>;

export const NotificationSchema = z.object({
	_id: z.string().optional(),
	userId: z.string().min(1, "User ID is required"),
	type: NotificationTypeEnum,
	message: z.string().min(1, "Message is required"),
	status: NotificationStatusEnum.default("unread"),
	title: z.string().optional(),
	actionUrl: z.string().url().optional(),
	metadata: z.record(z.string(), z.any()).optional(), // For additional data
	expiresAt: z.date().optional(),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
});

export type Notification = z.infer<typeof NotificationSchema>;

export const CreateNotificationSchema = NotificationSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateNotification = z.infer<typeof CreateNotificationSchema>;

export const UpdateNotificationSchema = NotificationSchema.partial().omit({
	_id: true,
	createdAt: true,
});
export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>;
