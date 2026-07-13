import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as searchService from '../services/searchService.js';

function parseListParam(value: unknown): string[] | undefined {
	if (typeof value === 'string' && value.trim()) {
		return value
			.split(',')
			.map((part) => part.trim())
			.filter(Boolean);
	}
	if (Array.isArray(value)) {
		const items = value
			.filter((item): item is string => typeof item === 'string')
			.map((item) => item.trim())
			.filter(Boolean);
		return items.length > 0 ? items : undefined;
	}
	return undefined;
}

const optionalInt = z.preprocess(
	(value) => (value === undefined || value === '' ? undefined : value),
	z.coerce.number().int().min(1).max(20).optional()
);

const searchQuerySchema = z.object({
	q: z.string().optional().default(''),
	playstyle: z.array(z.string()).optional(),
	alignments: z.array(z.string()).optional(),
	biomes: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	levelMin: optionalInt,
	levelMax: optionalInt,
	sort: z.string().optional().default('relevance'),
	page: z.preprocess(
		(value) => (value === undefined || value === '' ? 1 : value),
		z.coerce.number().int().min(1)
	),
	limit: z.preprocess(
		(value) => (value === undefined || value === '' ? 20 : value),
		z.coerce.number().int().min(1).max(50)
	)
});

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const parsed = searchQuerySchema.parse({
			q: typeof req.query.q === 'string' ? req.query.q : '',
			playstyle: parseListParam(req.query.playstyle),
			alignments: parseListParam(req.query.alignments),
			biomes: parseListParam(req.query.biomes),
			tags: parseListParam(req.query.tags),
			levelMin: req.query.levelMin,
			levelMax: req.query.levelMax,
			sort: typeof req.query.sort === 'string' ? req.query.sort : 'relevance',
			page: req.query.page,
			limit: req.query.limit
		});

		const result = await searchService.searchModules({
			q: parsed.q,
			page: parsed.page,
			limit: parsed.limit,
			sort: parsed.sort,
			...(parsed.playstyle ? { playstyle: parsed.playstyle } : {}),
			...(parsed.alignments ? { alignments: parsed.alignments } : {}),
			...(parsed.biomes ? { biomes: parsed.biomes } : {}),
			...(parsed.tags ? { tags: parsed.tags } : {}),
			...(parsed.levelMin !== undefined ? { levelMin: parsed.levelMin } : {}),
			...(parsed.levelMax !== undefined ? { levelMax: parsed.levelMax } : {})
		});
		res.json(result);
	} catch (error) {
		next(error);
	}
}
