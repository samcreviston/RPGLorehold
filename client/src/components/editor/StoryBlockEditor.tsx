import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState
} from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ContentLink } from './contentLinkExtension';

export type PendingContentLink = {
	adventureId: string;
	blockId: string;
	from: number;
	to: number;
	text: string;
};

export type StoryBlockEditorHandle = {
	applyContentLink: (
		href: string,
		from: number,
		to: number,
		label: string,
		contentKey?: string
	) => boolean;
};

type StoryBlockEditorProps = {
	content: string;
	placeholder: string;
	adventureId: string;
	blockId: string;
	onContentChange: (html: string) => void;
	onRequestLinkContent: (pending: PendingContentLink) => void;
	onOpenContentLink: (href: string, contentKey?: string) => void;
};

function normalizeEditorHtml(value: string): string {
	const trimmed = value.trim();
	return trimmed.length > 0 ? value : '<p></p>';
}

const StoryBlockEditor = forwardRef<StoryBlockEditorHandle, StoryBlockEditorProps>(
	function StoryBlockEditor(
		{
			content,
			placeholder,
			adventureId,
			blockId,
			onContentChange,
			onRequestLinkContent,
			onOpenContentLink
		},
		ref
	) {
		const [hasTextSelection, setHasTextSelection] = useState(false);
		const lastEmittedHtmlRef = useRef(normalizeEditorHtml(content));
		const onOpenContentLinkRef = useRef(onOpenContentLink);
		onOpenContentLinkRef.current = onOpenContentLink;

		const editor = useEditor({
			extensions: [
				StarterKit.configure({
					heading: false,
					blockquote: false,
					codeBlock: false,
					horizontalRule: false
				}),
				ContentLink.configure({
					onOpenContentLink: (href, contentKey) => {
						onOpenContentLinkRef.current(href, contentKey);
					}
				})
			],
			content: normalizeEditorHtml(content),
			editorProps: {
				attributes: {
					class: 'story-block-editor__content',
					'data-placeholder': placeholder
				}
			},
			onUpdate: ({ editor: currentEditor }) => {
				const html = currentEditor.getHTML();
				lastEmittedHtmlRef.current = html;
				onContentChange(html);
			},
			onSelectionUpdate: ({ editor: currentEditor }) => {
				const { empty, from, to } = currentEditor.state.selection;
				const selectedText = currentEditor.state.doc.textBetween(from, to, ' ');
				setHasTextSelection(!empty && selectedText.trim().length > 0);
			}
		});

		useImperativeHandle(
			ref,
			() => ({
				applyContentLink: (href, from, to, label, contentKey) => {
					if (!editor) {
						return false;
					}

					return editor
						.chain()
						.focus()
						.insertContentAt(
							{ from, to },
							{
								type: 'contentLink',
								attrs: {
									href,
									label,
									...(contentKey ? { contentKey } : {})
								}
							}
						)
						.run();
				}
			}),
			[editor]
		);

		useEffect(() => {
			if (!editor) {
				return;
			}

			const next = normalizeEditorHtml(content);
			if (next === lastEmittedHtmlRef.current) {
				return;
			}

			lastEmittedHtmlRef.current = next;
			editor.commands.setContent(next, false);
		}, [content, editor]);

		const handleLinkContent = () => {
			if (!editor) {
				return;
			}

			const { from, to, empty } = editor.state.selection;
			const text = editor.state.doc.textBetween(from, to, ' ').trim();
			if (empty || !text) {
				return;
			}

			onRequestLinkContent({ adventureId, blockId, from, to, text });
		};

		return (
			<div className="story-block-editor">
				<EditorContent editor={editor} />
				{hasTextSelection ? (
					<button
						type="button"
						className="story-block-link-content-button"
						onMouseDown={(event) => event.preventDefault()}
						onClick={handleLinkContent}
					>
						Link Content
					</button>
				) : null}
			</div>
		);
	}
);

export default StoryBlockEditor;
