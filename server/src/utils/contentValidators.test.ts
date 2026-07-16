import { contentUpsertSchema, moduleUpsertSchema } from './validators.js';

describe('content persistence validation', () => {
	it('accepts a valid published spell payload', () => {
		expect(
			contentUpsertSchema.parse({
				contentType: 'spell',
				title: 'Moonlit Ward',
				data: { level: 2, school: 'Abjuration', description: 'A spectral shield.' },
				status: 'published',
				visibility: 'public'
			})
		).toMatchObject({ contentType: 'spell', status: 'published', visibility: 'public' });
	});

	it('rejects a weapon without its required typed field', () => {
		expect(() =>
			contentUpsertSchema.parse({
				contentType: 'weapon',
				title: 'Broken Blade',
				data: { description: 'It needs repair.' }
			})
		).toThrow('damageDice is required for weapon');
	});

	it('rejects duplicate adventure and section IDs', () => {
		expect(() =>
			moduleUpsertSchema.parse({
				title: 'The Lost Keep',
				startingLevel: 1,
				endingLevel: 2,
				playstyle: 'Balanced',
				adventures: [
					{
						id: 'adventure-1',
						order: 0,
						title: 'First Adventure',
						sections: [{ id: 'section-1', type: 'setting', order: 0 }]
					},
					{
						id: 'adventure-1',
						order: 1,
						title: 'Second Adventure',
						sections: [{ id: 'section-1', type: 'story', order: 0 }]
					}
				]
			})
		).toThrow(/Adventure IDs must be unique[\s\S]*Section IDs must be unique/);
	});
});
