type SearchBarProps = {
	label: string;
	placeholder: string;
	helperText: string;
};

function SearchBar({ label, placeholder, helperText }: SearchBarProps) {
	return (
		<div className="search-bar-shell">
			<label htmlFor="global-search-input">{label}</label>
			<input id="global-search-input" type="search" placeholder={placeholder} />
			<p>{helperText}</p>
		</div>
	);
}

export default SearchBar;

