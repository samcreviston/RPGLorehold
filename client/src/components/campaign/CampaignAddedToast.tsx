import { useEffect } from 'react';
import './campaign-picker.css';

type CampaignAddedToastProps = {
	campaignName: string;
	onClose: () => void;
};

function CampaignAddedToast({ campaignName, onClose }: CampaignAddedToastProps) {
	useEffect(() => {
		const timeout = window.setTimeout(onClose, 7_000);
		return () => window.clearTimeout(timeout);
	}, [onClose]);

	return (
		<aside className="campaign-added-toast" role="status">
			<span>Added to {campaignName}</span>
			<button type="button" aria-label="Dismiss confirmation" onClick={onClose}>
				×
			</button>
		</aside>
	);
}

export default CampaignAddedToast;
