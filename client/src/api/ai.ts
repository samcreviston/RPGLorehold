import { apiRequest } from './http';
import type { GeneratedContent, GeneratedContentType } from '../lib/generatedContent/generatedContent';
import type { LairChatCategory } from '../lib/lair/lairChatTemplates';

type AiTextGeneration = {
	kind: 'text';
	templateId: string;
	data: string;
};

type AiContentGeneration = {
	kind: 'content';
	templateId: string;
	contentType: GeneratedContentType;
	data: Record<string, unknown>;
};

export type AiGeneration = AiTextGeneration | AiContentGeneration;

export async function generateAiContent(request: {
	category: LairChatCategory;
	templateId: string;
	prompt: string;
}): Promise<AiGeneration> {
	const response = await apiRequest<{ generation: AiGeneration }>('/ai/generate', {
		method: 'POST',
		body: JSON.stringify(request)
	});
	return response.generation;
}

export function isGeneratedContent(generation: AiGeneration): generation is AiContentGeneration {
	return generation.kind === 'content';
}

export function toGeneratedContent(generation: AiContentGeneration): GeneratedContent {
	return {
		contentType: generation.contentType,
		data: generation.data
	};
}
