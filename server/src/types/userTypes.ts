export type AuthUser = {
	id: string;
	email: string;
	username: string;
	role: 'user' | 'admin';
};

export type JwtAccessPayload = {
	sub: string;
	role: 'user' | 'admin';
};
