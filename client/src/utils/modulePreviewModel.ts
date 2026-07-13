import type { ModuleAdventure, ModuleDocument } from '../types/module';

export type ModulePreviewBlockType = 'story' | 'dmNote' | 'setting' | 'imageMap';

export type ModulePreviewBlock = {
	id: string;
	type: ModulePreviewBlockType;
	content: string;
	imageID?: string;
	caption?: string;
};

export type ModulePreviewAdventure = {
	id: string;
	title: string;
	blocks: ModulePreviewBlock[];
};

function stripHtmlToText(html: string): string {
	return html
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function isPreviewBlockEmpty(block: ModulePreviewBlock): boolean {
	if (block.type === 'imageMap') {
		return !block.imageID?.trim() && !stripHtmlToText(block.content);
	}
	return !stripHtmlToText(block.content);
}

export function isModulePreviewEmpty(title: string, adventures: ModulePreviewAdventure[]): boolean {
	if (title.trim()) {
		return false;
	}
	return !adventures.some((adventure) => adventure.blocks.some((block) => !isPreviewBlockEmpty(block)));
}

export function adventuresFromModuleDocument(doc: ModuleDocument): ModulePreviewAdventure[] {
	return (doc.adventures ?? [])
		.slice()
		.sort((a, b) => a.order - b.order)
		.map((adventure) => adventureToPreviewAdventure(adventure));
}

export function adventureToPreviewAdventure(adventure: ModuleAdventure): ModulePreviewAdventure {
	return {
		id: adventure.id,
		title: adventure.title ?? '',
		blocks: (adventure.sections ?? [])
			.slice()
			.sort((a, b) => a.order - b.order)
			.map((section) => ({
				id: section.id,
				type: (section.type === 'image' ? 'imageMap' : section.type) as ModulePreviewBlockType,
				content: section.content ?? '',
				imageID: section.imageID ?? '',
				caption: section.caption ?? ''
			}))
	};
}
