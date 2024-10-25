import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => JSON.parse(localStorage.getItem('isSidebarOpen')) ?? true
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => JSON.parse(localStorage.getItem('isDarkMode')) ?? false
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    localStorage.setItem('isSidebarOpen', JSON.stringify(!isSidebarOpen));
  };
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('isDarkMode', JSON.stringify(!isDarkMode));
  };
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-[#06070b]">
      {/* Slim Sidebar for Mobile */}
      <div className="md:hidden">
        <Navbar 
          isSidebarOpen={false} 
          toggleSidebar={toggleSidebar} 
          toggleDarkMode={toggleDarkMode}
        />
      </div>

      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          toggleDarkMode={toggleDarkMode}
        />
      </div>

      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg bg-purple-600 shadow-lg"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Expanded Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={toggleMenu}
          />
          
          <div className="relative z-50 w-64 h-full">
            <Navbar 
              isSidebarOpen={true}
              toggleSidebar={toggleSidebar}
              toggleDarkMode={toggleDarkMode}
              closeMenu={() => setIsMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-300 ${
          isMobile ? 'ml-0' : isSidebarOpen ? 'md:ml-56' : 'md:ml-20'
        } bg-white dark:bg-[#06070b]`}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
