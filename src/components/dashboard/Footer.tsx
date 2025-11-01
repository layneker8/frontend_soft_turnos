import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 text-center p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-secondary">
                &copy; {new Date().getFullYear()} Iturno. Todos los derechos reservados.
            </p>
        </footer>
    );
};

export default Footer;