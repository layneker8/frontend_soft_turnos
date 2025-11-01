
const ViewTurnos: React.FC = () => {
    return (
        <div className="flex h-screen w-screen">

            <main className="w-2/3 p-12 flex flex-col items-center justify-center bg-white dark:bg-background-dark relative">
                {/* <iframe className="aspect-video" src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe> */}
                <div className="">
                    <h1 className="text-6xl font-bold text-gray-400 dark:text-gray-600 mb-4">TURNO ACTUAL</h1>
                    <p className="text-[20rem] font-black text-primary leading-none tracking-tighter">A-102</p>
                    <p className="text-8xl font-bold text-gray-500 dark:text-gray-400 mt-4">Modulo 1</p>
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-200 dark:bg-gray-700">
                        <div className="progress-bar h-full bg-primary"></div>
                    </div>
                </div>
            </main>

            <aside className="w-1/3 bg-gray-100 dark:bg-gray-900 p-12 flex flex-col">
                <h2 className="text-4xl font-bold text-center text-secondary mb-10">TURNOS LLAMADOS</h2>
                <div className="flex-grow space-y-4 overflow-y-auto">
                    <div
                        className="flex items-center justify-between bg-white dark:bg-background-dark p-6 rounded-xl shadow-md">
                        <p className="text-6xl font-bold text-secondary text-shadow-xs text-shadow-secondary-600">A-101</p>
                        <p className="text-4xl font-semibold text-secondary">Modulo 3</p>
                    </div>
                    <div
                        className="flex items-center justify-between bg-white dark:bg-background-dark p-6 rounded-xl shadow-md">
                        <p className="text-6xl font-bold text-secondary text-shadow-xs text-shadow-secondary-600">A-100</p>
                        <p className="text-4xl font-semibold text-secondary">Modulo 1</p>
                    </div>
                    <div
                        className="flex items-center justify-between bg-white dark:bg-background-dark p-6 rounded-xl shadow-md">
                        <p className="text-6xl font-bold text-secondary text-shadow-xs text-shadow-secondary-600">A-099</p>
                        <p className="text-4xl font-semibold text-secondary">Modulo 3</p>
                    </div>
                    <div
                        className="flex items-center justify-between bg-white dark:bg-background-dark p-6 rounded-xl shadow-md">
                        <p className="text-6xl font-bold text-secondary text-shadow-xs text-shadow-secondary-600">A-098</p>
                        <p className="text-4xl font-semibold text-secondary">Modulo 1</p>
                    </div>
                    <div
                        className="flex items-center justify-between bg-white dark:bg-background-dark p-6 rounded-xl shadow-md">
                        <p className="text-6xl font-bold text-secondary text-shadow-xs text-shadow-secondary-600">A-097</p>
                        <p className="text-4xl font-semibold text-secondary">Modulo 2</p>
                    </div>
                    <div
                        className="flex items-center justify-between bg-white dark:bg-background-dark p-6 rounded-xl shadow-md">
                        <p className="text-6xl font-bold text-secondary text-shadow-xs text-shadow-secondary-600">A-096</p>
                        <p className="text-4xl font-semibold text-secondary">Modulo 2</p>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default ViewTurnos;