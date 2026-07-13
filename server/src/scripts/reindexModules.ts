import { connectDB } from '../config/db.js';
import { reindexAllPublishedModules } from '../services/indexingService.js';

async function main(): Promise<void> {
	await connectDB();
	const count = await reindexAllPublishedModules();
	console.log(`Reindexed ${count} published module(s) into Meilisearch.`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('Reindex failed:', error);
		process.exit(1);
	});
