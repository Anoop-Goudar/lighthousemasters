import { z } from "zod";

export const PerformanceMetricsSchema = z.object({
	duration: z.number().positive().optional(), // in minutes
	intensity: z.number().min(1).max(10).optional(), // 1-10 scale
	skillsWorkedOn: z.array(z.string()).default([]),
	improvementAreas: z.array(z.string()).default([]),
	rating: z.number().min(1).max(5).optional(), // 1-5 stars
});

export const TrainingLogSchema = z.object({
	_id: z.string().optional(),
	userId: z.string().min(1, "User ID is required"),
	coachId: z.string().min(1, "Coach ID is required"),
	activityType: z.string().min(1, "Activity type is required"),
	notes: z.string().optional(),
	performanceMetrics: PerformanceMetricsSchema.optional(),
	sessionDate: z.date().default(() => new Date()),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
});

export type TrainingLog = z.infer<typeof TrainingLogSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

export const CreateTrainingLogSchema = TrainingLogSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateTrainingLog = z.infer<typeof CreateTrainingLogSchema>;

export const UpdateTrainingLogSchema = TrainingLogSchema.partial().omit({
	_id: true,
	createdAt: true,
});
export type UpdateTrainingLog = z.infer<typeof UpdateTrainingLogSchema>;
