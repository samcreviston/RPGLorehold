import { useEffect, useEffectEvent, useRef, useState, type MutableRefObject } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createModule, getModule, publishModule, updateModule } from '../../api/modules';
import CreatureStatBlock from '../../components/content/CreatureStatBlock';
import StoryBlockEditor, {
	type PendingContentLink,
	type StoryBlockEditorHandle
} from '../../components/editor/StoryBlockEditor';
import type { MappedCreatureStatblock, Open5eCreature } from '../../lib/open5e/creatureTypes';
import { mapOpen5eCreatureToStatblock } from '../../lib/open5e/mapOpen5eCreatureToStatblock';
import type { ModuleDocument, ModuleUpsertPayload, Playstyle } from '../../types/module';
import './module-create-template.css';

type StoryBlockType = 'story' | 'dmNote' | 'setting' | 'imageMap';

type StoryBlock = {
	id: string;
	type: StoryBlockType;
	content: string;
	imageID?: string;
	caption?: string;
};

type AdventureSection = {
	id: string;
	title: string;
	summary?: string;
	estimatedPlayTime?: number;
	blocks: StoryBlock[];
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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

const open5eEndpointByFilter: Record<Exclude<ContentTypeFilter, 'all'>, string> = {
	creatures: 'creatures',
	items: 'items',
	'magic items': 'magicitems',
	weapons: 'weapons',
	armor: 'armor',
	conditions: 'conditions',
	spells: 'spells',
	'spell schools': 'spellschools',
	classes: 'classes',
	environments: 'environments',
	abilities: 'abilities',
	skills: 'skills',
	services: 'services'
};

type ContentManagerResult = {
	id: string;
	name: string;
	slug?: string;
	objectModel?: string;
	detailPath?: string;
};

function isCreatureResult(result: ContentManagerResult): boolean {
	const model = result.objectModel?.toLowerCase() ?? '';
	const path = result.detailPath?.toLowerCase() ?? '';
	return model === 'creature' || path.includes('creatures');
}

function buildCreatureContentLink(name: string, documentKey: string): string {
	return `https://api.open5e.com/v2/creatures/?name__iexact=${encodeURIComponent(name)}&document__key__in=${encodeURIComponent(documentKey)}`;
}

type ChatMessage = {
	id: string;
	role: 'assistant' | 'user';
	content: string;
};

function ModuleCreateTemplate() {
	const idCounterRef = useRef(0);
	const [searchParams, setSearchParams] = useSearchParams();
	const loadedModuleIdRef = useRef<string | null>(null);

	const [moduleId, setModuleId] = useState<string | null>(null);
	const [moduleStatus, setModuleStatus] = useState<'draft' | 'published'>('draft');
	const [moduleTitle, setModuleTitle] = useState('');
	const [moduleFlavorText, setModuleFlavorText] = useState('');
	const [startingPartyLevel, setStartingPartyLevel] = useState(1);
	const [endingPartyLevel, setEndingPartyLevel] = useState(2);
	const [playstyle, setPlaystyle] = useState<Playstyle>('Balanced');
	const [selectedAlignments, setSelectedAlignments] = useState<string[]>([]);
	const [selectedBiomes, setSelectedBiomes] = useState<string[]>([]);
	const [selectedContentFilter, setSelectedContentFilter] = useState<ContentTypeFilter>('all');
	const [contentSearchInput, setContentSearchInput] = useState('');
	const [contentSearchResults, setContentSearchResults] = useState<ContentManagerResult[]>([]);
	const [contentResultCount, setContentResultCount] = useState(0);
	const [contentSearchStatus, setContentSearchStatus] = useState<'idle' | 'loading' | 'done'>('idle');
	const [contentViewMode, setContentViewMode] = useState<'results' | 'detail'>('results');
	const [selectedContentResult, setSelectedContentResult] = useState<ContentManagerResult | null>(null);
	const [creatureStatblock, setCreatureStatblock] = useState<MappedCreatureStatblock | null>(null);
	const [creatureDetailStatus, setCreatureDetailStatus] = useState<'idle' | 'loading' | 'error'>('idle');
	const [creatureDetailError, setCreatureDetailError] = useState('');
	const [selectedCreatureDocumentKey, setSelectedCreatureDocumentKey] = useState('');
	const [pendingContentLink, setPendingContentLink] = useState<PendingContentLink | null>(null);
	const contentSearchInputRef = useRef<HTMLInputElement | null>(null);
	const storyEditorRefs = useRef<Record<string, StoryBlockEditorHandle | null>>({});
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
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
	const [saveMessage, setSaveMessage] = useState('');
	const isSavingRef = useRef(false);

	const adventureCount = adventures.length;

	const buildPayload = (status?: 'draft' | 'published'): ModuleUpsertPayload => ({
		title: moduleTitle.trim(),
		flavorText: moduleFlavorText,
		startingLevel: startingPartyLevel,
		endingLevel: endingPartyLevel,
		playstyle,
		alignments: selectedAlignments,
		biomes: selectedBiomes,
		coverImage: null,
		tags: [],
		adventures: adventures.map((adventure, adventureIndex) => ({
			id: adventure.id,
			order: adventureIndex,
			title: adventure.title.trim() || `Adventure ${adventureIndex + 1}`,
			summary: adventure.summary ?? '',
			estimatedPlayTime: adventure.estimatedPlayTime ?? 0,
			sections: adventure.blocks.map((block, blockIndex) => ({
				id: block.id,
				type: block.type === 'imageMap' ? 'image' : block.type,
				order: blockIndex,
				content: block.content,
				imageID: block.imageID ?? '',
				caption: block.caption ?? ''
			}))
		})),
		...(status ? { status } : {})
	});

	const applyLoadedModule = (doc: ModuleDocument) => {
		const resolvedId = String(doc._id);
		setModuleId(resolvedId);
		setModuleStatus(doc.status);
		setModuleTitle(doc.title ?? '');
		setModuleFlavorText(doc.flavorText ?? '');
		setStartingPartyLevel(doc.startingLevel ?? 1);
		setEndingPartyLevel(doc.endingLevel ?? 2);
		setPlaystyle(doc.playstyle ?? 'Balanced');
		setSelectedAlignments(doc.alignments ?? []);
		setSelectedBiomes(doc.biomes ?? []);
		setAdventures(
			(doc.adventures ?? []).length > 0
				? (doc.adventures ?? [])
						.slice()
						.sort((a, b) => a.order - b.order)
						.map((adventure) => ({
							id: adventure.id,
							title: adventure.title,
							summary: adventure.summary ?? '',
							estimatedPlayTime: adventure.estimatedPlayTime ?? 0,
							blocks:
								(adventure.sections ?? []).length > 0
									? (adventure.sections ?? [])
											.slice()
											.sort((a, b) => a.order - b.order)
											.map((section) => ({
												id: section.id,
												type: (section.type === 'image' ? 'imageMap' : section.type) as StoryBlockType,
												content: section.content ?? '',
												imageID: section.imageID ?? '',
												caption: section.caption ?? ''
											}))
									: [
											{
												id: nextId(idCounterRef),
												type: 'setting' as const,
												content: ''
											}
									  ]
						}))
				: [createAdventureSection(() => nextId(idCounterRef), 1)]
		);
		loadedModuleIdRef.current = resolvedId;
		setSearchParams(
			(previous) => {
				const next = new URLSearchParams(previous);
				next.set('moduleId', resolvedId);
				return next;
			},
			{ replace: true }
		);
	};

	const moduleIdFromQuery = searchParams.get('moduleId')?.trim() ?? '';

	useEffect(() => {
		if (!moduleIdFromQuery || loadedModuleIdRef.current === moduleIdFromQuery) {
			return;
		}

		let cancelled = false;
		setSaveStatus('saving');
		setSaveMessage('Loading module…');

		const load = async () => {
			try {
				const doc = await getModule(moduleIdFromQuery);
				if (cancelled) {
					return;
				}
				applyLoadedModule(doc);
				setSaveStatus('saved');
				setSaveMessage('Module loaded.');
			} catch (error) {
				if (cancelled) {
					return;
				}
				loadedModuleIdRef.current = null;
				setSaveStatus('error');
				setSaveMessage(error instanceof Error ? error.message : 'Failed to load module.');
			}
		};

		void load();
		return () => {
			cancelled = true;
		};
	}, [moduleIdFromQuery]);

	const persistModule = async (mode: 'draft' | 'publish' | 'autosave') => {
		if (isSavingRef.current) {
			return;
		}

		const title = moduleTitle.trim();
		if (!title) {
			if (mode !== 'autosave') {
				setSaveStatus('error');
				setSaveMessage('Add a module title before saving.');
			}
			return;
		}

		isSavingRef.current = true;
		if (mode !== 'autosave') {
			setSaveStatus('saving');
			setSaveMessage(mode === 'publish' ? 'Publishing…' : 'Saving draft…');
		}

		try {
			let saved: ModuleDocument;

			if (mode === 'publish') {
				saved = await publishModule(buildPayload('published'), moduleId);
			} else if (moduleId) {
				const status = mode === 'autosave' ? moduleStatus : 'draft';
				saved = await updateModule(moduleId, buildPayload(status));
			} else {
				saved = await createModule(buildPayload('draft'));
			}

			applyLoadedModule(saved);
			setSaveStatus('saved');
			setSaveMessage(
				mode === 'publish'
					? 'Module published.'
					: mode === 'autosave'
						? 'Autosaved.'
						: 'Draft saved.'
			);
		} catch (error) {
			console.error(error);
			setSaveStatus('error');
			setSaveMessage(error instanceof Error ? error.message : 'Save failed.');
		} finally {
			isSavingRef.current = false;
		}
	};

	const onAutosave = useEffectEvent(() => {
		void persistModule('autosave');
	});

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			onAutosave();
		}, 30_000);

		return () => window.clearInterval(intervalId);
	}, [onAutosave]);

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

	useEffect(() => {
		const query = contentSearchInput.trim();
		if (!query) {
			setContentSearchResults([]);
			setContentResultCount(0);
			setContentSearchStatus('idle');
			return;
		}

		const controller = new AbortController();
		setContentSearchStatus('loading');
		const timeoutId = window.setTimeout(async () => {
			const usesCatalogKeyFilter =
				selectedContentFilter === 'armor' ||
				selectedContentFilter === 'weapons' ||
				selectedContentFilter === 'conditions' ||
				selectedContentFilter === 'spell schools' ||
				selectedContentFilter === 'classes' ||
				selectedContentFilter === 'environments' ||
				selectedContentFilter === 'services';

			const path =
				selectedContentFilter === 'all'
					? `search/?query=${encodeURIComponent(query)}`
					: selectedContentFilter === 'abilities'
						? `${open5eEndpointByFilter.abilities}/?fields=key,descriptions,name`
						: usesCatalogKeyFilter
							? `${open5eEndpointByFilter[selectedContentFilter]}/?exclude=document`
							: `${open5eEndpointByFilter[selectedContentFilter]}/?name__icontains=${encodeURIComponent(query)}`;

			try {
				const response = await fetch(`/open5e-api/${path}`, { signal: controller.signal });
				const data = await response.json();
				console.log(data);

				const searchLower = query.toLowerCase();
				const rawResults = (data.results ?? []) as Array<{
					key?: string;
					object_pk?: string;
					slug?: string;
					name?: string;
					object_name?: string;
					object_model?: string;
					route?: string;
				}>;

				// Some Open5e list endpoints return the full catalog; filter client-side.
				const catalogEndpoints = [
					'armor/',
					'weapons/',
					'conditions/',
					'spellschools/',
					'classes/',
					'environments/',
					'services/',
					'abilities/'
				];
				const isCatalogEndpoint = catalogEndpoints.some((endpoint) => path.startsWith(endpoint));
				const sourceResults =
					selectedContentFilter === 'abilities'
						? rawResults.filter((item) => (item.name ?? '').toLowerCase().includes(searchLower))
						: usesCatalogKeyFilter || isCatalogEndpoint
							? rawResults.filter((item) => (item.key ?? '').toLowerCase().includes(searchLower))
							: rawResults;

				const results: ContentManagerResult[] = sourceResults.map((entry, index) => {
					const slugOrKey = entry.slug ?? entry.object_pk ?? entry.key ?? String(index);
					const route = entry.route?.replace(/^v2\//, '') ?? '';
					const inferredCreature =
						selectedContentFilter === 'creatures' ||
						entry.object_model?.toLowerCase() === 'creature' ||
						route.includes('creatures');

					const objectModel =
						entry.object_model ??
						(selectedContentFilter === 'creatures'
							? 'Creature'
							: selectedContentFilter === 'armor'
								? 'Armor'
								: selectedContentFilter === 'weapons'
									? 'Weapon'
									: undefined);

					const detailPath = inferredCreature
						? `creatures/${slugOrKey}/`
						: route
							? `${route.replace(/\/?$/, '/')}${slugOrKey}/`
							: selectedContentFilter === 'armor'
								? `armor/${slugOrKey}/`
								: selectedContentFilter === 'weapons'
									? `weapons/${slugOrKey}/`
									: undefined;

					return {
						id: slugOrKey,
						name: entry.name ?? entry.object_name ?? 'Unknown',
						slug: slugOrKey,
						...(objectModel ? { objectModel } : {}),
						...(detailPath ? { detailPath } : {})
					};
				});

				setContentSearchResults(results);
				setContentResultCount(results.length);
				setContentSearchStatus('done');
				setSelectedContentResult(null);
				setCreatureStatblock(null);
				setCreatureDetailStatus('idle');
				setCreatureDetailError('');
				setContentViewMode('results');
			} catch (error) {
				if ((error as Error).name === 'AbortError') {
					return;
				}
				console.error(error);
				setContentSearchResults([]);
				setContentResultCount(0);
				setContentSearchStatus('done');
			}
		}, 1000);

		return () => {
			window.clearTimeout(timeoutId);
			controller.abort();
		};
	}, [contentSearchInput, selectedContentFilter]);

	const openContentDetail = (result: ContentManagerResult) => {
		setSelectedContentResult(result);
		setContentViewMode('detail');
		setCreatureStatblock(null);
		setCreatureDetailError('');
		setSelectedCreatureDocumentKey('');

		if (!isCreatureResult(result)) {
			setCreatureDetailStatus('idle');
			return;
		}

		const detailPath = result.detailPath ?? `creatures/${result.slug ?? result.id}/`;
		setCreatureDetailStatus('loading');

		void (async () => {
			try {
				const response = await fetch(`/open5e-api/${detailPath}`);
				if (!response.ok) {
					throw new Error(`Failed to load creature (${response.status})`);
				}
				const data = (await response.json()) as Open5eCreature;
				setSelectedCreatureDocumentKey(data.document?.key ?? '');
				setCreatureStatblock(mapOpen5eCreatureToStatblock(data));
				setCreatureDetailStatus('idle');
			} catch (error) {
				console.error(error);
				setCreatureDetailStatus('error');
				setCreatureDetailError(error instanceof Error ? error.message : 'Failed to load creature.');
			}
		})();
	};

	const returnToContentResults = () => {
		setContentViewMode('results');
		setSelectedContentResult(null);
		setCreatureStatblock(null);
		setCreatureDetailStatus('idle');
		setCreatureDetailError('');
		setSelectedCreatureDocumentKey('');
	};

	const requestLinkContent = (pending: PendingContentLink) => {
		setPendingContentLink(pending);
		setIsSidebarToolsOpen(true);
		window.requestAnimationFrame(() => {
			const input = contentSearchInputRef.current;
			if (!input) {
				return;
			}
			input.focus();
			const caret = input.value.length;
			input.setSelectionRange(caret, caret);
		});
	};

	const connectSelectedContentToText = () => {
		if (!pendingContentLink || !selectedContentResult) {
			return;
		}
		if (!isCreatureResult(selectedContentResult) || !selectedCreatureDocumentKey) {
			console.warn('Content linking currently supports creatures with a document key only.');
			return;
		}

		const href = buildCreatureContentLink(selectedContentResult.name, selectedCreatureDocumentKey);
		const editor = storyEditorRefs.current[pendingContentLink.blockId];
		const applied = editor?.applyContentLink(
			href,
			pendingContentLink.from,
			pendingContentLink.to,
			pendingContentLink.text
		);

		if (applied) {
			setPendingContentLink(null);
		}
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

								<form
									className="content-search-form"
									onSubmit={(event) => event.preventDefault()}
								>
									<input
										ref={contentSearchInputRef}
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
												<button
													type="button"
													className="content-connect-button"
													onClick={connectSelectedContentToText}
													disabled={
														!pendingContentLink ||
														!selectedContentResult ||
														!isCreatureResult(selectedContentResult) ||
														!selectedCreatureDocumentKey ||
														creatureDetailStatus === 'loading'
													}
												>
													connect to text
												</button>
											</div>
											{selectedContentResult && isCreatureResult(selectedContentResult) ? (
												creatureDetailStatus === 'loading' ? (
													<p className="content-results-empty">Loading stat block…</p>
												) : creatureDetailStatus === 'error' ? (
													<p className="content-results-empty">{creatureDetailError}</p>
												) : creatureStatblock ? (
													<CreatureStatBlock creature={creatureStatblock} />
												) : (
													<h5>{selectedContentResult.name}</h5>
												)
											) : (
												<h5>{selectedContentResult.name}</h5>
											)}
										</div>
									) : (
										<div className="content-results-list" role="list">
											{contentSearchStatus === 'loading' ? (
												<p className="content-results-empty">Loading results</p>
											) : contentSearchResults.length > 0 ? (
												<>
													<p className="content-results-count">{contentResultCount} results</p>
													{contentSearchResults.map((result) => (
														<button
															key={result.id}
															type="button"
															className="content-result-item"
															onClick={() => openContentDetail(result)}
														>
															<strong>{result.name}</strong>
														</button>
													))}
												</>
											) : contentSearchStatus === 'done' ? (
												<p className="content-results-empty">
													No results for that search, try searching in &quot;all&quot; instead.
												</p>
											) : (
												<p className="content-results-empty">
													No results yet. Choose a filter and search to populate this panel.
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
					<label htmlFor="module-title">Module Title</label>
					<input
						id="module-title"
						type="text"
						value={moduleTitle}
						onChange={(event) => setModuleTitle(event.target.value)}
						placeholder="Enter module title"
						required
					/>
					<p className="field-help">Required to save or publish this module.</p>

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
						onChange={(event) => setPlaystyle(event.target.value as Playstyle)}
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
												<StoryBlockEditor
													ref={(handle) => {
														storyEditorRefs.current[block.id] = handle;
													}}
													content={block.content}
													placeholder={`Enter ${blockTypeLabelMap[block.type]} content`}
													adventureId={adventure.id}
													blockId={block.id}
													onContentChange={(html) =>
														updateBlockContent(adventure.id, block.id, html)
													}
													onRequestLinkContent={requestLinkContent}
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

			<section className="module-save-actions" aria-label="Save module">
				<div className="module-save-buttons">
					<button
						type="button"
						className="module-save-draft-button"
						onClick={() => void persistModule('draft')}
						disabled={saveStatus === 'saving'}
					>
						Save Draft
					</button>
					<button
						type="button"
						className="module-publish-button"
						onClick={() => void persistModule('publish')}
						disabled={saveStatus === 'saving'}
					>
						Publish Module
					</button>
				</div>
				<p
					className={`module-save-status module-save-status--${saveStatus}`}
					aria-live="polite"
				>
					{saveMessage ||
						(moduleId
							? `Editing ${moduleStatus} module (${moduleId})`
							: 'Not saved yet. Autosave runs every 30 seconds after a title is set.')}
				</p>
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
