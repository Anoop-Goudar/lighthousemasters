import { z } from "zod";

export const FacilityTypeEnum = z.enum(["court", "ground", "room"]);
export type FacilityType = z.infer<typeof FacilityTypeEnum>;

export const AvailabilityScheduleSchema = z.object({
	dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
	startTime: z.string(), // Format: "HH:MM"
	endTime: z.string(), // Format: "HH:MM"
	isAvailable: z.boolean().default(true),
});

export const FacilitySchema = z.object({
	_id: z.string().optional(),
	name: z.string().min(1, "Facility name is required"),
	type: FacilityTypeEnum,
	availabilitySchedule: z.array(AvailabilityScheduleSchema).default([]),
	description: z.string().optional(),
	capacity: z.number().positive().optional(),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
});

export type Facility = z.infer<typeof FacilitySchema>;
export type AvailabilitySchedule = z.infer<typeof AvailabilityScheduleSchema>;

export const CreateFacilitySchema = FacilitySchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateFacility = z.infer<typeof CreateFacilitySchema>;

export const UpdateFacilitySchema = FacilitySchema.partial().omit({ _id: true, createdAt: true });
export type UpdateFacility = z.infer<typeof UpdateFacilitySchema>;
