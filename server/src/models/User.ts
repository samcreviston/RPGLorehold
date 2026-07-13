import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const userSchema = new Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		username: { type: String, required: true, unique: true, trim: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['user', 'admin'], default: 'user' },
		emailVerified: { type: Boolean, default: false },
		profileImage: { type: String, default: null },
		favoriteModules: { type: [Schema.Types.ObjectId], ref: 'Module', default: [] },
		createdModules: { type: [Schema.Types.ObjectId], ref: 'Module', default: [] },
		recentlyEdited: { type: [Schema.Types.ObjectId], ref: 'Module', default: [] }
	},
	{
		timestamps: true,
		collection: 'users'
	}
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
	_id: mongoose.Types.ObjectId;
};

export const User: Model<UserDocument> =
	mongoose.models.User ?? mongoose.model<UserDocument>('User', userSchema);
