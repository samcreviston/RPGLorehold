import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import usePageMeta from '../hooks/usePageMeta';
import './account-page.css';

type GuestMode = 'signin' | 'signup';

const PASSWORD_RULES_HELP = 'At least 8 characters, 1 number, 1 capital letter.';

function isStrongPassword(password: string): boolean {
	return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

function AccountPage() {
	const { user, isLoading, isAuthenticated, login, register, logout, updateProfile, changePassword } =
		useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const fromPath =
		typeof location.state === 'object' &&
		location.state &&
		'from' in location.state &&
		typeof location.state.from === 'string'
			? location.state.from
			: '/creator/home';

	usePageMeta({
		title: 'Account',
		description: 'Sign in, create an account, or manage your RPGLorehold profile.',
		path: '/account'
	});

	const [guestMode, setGuestMode] = useState<GuestMode>('signin');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);

	const [signInEmail, setSignInEmail] = useState('');
	const [signInPassword, setSignInPassword] = useState('');

	const [signUpEmail, setSignUpEmail] = useState('');
	const [signUpUsername, setSignUpUsername] = useState('');
	const [signUpPassword, setSignUpPassword] = useState('');

	const [profileUsername, setProfileUsername] = useState('');
	const [profileEmail, setProfileEmail] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const clearFeedback = () => {
		setMessage('');
		setError('');
	};

	const handleSignIn = async (event: FormEvent) => {
		event.preventDefault();
		clearFeedback();
		setBusy(true);
		try {
			await login(signInEmail.trim(), signInPassword);
			navigate(fromPath === '/account' ? '/creator/home' : fromPath, { replace: true });
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Sign in failed.');
		} finally {
			setBusy(false);
		}
	};

	const handleSignUp = async (event: FormEvent) => {
		event.preventDefault();
		clearFeedback();
		if (!isStrongPassword(signUpPassword)) {
			setError(PASSWORD_RULES_HELP);
			return;
		}
		setBusy(true);
		try {
			const resultMessage = await register({
				email: signUpEmail.trim(),
				username: signUpUsername.trim(),
				password: signUpPassword
			});
			setMessage(resultMessage);
			setGuestMode('signin');
			setSignInEmail(signUpEmail.trim());
			setSignUpPassword('');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Sign up failed.');
		} finally {
			setBusy(false);
		}
	};

	const handleUpdateProfile = async (event: FormEvent) => {
		event.preventDefault();
		clearFeedback();
		setBusy(true);
		try {
			const payload: { username?: string; email?: string } = {};
			if (profileUsername.trim() && profileUsername.trim() !== user?.username) {
				payload.username = profileUsername.trim();
			}
			if (profileEmail.trim() && profileEmail.trim() !== user?.email) {
				payload.email = profileEmail.trim();
			}
			if (!payload.username && !payload.email) {
				setError('Enter a new username or email to update.');
				return;
			}
			await updateProfile(payload);
			setMessage('Profile updated.');
			setProfileUsername('');
			setProfileEmail('');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Profile update failed.');
		} finally {
			setBusy(false);
		}
	};

	const handleChangePassword = async (event: FormEvent) => {
		event.preventDefault();
		clearFeedback();
		if (newPassword !== confirmPassword) {
			setError('New password and confirmation do not match.');
			return;
		}
		if (!isStrongPassword(newPassword)) {
			setError(PASSWORD_RULES_HELP);
			return;
		}
		setBusy(true);
		try {
			const resultMessage = await changePassword(currentPassword, newPassword);
			setMessage(resultMessage);
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			setGuestMode('signin');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Password change failed.');
		} finally {
			setBusy(false);
		}
	};

	if (isLoading) {
		return (
			<main className="page-main account-page">
				<p>Loading account…</p>
			</main>
		);
	}

	if (!isAuthenticated) {
		return (
			<main className="page-main account-page account-page--guest">
				<div className="account-guest-panel">
					<h1>Account</h1>
					<p className="account-lede">
						Sign in to access Creator, Creator Home, and DM Home. New here? Create an account, then
						sign in.
					</p>

					{message ? <p className="account-feedback account-feedback--ok">{message}</p> : null}
					{error ? <p className="account-feedback account-feedback--error">{error}</p> : null}

					{guestMode === 'signin' ? (
						<form className="account-card account-form" onSubmit={(event) => void handleSignIn(event)}>
							<h2>Sign in</h2>
							<label htmlFor="signin-email">Email</label>
							<input
								id="signin-email"
								type="email"
								autoComplete="email"
								required
								value={signInEmail}
								onChange={(event) => setSignInEmail(event.target.value)}
							/>
							<label htmlFor="signin-password">Password</label>
							<input
								id="signin-password"
								type="password"
								autoComplete="current-password"
								required
								value={signInPassword}
								onChange={(event) => setSignInPassword(event.target.value)}
							/>
							<button type="submit" className="account-primary-button" disabled={busy}>
								{busy ? 'Signing in…' : 'Sign in'}
							</button>
							<p className="account-mode-swap">
								Sign up{' '}
								<button
									type="button"
									className="account-mode-link"
									onClick={() => {
										setGuestMode('signup');
										clearFeedback();
									}}
								>
									here instead
								</button>
							</p>
						</form>
					) : (
						<form className="account-card account-form" onSubmit={(event) => void handleSignUp(event)}>
							<h2>Create account</h2>
							<label htmlFor="signup-email">Email</label>
							<input
								id="signup-email"
								type="email"
								autoComplete="email"
								required
								value={signUpEmail}
								onChange={(event) => setSignUpEmail(event.target.value)}
							/>
							<label htmlFor="signup-username">Username</label>
							<input
								id="signup-username"
								type="text"
								autoComplete="username"
								required
								minLength={3}
								maxLength={32}
								value={signUpUsername}
								onChange={(event) => setSignUpUsername(event.target.value)}
							/>
							<label htmlFor="signup-password">Password</label>
							<input
								id="signup-password"
								type="password"
								autoComplete="new-password"
								required
								minLength={8}
								value={signUpPassword}
								onChange={(event) => setSignUpPassword(event.target.value)}
							/>
							<p className="account-help">
								{PASSWORD_RULES_HELP} You will sign in after creating the account.
							</p>
							<button type="submit" className="account-primary-button" disabled={busy}>
								{busy ? 'Creating…' : 'Create account'}
							</button>
							<p className="account-mode-swap">
								Already signed up?{' '}
								<button
									type="button"
									className="account-mode-link"
									onClick={() => {
										setGuestMode('signin');
										clearFeedback();
									}}
								>
									Login instead
								</button>
							</p>
						</form>
					)}
				</div>
			</main>
		);
	}

	return (
		<main className="page-main account-page">
			<h1>Account</h1>
			<p className="account-lede">
				Signed in as <strong>{user?.username}</strong> ({user?.email}).
			</p>

			{message ? <p className="account-feedback account-feedback--ok">{message}</p> : null}
			{error ? <p className="account-feedback account-feedback--error">{error}</p> : null}

			<section className="account-card">
				<h2>Profile</h2>
				<form className="account-form" onSubmit={(event) => void handleUpdateProfile(event)}>
					<label htmlFor="profile-username">New username</label>
					<input
						id="profile-username"
						type="text"
						placeholder={user?.username}
						minLength={3}
						maxLength={32}
						value={profileUsername}
						onChange={(event) => setProfileUsername(event.target.value)}
					/>
					<label htmlFor="profile-email">New email</label>
					<input
						id="profile-email"
						type="email"
						placeholder={user?.email}
						value={profileEmail}
						onChange={(event) => setProfileEmail(event.target.value)}
					/>
					<button type="submit" className="account-secondary-button" disabled={busy}>
						Save profile changes
					</button>
				</form>
			</section>

			<section className="account-card">
				<h2>Reset password</h2>
				<form className="account-form" onSubmit={(event) => void handleChangePassword(event)}>
					<label htmlFor="current-password">Current password</label>
					<input
						id="current-password"
						type="password"
						autoComplete="current-password"
						required
						value={currentPassword}
						onChange={(event) => setCurrentPassword(event.target.value)}
					/>
					<label htmlFor="new-password">New password</label>
					<input
						id="new-password"
						type="password"
						autoComplete="new-password"
						required
						minLength={8}
						value={newPassword}
						onChange={(event) => setNewPassword(event.target.value)}
					/>
					<p className="account-help">{PASSWORD_RULES_HELP}</p>
					<label htmlFor="confirm-password">Confirm new password</label>
					<input
						id="confirm-password"
						type="password"
						autoComplete="new-password"
						required
						minLength={8}
						value={confirmPassword}
						onChange={(event) => setConfirmPassword(event.target.value)}
					/>
					<button type="submit" className="account-primary-button" disabled={busy}>
						Update password
					</button>
				</form>
			</section>

			<button
				type="button"
				className="account-signout-button"
				disabled={busy}
				onClick={() => {
					void logout();
				}}
			>
				Sign out
			</button>
		</main>
	);
}

export default AccountPage;
