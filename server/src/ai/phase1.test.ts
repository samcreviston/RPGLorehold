import { getAiTemplate } from './promptBuilder.js';
import { validateStructuredResponse } from './validationRules.js';

describe('Lair Co-Dragon Phase 1 contracts', () => {
	it('assigns a strict token cap to every supported template', () => {
		expect(getAiTemplate('content', 'magic-item')?.maxOutputTokens).toBe(300);
		expect(getAiTemplate('content', 'monster')?.maxOutputTokens).toBe(800);
		expect(getAiTemplate('ideas', 'location-idea')?.maxOutputTokens).toBe(500);
		expect(getAiTemplate('writing', 'generate-adventure')?.maxOutputTokens).toBe(2000);
	});

	it('rejects an item response without its required card fields', () => {
		expect(() =>
			validateStructuredResponse('item', {
				itemType: 'item',
				name: 'Moonstone',
				rarity: 'Common',
				description: 'A pale stone.'
			})
		).toThrow();
	});

	it('accepts a valid item response and preserves item subtype', () => {
		expect(
			validateStructuredResponse('item', {
				itemType: 'weapon',
				name: 'Moonblade',
				rarity: 'Rare',
				description: 'A blade that catches moonlight.',
				damageDice: '1d8',
				damageType: 'Slashing',
				effects: [{ name: 'Moonlit Edge', description: 'It sheds dim light.' }]
			})
		).toMatchObject({ itemType: 'weapon', name: 'Moonblade' });
	});
});
