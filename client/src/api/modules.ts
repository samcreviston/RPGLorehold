import type { ModuleDocument, ModuleUpsertPayload } from '../types/module';
import { apiRequest } from './http';

export async function listModules(status?: 'draft' | 'published'): Promise<ModuleDocument[]> {
	const query = status ? `?status=${status}` : '';
	const data = await apiRequest<{ modules: ModuleDocument[] }>(`/modules${query}`);
	return data.modules;
}

export async function createModule(payload: ModuleUpsertPayload): Promise<ModuleDocument> {
	const data = await apiRequest<{ module: ModuleDocument }>('/modules', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
	return data.module;
}

export async function updateModule(
	id: string,
	payload: ModuleUpsertPayload
): Promise<ModuleDocument> {
	const data = await apiRequest<{ module: ModuleDocument }>(`/modules/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
	return data.module;
}

export async function getModule(id: string): Promise<ModuleDocument> {
	const data = await apiRequest<{ module: ModuleDocument }>(`/modules/${id}`);
	return data.module;
}

export async function publishModule(
	payload: ModuleUpsertPayload,
	id?: string | null
): Promise<ModuleDocument> {
	const path = id ? `/modules/${id}/publish` : '/modules/publish';
	const data = await apiRequest<{ module: ModuleDocument }>(path, {
		method: 'POST',
		body: JSON.stringify(payload)
	});
	return data.module;
}
