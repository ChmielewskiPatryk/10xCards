import * as React from 'react';

const DashboardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
          &copy; {currentYear} 10xCards. Wszelkie prawa zastrzeżone.
        </div>
        <div className="flex space-x-6">
          <a 
            href="/privacy" 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Polityka prywatności
          </a>
          <a 
            href="/terms" 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Regulamin
          </a>
          <a 
            href="/contact" 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Kontakt
          </a>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-center text-gray-400 dark:text-gray-500">
        Wersja 0.1.0 • Stworzone z ♥ przez zespół 10xCards
      </div>
    </footer>
  );
};

export default DashboardFooter; 