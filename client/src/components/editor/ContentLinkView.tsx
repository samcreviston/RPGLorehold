import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

export default function ContentLinkView({ node, deleteNode }: NodeViewProps) {
	const href = String(node.attrs.href ?? '');
	const label = String(node.attrs.label ?? '');

	return (
		<NodeViewWrapper as="span" className="content-link-tag" data-content-link={href}>
			<button
				type="button"
				className="content-link-tag__hit"
				aria-label={`Log link for ${label}`}
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					console.log(href);
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
