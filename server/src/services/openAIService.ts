import OpenAI from 'openai';
import { env } from '../config/env.js';
import type { AiProviderRequest, AiProviderResponse } from '../types/aiTypes.js';

export class AiProviderError extends Error {
	constructor(
		public readonly kind: 'unconfigured' | 'timeout' | 'unavailable',
		message: string
	) {
		super(message);
		this.name = 'AiProviderError';
	}
}

function createClient(): OpenAI {
	if (!env.OPENAI_API_KEY) {
		throw new AiProviderError('unconfigured', 'AI service is not configured');
	}

	return new OpenAI({
		apiKey: env.OPENAI_API_KEY,
		timeout: env.OPENAI_REQUEST_TIMEOUT_MS,
		maxRetries: 0
	});
}

/** The only module that communicates with the configured AI provider. */
export async function generateCompletion(
	request: AiProviderRequest
): Promise<AiProviderResponse> {
	try {
		const completion = await createClient().chat.completions.create({
			model: env.OPENAI_MODEL,
			max_tokens: request.maxOutputTokens,
			temperature: 0.7,
			messages: [
				{ role: 'system', content: request.systemInstructions },
				{ role: 'user', content: request.userPrompt }
			],
			...(request.jsonMode ? { response_format: { type: 'json_object' as const } } : {})
		});
		const text = completion.choices[0]?.message.content?.trim();
		if (!text) {
			throw new AiProviderError('unavailable', 'AI service returned an empty response');
		}

		return {
			text,
			usage: completion.usage
				? {
						inputTokens: completion.usage.prompt_tokens,
						outputTokens: completion.usage.completion_tokens,
						totalTokens: completion.usage.total_tokens
					}
				: undefined
		};
	} catch (error) {
		if (error instanceof AiProviderError) {
			throw error;
		}
		if (error instanceof OpenAI.APIConnectionTimeoutError) {
			throw new AiProviderError('timeout', 'AI service timed out');
		}
		throw new AiProviderError('unavailable', 'AI service is unavailable');
	}
}
