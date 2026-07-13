import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from '../auth/RequireAuth';
import MainLayout from '../layouts/MainLayout';
import AccountPage from '../pages/AccountPage';
import CampaignManagerPage from '../pages/CampaignManagerPage';
import CreatorHomePage from '../pages/CreatorHomePage';
import CreatorPage from '../pages/CreatorPage';
import DmHomePage from '../pages/DmHomePage';
import HomePage from '../pages/HomePage';
import ModuleCreatorPage from '../pages/ModuleCreatorPage';
import ModuleViewPage from '../pages/ModuleViewPage';
import SearchPage from '../pages/SearchPage';

function AppRoutes() {
	return (
		<Routes>
			<Route element={<MainLayout />}>
				<Route path="/" element={<HomePage />} />
				<Route path="/search" element={<SearchPage />} />
				<Route path="/account" element={<AccountPage />} />

				<Route
					path="/creator"
					element={
						<RequireAuth>
							<CreatorPage />
						</RequireAuth>
					}
				/>
				<Route
					path="/creator/home"
					element={
						<RequireAuth>
							<CreatorHomePage />
						</RequireAuth>
					}
				/>
				<Route
					path="/dm-home"
					element={
						<RequireAuth>
							<DmHomePage />
						</RequireAuth>
					}
				/>

				<Route path="/campaigns" element={<CampaignManagerPage />} />
				<Route path="/module/creator" element={<ModuleCreatorPage />} />
				<Route path="/module/view" element={<ModuleViewPage />} />

				<Route path="/content" element={<Navigate to="/" replace />} />
				<Route path="/user" element={<Navigate to="/account" replace />} />
				<Route path="/profile" element={<Navigate to="/account" replace />} />
				<Route path="/login" element={<Navigate to="/account" replace />} />
				<Route path="/register" element={<Navigate to="/account" replace />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default AppRoutes;
