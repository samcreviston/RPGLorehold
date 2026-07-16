import { apiRequest } from './http';
import type { ContentDocument, ContentUpsertPayload } from '../types/content';

export async function createContent(payload: ContentUpsertPayload): Promise<ContentDocument> {
	const data = await apiRequest<{ content: ContentDocument }>('/contents', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
	return data.content;
}

export async function getContent(id: string): Promise<ContentDocument> {
	const data = await apiRequest<{ content: ContentDocument }>(`/contents/${id}`);
	return data.content;
}

export async function getPublicContent(slug: string): Promise<ContentDocument> {
	const data = await apiRequest<{ content: ContentDocument }>(`/contents/published/${slug}`);
	return data.content;
}

export async function updateContent(id: string, payload: ContentUpsertPayload): Promise<ContentDocument> {
	const data = await apiRequest<{ content: ContentDocument }>(`/contents/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
	return data.content;
}

export async function listContents(): Promise<ContentDocument[]> {
	const data = await apiRequest<{ contents: ContentDocument[] }>('/contents');
	return data.contents;
}
