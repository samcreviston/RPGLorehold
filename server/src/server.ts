import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { ensureContentsIndex, ensureModulesIndex } from './config/meilisearch.js';
import { errorHandler } from './middleware/errorHandler.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import type {} from './types/express.js';

async function startServer(): Promise<void> {
	await connectDB();

	try {
		await ensureModulesIndex();
		console.log('Meilisearch modules index ready');
		await ensureContentsIndex();
		console.log('Meilisearch contents index ready');
	} catch (error) {
		console.error('Meilisearch index setup failed (is docker compose up?):', error);
	}

	const app = express();

	app.use(helmet());
	app.use(cors({ origin: true, credentials: true }));
	app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
	app.use(express.json({ limit: '2mb' }));
	app.use(cookieParser());

	app.get('/api/health', (_req, res) => {
		res.json({ ok: true, db: env.MONGO_DB_NAME });
	});

	app.use('/api/auth', authRoutes);
	app.use('/api/ai', aiRoutes);
	app.use('/api/campaigns', campaignRoutes);
	app.use('/api/contents', contentRoutes);
	app.use('/api/modules', moduleRoutes);
	app.use('/api/search', searchRoutes);

	app.use(errorHandler);

	app.listen(env.PORT, () => {
		console.log(`Server listening on http://localhost:${env.PORT}`);
	});
}

startServer().catch((error) => {
	console.error('Failed to start server:', error);
	process.exit(1);
});
