import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ContentLinkView from './ContentLinkView';

export type ContentLinkAttributes = {
	href: string;
	label: string;
};

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		contentLink: {
			insertContentLink: (attrs: ContentLinkAttributes) => ReturnType;
		};
	}
}

export const ContentLink = Node.create({
	name: 'contentLink',
	group: 'inline',
	inline: true,
	atom: true,
	selectable: true,

	addAttributes() {
		return {
			href: {
				default: '',
				parseHTML: (element) => element.getAttribute('data-content-link') ?? '',
				renderHTML: (attributes) => ({
					'data-content-link': attributes.href
				})
			},
			label: {
				default: '',
				parseHTML: (element) => {
					const clone = element.cloneNode(true) as HTMLElement;
					clone.querySelectorAll('.content-link-tag__remove').forEach((node) => node.remove());
					return clone.textContent?.trim() ?? '';
				}
			}
		};
	},

	parseHTML() {
		return [{ tag: 'span[data-content-link]' }];
	},

	renderHTML({ node, HTMLAttributes }) {
		return [
			'span',
			mergeAttributes(HTMLAttributes, {
				class: 'content-link-tag',
				'data-content-link': node.attrs.href
			}),
			node.attrs.label
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(ContentLinkView);
	},

	addCommands() {
		return {
			insertContentLink:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({
						type: this.name,
						attrs
					})
		};
	}
});
