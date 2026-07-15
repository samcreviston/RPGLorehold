import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AI_CATEGORIES } from '../types/aiTypes.js';
import { env } from '../config/env.js';
import { AiGenerationError, generateAiContent } from '../services/aiGenerationService.js';
import { HttpError } from '../middleware/errorHandler.js';

const generationRequestSchema = z.object({
	category: z.enum(AI_CATEGORIES),
	templateId: z.string().trim().min(1).max(100),
	prompt: z.string().trim().min(1).max(env.AI_MAX_PROMPT_CHARS)
});

export async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		if (!req.user) {
			throw new HttpError(401, 'Authentication required');
		}
		const body = generationRequestSchema.parse(req.body);
		const generation = await generateAiContent(req.user.id, body);
		res.json({ generation });
	} catch (error) {
		if (error instanceof AiGenerationError) {
			next(new HttpError(error.statusCode, error.message));
			return;
		}
		next(error);
	}
}
