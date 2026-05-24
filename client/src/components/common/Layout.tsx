import type { ReactNode } from 'react';

type LayoutProps = {
	children: ReactNode;
};

function Layout({ children }: LayoutProps) {
	return <div className="site-layout__content">{children}</div>;
}

export default Layout;

