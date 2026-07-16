import mongoose, { Schema, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';
import {
	CONTENT_SOURCES,
	CONTENT_STATUSES,
	CONTENT_TYPES,
	CONTENT_VISIBILITIES
} from '../types/contentTypes.js';

const contentSchema = new Schema(
	{
		ownerId: { type: Schema.Types.ObjectId, required: true, index: true },
		contentType: { type: String, enum: CONTENT_TYPES, required: true, trim: true, index: true },
		title: { type: String, required: true, trim: true, maxlength: 160 },
		data: { type: Schema.Types.Mixed, required: true, default: {} },
		source: { type: String, enum: CONTENT_SOURCES, default: 'manual' },
		status: { type: String, enum: CONTENT_STATUSES, default: 'draft', index: true },
		visibility: { type: String, enum: CONTENT_VISIBILITIES, default: 'private', index: true },
		slug: { type: String, required: true, unique: true, index: true },
		publishedAt: { type: Date, default: null },
		searchText: { type: String, default: '' }
	},
	{ timestamps: true, collection: 'contents' }
);

contentSchema.index({ ownerId: 1, updatedAt: -1 });
contentSchema.index({ status: 1, visibility: 1, publishedAt: -1 });
contentSchema.index({ searchText: 'text', title: 'text' });

type ContentSchemaType = InferSchemaType<typeof contentSchema>;
export type ContentDocument = HydratedDocument<ContentSchemaType>;

export const Content: Model<ContentSchemaType> =
	mongoose.models.Content ?? mongoose.model<ContentSchemaType>('Content', contentSchema);
