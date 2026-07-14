import type { ModuleDocument } from '../types/module';
import { apiRequest } from './http';

export type FavoriteToggleResult = {
	favorited: boolean;
	favorites: number;
};

export type FavoriteModuleItem = {
	module: ModuleDocument;
	authorUsername: string;
};

export async function listFavoriteModules(): Promise<FavoriteModuleItem[]> {
	const data = await apiRequest<{ modules: FavoriteModuleItem[] }>('/modules/favorites');
	return data.modules;
}

export async function addFavorite(moduleId: string): Promise<FavoriteToggleResult> {
	return apiRequest<FavoriteToggleResult>(`/modules/${moduleId}/favorite`, {
		method: 'POST'
	});
}

export async function removeFavorite(moduleId: string): Promise<FavoriteToggleResult> {
	return apiRequest<FavoriteToggleResult>(`/modules/${moduleId}/favorite`, {
		method: 'DELETE'
	});
}
