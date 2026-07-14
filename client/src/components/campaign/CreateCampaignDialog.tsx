import { useEffect, useRef, useState } from 'react';
import './campaign-picker.css';

type CreateCampaignDialogProps = {
	isOpen: boolean;
	isSubmitting: boolean;
	error: string;
	onClose: () => void;
	onCreate: (title: string) => void;
};

function CreateCampaignDialog({
	isOpen,
	isSubmitting,
	error,
	onClose,
	onCreate
}: CreateCampaignDialogProps) {
	const [title, setTitle] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!isOpen) {
			setTitle('');
			return;
		}
		inputRef.current?.focus();
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	return (
		<div className="campaign-dialog-backdrop" role="presentation" onMouseDown={onClose}>
			<section
				className="campaign-dialog"
				role="dialog"
				aria-modal="true"
				aria-labelledby="create-campaign-title"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<button type="button" className="campaign-dialog__back" onClick={onClose}>
					← Back
				</button>
				<h2 id="create-campaign-title">Create New Campaign</h2>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						if (title.trim()) {
							onCreate(title.trim());
						}
					}}
				>
					<label htmlFor="campaign-name">Campaign Name</label>
					<input
						ref={inputRef}
						id="campaign-name"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						maxLength={120}
						required
					/>
					{error ? <p className="dm-home-error" role="alert">{error}</p> : null}
					<div className="campaign-dialog__actions">
						<button type="button" className="dm-home-secondary-button" onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className="dm-home-secondary-button" disabled={isSubmitting}>
							{isSubmitting ? 'Creating…' : 'Create Campaign'}
						</button>
					</div>
				</form>
			</section>
		</div>
	);
}

export default CreateCampaignDialog;
