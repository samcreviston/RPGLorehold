import mongoose, { Schema, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

const campaignEntrySchema = new Schema(
	{
		id: { type: String, required: true },
		moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
		plannedStartingLevel: { type: Number, required: true, min: 1, max: 20 },
		plannedEndingLevel: { type: Number, required: true, min: 1, max: 20 },
		dmNotes: { type: String, default: '', maxlength: 10000 }
	},
	{ _id: false }
);

const campaignSchema = new Schema(
	{
		ownerId: { type: Schema.Types.ObjectId, required: true, index: true },
		title: { type: String, required: true, trim: true, maxlength: 120 },
		entries: { type: [campaignEntrySchema], default: [] }
	},
	{
		timestamps: true,
		collection: 'campaigns'
	}
);

campaignSchema.index({ ownerId: 1, updatedAt: -1 });

type CampaignSchemaType = InferSchemaType<typeof campaignSchema>;
export type CampaignDocument = HydratedDocument<CampaignSchemaType>;

export const Campaign: Model<CampaignSchemaType> =
	mongoose.models.Campaign ?? mongoose.model<CampaignSchemaType>('Campaign', campaignSchema);
