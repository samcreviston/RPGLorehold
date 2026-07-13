import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const imageSchema = new Schema(
	{
		ownerId: { type: Schema.Types.ObjectId, required: true, index: true },
		url: { type: String, required: true },
		storageProvider: { type: String, default: 'backblaze-b2' },
		fileKey: { type: String, required: true },
		imageRole: { type: String, default: 'map' },
		width: { type: Number, default: 0 },
		height: { type: Number, default: 0 },
		fileType: { type: String, default: 'webp' }
	},
	{
		timestamps: true,
		collection: 'images'
	}
);

export type ImageDocument = InferSchemaType<typeof imageSchema> & {
	_id: mongoose.Types.ObjectId;
};

export const Image: Model<ImageDocument> =
	mongoose.models.Image ?? mongoose.model<ImageDocument>('Image', imageSchema);
