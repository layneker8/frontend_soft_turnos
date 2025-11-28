import React from "react";

interface MainContentProps {
	children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
	return (
		<main className="overflow-y-auto flex-1">
			<div className="mt-4 xl:mt-6 w-full px-4 sm:px-6 lg:px-8 xl:w-5/6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md py-6">
				{children}
			</div>
		</main>
	);
};

export default MainContent;
