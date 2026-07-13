import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
	changeAccountPassword,
	fetchCurrentUser,
	loginAccount,
	logoutAccount,
	refreshAccount,
	registerAccount,
	updateAccountProfile,
	type AuthUser
} from '../api/auth';
import { registerSessionHandlers } from '../api/http';

type AuthContextValue = {
	user: AuthUser | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (input: { email: string; username: string; password: string }) => Promise<string>;
	logout: () => Promise<void>;
	refresh: () => Promise<boolean>;
	updateProfile: (input: { username?: string; email?: string }) => Promise<void>;
	changePassword: (currentPassword: string, newPassword: string) => Promise<string>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const navigate = useNavigate();
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const refresh = useCallback(async () => {
		try {
			const data = await refreshAccount();
			setUser(data.user);
			return true;
		} catch {
			setUser(null);
			return false;
		}
	}, []);

	const handleSessionExpired = useCallback(
		(fromPath?: string) => {
			setUser(null);
			const currentPath = fromPath?.split('?')[0] || window.location.pathname;
			if (currentPath === '/account') {
				return;
			}

			const requiresSignIn =
				currentPath === '/creator' ||
				currentPath.startsWith('/creator/') ||
				currentPath === '/dm-home' ||
				currentPath.startsWith('/dm-home/');

			if (!requiresSignIn) {
				return;
			}

			navigate('/account', {
				replace: true,
				state: { from: fromPath && !fromPath.startsWith('/account') ? fromPath : currentPath }
			});
		},
		[navigate]
	);

	useEffect(() => {
		registerSessionHandlers({
			refreshAccess: refresh,
			handleSessionExpired
		});
		return () => {
			registerSessionHandlers(null);
		};
	}, [refresh, handleSessionExpired]);

	useEffect(() => {
		let cancelled = false;

		const bootstrap = async () => {
			try {
				const data = await fetchCurrentUser();
				if (!cancelled) {
					setUser(data.user);
				}
			} catch {
				const refreshed = await refresh();
				if (!cancelled && !refreshed) {
					setUser(null);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		};

		void bootstrap();
		return () => {
			cancelled = true;
		};
	}, [refresh]);

	const login = useCallback(async (email: string, password: string) => {
		const data = await loginAccount({ email, password });
		setUser(data.user);
	}, []);

	const register = useCallback(
		async (input: { email: string; username: string; password: string }) => {
			const data = await registerAccount(input);
			return data.message;
		},
		[]
	);

	const logout = useCallback(async () => {
		try {
			await logoutAccount();
		} finally {
			setUser(null);
		}
	}, []);

	const updateProfile = useCallback(async (input: { username?: string; email?: string }) => {
		const data = await updateAccountProfile(input);
		setUser(data.user);
	}, []);

	const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
		const data = await changeAccountPassword({ currentPassword, newPassword });
		setUser(null);
		return data.message;
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			isLoading,
			isAuthenticated: Boolean(user),
			login,
			register,
			logout,
			refresh,
			updateProfile,
			changePassword
		}),
		[user, isLoading, login, register, logout, refresh, updateProfile, changePassword]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
}
