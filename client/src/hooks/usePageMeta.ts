import { useEffect } from 'react';

type PageMetaOptions = {
	title: string;
	description: string;
	path?: string;
};

const siteName = 'RPGLorehold';
const canonicalBaseUrl = 'https://rpglorehold.com';

function setMetaTag(attribute: 'name' | 'property', value: string, content: string): void {
	let tag = document.querySelector(`meta[${attribute}="${value}"]`);

	if (!tag) {
		tag = document.createElement('meta');
		tag.setAttribute(attribute, value);
		document.head.appendChild(tag);
	}

	tag.setAttribute('content', content);
}

function setCanonicalUrl(path: string): void {
	let canonicalLink = document.querySelector('link[rel="canonical"]');

	if (!canonicalLink) {
		canonicalLink = document.createElement('link');
		canonicalLink.setAttribute('rel', 'canonical');
		document.head.appendChild(canonicalLink);
	}

	const canonicalUrl = new URL(path, canonicalBaseUrl).toString();
	canonicalLink.setAttribute('href', canonicalUrl);
}

function usePageMeta({ title, description, path }: PageMetaOptions): void {
	useEffect(() => {
		document.title = `${title} | ${siteName}`;
		setMetaTag('name', 'description', description);
		setMetaTag('property', 'og:title', `${title} | ${siteName}`);
		setMetaTag('property', 'og:description', description);
		setMetaTag('property', 'og:type', 'website');
		setMetaTag('name', 'twitter:card', 'summary_large_image');
		setMetaTag('name', 'twitter:title', `${title} | ${siteName}`);
		setMetaTag('name', 'twitter:description', description);
		setCanonicalUrl(path ?? window.location.pathname);
	}, [description, path, title]);
}

export default usePageMeta;
