export const LAIR_CHAT_CATEGORIES = ['writing', 'content', 'ideas'] as const;

export type LairChatCategory = (typeof LAIR_CHAT_CATEGORIES)[number];

export type LairChatTemplate = {
	id: string;
	label: string;
	category: LairChatCategory;
};

export const LAIR_CHAT_TEMPLATES: readonly LairChatTemplate[] = [
	{ id: 'edit-paragraph', label: 'Edit Paragraph', category: 'writing' },
	{ id: 'edit-adventure', label: 'Edit Adventure', category: 'writing' },
	{ id: 'generate-paragraph', label: 'Generate Paragraph', category: 'writing' },
	{ id: 'generate-adventure', label: 'Generate Adventure', category: 'writing' },
	{ id: 'non-magic-item', label: 'Non-Magic Item Creation', category: 'content' },
	{ id: 'magic-item', label: 'Magic Item Creation', category: 'content' },
	{ id: 'cursed-item', label: 'Cursed Item Creation', category: 'content' },
	{ id: 'monster', label: 'Monster Creation', category: 'content' },
	{ id: 'npc-story', label: 'NPC (Story-only) Creation', category: 'content' },
	{ id: 'npc-stats', label: 'NPC (Stats-only) Creation', category: 'content' },
	{ id: 'npc-full', label: 'NPC (Stats & Story) Creation', category: 'content' },
	{ id: 'spell', label: 'Spell Creation', category: 'content' },
	{ id: 'adventure-idea', label: 'Adventure Idea Generator', category: 'ideas' },
	{ id: 'module-idea', label: 'Module Idea Generator', category: 'ideas' },
	{ id: 'item-name', label: 'Item Name Generator', category: 'ideas' },
	{ id: 'monster-name', label: 'Monster Name Generator', category: 'ideas' },
	{ id: 'familiar-name', label: 'Familiar Name Generator', category: 'ideas' },
	{ id: 'race-name', label: 'Race Name Generator', category: 'ideas' },
	{ id: 'setting-idea', label: 'Setting Idea Generator', category: 'ideas' },
	{ id: 'location-idea', label: 'Location Idea Generator', category: 'ideas' }
];

export const LAIR_CATEGORY_LABELS: Record<LairChatCategory, string> = {
	writing: 'Writing question/request',
	content: 'Content creation',
	ideas: 'Idea/name generation'
};

export function templatesForLairCategory(category: LairChatCategory): readonly LairChatTemplate[] {
	return LAIR_CHAT_TEMPLATES.filter((template) => template.category === category);
}
