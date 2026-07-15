import { useState } from 'react';
import {
	generateAiContent,
	isGeneratedContent,
	toGeneratedContent
} from '../api/ai';
import type { GeneratedContent } from '../lib/generatedContent/generatedContent';
import {
	templatesForLairCategory,
	type LairChatCategory
} from '../lib/lair/lairChatTemplates';

export type LairChatMessage = {
	id: string;
	role: 'assistant' | 'user';
	content: string;
};

function messageId(role: LairChatMessage['role']): string {
	return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useLairChat(onGeneratedContent: (content: GeneratedContent) => void) {
	const [draft, setDraft] = useState('');
	const [category, setCategory] = useState<LairChatCategory>('writing');
	const [templateId, setTemplateId] = useState(templatesForLairCategory('writing')[0]?.id ?? '');
	const [isGenerating, setIsGenerating] = useState(false);
	const [messages, setMessages] = useState<LairChatMessage[]>([
		{
			id: 'assistant-intro',
			role: 'assistant',
			content: 'Greetings, creator. I am your Lair Co-Dragon. Choose a request type and template, then tell me what you need.'
		}
	]);

	const selectCategory = (nextCategory: LairChatCategory) => {
		setCategory(nextCategory);
		setTemplateId(templatesForLairCategory(nextCategory)[0]?.id ?? '');
	};

	const send = async (): Promise<void> => {
		const prompt = draft.trim();
		if (!prompt || !templateId || isGenerating) {
			return;
		}

		setMessages((previous) => [...previous, { id: messageId('user'), role: 'user', content: prompt }]);
		setDraft('');
		setIsGenerating(true);
		try {
			const generation = await generateAiContent({ category, templateId, prompt });
			if (isGeneratedContent(generation)) {
				onGeneratedContent(toGeneratedContent(generation));
				setMessages((previous) => [
					...previous,
					{
						id: messageId('assistant'),
						role: 'assistant',
						content: `Generated ${generation.contentType} opened in the Content Window.`
					}
				]);
				return;
			}
			setMessages((previous) => [
				...previous,
				{ id: messageId('assistant'), role: 'assistant', content: generation.data }
			]);
		} catch (error) {
			setMessages((previous) => [
				...previous,
				{
					id: messageId('assistant'),
					role: 'assistant',
					content: error instanceof Error ? error.message : 'Unable to generate content. Please try again.'
				}
			]);
		} finally {
			setIsGenerating(false);
		}
	};

	return {
		draft,
		setDraft,
		category,
		templateId,
		setTemplateId,
		isGenerating,
		messages,
		selectCategory,
		send
	};
}
