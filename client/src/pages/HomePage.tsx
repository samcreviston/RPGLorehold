import { useEffect, useState } from 'react';
import HomeAdvancedSearchSection from '../components/home/HomeAdvancedSearchSection';
import HomeCreationSpaceSection from '../components/home/HomeCreationSpaceSection';
import HomeDMBuiltSection from '../components/home/HomeDMBuiltSection';
import HomeHeroSection from '../components/home/HomeHeroSection';
import usePageMeta from '../hooks/usePageMeta';
import './home-page.css';

function HomePage() {
	const [selectedDotIndex, setSelectedDotIndex] = useState(0);
	usePageMeta({
		title: 'Home',
		description:
			'Welcome to RPGLorehold, a platform for RPG search, campaign support, and content creation workflows.',
		path: '/'
	});

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			setSelectedDotIndex((currentIndex) => (currentIndex + 1) % 3);
		}, 7000);

		return () => window.clearInterval(intervalId);
	}, []);

	return (
		<main className="page-main home-page">
			<HomeHeroSection />
			<HomeAdvancedSearchSection selectedDotIndex={selectedDotIndex} />
			<HomeDMBuiltSection />
			<HomeCreationSpaceSection />
		</main>
	);
}

export default HomePage;
