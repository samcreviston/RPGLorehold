import { useEffect } from 'react';
import type { MappedCreatureStatblock, StatblockPropertyBlock } from '../../lib/open5e/creatureTypes';
import { registerStatblock5eElements } from '../../lib/statblock5e/register';
import './creature-stat-block.css';

type CreatureStatBlockProps = {
	creature: MappedCreatureStatblock;
};

function PropertyBlocks({ items }: { items: StatblockPropertyBlock[] }) {
	return (
		<>
			{items.map((item) => (
				<property-block key={`${item.name}-${item.desc.slice(0, 24)}`}>
					<h4>{item.name}.</h4>
					<p>{item.desc}</p>
				</property-block>
			))}
		</>
	);
}

function Section({ title, items }: { title: string; items: StatblockPropertyBlock[] }) {
	if (items.length === 0) {
		return null;
	}
	return (
		<>
			<h3>{title}</h3>
			<PropertyBlocks items={items} />
		</>
	);
}

function CreatureStatBlock({ creature }: CreatureStatBlockProps) {
	useEffect(() => {
		registerStatblock5eElements();
	}, []);

	return (
		<div className="creature-statblock-wrap">
			<stat-block>
				<creature-heading>
					<h1>{creature.name}</h1>
					<h2>{creature.subtitle}</h2>
				</creature-heading>

				<top-stats>
					<property-line>
						<h4>Armor Class</h4>
						<p>{creature.armorClass}</p>
					</property-line>
					<property-line>
						<h4>Hit Points</h4>
						<p>{creature.hitPoints}</p>
					</property-line>
					<property-line>
						<h4>Speed</h4>
						<p>{creature.speed}</p>
					</property-line>

					<abilities-block
						data-str={String(creature.abilities.str)}
						data-dex={String(creature.abilities.dex)}
						data-con={String(creature.abilities.con)}
						data-int={String(creature.abilities.int)}
						data-wis={String(creature.abilities.wis)}
						data-cha={String(creature.abilities.cha)}
					/>

					{creature.propertyLines.map((line) => (
						<property-line key={line.name}>
							<h4>{line.name}</h4>
							<p>{line.value}</p>
						</property-line>
					))}
				</top-stats>

				<PropertyBlocks items={creature.traits} />
				<Section title="Actions" items={creature.actions} />
				<Section title="Bonus Actions" items={creature.bonusActions} />
				<Section title="Reactions" items={creature.reactions} />
				<Section title="Legendary Actions" items={creature.legendaryActions} />
				<Section title="Mythic Actions" items={creature.mythicActions} />
				<Section title="Lair Actions" items={creature.lairActions} />
				<Section title="Regional Effects" items={creature.regionalEffects} />
			</stat-block>
		</div>
	);
}

export default CreatureStatBlock;
