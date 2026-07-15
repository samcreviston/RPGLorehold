import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLairChat } from '../../hooks/useLairChat';
import type { GeneratedContent } from '../../lib/generatedContent/generatedContent';
import {
	LAIR_CATEGORY_LABELS,
	LAIR_CHAT_CATEGORIES,
	templatesForLairCategory
} from '../../lib/lair/lairChatTemplates';

type LairChatToolProps = {
	onGeneratedContent: (content: GeneratedContent) => void;
};

export default function LairChatTool({ onGeneratedContent }: LairChatToolProps) {
	const [isOpen, setIsOpen] = useState(true);
	const chatLogEndRef = useRef<HTMLDivElement | null>(null);
	const chat = useLairChat(onGeneratedContent);
	const templates = templatesForLairCategory(chat.category);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		chatLogEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
	}, [chat.messages.length, chat.isGenerating, isOpen]);

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void chat.send();
	};

	return (
		<section
			className={`sidebar-tool-card lair-chat-tool${isOpen ? '' : ' sidebar-tool-card--collapsed'}`}
			aria-label="Lair Co-Dragon Chat"
		>
			<div className="section-card-heading">
				<h4>Lair Co-Dragon Chat</h4>
				<button
					type="button"
					className="section-collapse-button"
					aria-expanded={isOpen}
					aria-label={isOpen ? 'Collapse Lair Co-Dragon Chat' : 'Expand Lair Co-Dragon Chat'}
					onClick={() => setIsOpen((previous) => !previous)}
				>
					{isOpen ? '▾' : '▸'}
				</button>
			</div>

			{isOpen ? (
				<>
					<div className="lair-chat-log" aria-live="polite">
						{chat.messages.map((message) => (
							<article
								key={message.id}
								className={`lair-chat-message lair-chat-message--${message.role}`}
							>
								<p>{message.content}</p>
							</article>
						))}
						<div ref={chatLogEndRef} />
					</div>
					<form className="lair-chat-input-wrap" onSubmit={submit}>
						<textarea
							value={chat.draft}
							onChange={(event) => chat.setDraft(event.target.value)}
							placeholder="Describe what you need from the Lair Co-Dragon..."
							rows={4}
							maxLength={6000}
							disabled={chat.isGenerating}
							aria-label="Lair Co-Dragon request"
						/>
						<div className="lair-chat-mode-row" aria-label="Request type">
							{LAIR_CHAT_CATEGORIES.map((category) => (
								<button
									key={category}
									type="button"
									className={`content-filter-chip${chat.category === category ? ' content-filter-chip--selected' : ''}`}
									aria-pressed={chat.category === category}
									disabled={chat.isGenerating}
									onClick={() => chat.selectCategory(category)}
								>
									{LAIR_CATEGORY_LABELS[category]}
								</button>
							))}
						</div>
						<label className="lair-chat-template-label">
							Template
							<select
								value={chat.templateId}
								disabled={chat.isGenerating}
								onChange={(event) => chat.setTemplateId(event.target.value)}
							>
								{templates.map((template) => (
									<option key={template.id} value={template.id}>
										{template.label}
									</option>
								))}
							</select>
						</label>
						<button
							type="submit"
							className="lair-chat-send-button"
							disabled={chat.isGenerating || !chat.draft.trim()}
						>
							{chat.isGenerating ? 'Generating…' : 'Send'}
						</button>
					</form>
				</>
			) : null}
		</section>
	);
}
