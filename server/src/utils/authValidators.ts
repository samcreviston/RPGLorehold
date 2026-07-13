import { z } from 'zod';

const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.max(128)
	.regex(/[A-Z]/, 'Password must include at least 1 capital letter')
	.regex(/[0-9]/, 'Password must include at least 1 number');

export const registerSchema = z.object({
	email: z.string().trim().email(),
	username: z.string().trim().min(3).max(32),
	password: passwordSchema
});

export const loginSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(1)
});

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: passwordSchema
});

export const updateProfileSchema = z
	.object({
		username: z.string().trim().min(3).max(32).optional(),
		email: z.string().trim().email().optional()
	})
	.refine((data) => data.username !== undefined || data.email !== undefined, {
		message: 'Provide username and/or email to update'
	});
