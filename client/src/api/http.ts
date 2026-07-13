const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

type SessionHandlers = {
	refreshAccess: () => Promise<boolean>;
	handleSessionExpired: (fromPath?: string) => void;
};

const AUTH_NO_SESSION_RETRY = new Set([
	'/auth/login',
	'/auth/register',
	'/auth/refresh',
	'/auth/logout'
]);

let sessionHandlers: SessionHandlers | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function registerSessionHandlers(handlers: SessionHandlers | null) {
	sessionHandlers = handlers;
}

function requestPath(path: string): string {
	return path.split('?')[0] ?? path;
}

export async function apiRequest<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
	const response = await fetch(`${API_BASE}${path}`, {
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers ?? {})
		},
		...init
	});

	const data = await response.json().catch(() => ({}));
	const message =
		typeof data === 'object' && data && 'error' in data && typeof data.error === 'string'
			? data.error
			: `Request failed (${response.status})`;

	if (response.status === 401) {
		const skipRetry = AUTH_NO_SESSION_RETRY.has(requestPath(path));

		if (!skipRetry && !retried && sessionHandlers) {
			if (!refreshInFlight) {
				refreshInFlight = sessionHandlers.refreshAccess().finally(() => {
					refreshInFlight = null;
				});
			}
			const refreshed = await refreshInFlight;
			if (refreshed) {
				return apiRequest<T>(path, init, true);
			}
			sessionHandlers.handleSessionExpired(window.location.pathname + window.location.search);
			throw new ApiError(message, 401);
		}

		if (!skipRetry && retried) {
			sessionHandlers?.handleSessionExpired(window.location.pathname + window.location.search);
		}

		throw new ApiError(message, 401);
	}

	if (!response.ok) {
		throw new ApiError(message, response.status);
	}

	return data as T;
}
