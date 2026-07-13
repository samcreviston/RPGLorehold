import type { ModuleDocument, ModuleUpsertPayload } from '../types/module';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${API_BASE}${path}`, {
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers ?? {})
		},
		...init
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		const message =
			typeof data === 'object' && data && 'error' in data && typeof data.error === 'string'
				? data.error
				: `Request failed (${response.status})`;
		throw new Error(message);
	}

	return data as T;
}

export async function listModules(status?: 'draft' | 'published'): Promise<ModuleDocument[]> {
	const query = status ? `?status=${status}` : '';
	const data = await request<{ modules: ModuleDocument[] }>(`/modules${query}`);
	return data.modules;
}

export async function createModule(payload: ModuleUpsertPayload): Promise<ModuleDocument> {
	const data = await request<{ module: ModuleDocument }>('/modules', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
	return data.module;
}

export async function updateModule(
	id: string,
	payload: ModuleUpsertPayload
): Promise<ModuleDocument> {
	const data = await request<{ module: ModuleDocument }>(`/modules/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
	return data.module;
}

export async function getModule(id: string): Promise<ModuleDocument> {
	const data = await request<{ module: ModuleDocument }>(`/modules/${id}`);
	return data.module;
}

export async function publishModule(
	payload: ModuleUpsertPayload,
	id?: string | null
): Promise<ModuleDocument> {
	const path = id ? `/modules/${id}/publish` : '/modules/publish';
	const data = await request<{ module: ModuleDocument }>(path, {
		method: 'POST',
		body: JSON.stringify(payload)
	});
	return data.module;
}
