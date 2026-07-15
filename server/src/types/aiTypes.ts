export const AI_CATEGORIES = ['writing', 'content', 'ideas'] as const;

export type AiCategory = (typeof AI_CATEGORIES)[number];

export type AiOutputMode = 'text' | 'structured';

export type AiContentType =
	| 'item'
	| 'weapon'
	| 'armor'
	| 'monster'
	| 'npcStory'
	| 'npcStats'
	| 'npcFull'
	| 'spell';

export type AiTemplate = {
	id: string;
	label: string;
	category: AiCategory;
	outputMode: AiOutputMode;
	maxOutputTokens: number;
	contentType?: AiContentType;
	instructions: string;
};

export type AiGenerationRequest = {
	category: AiCategory;
	templateId: string;
	prompt: string;
};

export type AiUsage = {
	inputTokens?: number;
	outputTokens?: number;
	totalTokens?: number;
};

export type AiProviderRequest = {
	systemInstructions: string;
	userPrompt: string;
	maxOutputTokens: number;
	jsonMode: boolean;
};

export type AiProviderResponse = {
	text: string;
	usage?: AiUsage | undefined;
};

export type AiGenerationResponse = {
	kind: 'text' | 'content';
	templateId: string;
	contentType?: AiContentType;
	data: string | Record<string, unknown>;
	usage?: AiUsage | undefined;
};
