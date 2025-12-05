import React from "react";

interface MainContentProps {
	children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
	return (
		<main className="overflow-y-auto flex-1 p-4 md:p-6">
			<div className="w-full max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
				{children}
			</div>
		</main>
	);
};

export default MainContent;
