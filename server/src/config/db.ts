import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<typeof mongoose> {
	mongoose.set('strictQuery', true);

	await mongoose.connect(env.MONGO_URI, {
		dbName: env.MONGO_DB_NAME
	});

	console.log(`MongoDB connected (db: ${env.MONGO_DB_NAME})`);
	return mongoose;
}

export async function disconnectDB(): Promise<void> {
	await mongoose.disconnect();
}
