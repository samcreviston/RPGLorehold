import { Outlet } from 'react-router-dom';
import Footer from '../components/common/Footer';
import Header from '../components/common/Header';
import '../styles/layout.css';

function MainLayout() {
	return (
		<div className="site-layout">
			<Header />
			<div className="site-main">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
}

export default MainLayout;

