export function toOpen5eProxyPath(href: string): string | null {
	try {
		const url = new URL(href);
		if (url.hostname !== 'api.open5e.com') {
			return null;
		}
		const path = url.pathname.replace(/^\/v2\/?/, '');
		return `/open5e-api/${path}${url.search}`;
	} catch {
		if (href.startsWith('/open5e-api/')) {
			return href;
		}
		return null;
	}
}

export function isCreatureDeepLink(href: string): boolean {
	return href.includes('/creatures/') && href.includes('name__iexact=');
}
