import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from '../auth/RequireAuth';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';

const AccountPage = lazy(() => import('../pages/AccountPage'));
const CampaignManagerPage = lazy(() => import('../pages/CampaignManagerPage'));
const CreatorHomePage = lazy(() => import('../pages/CreatorHomePage'));
const CreatorPage = lazy(() => import('../pages/CreatorPage'));
const DmHomePage = lazy(() => import('../pages/DmHomePage'));
const ModuleCreatorPage = lazy(() => import('../pages/ModuleCreatorPage'));
const ModuleViewPage = lazy(() => import('../pages/ModuleViewPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));

function AppRoutes() {
	return (
		<Suspense fallback={null}>
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
		</Suspense>
	);
}

export default AppRoutes;
