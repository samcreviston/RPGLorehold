import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { Content, type ContentDocument } from '../models/Content.js';
import type { ContentUpsertInput } from '../types/contentTypes.js';
import {
	removeContentFromIndexBackground,
	syncContentIndexBackground
} from './indexingService.js';

function ownerObjectId(ownerId: string): mongoose.Types.ObjectId {
	if (!mongoose.isValidObjectId(ownerId)) {
		throw new Error('Invalid owner id');
	}
	return new mongoose.Types.ObjectId(ownerId);
}

function makeSlug(title: string): string {
	const base = title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 72);
	return `${base || 'content'}-${crypto.randomUUID().slice(0, 8)}`;
}

function searchText(title: string, data: Record<string, unknown>): string {
	return `${title} ${Object.values(data)
		.filter((value) => typeof value === 'string' || typeof value === 'number')
		.join(' ')}`.slice(0, 20000);
}

function setPublicationFields(doc: ContentDocument, input: ContentUpsertInput): void {
	const status = input.status ?? doc.status;
	const visibility = input.visibility ?? doc.visibility;
	doc.status = status;
	doc.visibility = visibility;
	if (status === 'published' && visibility !== 'private') {
		doc.publishedAt ??= new Date();
	} else {
		doc.publishedAt = null;
	}
}

export async function createContent(ownerId: string, input: ContentUpsertInput): Promise<ContentDocument> {
	const doc = new Content({
		ownerId: ownerObjectId(ownerId),
		contentType: input.contentType,
		title: input.title.trim(),
		data: input.data,
		source: input.source ?? 'manual',
		status: input.status ?? 'draft',
		visibility: input.visibility ?? 'private',
		slug: makeSlug(input.title),
		searchText: searchText(input.title, input.data)
	});
	setPublicationFields(doc, input);
	await doc.save();
	syncContentIndexBackground(String(doc._id));
	return doc;
}

export async function listContentForOwner(ownerId: string): Promise<ContentDocument[]> {
	return Content.find({ ownerId: ownerObjectId(ownerId) }).sort({ updatedAt: -1 });
}

export async function getContentForOwner(id: string, ownerId: string): Promise<ContentDocument | null> {
	return Content.findOne({ _id: id, ownerId: ownerObjectId(ownerId) });
}

export async function getPublicContent(slug: string): Promise<ContentDocument | null> {
	return Content.findOne({
		slug,
		status: 'published',
		visibility: { $in: ['public', 'unlisted'] }
	});
}

export async function updateContent(
	id: string,
	ownerId: string,
	input: ContentUpsertInput
): Promise<ContentDocument | null> {
	const doc = await getContentForOwner(id, ownerId);
	if (!doc) {
		return null;
	}
	doc.contentType = input.contentType;
	doc.title = input.title.trim();
	doc.data = input.data;
	doc.source = input.source ?? doc.source;
	doc.searchText = searchText(input.title, input.data);
	setPublicationFields(doc, input);
	await doc.save();
	syncContentIndexBackground(String(doc._id));
	return doc;
}

export async function deleteContent(id: string, ownerId: string): Promise<boolean> {
	const deleted = await Content.findOneAndDelete({ _id: id, ownerId: ownerObjectId(ownerId) });
	if (deleted) {
		removeContentFromIndexBackground(id);
	}
	return Boolean(deleted);
}
