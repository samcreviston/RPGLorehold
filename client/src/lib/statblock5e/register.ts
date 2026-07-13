import { createCustomElement } from '../../../vendor/statblock5e/src/js/helpers/create-custom-element.js';
import abilitiesBlockHtml from '../../../vendor/statblock5e/src/templates/abilities-block.html?raw';
import creatureHeadingHtml from '../../../vendor/statblock5e/src/templates/creature-heading.html?raw';
import propertyBlockHtml from '../../../vendor/statblock5e/src/templates/property-block.html?raw';
import propertyLineHtml from '../../../vendor/statblock5e/src/templates/property-line.html?raw';
import statBlockHtml from '../../../vendor/statblock5e/src/templates/stat-block.html?raw';
import taperedRuleHtml from '../../../vendor/statblock5e/src/templates/tapered-rule.html?raw';
import topStatsHtml from '../../../vendor/statblock5e/src/templates/top-stats.html?raw';

function fragmentFromHtml(htmlContent: string): DocumentFragment {
	return document.createRange().createContextualFragment(htmlContent);
}

function abilityModifier(abilityScore: string): number {
	const score = Number.parseInt(abilityScore, 10);
	return Math.floor((score - 10) / 2);
}

function formattedModifier(modifier: number): string {
	if (modifier >= 0) {
		return `+${modifier}`;
	}
	return `–${Math.abs(modifier)}`;
}

function abilityText(abilityScore: string): string {
	return `${abilityScore} (${formattedModifier(abilityModifier(abilityScore))})`;
}

function abilitiesElementClass(contentNode: DocumentFragment) {
	return class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' }).appendChild(contentNode.cloneNode(true));
		}

		connectedCallback() {
			const root = this.shadowRoot;
			if (!root) {
				return;
			}
			for (const attribute of Array.from(this.attributes)) {
				const abilityShortName = attribute.name.split('-')[1];
				if (!abilityShortName) {
					continue;
				}
				const target = root.getElementById(abilityShortName);
				if (target) {
					target.textContent = abilityText(attribute.value);
				}
			}
		}
	};
}

let registered = false;

export function registerStatblock5eElements(): void {
	if (registered || typeof customElements === 'undefined') {
		return;
	}

	createCustomElement('tapered-rule', fragmentFromHtml(taperedRuleHtml));
	createCustomElement('stat-block', fragmentFromHtml(statBlockHtml));
	createCustomElement('creature-heading', fragmentFromHtml(creatureHeadingHtml));
	createCustomElement('top-stats', fragmentFromHtml(topStatsHtml));
	createCustomElement('abilities-block', fragmentFromHtml(abilitiesBlockHtml), abilitiesElementClass);
	createCustomElement('property-line', fragmentFromHtml(propertyLineHtml));
	createCustomElement('property-block', fragmentFromHtml(propertyBlockHtml));

	registered = true;
}
