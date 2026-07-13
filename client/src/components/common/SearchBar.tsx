type SearchBarProps = {
	label: string;
	placeholder: string;
	helperText?: string;
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
};

function SearchBar({
	label,
	placeholder,
	helperText,
	value,
	onChange,
	onSubmit
}: SearchBarProps) {
	return (
		<form
			className="search-bar-shell"
			onSubmit={(event) => {
				event.preventDefault();
				onSubmit();
			}}
		>
			<label htmlFor="global-search-input">{label}</label>
			<input
				id="global-search-input"
				type="search"
				placeholder={placeholder}
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
			{helperText ? <p>{helperText}</p> : null}
		</form>
	);
}

export default SearchBar;
