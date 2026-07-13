import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const sessionSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		refreshTokenHash: { type: String, required: true },
		expiresAt: { type: Date, required: true },
		userAgent: { type: String, default: '' },
		ipAddress: { type: String, default: '' },
		revokedAt: { type: Date, default: null }
	},
	{
		timestamps: true,
		collection: 'sessions'
	}
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type SessionDocument = InferSchemaType<typeof sessionSchema> & {
	_id: mongoose.Types.ObjectId;
};

export const Session: Model<SessionDocument> =
	mongoose.models.Session ?? mongoose.model<SessionDocument>('Session', sessionSchema);
