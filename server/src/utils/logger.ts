import type { AiUsage } from '../types/aiTypes.js';

type AiRequestLog = {
	requestId: string;
	userId: string;
	templateId: string;
	promptChars: number;
	maxOutputTokens: number;
	elapsedMs: number;
	outcome: 'success' | 'validation_retry' | 'failure';
	usage?: AiUsage | undefined;
	errorKind?: string;
};

/** Logs only operational AI metadata; never prompt or generated-content bodies. */
export function logAiRequest(entry: AiRequestLog): void {
	console.info(JSON.stringify({
		event: 'ai_request',
		timestamp: new Date().toISOString(),
		...entry
	}));
}
