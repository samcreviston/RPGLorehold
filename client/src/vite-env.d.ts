/// <reference types="vite/client" />

declare module '*.html?raw' {
	const content: string;
	export default content;
}

declare module '*create-custom-element.js' {
	export function createCustomElement(
		name: string,
		contentNode: DocumentFragment,
		elementClass?: ((contentNode: DocumentFragment) => CustomElementConstructor) | null
	): void;
}

import 'react';

declare module 'react' {
	namespace JSX {
		interface IntrinsicElements {
			'stat-block': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
			'creature-heading': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
			'top-stats': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
			'abilities-block': React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLElement> & {
					'data-str'?: string;
					'data-dex'?: string;
					'data-con'?: string;
					'data-int'?: string;
					'data-wis'?: string;
					'data-cha'?: string;
				},
				HTMLElement
			>;
			'property-line': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
			'property-block': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
			'tapered-rule': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
		}
	}
}

export {};
