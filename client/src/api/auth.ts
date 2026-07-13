import { apiRequest } from './http';

export type AuthUser = {
	id: string;
	email: string;
	username: string;
	role: 'user' | 'admin';
};

export async function registerAccount(input: {
	email: string;
	username: string;
	password: string;
}): Promise<{ message: string }> {
	return apiRequest('/auth/register', {
		method: 'POST',
		body: JSON.stringify(input)
	});
}

export async function loginAccount(input: {
	email: string;
	password: string;
}): Promise<{ user: AuthUser }> {
	return apiRequest('/auth/login', {
		method: 'POST',
		body: JSON.stringify(input)
	});
}

export async function logoutAccount(): Promise<void> {
	await apiRequest('/auth/logout', { method: 'POST' });
}

export async function refreshAccount(): Promise<{ user: AuthUser }> {
	return apiRequest('/auth/refresh', { method: 'POST' });
}

export async function fetchCurrentUser(): Promise<{ user: AuthUser }> {
	return apiRequest('/auth/me');
}

export async function updateAccountProfile(input: {
	username?: string;
	email?: string;
}): Promise<{ user: AuthUser }> {
	return apiRequest('/auth/me', {
		method: 'PATCH',
		body: JSON.stringify(input)
	});
}

export async function changeAccountPassword(input: {
	currentPassword: string;
	newPassword: string;
}): Promise<{ message: string }> {
	return apiRequest('/auth/me/password', {
		method: 'POST',
		body: JSON.stringify(input)
	});
}
