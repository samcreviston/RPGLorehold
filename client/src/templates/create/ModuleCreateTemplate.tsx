import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import './module-create-template.css';

type StoryBlockType = 'story' | 'dmNote' | 'setting' | 'imageMap';

type StoryBlock = {
	id: string;
	type: StoryBlockType;
	content: string;
};

type AdventureSection = {
	id: string;
	title: string;
	blocks: StoryBlock[];
};

const playstyleOptions = ['More Roleplay', 'Balanced', 'More Combat'] as const;

const alignmentOptions = ['LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE'] as const;

const biomeOptions = [
	'Forest',
	'Jungle',
	'Rainforest',
	'Temperate Forest',
	'Boreal Forest',
	'Swamp',
	'Marsh',
	'Bog',
	'Wetlands',
	'Grassland',
	'Plains',
	'Savannah',
	'Prairie',
	'Steppe',
	'Desert',
	'Badlands',
	'Canyon',
	'Mountain',
	'Hills',
	'Alpine',
	'Tundra',
	'Arctic',
	'Glacier',
	'Volcanic',
	'Wasteland',
	'Coastal',
	'Beach',
	'Island',
	'Archipelago',
	'Ocean',
	'Underwater',
	'Reef',
	'River',
	'Lake',
	'Cavern',
	'Underdark',
	'Feywild',
	'Shadowfell',
	'Astral Plane',
	'Ethereal Plane',
	'Abyss',
	'Nine Hells',
	'Elemental Plane of Fire',
	'Elemental Plane of Water',
	'Elemental Plane of Earth',
	'Elemental Plane of Air',
	'Urban',
	'Ruins',
	'Dungeon',
	'Castle',
	'Farmland',
	'Haunted',
	'Dreamscape',
	'Oasis',
	'Outer Space',
	'Other'
] as const;

const blockTypeLabelMap: Record<StoryBlockType, string> = {
	story: 'Story Text',
	dmNote: 'DM Note',
	setting: 'Setting Description',
	imageMap: 'Image/Map'
};

const contentTypeFilters = [
	'all',
	'creatures',
	'items',
	'magic items',
	'weapons',
	'armor',
	'conditions',
	'spells',
	'spell schools',
	'classes',
	'environments',
	'abilities',
	'skills',
	'services'
] as const;

type ContentTypeFilter = (typeof contentTypeFilters)[number];

type ContentManagerResult = {
	id: string;
	title: string;
	type: Exclude<ContentTypeFilter, 'all'>;
	summary: string;
	detail: string;
};

type ChatMessage = {
	id: string;
	role: 'assistant' | 'user';
	content: string;
};

const contentManagerMockCatalog: ContentManagerResult[] = [
	{
		id: 'spell-fireball',
		title: 'Fireball',
		type: 'spells',
		summary: '3rd-level evocation that deals 8d6 fire damage in a 20-foot radius.',
		detail:
			'Casting Time: 1 action\nRange: 150 feet\nComponents: V, S, M\nDuration: Instantaneous\n\nA bright streak flashes from your pointing finger to a point you choose within range and blossoms with a low roar into an explosion of flame. Creatures in a 20-foot radius sphere make a Dexterity save, taking 8d6 fire damage on a failed save, or half as much on a success.'
	},
	{
		id: 'monster-young-red-dragon',
		title: 'Young Red Dragon',
		type: 'creatures',
		summary: 'Large dragon with high mobility, fire breath, and fear presence.',
		detail:
			'Size/Type: Large dragon\nArmor Class: 18\nHit Points: 178 (17d10 + 85)\nSpeed: 40 ft., climb 40 ft., fly 80 ft.\n\nSTR 23, DEX 10, CON 21, INT 14, WIS 11, CHA 19\n\nActions include Multiattack and Fire Breath (Recharge 5-6), making it a deadly solo encounter for mid-level parties.'
	},
	{
		id: 'magic-item-bag-of-holding',
		title: 'Bag of Holding',
		type: 'magic items',
		summary: 'Uncommon wondrous item with extradimensional storage space.',
		detail:
			'Wondrous Item, Uncommon\n\nThis bag has an interior space considerably larger than its outside dimensions, roughly 2 feet in diameter at the mouth and 4 feet deep. It can hold up to 500 pounds, not exceeding a volume of 64 cubic feet. Retrieving an item from the bag requires an action.'
	},
	{
		id: 'class-wizard',
		title: 'Wizard',
		type: 'classes',
		summary: 'Arcane full-caster with wide spell preparation and utility.',
		detail:
			'Primary Ability: Intelligence\nHit Die: d6\nSaving Throws: Intelligence, Wisdom\n\nWizards prepare spells from a spellbook and can specialize via Arcane Traditions. They excel in utility, battlefield control, and magical versatility.'
	}
];

function ModuleCreateTemplate() {
	const idCounterRef = useRef(0);

	const [moduleFlavorText, setModuleFlavorText] = useState('');
	const [startingPartyLevel, setStartingPartyLevel] = useState(1);
	const [endingPartyLevel, setEndingPartyLevel] = useState(2);
	const [playstyle, setPlaystyle] = useState<(typeof playstyleOptions)[number]>('Balanced');
	const [selectedAlignments, setSelectedAlignments] = useState<string[]>([]);
	const [selectedBiomes, setSelectedBiomes] = useState<string[]>([]);
	const [selectedContentFilter, setSelectedContentFilter] = useState<ContentTypeFilter>('all');
	const [contentSearchInput, setContentSearchInput] = useState('');
	const [activeContentQuery, setActiveContentQuery] = useState('');
	const [contentViewMode, setContentViewMode] = useState<'results' | 'detail'>('results');
	const [selectedContentResult, setSelectedContentResult] = useState<ContentManagerResult | null>(null);
	const [chatDraft, setChatDraft] = useState('');
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
		{
			id: 'assistant-intro',
			role: 'assistant',
			content: 'Greetings, creator. I am your Lair Co-Dragon. Ask for story hooks, pacing help, or encounter ideas.'
		}
	]);
	const [isSidebarToolsOpen, setIsSidebarToolsOpen] = useState(false);
	const [inlineAddSectionMenu, setInlineAddSectionMenu] = useState<{
		adventureId: string;
		afterBlockId: string;
	} | null>(null);
	const [adventures, setAdventures] = useState<AdventureSection[]>(() => [
		createAdventureSection(() => nextId(idCounterRef), 1)
	]);

	const adventureCount = adventures.length;

	const updateAdventureCount = (nextCount: number) => {
		const sanitizedTargetCount = Number.isFinite(nextCount) ? Math.max(1, nextCount) : 1;

		setAdventures((previousAdventures) => {
			if (sanitizedTargetCount === previousAdventures.length) {
				return previousAdventures;
			}

			if (sanitizedTargetCount < previousAdventures.length) {
				return previousAdventures.slice(0, sanitizedTargetCount);
			}

			const nextAdventures = [...previousAdventures];
			for (let index = previousAdventures.length; index < sanitizedTargetCount; index += 1) {
				nextAdventures.push(createAdventureSection(() => nextId(idCounterRef), index + 1));
			}
			return nextAdventures;
		});
	};

	const addAdventure = () => {
		setAdventures((previousAdventures) => [
			...previousAdventures,
			createAdventureSection(() => nextId(idCounterRef), previousAdventures.length + 1)
		]);
	};

	const updateAdventureTitle = (adventureId: string, title: string) => {
		setAdventures((previousAdventures) =>
			previousAdventures.map((adventure) =>
				adventure.id === adventureId ? { ...adventure, title } : adventure
			)
		);
	};

	const addBlockToAdventure = (adventureId: string, blockType: StoryBlockType, insertAtIndex?: number) => {
		setAdventures((previousAdventures) =>
			previousAdventures.map((adventure) => {
				if (adventure.id !== adventureId) {
					return adventure;
				}

				const nextBlock = { id: nextId(idCounterRef), type: blockType, content: '' };
				const nextBlocks = [...adventure.blocks];

				if (
					typeof insertAtIndex === 'number' &&
					insertAtIndex >= 0 &&
					insertAtIndex <= nextBlocks.length
				) {
					nextBlocks.splice(insertAtIndex, 0, nextBlock);
				} else {
					nextBlocks.push(nextBlock);
				}

				return {
					...adventure,
					blocks: nextBlocks
				};
			})
		);
	};

	const updateBlockContent = (adventureId: string, blockId: string, content: string) => {
		setAdventures((previousAdventures) =>
			previousAdventures.map((adventure) => {
				if (adventure.id !== adventureId) {
					return adventure;
				}

				return {
					...adventure,
					blocks: adventure.blocks.map((block) =>
						block.id === blockId ? { ...block, content } : block
					)
				};
			})
		);
	};

	const moveBlock = (adventureId: string, fromIndex: number, direction: -1 | 1) => {
		setAdventures((previousAdventures) =>
			previousAdventures.map((adventure) => {
				if (adventure.id !== adventureId) {
					return adventure;
				}

				const toIndex = fromIndex + direction;
				if (toIndex < 0 || toIndex >= adventure.blocks.length) {
					return adventure;
				}

				const nextBlocks = [...adventure.blocks];
				const fromBlock = nextBlocks[fromIndex];
				const toBlock = nextBlocks[toIndex];
				if (!fromBlock || !toBlock) {
					return adventure;
				}

				nextBlocks[fromIndex] = toBlock;
				nextBlocks[toIndex] = fromBlock;

				return {
					...adventure,
					blocks: nextBlocks
				};
			})
		);
	};

	const toggleInlineAddSectionMenu = (adventureId: string, afterBlockId: string) => {
		setInlineAddSectionMenu((previousMenu) => {
			if (
				previousMenu?.adventureId === adventureId &&
				previousMenu.afterBlockId === afterBlockId
			) {
				return null;
			}

			return { adventureId, afterBlockId };
		});
	};

	const addInlineBlockToAdventure = (
		adventureId: string,
		blockType: StoryBlockType,
		insertAtIndex: number
	) => {
		addBlockToAdventure(adventureId, blockType, insertAtIndex);
		setInlineAddSectionMenu(null);
	};

	const toggleSelection = (value: string, selectedValues: string[], onChange: (values: string[]) => void) => {
		if (selectedValues.includes(value)) {
			onChange(selectedValues.filter((selectedValue) => selectedValue !== value));
			return;
		}

		onChange([...selectedValues, value]);
	};

	const visibleContentTypes =
		selectedContentFilter === 'all'
			? contentTypeFilters.filter((contentTypeFilter) => contentTypeFilter !== 'all')
			: [selectedContentFilter];

	const contentManagerResults = useMemo(() => {
		const normalizedQuery = activeContentQuery.trim().toLowerCase();

		return contentManagerMockCatalog.filter((entry) => {
			const matchesType = visibleContentTypes.includes(entry.type);
			if (!matchesType) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return (
				entry.title.toLowerCase().includes(normalizedQuery) ||
				entry.summary.toLowerCase().includes(normalizedQuery)
			);
		});
	}, [activeContentQuery, visibleContentTypes]);

	const submitContentSearch = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setActiveContentQuery(contentSearchInput);
		setSelectedContentResult(null);
		setContentViewMode('results');
	};

	const openContentDetail = (result: ContentManagerResult) => {
		setSelectedContentResult(result);
		setContentViewMode('detail');
	};

	const returnToContentResults = () => {
		setContentViewMode('results');
		setSelectedContentResult(null);
	};

	const sendChatMessage = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedMessage = chatDraft.trim();
		if (!trimmedMessage) {
			return;
		}

		const userMessage: ChatMessage = {
			id: `user-${Date.now()}`,
			role: 'user',
			content: trimmedMessage
		};

		const assistantReply: ChatMessage = {
			id: `assistant-${Date.now()}`,
			role: 'assistant',
			content: 'I can help shape that scene. API and backend chat hookup comes next in the workflow.'
		};

		setChatMessages((previousMessages) => [...previousMessages, userMessage, assistantReply]);
		setChatDraft('');
	};

	return (
		<section className="template-card module-create-template" aria-label="Module create template">
			<h2>Module Builder Template</h2>
			<p>Build reusable module and campaign story sections from modular adventure blocks.</p>

			<div className="module-create-workspace">
				<aside className="sidebar-tools" aria-label="Sidebar tools">
					<button
						type="button"
						className="sidebar-tools-summary"
						onClick={() => setIsSidebarToolsOpen((previousValue) => !previousValue)}
						aria-expanded={isSidebarToolsOpen}
					>
						Sidebar Tools
					</button>
					<div className={`sidebar-tools-content ${isSidebarToolsOpen ? 'sidebar-tools-content--open' : ''}`}>
							<section className="sidebar-tool-card content-manager-tool" aria-label="5e Content Manager">
								<h4>5e Content Manager</h4>
								<p className="content-manager-helper">
									highlight text in your story or dm note to attach D&amp;D content!
								</p>

								<div className="content-filter-row" aria-label="5e content filters">
									{contentTypeFilters.map((filter) => {
										const isSelected = selectedContentFilter === filter;
										return (
											<button
												key={filter}
												type="button"
												className={`content-filter-chip ${isSelected ? 'content-filter-chip--selected' : ''}`}
												onClick={() => setSelectedContentFilter(filter)}
											>
												{filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
											</button>
										);
									})}
								</div>

								<form className="content-search-form" onSubmit={submitContentSearch}>
									<input
										type="search"
										value={contentSearchInput}
										onChange={(event) => setContentSearchInput(event.target.value)}
										placeholder="select a type or all to begin searching"
										aria-label="Search 5e content"
									/>
								</form>

								<section className="content-results-panel" aria-label="5e content results and detail">
									{contentViewMode === 'detail' && selectedContentResult ? (
										<div className="content-detail-view">
											<div className="content-detail-toolbar">
												<button
													type="button"
													className="content-back-button"
													onClick={returnToContentResults}
													aria-label="Back to search results"
												>
													←
												</button>
												<button type="button" className="content-connect-button">
													connect to text
												</button>
											</div>
											<h5>{selectedContentResult.title}</h5>
											<p className="content-result-type">({selectedContentResult.type})</p>
											<pre className="content-result-detail">{selectedContentResult.detail}</pre>
										</div>
									) : (
										<div className="content-results-list" role="list">
											{contentManagerResults.length > 0 ? (
												contentManagerResults.map((result) => (
													<button
														key={result.id}
														type="button"
														className="content-result-item"
														onClick={() => openContentDetail(result)}
													>
														<strong>{result.title}</strong>
														<span>{result.summary}</span>
													</button>
												))
											) : (
												<p className="content-results-empty">
													No visual results yet. Choose filters and run a search to populate this panel.
												</p>
											)}
										</div>
									)}
								</section>
							</section>

							<section className="sidebar-tool-card lair-chat-tool" aria-label="Lair Co-Dragon Chat">
								<h4>Lair Co-Dragon Chat</h4>
								<div className="lair-chat-log" aria-live="polite">
									{chatMessages.map((message) => (
										<article
											key={message.id}
											className={`lair-chat-message lair-chat-message--${message.role}`}
										>
											<p>{message.content}</p>
										</article>
									))}
								</div>
								<form className="lair-chat-input-wrap" onSubmit={sendChatMessage}>
									<textarea
										value={chatDraft}
										onChange={(event) => setChatDraft(event.target.value)}
										placeholder="Discuss your story ideas with the Lair Co-Dragon..."
										rows={4}
										aria-label="Chat reply"
									/>
									<button type="submit" className="lair-chat-send-button">
										Send
									</button>
								</form>
							</section>
						</div>
				</aside>

				<div className="module-create-main">

			<section className="story-content-info" aria-label="Story content info">
				<h3>Story Content Info</h3>

				<div className="module-create-form-grid">
					<label htmlFor="module-flavor-text">Module Flavor Text</label>
					<input
						id="module-flavor-text"
						type="text"
						maxLength={100}
						value={moduleFlavorText}
						onChange={(event) => setModuleFlavorText(event.target.value)}
						placeholder="Short one-line flavor text"
					/>
					<p className="field-help">
						{moduleFlavorText.length}/100 characters
					</p>

					<label htmlFor="starting-party-level">Starting Party Level</label>
					<input
						id="starting-party-level"
						type="number"
						min={1}
						max={20}
						value={startingPartyLevel}
						onChange={(event) => {
							const nextValue = Number.parseInt(event.target.value, 10);
							if (Number.isNaN(nextValue)) {
								return;
							}
							const clampedValue = Math.min(20, Math.max(1, nextValue));
							setStartingPartyLevel(clampedValue);
							setEndingPartyLevel((previousEndValue) => Math.max(previousEndValue, Math.max(2, clampedValue)));
						}}
					/>
					<p className="field-help">One-shots and modules/campaigns starting at this level.</p>

					<label htmlFor="ending-party-level">Ending Party Level</label>
					<input
						id="ending-party-level"
						type="number"
						min={2}
						max={20}
						value={endingPartyLevel}
						onChange={(event) => {
							const nextValue = Number.parseInt(event.target.value, 10);
							if (Number.isNaN(nextValue)) {
								return;
							}
							const minEndingValue = Math.max(2, startingPartyLevel);
							const clampedValue = Math.min(20, Math.max(minEndingValue, nextValue));
							setEndingPartyLevel(clampedValue);
						}}
					/>
					<p className="field-help">
						Non-one-shots: use start and end party levels to show progression.
						{endingPartyLevel > Math.max(2, startingPartyLevel)
							? ''
							: ' End level currently at minimum allowed by start level.'}
					</p>

					<label htmlFor="adventure-count"># of Adventures</label>
					<input
						id="adventure-count"
						type="number"
						min={1}
						value={adventureCount}
						onChange={(event) => {
							const nextCount = Number.parseInt(event.target.value, 10);
							if (Number.isNaN(nextCount)) {
								return;
							}
							updateAdventureCount(nextCount);
						}}
					/>
					<p className="field-help">Automatically synced with the adventure cards below.</p>

					<label htmlFor="playstyle">Playstyle</label>
					<select
						id="playstyle"
						value={playstyle}
						onChange={(event) =>
							setPlaystyle(event.target.value as (typeof playstyleOptions)[number])
						}
					>
						{playstyleOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					<p className="field-help">Set the expected RP/combat balance for this content.</p>
				</div>

				<fieldset className="checkbox-fieldset">
					<legend>Alignments</legend>
					<div className="checkbox-chip-grid checkbox-chip-grid--compact">
						{alignmentOptions.map((alignment) => (
							<label className="checkbox-chip" key={alignment}>
								<input
									type="checkbox"
									checked={selectedAlignments.includes(alignment)}
									onChange={() =>
										toggleSelection(alignment, selectedAlignments, setSelectedAlignments)
									}
								/>
								<span>{alignment}</span>
							</label>
						))}
					</div>
				</fieldset>

				<fieldset className="checkbox-fieldset">
					<legend>Biomes</legend>
					<div className="checkbox-chip-grid">
						{biomeOptions.map((biome) => (
							<label className="checkbox-chip" key={biome}>
								<input
									type="checkbox"
									checked={selectedBiomes.includes(biome)}
									onChange={() => toggleSelection(biome, selectedBiomes, setSelectedBiomes)}
								/>
								<span>{biome}</span>
							</label>
						))}
					</div>
				</fieldset>
			</section>

			<h3 className="story-begins-heading">Where the Story Begins!</h3>

			<section className="story-content" aria-label="Story content">
				<h3>Story Content</h3>
				<div className="adventure-list">
					{adventures.map((adventure) => (
						<article key={adventure.id} className="adventure-card">
							<label htmlFor={`adventure-title-${adventure.id}`}>(Adventure Title)</label>
							<input
								id={`adventure-title-${adventure.id}`}
								type="text"
								value={adventure.title}
								onChange={(event) => updateAdventureTitle(adventure.id, event.target.value)}
								placeholder="Enter adventure title"
							/>

							<div className="story-block-list">
								{adventure.blocks.map((block, blockIndex) => (
									<div key={block.id} className="story-block-flow-item">
										<section className={`story-block-card story-block-card--${block.type}`}>
											<div className="story-block-heading-row">
												<h5>({blockTypeLabelMap[block.type]})</h5>
												<div className="story-block-order-controls" aria-label="Reorder block">
													<button
														type="button"
														onClick={() => moveBlock(adventure.id, blockIndex, -1)}
														disabled={blockIndex === 0}
														aria-label={`Move ${blockTypeLabelMap[block.type]} up`}
													>
														↑
													</button>
													<button
														type="button"
														onClick={() => moveBlock(adventure.id, blockIndex, 1)}
														disabled={blockIndex === adventure.blocks.length - 1}
														aria-label={`Move ${blockTypeLabelMap[block.type]} down`}
													>
														↓
													</button>
												</div>
											</div>

											{block.type === 'imageMap' ? (
												<button type="button" className="upload-placeholder-button">
													Upload a file (.jpeg, .png, .pdf)
												</button>
											) : (
												<textarea
													value={block.content}
													onChange={(event) =>
														updateBlockContent(adventure.id, block.id, event.target.value)
													}
													placeholder={`Enter ${blockTypeLabelMap[block.type]} content`}
													rows={6}
												/>
											)}
										</section>

										{blockIndex < adventure.blocks.length - 1 ? (
											inlineAddSectionMenu?.adventureId === adventure.id &&
											inlineAddSectionMenu.afterBlockId === block.id ? (
												<section className="add-section-card-options add-section-card-options--inline" aria-label="Choose section type">
													<button
														type="button"
														className="add-card-button"
														onClick={() => addInlineBlockToAdventure(adventure.id, 'story', blockIndex + 1)}
													>
														+ Story Text
													</button>
													<button
														type="button"
														className="add-card-button"
														onClick={() => addInlineBlockToAdventure(adventure.id, 'dmNote', blockIndex + 1)}
													>
														+ DM Note
													</button>
													<button
														type="button"
														className="add-card-button"
														onClick={() =>
															addInlineBlockToAdventure(adventure.id, 'setting', blockIndex + 1)
														}
													>
														+ Setting Description
													</button>
													<button
														type="button"
														className="add-card-button"
														onClick={() => addInlineBlockToAdventure(adventure.id, 'imageMap', blockIndex + 1)}
													>
														+ Image/Map
													</button>
												</section>
											) : (
												<button
													type="button"
													className="add-card-button add-section-card"
													onClick={() => toggleInlineAddSectionMenu(adventure.id, block.id)}
												>
													+ Section Card
												</button>
											)
										) : null}
									</div>
								))}

								<section className="add-section-card-options" aria-label="Choose section type">
									<button
										type="button"
										className="add-card-button"
										onClick={() => addBlockToAdventure(adventure.id, 'story')}
									>
										+ Story Text
									</button>
									<button
										type="button"
										className="add-card-button"
										onClick={() => addBlockToAdventure(adventure.id, 'dmNote')}
									>
										+ DM Note
									</button>
									<button
										type="button"
										className="add-card-button"
										onClick={() => addBlockToAdventure(adventure.id, 'setting')}
									>
										+ Setting Description
									</button>
									<button
										type="button"
										className="add-card-button"
										onClick={() => addBlockToAdventure(adventure.id, 'imageMap')}
									>
										+ Image/Map
									</button>
								</section>
							</div>
						</article>
					))}
				</div>

				<button type="button" className="add-card-button add-adventure-button" onClick={addAdventure}>
					+ Adventure Card
				</button>
			</section>
				</div>
			</div>
		</section>
	);
}

function createAdventureSection(nextIdFactory: () => string, position: number): AdventureSection {
	return {
		id: nextIdFactory(),
		title: `Adventure ${position}`,
		blocks: [
			{
				id: nextIdFactory(),
				type: 'setting',
				content: ''
			}
		]
	};
}

function nextId(counterRef: MutableRefObject<number>): string {
	const nextValue = (counterRef.current ?? 0) + 1;
	counterRef.current = nextValue;
	return `story-template-item-${nextValue}`;
}

export default ModuleCreateTemplate;
