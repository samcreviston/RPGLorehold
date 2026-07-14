export type ModuleCardAttributeSource = {
	startingLevel: number;
	endingLevel: number;
	playstyle: string;
	biomes: string[];
	authorUsername?: string;
};

export function formatModuleCardAttributes(source: ModuleCardAttributeSource): string {
	const parts = [
		`Levels ${source.startingLevel}–${source.endingLevel}`,
		source.playstyle,
		source.biomes.slice(0, 2).join(', '),
		source.authorUsername ? `by ${source.authorUsername}` : ''
	].filter(Boolean);
	return parts.join(' · ');
}
