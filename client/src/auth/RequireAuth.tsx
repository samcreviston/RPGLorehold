import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function RequireAuth({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return (
			<main className="page-main">
				<p>Checking your account…</p>
			</main>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/account" replace state={{ from: location.pathname }} />;
	}

	return children;
}

export default RequireAuth;
