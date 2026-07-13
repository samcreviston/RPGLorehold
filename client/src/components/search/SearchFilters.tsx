export type SearchFilterValues = {
	playstyle: string;
	alignment: string;
	biome: string;
	tag: string;
	authorUsername: string;
	levelMin: string;
	levelMax: string;
	numberOfAdventures: string;
};

type SearchFiltersProps = {
	values: SearchFilterValues;
	onChange: (next: SearchFilterValues) => void;
	disabled?: boolean;
};

export const emptySearchFilters: SearchFilterValues = {
	playstyle: '',
	alignment: '',
	biome: '',
	tag: '',
	authorUsername: '',
	levelMin: '',
	levelMax: '',
	numberOfAdventures: ''
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

function SearchFilters({ values, onChange, disabled = false }: SearchFiltersProps) {
	function update<K extends keyof SearchFilterValues>(key: K, value: SearchFilterValues[K]) {
		onChange({ ...values, [key]: value });
	}

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

				<label className="search-control">
					<span>Biome</span>
					<select
						value={values.biome}
						disabled={disabled}
						onChange={(event) => update('biome', event.target.value)}
					>
						<option value="">Any</option>
						{biomeOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>

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
					<span>Adventures</span>
					<input
						type="number"
						min={1}
						step={1}
						placeholder="Any"
						value={values.numberOfAdventures}
						disabled={disabled}
						onChange={(event) => update('numberOfAdventures', event.target.value)}
					/>
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
