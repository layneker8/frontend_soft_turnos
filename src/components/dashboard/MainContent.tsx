import React from "react";

interface MainContentProps {
	children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
	return (
		<main className="overflow-y-auto flex-1">
			<div className="mt-4 xl:mt-6 w-full px-4 sm:px-6 lg:px-8">{children}</div>
		</main>
	);
};

export default MainContent;
