import { connectDB } from '../config/db.js';
import { reindexAllPublicContents } from '../services/indexingService.js';

async function run(): Promise<void> {
	await connectDB();
	const count = await reindexAllPublicContents();
	console.log(`Reindexed ${count} public content documents.`);
	process.exit(0);
}

run().catch((error) => {
	console.error('Content reindex failed:', error);
	process.exit(1);
});
