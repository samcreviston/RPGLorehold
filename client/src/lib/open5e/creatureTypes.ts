export type Open5eNamedDesc = {
	name?: string;
	desc?: string;
};

export type Open5eCreature = {
	slug?: string;
	name?: string;
	size?: string;
	type?: string;
	alignment?: string;
	armor_class?: number | string;
	armor_desc?: string | null;
	hit_points?: number | string;
	hit_dice?: string | null;
	speed?: string | Record<string, number | string | undefined> | null;
	strength?: number;
	dexterity?: number;
	constitution?: number;
	intelligence?: number;
	wisdom?: number;
	charisma?: number;
	strength_save?: number | null;
	dexterity_save?: number | null;
	constitution_save?: number | null;
	intelligence_save?: number | null;
	wisdom_save?: number | null;
	charisma_save?: number | null;
	saving_throws?: string | Record<string, number | string> | null;
	skills?: string | Record<string, number | string> | null;
	damage_vulnerabilities?: string | null;
	damage_resistances?: string | null;
	damage_immunities?: string | null;
	condition_immunities?: string | null;
	senses?: string | null;
	perception?: number | null;
	languages?: string | null;
	challenge_rating?: string | number | null;
	cr?: string | number | null;
	special_abilities?: Open5eNamedDesc[] | null;
	actions?: Open5eNamedDesc[] | null;
	bonus_actions?: Open5eNamedDesc[] | null;
	reactions?: Open5eNamedDesc[] | null;
	legendary_actions?: Open5eNamedDesc[] | null;
	mythic_actions?: Open5eNamedDesc[] | null;
	lair_actions?: Open5eNamedDesc[] | null;
	regional_effects?: Open5eNamedDesc[] | null;
};

export type StatblockPropertyLine = {
	name: string;
	value: string;
};

export type StatblockPropertyBlock = {
	name: string;
	desc: string;
};

export type MappedCreatureStatblock = {
	name: string;
	subtitle: string;
	armorClass: string;
	hitPoints: string;
	speed: string;
	abilities: {
		str: number;
		dex: number;
		con: number;
		int: number;
		wis: number;
		cha: number;
	};
	propertyLines: StatblockPropertyLine[];
	traits: StatblockPropertyBlock[];
	actions: StatblockPropertyBlock[];
	bonusActions: StatblockPropertyBlock[];
	reactions: StatblockPropertyBlock[];
	legendaryActions: StatblockPropertyBlock[];
	mythicActions: StatblockPropertyBlock[];
	lairActions: StatblockPropertyBlock[];
	regionalEffects: StatblockPropertyBlock[];
};
