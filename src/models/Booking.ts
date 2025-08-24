import { z } from "zod";

export const BookingStatusEnum = z.enum(["pending", "confirmed", "cancelled", "completed"]);
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

export const BookingSchema = z
	.object({
		_id: z.string().optional(),
		facilityId: z.string().min(1, "Facility ID is required"),
		userId: z.string().min(1, "User ID is required"),
		startTime: z.date(),
		endTime: z.date(),
		status: BookingStatusEnum.default("pending"),
		notes: z.string().optional(),
		createdAt: z.date().default(() => new Date()),
		updatedAt: z.date().default(() => new Date()),
	})
	.refine((data) => data.endTime > data.startTime, {
		message: "End time must be after start time",
		path: ["endTime"],
	});

export type Booking = z.infer<typeof BookingSchema>;

export const CreateBookingSchema = BookingSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateBooking = z.infer<typeof CreateBookingSchema>;

export const UpdateBookingSchema = BookingSchema.partial().omit({ _id: true, createdAt: true });
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;
