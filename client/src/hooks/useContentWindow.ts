import { useEffectEvent, useRef, useState } from 'react';
import type { MappedCreatureStatblock, Open5eCreature } from '../lib/open5e/creatureTypes';
import { findResultByContentKey, type Open5eKeyedItem } from '../lib/open5e/findByDocumentKey';
import { mapOpen5eCreatureToStatblock } from '../lib/open5e/mapOpen5eCreatureToStatblock';
import { mapOpen5eItemToDetailView } from '../lib/open5e/mapOpen5eItemToDetailView';
import type { Open5eDetailViewModel } from '../lib/open5e/open5eDetailTypes';
import { isCreatureDeepLink, toOpen5eProxyPath } from '../lib/open5e/toOpen5eProxyPath';

export function useContentWindow() {
	const contentWindowFetchRef = useRef<AbortController | null>(null);
	const [isContentWindowOpen, setIsContentWindowOpen] = useState(false);
	const [contentWindowStatus, setContentWindowStatus] = useState<'idle' | 'loading' | 'error'>('idle');
	const [contentWindowCreature, setContentWindowCreature] = useState<MappedCreatureStatblock | null>(
		null
	);
	const [contentWindowDetail, setContentWindowDetail] = useState<Open5eDetailViewModel | null>(null);
	const [contentWindowError, setContentWindowError] = useState('');

	const openContentLinkInWindow = useEffectEvent((href: string, contentKey?: string) => {
		setIsContentWindowOpen(true);

		const proxyPath = toOpen5eProxyPath(href);
		if (!proxyPath) {
			setContentWindowCreature(null);
			setContentWindowDetail(null);
			setContentWindowStatus('error');
			setContentWindowError('Invalid content link.');
			return;
		}

		contentWindowFetchRef.current?.abort();
		const controller = new AbortController();
		contentWindowFetchRef.current = controller;

		setContentWindowStatus('loading');
		setContentWindowError('');
		setContentWindowCreature(null);
		setContentWindowDetail(null);

		void (async () => {
			try {
				const response = await fetch(proxyPath, { signal: controller.signal });
				if (!response.ok) {
					throw new Error(`Failed to load content (${response.status})`);
				}
				const data = (await response.json()) as { results?: Array<Open5eCreature & Open5eKeyedItem> };
				let results = data.results ?? [];

				if (isCreatureDeepLink(href)) {
					const creature = contentKey
						? (findResultByContentKey(results, contentKey) ?? results[0])
						: results[0];
					if (!creature) {
						throw new Error('No creature found for that link.');
					}
					setContentWindowCreature(mapOpen5eCreatureToStatblock(creature));
					setContentWindowStatus('idle');
					return;
				}

				if (!contentKey) {
					throw new Error('Missing content key on this link.');
				}

				let matched = findResultByContentKey(results, contentKey);
				if (!matched) {
					const retryUrl = new URL(proxyPath, window.location.origin);
					retryUrl.searchParams.delete('name__icontains');
					const retryPath = `${retryUrl.pathname}${retryUrl.search}`;
					if (retryPath !== proxyPath) {
						const retryResponse = await fetch(retryPath, { signal: controller.signal });
						if (!retryResponse.ok) {
							throw new Error(`Failed to load content (${retryResponse.status})`);
						}
						const retryData = (await retryResponse.json()) as {
							results?: Array<Open5eCreature & Open5eKeyedItem>;
						};
						results = retryData.results ?? [];
						matched = findResultByContentKey(results, contentKey);
					}
				}

				if (!matched) {
					throw new Error('No result matched the saved content key.');
				}

				const looksLikeCreature =
					proxyPath.includes('creatures') ||
					Boolean(
						(matched as Open5eCreature).challenge_rating != null || (matched as Open5eCreature).cr != null
					);

				if (looksLikeCreature) {
					setContentWindowCreature(mapOpen5eCreatureToStatblock(matched as Open5eCreature));
				} else {
					setContentWindowDetail(mapOpen5eItemToDetailView(matched, proxyPath));
				}
				setContentWindowStatus('idle');
			} catch (error) {
				if ((error as Error).name === 'AbortError') {
					return;
				}
				console.error(error);
				setContentWindowCreature(null);
				setContentWindowDetail(null);
				setContentWindowStatus('error');
				setContentWindowError(error instanceof Error ? error.message : 'Failed to load content.');
			}
		})();
	});

	return {
		isContentWindowOpen,
		setIsContentWindowOpen,
		contentWindowStatus,
		contentWindowCreature,
		contentWindowDetail,
		contentWindowError,
		openContentLinkInWindow
	};
}
