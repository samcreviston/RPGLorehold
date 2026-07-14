import type { Campaign, CampaignUpdatePayload } from '../types/campaign';
import { apiRequest } from './http';

export async function listCampaigns(): Promise<Campaign[]> {
	const data = await apiRequest<{ campaigns: Campaign[] }>('/campaigns');
	return data.campaigns;
}

export async function createCampaign(title: string): Promise<Campaign> {
	const data = await apiRequest<{ campaign: Campaign }>('/campaigns', {
		method: 'POST',
		body: JSON.stringify({ title })
	});
	return data.campaign;
}

export async function updateCampaign(
	id: string,
	payload: CampaignUpdatePayload
): Promise<Campaign> {
	const data = await apiRequest<{ campaign: Campaign }>(`/campaigns/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
	return data.campaign;
}
