const LAST_CREATOR_MODULE_ID_KEY = 'rpgLorehold.lastCreatorModuleId';

export function getLastCreatorModuleId(): string | null {
	try {
		const value = sessionStorage.getItem(LAST_CREATOR_MODULE_ID_KEY)?.trim();
		return value || null;
	} catch {
		return null;
	}
}

export function setLastCreatorModuleId(moduleId: string): void {
	const trimmed = moduleId.trim();
	if (!trimmed) {
		return;
	}
	try {
		sessionStorage.setItem(LAST_CREATOR_MODULE_ID_KEY, trimmed);
	} catch {
		// Ignore storage failures (private mode quotas, etc.)
	}
}

export function clearLastCreatorModuleId(): void {
	try {
		sessionStorage.removeItem(LAST_CREATOR_MODULE_ID_KEY);
	} catch {
		// Ignore storage failures
	}
}
