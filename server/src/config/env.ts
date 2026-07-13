import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number().int().positive().default(4000),
	MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
	MONGO_DB_NAME: z.string().min(1).default('rpg_platform'),
	DEV_AUTHOR_ID: z
		.string()
		.regex(/^[a-fA-F0-9]{24}$/, 'DEV_AUTHOR_ID must be a 24-char ObjectId hex string')
		.optional(),
	JWT_SECRET: z.string().min(1).default('dev-jwt-secret-change-me'),
	JWT_ACCESS_EXPIRES: z.string().default('15m'),
	JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().int().positive().default(7),
	OPENAI_API_KEY: z.string().optional().default(''),
	OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
	OPENAI_MAX_TOKENS: z.coerce.number().int().positive().default(2000),
	OPENAI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),
	MEILISEARCH_HOST: z.string().default('http://localhost:7700'),
	MEILISEARCH_API_KEY: z.string().optional().default(''),
	OPEN5E_BASE_URL: z.string().default('https://api.open5e.com')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
	throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
