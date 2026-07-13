import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import type { ContentLinkOptions } from './contentLinkExtension';

export default function ContentLinkView({ node, deleteNode, extension }: NodeViewProps) {
	const href = String(node.attrs.href ?? '');
	const label = String(node.attrs.label ?? '');
	const options = extension.options as ContentLinkOptions;

	return (
		<NodeViewWrapper as="span" className="content-link-tag" data-content-link={href}>
			<button
				type="button"
				className="content-link-tag__hit"
				aria-label={`Open linked content for ${label}`}
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					console.log(href);
					options.onOpenContentLink?.(href);
				}}
			/>
			<span className="content-link-tag__label">{label}</span>
			<button
				type="button"
				className="content-link-tag__remove"
				aria-label={`Remove link for ${label}`}
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					deleteNode();
				}}
			>
				×
			</button>
		</NodeViewWrapper>
	);
}
