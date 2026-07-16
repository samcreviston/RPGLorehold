import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContent, getContent, updateContent } from '../../api/contents';
import Open5eDetailCard from '../../components/content/Open5eDetailCard';
import {
	contentSchemaFor,
	contentToDetailView,
	normalizeContentData
} from '../../lib/content/contentSchema';
import type { ContentDocument, ContentSource, ContentVisibility } from '../../types/content';
import './content-create-template.css';

type CreatorViewMode = 'editor' | 'preview';

type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

type MonsterAction = {
	name: string;
	descriptionEnabled: boolean;
	description: string;
};

const abilityFields: Array<{ key: AbilityKey; label: string }> = [
	{ key: 'str', label: 'Strength' },
	{ key: 'dex', label: 'Dexterity' },
	{ key: 'con', label: 'Constitution' },
	{ key: 'int', label: 'Intelligence' },
	{ key: 'wis', label: 'Wisdom' },
	{ key: 'cha', label: 'Charisma' }
];

function blankAbilityScores(): Record<AbilityKey, number | ''> {
	return {
		str: '',
		dex: '',
		con: '',
		int: '',
		wis: '',
		cha: ''
	};
}

function abilityModifier(score: number | ''): string {
	if (score === '') {
		return '—';
	}
	const modifier = Math.floor((score - 10) / 2);
	return modifier >= 0 ? `+${modifier}` : String(modifier);
}

function normalizeMonsterActions(input: unknown): MonsterAction[] {
	if (typeof input === 'string') {
		return input
			.split(/\n\s*\n+/)
			.map((block) => block.trim())
			.filter(Boolean)
			.map((block, index) => {
				const separatorIndex = block.indexOf(':');
				if (separatorIndex > 0) {
					return {
						name: block.slice(0, separatorIndex).trim(),
						descriptionEnabled: true,
						description: block.slice(separatorIndex + 1).trim()
					};
				}
				return {
					name: `Action ${index + 1}`,
					descriptionEnabled: true,
					description: block
				};
			});
	}

	if (!Array.isArray(input)) {
		return [];
	}

	return input.flatMap((entry, index) => {
		if (typeof entry === 'string') {
			const text = entry.trim();
			if (!text) {
				return [];
			}
			const separatorIndex = text.indexOf(':');
			if (separatorIndex > 0) {
				return [
					{
						name: text.slice(0, separatorIndex).trim(),
						descriptionEnabled: true,
						description: text.slice(separatorIndex + 1).trim()
					}
				];
			}
			return [
				{
					name: `Action ${index + 1}`,
					descriptionEnabled: true,
					description: text
				}
			];
		}
		if (!entry || typeof entry !== 'object') {
			return [];
		}

		const record = entry as {
			name?: unknown;
			description?: unknown;
			desc?: unknown;
			descriptionEnabled?: unknown;
			hasDescription?: unknown;
		};
		const name = typeof record.name === 'string' && record.name.trim() ? record.name.trim() : `Action ${index + 1}`;
		const description =
			typeof record.description === 'string'
				? record.description.trim()
				: typeof record.desc === 'string'
					? record.desc.trim()
					: '';
		const descriptionEnabled =
			typeof record.descriptionEnabled === 'boolean'
				? record.descriptionEnabled
				: typeof record.hasDescription === 'boolean'
					? record.hasDescription
					: description.length > 0;
		return [{ name, descriptionEnabled, description }];
	});
}

function normalizeMonsterData(input: Record<string, unknown>): Record<string, unknown> {
	const scores = input.abilityScores;
	const scoreRecord =
		scores && typeof scores === 'object' && !Array.isArray(scores)
			? (scores as Record<string, unknown>)
			: {};

	const pickScore = (...keys: string[]): number | '' => {
		for (const key of keys) {
			const value = scoreRecord[key] ?? input[key];
			if (typeof value === 'number' && Number.isFinite(value)) {
				return value;
			}
			if (typeof value === 'string' && value.trim() !== '') {
				const parsed = Number(value);
				if (Number.isFinite(parsed)) {
					return parsed;
				}
			}
		}
		return '';
	};

	return {
		...input,
		creatureType: typeof input.creatureType === 'string' ? input.creatureType : typeof input.type === 'string' ? input.type : '',
		challengeRating:
			typeof input.challengeRating === 'string' || typeof input.challengeRating === 'number'
				? input.challengeRating
				: typeof input.challenge === 'string' || typeof input.challenge === 'number'
					? input.challenge
					: '',
		abilityScores: {
			str: pickScore('str', 'strength'),
			dex: pickScore('dex', 'dexterity'),
			con: pickScore('con', 'constitution'),
			int: pickScore('int', 'intelligence'),
			wis: pickScore('wis', 'wisdom'),
			cha: pickScore('cha', 'charisma')
		},
		actions: normalizeMonsterActions(input.actions)
	};
}

type ContentCreateTemplateProps = {
	contentType: string;
	viewMode: CreatorViewMode;
	contentId: string | undefined;
	initialContent?: { title: string; data: Record<string, unknown>; source: ContentSource } | null;
};

function stringValue(value: unknown): string {
	return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function ContentCreateTemplate({
	contentType,
	viewMode,
	contentId,
	initialContent
}: ContentCreateTemplateProps) {
	const navigate = useNavigate();
	const definition = useMemo(() => contentSchemaFor(contentType), [contentType]);
	const isMonsterTemplate = contentType === 'monster';
	const [content, setContent] = useState<ContentDocument | null>(null);
	const [title, setTitle] = useState(initialContent?.title ?? '');
	const [data, setData] = useState<Record<string, unknown>>(
		initialContent
			? isMonsterTemplate
				? normalizeMonsterData(initialContent.data)
				: normalizeContentData(contentType, initialContent.data)
			: {}
	);
	const [visibility, setVisibility] = useState<ContentVisibility>('private');
	const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
	const [error, setError] = useState('');

	useEffect(() => {
		if (!contentId) {
			setContent(null);
			setTitle(initialContent?.title ?? '');
			setData(
				initialContent
					? isMonsterTemplate
						? normalizeMonsterData(initialContent.data)
						: normalizeContentData(contentType, initialContent.data)
					: {}
			);
			setVisibility('private');
			return;
		}
		void getContent(contentId)
			.then((loaded) => {
				setContent(loaded);
				setTitle(loaded.title);
				setData(isMonsterTemplate ? normalizeMonsterData(loaded.data) : loaded.data);
				setVisibility(loaded.visibility);
			})
			.catch((loadError: unknown) => {
				setError(loadError instanceof Error ? loadError.message : 'Unable to load content.');
				setStatus('error');
			});
	}, [contentId, initialContent, contentType, isMonsterTemplate]);

	const updateField = (key: string, value: unknown) => {
		setData((current) => ({ ...current, [key]: value }));
		setStatus('idle');
	};

	const updateMonsterAbilityScore = (key: AbilityKey, value: string) => {
		setData((current) => {
			const currentScores =
				current.abilityScores && typeof current.abilityScores === 'object' && !Array.isArray(current.abilityScores)
					? (current.abilityScores as Record<string, unknown>)
					: {};
			return {
				...current,
				abilityScores: {
					...blankAbilityScores(),
					...currentScores,
					[key]: value === '' ? '' : Number(value)
				}
			};
		});
		setStatus('idle');
	};

	const addMonsterAction = () => {
		setData((current) => {
			const actions = normalizeMonsterActions(current.actions);
			return {
				...current,
				actions: [
					...actions,
					{
						name: '',
						descriptionEnabled: true,
						description: ''
					}
				]
			};
		});
		setStatus('idle');
	};

	const updateMonsterAction = (index: number, patch: Partial<MonsterAction>) => {
		setData((current) => {
			const actions = normalizeMonsterActions(current.actions);
			return {
				...current,
				actions: actions.map((action, actionIndex) =>
					actionIndex === index
						? {
								...action,
								...patch,
								descriptionEnabled:
									typeof patch.descriptionEnabled === 'boolean'
										? patch.descriptionEnabled
										: action.descriptionEnabled
							}
						: action
				)
			};
		});
		setStatus('idle');
	};

	const save = async (publish: boolean) => {
		if (!title.trim()) {
			setError('A title is required.');
			setStatus('error');
			return;
		}
		setStatus('saving');
		setError('');
		try {
			const payload = {
				contentType,
				title: title.trim(),
				data,
				source: initialContent?.source ?? content?.source ?? 'manual',
				status: publish ? ('published' as const) : content?.status ?? ('draft' as const),
				visibility: publish && visibility === 'private' ? ('public' as const) : visibility
			};
			const saved = content ? await updateContent(content._id, payload) : await createContent(payload);
			setContent(saved);
			setVisibility(saved.visibility);
			setStatus('saved');
			navigate(`/creator?contentId=${encodeURIComponent(saved._id)}&contentType=${encodeURIComponent(contentType)}`, {
				replace: true,
				state: null
			});
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : 'Unable to save content.');
			setStatus('error');
		}
	};

	const monsterAbilityScores =
		isMonsterTemplate &&
		data.abilityScores &&
		typeof data.abilityScores === 'object' &&
		!Array.isArray(data.abilityScores)
			? (data.abilityScores as Record<string, number | ''>)
			: null;
	const monsterActions = isMonsterTemplate ? normalizeMonsterActions(data.actions) : [];

	if (viewMode === 'preview') {
		return <Open5eDetailCard detail={contentToDetailView({ title, contentType, data })} />;
	}

	if (isMonsterTemplate) {
		return (
			<section className="content-create-template content-create-template--monster" aria-label={`${definition.label} editor`}>
				<header>
					<h2>{definition.label} Editor</h2>
					<p>{definition.description}</p>
				</header>
				<label>
					Name
					<input value={title} onChange={(event) => setTitle(event.target.value)} required />
				</label>
				<div className="monster-core-fields">
					<label>
						Size
						<input
							value={stringValue(data.size)}
							onChange={(event) => updateField('size', event.target.value)}
							required
						/>
					</label>
					<label>
						Creature Type
						<input
							value={stringValue(data.creatureType)}
							onChange={(event) => updateField('creatureType', event.target.value)}
							required
						/>
					</label>
					<label>
						Alignment
						<input
							value={stringValue(data.alignment)}
							onChange={(event) => updateField('alignment', event.target.value)}
							required
						/>
					</label>
					<label>
						Armor Class
						<input
							value={stringValue(data.armorClass)}
							onChange={(event) => updateField('armorClass', event.target.value)}
							required
						/>
					</label>
					<label>
						Hit Points
						<input
							value={stringValue(data.hitPoints)}
							onChange={(event) => updateField('hitPoints', event.target.value)}
							required
						/>
					</label>
					<label>
						Speed
						<input
							value={stringValue(data.speed)}
							onChange={(event) => updateField('speed', event.target.value)}
							required
						/>
					</label>
					<label>
						Challenge Rating
						<input
							value={stringValue(data.challengeRating)}
							onChange={(event) => updateField('challengeRating', event.target.value)}
							required
						/>
					</label>
				</div>

				<section className="monster-ability-section" aria-label="Ability scores">
					<h3>Ability Scores</h3>
					<div className="monster-ability-grid monster-ability-grid--labels" aria-hidden="true">
						{abilityFields.map((field) => (
							<div key={`${field.key}-label`} className="monster-ability-cell monster-ability-cell--label">
								{field.label}
							</div>
						))}
					</div>
					<div className="monster-ability-grid monster-ability-grid--scores">
						{abilityFields.map((field) => (
							<div key={`${field.key}-score`} className="monster-ability-cell">
								<input
									type="number"
									min={1}
									max={30}
									value={monsterAbilityScores?.[field.key] ?? ''}
									onChange={(event) => updateMonsterAbilityScore(field.key, event.target.value)}
								/>
							</div>
						))}
					</div>
					<div className="monster-ability-grid monster-ability-grid--modifiers">
						{abilityFields.map((field) => {
							const score = monsterAbilityScores?.[field.key] ?? '';
							return (
								<div key={`${field.key}-modifier`} className="monster-ability-cell monster-ability-cell--modifier">
									{abilityModifier(score)}
								</div>
							);
						})}
					</div>
				</section>

				<label className="content-create-field--wide">
					Description
					<textarea
						rows={5}
						value={stringValue(data.description)}
						onChange={(event) => updateField('description', event.target.value)}
					/>
				</label>

				<section className="monster-actions-section" aria-label="Actions">
					<div className="section-card-heading">
						<h3>Actions</h3>
					</div>
					<div className="monster-actions-list">
						{monsterActions.length > 0 ? (
							monsterActions.map((action, index) => (
								<article key={`monster-action-${index}`} className="monster-action-card">
									<label>
										Name
										<input
											value={action.name}
											onChange={(event) => updateMonsterAction(index, { name: event.target.value })}
											placeholder="Enter action name"
										/>
									</label>
							<label className="monster-action-description">
								Description
								<textarea
									rows={4}
									value={action.description}
									onChange={(event) => updateMonsterAction(index, { description: event.target.value })}
									placeholder="Enter action description"
								/>
							</label>
								</article>
							))
						) : (
							<p className="monster-actions-empty">No actions yet. Use the button below to add one.</p>
						)}
					</div>
					<button type="button" className="add-card-button monster-add-action-button" onClick={addMonsterAction}>
						+ Action
					</button>
				</section>

				<label>
					Visibility
					<select value={visibility} onChange={(event) => setVisibility(event.target.value as ContentVisibility)}>
						<option value="private">Private</option>
						<option value="unlisted">Unlisted</option>
						<option value="public">Public</option>
					</select>
				</label>
				<div className="content-create-actions">
					<button type="button" onClick={() => void save(false)} disabled={status === 'saving'}>
						{status === 'saving' ? 'Saving…' : 'Save Draft'}
					</button>
					<button type="button" onClick={() => void save(true)} disabled={status === 'saving'}>
						Publish
					</button>
				</div>
				{status === 'saved' ? <p role="status">Saved.</p> : null}
				{status === 'error' ? <p role="alert">{error}</p> : null}
			</section>
		);
	}

	return (
		<section className="content-create-template" aria-label={`${definition.label} editor`}>
			<header>
				<h2>{definition.label} Editor</h2>
				<p>{definition.description}</p>
			</header>
			<label>
				Name
				<input value={title} onChange={(event) => setTitle(event.target.value)} required />
			</label>
			<div className="content-create-fields">
				{definition.fields
					.filter(
						(field) =>
							!field.visibleWhen ||
							data[field.visibleWhen.key] === field.visibleWhen.equals
					)
					.map((field) => (
					<label key={field.key} className={field.kind === 'textarea' ? 'content-create-field--wide' : ''}>
						{field.label}
						{field.kind === 'boolean' ? (
							<input
								type="checkbox"
								checked={data[field.key] === true}
								onChange={(event) => updateField(field.key, event.target.checked)}
							/>
						) : field.kind === 'textarea' ? (
							<textarea
								rows={5}
								value={stringValue(data[field.key])}
								onChange={(event) => updateField(field.key, event.target.value)}
								required={field.required}
							/>
						) : field.kind === 'select' ? (
							<select
								value={stringValue(data[field.key])}
								onChange={(event) => updateField(field.key, event.target.value)}
								required={field.required}
							>
								<option value="">Select…</option>
								{field.options?.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						) : (
							<input
								type={field.kind}
								min={field.min}
								max={field.max}
								value={stringValue(data[field.key])}
								onChange={(event) =>
									updateField(
										field.key,
										field.kind === 'number' && event.target.value !== ''
											? Number(event.target.value)
											: event.target.value
									)
								}
								required={field.required}
							/>
						)}
					</label>
				))}
			</div>
			<label>
				Visibility
				<select value={visibility} onChange={(event) => setVisibility(event.target.value as ContentVisibility)}>
					<option value="private">Private</option>
					<option value="unlisted">Unlisted</option>
					<option value="public">Public</option>
				</select>
			</label>
			<div className="content-create-actions">
				<button type="button" onClick={() => void save(false)} disabled={status === 'saving'}>
					{status === 'saving' ? 'Saving…' : 'Save Draft'}
				</button>
				<button type="button" onClick={() => void save(true)} disabled={status === 'saving'}>
					Publish
				</button>
			</div>
			{status === 'saved' ? <p role="status">Saved.</p> : null}
			{status === 'error' ? <p role="alert">{error}</p> : null}
		</section>
	);
}

export default ContentCreateTemplate;
