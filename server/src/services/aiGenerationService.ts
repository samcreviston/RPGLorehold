import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import { buildSystemInstructions, getAiTemplate } from '../ai/promptBuilder.js';
import { validateStructuredResponse } from '../ai/validationRules.js';
import type {
	AiContentType,
	AiGenerationRequest,
	AiGenerationResponse,
	AiProviderResponse
} from '../types/aiTypes.js';
import { logAiRequest } from '../utils/logger.js';
import { AiProviderError, generateCompletion } from './openAIService.js';

export class AiGenerationError extends Error {
	constructor(
		public readonly statusCode: number,
		message: string
	) {
		super(message);
		this.name = 'AiGenerationError';
	}
}

function parseAndValidate(contentType: AiContentType, response: AiProviderResponse): Record<string, unknown> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(response.text);
	} catch {
		throw new Error('AI response was not valid JSON');
	}
	return validateStructuredResponse(contentType, parsed);
}

function responseContentType(
	templateContentType: AiContentType,
	data: Record<string, unknown>
): AiContentType {
	if (templateContentType !== 'item') {
		return templateContentType;
	}
	const itemType = data.itemType;
	return itemType === 'weapon' || itemType === 'armor' ? itemType : 'item';
}

export async function generateAiContent(
	userId: string,
	request: AiGenerationRequest
): Promise<AiGenerationResponse> {
	const template = getAiTemplate(request.category, request.templateId);
	if (!template) {
		throw new AiGenerationError(400, 'Unknown AI template');
	}

	const requestId = randomUUID();
	const startedAt = Date.now();
	let response: AiProviderResponse | undefined;
	let retried = false;
	try {
		const providerRequest = {
			systemInstructions: buildSystemInstructions(template),
			userPrompt: request.prompt,
			maxOutputTokens: template.maxOutputTokens,
			jsonMode: template.outputMode === 'structured'
		};
		response = await generateCompletion(providerRequest);

		if (template.outputMode === 'text') {
			logAiRequest({
				requestId, userId, templateId: template.id, promptChars: request.prompt.length,
				maxOutputTokens: template.maxOutputTokens, elapsedMs: Date.now() - startedAt,
				outcome: 'success', usage: response.usage
			});
			return { kind: 'text', templateId: template.id, data: response.text, usage: response.usage };
		}

		let data: Record<string, unknown>;
		try {
			data = parseAndValidate(template.contentType!, response);
		} catch (error) {
			retried = true;
			const validationMessage = error instanceof ZodError
				? error.issues.map((issue) => issue.message).join('; ')
				: error instanceof Error ? error.message : 'Invalid structured response';
			logAiRequest({
				requestId, userId, templateId: template.id, promptChars: request.prompt.length,
				maxOutputTokens: template.maxOutputTokens, elapsedMs: Date.now() - startedAt,
				outcome: 'validation_retry', usage: response.usage, errorKind: 'invalid_structured_response'
			});
			response = await generateCompletion({
				...providerRequest,
				userPrompt: `${request.prompt}\n\nYour prior response failed validation: ${validationMessage}. Return a corrected JSON object only that follows all required fields.`
			});
			data = parseAndValidate(template.contentType!, response);
		}

		logAiRequest({
			requestId, userId, templateId: template.id, promptChars: request.prompt.length,
			maxOutputTokens: template.maxOutputTokens, elapsedMs: Date.now() - startedAt,
			outcome: 'success', usage: response.usage
		});
		return {
			kind: 'content',
			templateId: template.id,
			contentType: responseContentType(template.contentType!, data),
			data,
			usage: response.usage
		};
	} catch (error) {
		const statusCode = error instanceof AiProviderError
			? error.kind === 'unconfigured' ? 503 : error.kind === 'timeout' ? 504 : 502
			: retried ? 422 : 500;
		logAiRequest({
			requestId, userId, templateId: template.id, promptChars: request.prompt.length,
			maxOutputTokens: template.maxOutputTokens, elapsedMs: Date.now() - startedAt,
			outcome: 'failure', usage: response?.usage,
			errorKind: error instanceof AiProviderError ? error.kind : retried ? 'validation_failed' : 'unexpected'
		});
		if (retried && !(error instanceof AiProviderError)) {
			throw new AiGenerationError(422, 'AI response did not match the required content format. Please try again.');
		}
		throw new AiGenerationError(statusCode, error instanceof AiProviderError ? error.message : 'AI generation failed');
	}
}
