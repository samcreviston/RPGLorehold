import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CampaignManagerPage from '../pages/CampaignManagerPage';
import ContentPage from '../pages/ContentPage';
import CreatorHomePage from '../pages/CreatorHomePage';
import CreatorPage from '../pages/CreatorPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ModuleCreatorPage from '../pages/ModuleCreatorPage';
import ModuleViewPage from '../pages/ModuleViewPage';
import ProfilePage from '../pages/ProfilePage';
import RegisterPage from '../pages/RegisterPage';
import SearchPage from '../pages/SearchPage';
import UserPage from '../pages/UserPage';

function AppRoutes() {
	return (
		<Routes>
			<Route element={<MainLayout />}>
				<Route path="/" element={<HomePage />} />
				<Route path="/search" element={<SearchPage />} />
				<Route path="/creator" element={<CreatorPage />} />
				<Route path="/creator/home" element={<CreatorHomePage />} />
				<Route path="/content" element={<ContentPage />} />
				<Route path="/user" element={<UserPage />} />

				<Route path="/campaigns" element={<CampaignManagerPage />} />
				<Route path="/module/creator" element={<ModuleCreatorPage />} />
				<Route path="/module/view" element={<ModuleViewPage />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default AppRoutes;

