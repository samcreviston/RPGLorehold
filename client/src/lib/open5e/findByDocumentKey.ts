export type Open5eKeyedItem = {
	key?: string;
	document?: {
		key?: string;
		name?: string;
	} | string | null;
	name?: string;
	desc?: string | null;
	descriptions?: unknown;
	[field: string]: unknown;
};

export function resolveContentKey(item: Open5eKeyedItem): string {
	if (typeof item.key === 'string' && item.key.trim()) {
		return item.key.trim();
	}
	if (item.document && typeof item.document === 'object' && typeof item.document.key === 'string') {
		return item.document.key.trim();
	}
	if (typeof item.document === 'string' && item.document.trim()) {
		return item.document.trim();
	}
	return '';
}

export function findResultByContentKey<T extends Open5eKeyedItem>(
	results: T[],
	contentKey: string
): T | undefined {
	const byItemKey = results.find((item) => item.key === contentKey);
	if (byItemKey) {
		return byItemKey;
	}
	return results.find((item) => {
		if (item.document && typeof item.document === 'object') {
			return item.document.key === contentKey;
		}
		return item.document === contentKey;
	});
}

/** @deprecated Use findResultByContentKey */
export const findResultByDocumentKey = findResultByContentKey;

export function getOpen5eResultDescription(item: Open5eKeyedItem): string {
	if (typeof item.desc === 'string' && item.desc.trim()) {
		return item.desc;
	}

	if (typeof item.descriptions === 'string' && item.descriptions.trim()) {
		return item.descriptions;
	}

	if (Array.isArray(item.descriptions)) {
		return item.descriptions
			.map((entry) => {
				if (typeof entry === 'string') {
					return entry;
				}
				if (entry && typeof entry === 'object' && 'desc' in entry) {
					return String((entry as { desc?: string }).desc ?? '');
				}
				return '';
			})
			.filter(Boolean)
			.join('\n\n');
	}

	if (item.descriptions && typeof item.descriptions === 'object') {
		return JSON.stringify(item.descriptions, null, 2);
	}

	return '';
}

export function getDocumentDisplayName(item: Open5eKeyedItem): string {
	if (item.document && typeof item.document === 'object') {
		return item.document.name ?? item.document.key ?? '';
	}
	if (typeof item.document === 'string') {
		return item.document;
	}
	return '';
}
