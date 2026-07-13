import { useEffect, useId, useRef, useState } from 'react';

export type SearchFilterValues = {
	playstyle: string;
	alignment: string;
	biomes: string[];
	tag: string;
	authorUsername: string;
	levelMin: string;
	levelMax: string;
	adventuresMin: string;
	adventuresMax: string;
};

type SearchFiltersProps = {
	values: SearchFilterValues;
	onChange: (next: SearchFilterValues) => void;
	disabled?: boolean;
};

export const emptySearchFilters: SearchFilterValues = {
	playstyle: '',
	alignment: '',
	biomes: [],
	tag: '',
	authorUsername: '',
	levelMin: '',
	levelMax: '',
	adventuresMin: '',
	adventuresMax: ''
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

const levelOptions = Array.from({ length: 20 }, (_, index) => String(index + 1));
const adventureCountOptions = Array.from({ length: 30 }, (_, index) => String(index + 1));

function biomeSummaryLabel(biomes: string[]): string {
	if (biomes.length === 0) {
		return 'All';
	}
	if (biomes.length === 1) {
		return biomes[0]!;
	}
	return `${biomes.length} selected`;
}

function SearchFilters({ values, onChange, disabled = false }: SearchFiltersProps) {
	const biomesMenuId = useId();
	const biomesRootRef = useRef<HTMLDivElement>(null);
	const [biomesOpen, setBiomesOpen] = useState(false);

	function update<K extends keyof SearchFilterValues>(key: K, value: SearchFilterValues[K]) {
		onChange({ ...values, [key]: value });
	}

	function toggleBiome(biome: string) {
		const selected = values.biomes.includes(biome)
			? values.biomes.filter((entry) => entry !== biome)
			: [...values.biomes, biome];
		update('biomes', selected);
	}

	function setAdventuresMin(nextMin: string) {
		const next: SearchFilterValues = { ...values, adventuresMin: nextMin };
		if (nextMin && values.adventuresMax && Number(values.adventuresMax) < Number(nextMin)) {
			next.adventuresMax = nextMin;
		}
		onChange(next);
	}

	function setAdventuresMax(nextMax: string) {
		if (nextMax && values.adventuresMin && Number(nextMax) < Number(values.adventuresMin)) {
			update('adventuresMax', values.adventuresMin);
			return;
		}
		update('adventuresMax', nextMax);
	}

	useEffect(() => {
		if (!biomesOpen) {
			return;
		}

		function handlePointerDown(event: MouseEvent) {
			if (!biomesRootRef.current?.contains(event.target as Node)) {
				setBiomesOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setBiomesOpen(false);
			}
		}

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [biomesOpen]);

	useEffect(() => {
		if (disabled) {
			setBiomesOpen(false);
		}
	}, [disabled]);

	const maxAdventureOptions = values.adventuresMin
		? adventureCountOptions.filter((option) => Number(option) >= Number(values.adventuresMin))
		: adventureCountOptions;

	return (
		<section className="search-labeled-row" aria-label="Filter by">
			<p className="search-labeled-row__label">Filter by</p>
			<div className="search-control-bar" role="group" aria-label="Search filters">
				<label className="search-control">
					<span>Playstyle</span>
					<select
						value={values.playstyle}
						disabled={disabled}
						onChange={(event) => update('playstyle', event.target.value)}
					>
						<option value="">Any</option>
						{playstyleOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>

				<label className="search-control">
					<span>Alignment</span>
					<select
						value={values.alignment}
						disabled={disabled}
						onChange={(event) => update('alignment', event.target.value)}
					>
						<option value="">Any</option>
						{alignmentOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>

				<div className="search-control search-multi-select" ref={biomesRootRef}>
					<span id={`${biomesMenuId}-label`}>Biomes</span>
					<button
						type="button"
						className="search-multi-select__trigger"
						disabled={disabled}
						aria-haspopup="listbox"
						aria-expanded={biomesOpen}
						aria-controls={biomesMenuId}
						aria-labelledby={`${biomesMenuId}-label`}
						onClick={() => setBiomesOpen((open) => !open)}
					>
						{biomeSummaryLabel(values.biomes)}
					</button>
					{biomesOpen ? (
						<div
							id={biomesMenuId}
							className="search-multi-select__menu"
							role="listbox"
							aria-multiselectable="true"
							aria-labelledby={`${biomesMenuId}-label`}
						>
							<label className="search-multi-select__option">
								<input
									type="checkbox"
									checked={values.biomes.length === 0}
									onChange={() => update('biomes', [])}
								/>
								<span>All</span>
							</label>
							{biomeOptions.map((option) => (
								<label className="search-multi-select__option" key={option}>
									<input
										type="checkbox"
										checked={values.biomes.includes(option)}
										onChange={() => toggleBiome(option)}
									/>
									<span>{option}</span>
								</label>
							))}
						</div>
					) : null}
				</div>

				<label className="search-control">
					<span>Level min</span>
					<select
						value={values.levelMin}
						disabled={disabled}
						onChange={(event) => update('levelMin', event.target.value)}
					>
						<option value="">Any</option>
						{levelOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>

				<label className="search-control">
					<span>Level max</span>
					<select
						value={values.levelMax}
						disabled={disabled}
						onChange={(event) => update('levelMax', event.target.value)}
					>
						<option value="">Any</option>
						{levelOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>

				<label className="search-control">
					<span>Adventures min</span>
					<select
						value={values.adventuresMin}
						disabled={disabled}
						onChange={(event) => setAdventuresMin(event.target.value)}
					>
						<option value="">Any</option>
						{adventureCountOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>

				<label className="search-control">
					<span>Adventures max</span>
					<select
						value={values.adventuresMax}
						disabled={disabled}
						onChange={(event) => setAdventuresMax(event.target.value)}
					>
						<option value="">Any</option>
						{maxAdventureOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>

				<div className="search-control-bar__pair">
					<label className="search-control search-control--half">
						<span>Tag</span>
						<input
							type="text"
							placeholder="Any tag"
							value={values.tag}
							disabled={disabled}
							onChange={(event) => update('tag', event.target.value)}
						/>
					</label>

					<label className="search-control search-control--half">
						<span>Author</span>
						<input
							type="text"
							placeholder="Username"
							value={values.authorUsername}
							disabled={disabled}
							onChange={(event) => update('authorUsername', event.target.value)}
						/>
					</label>
				</div>
			</div>
		</section>
	);
}

export default SearchFilters;
