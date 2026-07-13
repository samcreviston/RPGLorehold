export type Open5eDetailLine = {
	label: string;
	value: string;
};

export type Open5eDetailSection = {
	title: string;
	blocks: Array<{ name: string; desc: string }>;
};

export type Open5eDetailViewModel = {
	title: string;
	subtitle?: string;
	lines: Open5eDetailLine[];
	description?: string;
	sections: Open5eDetailSection[];
};
