import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <main className="flex-grow p-6 transition-all">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            Toggle Dark Mode
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;