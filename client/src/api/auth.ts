const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export type AuthUser = {
	id: string;
	email: string;
	username: string;
	role: 'user' | 'admin';
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${API_BASE}${path}`, {
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers ?? {})
		},
		...init
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		const message =
			typeof data === 'object' && data && 'error' in data && typeof data.error === 'string'
				? data.error
				: `Request failed (${response.status})`;
		throw new Error(message);
	}

	return data as T;
}

export async function registerAccount(input: {
	email: string;
	username: string;
	password: string;
}): Promise<{ message: string }> {
	return request('/auth/register', {
		method: 'POST',
		body: JSON.stringify(input)
	});
}

export async function loginAccount(input: {
	email: string;
	password: string;
}): Promise<{ user: AuthUser }> {
	return request('/auth/login', {
		method: 'POST',
		body: JSON.stringify(input)
	});
}

export async function logoutAccount(): Promise<void> {
	await request('/auth/logout', { method: 'POST' });
}

export async function refreshAccount(): Promise<{ user: AuthUser }> {
	return request('/auth/refresh', { method: 'POST' });
}

export async function fetchCurrentUser(): Promise<{ user: AuthUser }> {
	return request('/auth/me');
}

export async function updateAccountProfile(input: {
	username?: string;
	email?: string;
}): Promise<{ user: AuthUser }> {
	return request('/auth/me', {
		method: 'PATCH',
		body: JSON.stringify(input)
	});
}

export async function changeAccountPassword(input: {
	currentPassword: string;
	newPassword: string;
}): Promise<{ message: string }> {
	return request('/auth/me/password', {
		method: 'POST',
		body: JSON.stringify(input)
	});
}
