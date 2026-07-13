import mongoose, { Schema, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';
import { MODULE_STATUSES, PLAYSTYLES, SECTION_TYPES } from '../types/moduleTypes.js';

const sectionSchema = new Schema(
	{
		id: { type: String, required: true },
		type: { type: String, enum: SECTION_TYPES, required: true },
		order: { type: Number, required: true, min: 0 },
		content: { type: String, default: '' },
		imageID: { type: String, default: '' },
		caption: { type: String, default: '' }
	},
	{ _id: false }
);

const adventureSchema = new Schema(
	{
		id: { type: String, required: true },
		order: { type: Number, required: true, min: 0 },
		title: { type: String, required: true, trim: true },
		summary: { type: String, default: '' },
		estimatedPlayTime: { type: Number, default: 0, min: 0 },
		sections: { type: [sectionSchema], default: [] }
	},
	{ _id: false }
);

const moduleSchema = new Schema(
	{
		authorId: { type: Schema.Types.ObjectId, required: true, index: true },
		status: { type: String, enum: MODULE_STATUSES, default: 'draft', index: true },
		published: { type: Boolean, default: false },
		title: { type: String, required: true, trim: true },
		flavorText: { type: String, default: '', maxlength: 100 },
		startingLevel: { type: Number, required: true, min: 1, max: 20 },
		endingLevel: { type: Number, required: true, min: 1, max: 20 },
		numberOfAdventures: { type: Number, default: 0, min: 0 },
		playstyle: { type: String, enum: PLAYSTYLES, required: true },
		alignments: { type: [String], default: [] },
		biomes: { type: [String], default: [] },
		coverImage: { type: String, default: null },
		tags: { type: [String], default: [] },
		publishedAt: { type: Date, default: null },
		views: { type: Number, default: 0, min: 0 },
		favorites: { type: Number, default: 0, min: 0 },
		averageRating: { type: Number, default: 0, min: 0, max: 5 },
		searchText: { type: String, default: '' },
		adventures: { type: [adventureSchema], default: [] }
	},
	{
		timestamps: true,
		collection: 'modules'
	}
);

moduleSchema.index({ authorId: 1, status: 1 });
moduleSchema.index({ status: 1, updatedAt: -1 });
moduleSchema.index({ searchText: 'text', title: 'text', flavorText: 'text' });

type ModuleSchemaType = InferSchemaType<typeof moduleSchema>;
export type ModuleDocument = HydratedDocument<ModuleSchemaType>;

export const Module: Model<ModuleSchemaType> =
	mongoose.models.Module ?? mongoose.model<ModuleSchemaType>('Module', moduleSchema);
