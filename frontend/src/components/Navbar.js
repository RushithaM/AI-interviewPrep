import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {Home, FileText, Briefcase, Building, User, ChevronLeft, ChevronRight, Zap, Moon, BarChart, ClipboardList, X, Menu} from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const Navbar = ({ 
  isSidebarOpen, 
  toggleSidebar, 
  toggleDarkMode,
  closeMenu 
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDarkModeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    toggleDarkMode?.();
  };

  return (
    <nav className={`
      bg-gradient-to-b from-gray-900 to-gray-800 
      dark:from-gray-800 dark:to-gray-700 
      text-white h-screen fixed top-0 left-0 
      transition-all duration-300
      ${isSidebarOpen ? 'w-58' : isMobile ? 'w-0' : 'w-20'}
      ${isMobile && !isSidebarOpen ? 'hidden' : 'block'}
      flex flex-col justify-between
      shadow-xl
    `}>
      <div className="mt-10 sm:mt-4"> {/* Added top margin */}
        {!isSidebarOpen && isMobile && (
          <button 
            onClick={toggleSidebar} 
            className="p-2 w-full flex justify-center focus:outline-none hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            <Menu size={24} />
          </button>
        )}

        {!closeMenu && !isMobile && (
          <button 
            onClick={toggleSidebar} 
            className="p-2 w-full flex justify-center focus:outline-none hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        )}

        {closeMenu && (
          <button 
            onClick={closeMenu}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        )}

        <div className="flex flex-col mt-4 space-y-2 px-3">
          <NavItem 
            icon={<Home size={24} />} 
            text="Dashboard" 
            to="/dashboard" 
            isOpen={isSidebarOpen}
            location={location}
            onClick={closeMenu}
          />
          <NavItem 
            icon={<BarChart size={24} />} 
            text="Resume Analysis" 
            to="/resume-analysis" 
            isOpen={isSidebarOpen}
            location={location}
            onClick={closeMenu}
          />
          <NavItem 
            icon={<FileText size={24} />} 
            text="Resume QA" 
            to="/resume-qa" 
            isOpen={isSidebarOpen}
            location={location}
            onClick={closeMenu}
          />
          <NavItem 
            icon={<Briefcase size={24} />} 
            text="Role QA" 
            to="/role-qa" 
            isOpen={isSidebarOpen}
            location={location}
            onClick={closeMenu}
          />
          <NavItem 
            icon={<Building size={24} />} 
            text="Company QA" 
            to="/company-qa" 
            isOpen={isSidebarOpen}
            location={location}
            onClick={closeMenu}
          />
          <NavItem 
            icon={<ClipboardList size={24} />} 
            text="Quiz" 
            to="/quiz" 
            isOpen={isSidebarOpen}
            location={location}
            onClick={closeMenu}
          />
          <NavItem 
            icon={<User size={24} />} 
            text="Edit Profile" 
            to="/profile" 
            isOpen={isSidebarOpen}
            location={location}
            onClick={closeMenu}
          />
        </div>
      </div>

      <div className="mt-auto mb-4 flex flex-col items-center space-y-4">
        <button 
          onClick={handleDarkModeToggle} 
          className="p-4 w-full flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-md"
        >
          <Moon size={24} />
          {isSidebarOpen && <span className="ml-4">Dark Mode</span>}
        </button>

        <div className="px-4 w-full">
          <Link
            to="/upgrade"
            className={`
              inline-flex items-center justify-center w-full
              bg-gradient-to-r from-purple-500 to-pink-500 
              text-white rounded-md hover:opacity-90 
              transition-all duration-300 
              ${isSidebarOpen ? 'py-2 px-4' : 'p-2'}
            `}
          >
            <Zap size={isSidebarOpen ? 16 : 18} />
            {isSidebarOpen && <span className="ml-2">Upgrade</span>}
          </Link>
        </div>

        <div className="p-4 w-full flex justify-center">
          <SignedIn>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </SignedIn>
          <SignedOut>
            <Link 
              to="/sign-in" 
              className="text-white hover:text-purple-400 transition-colors"
              onClick={closeMenu}
            >
              {isSidebarOpen ? 'Sign In' : <User size={24} />}
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ icon, text, to, isOpen, location, onClick }) => {
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center p-3 rounded-md 
        transition-all duration-300 
        hover:bg-gray-700 dark:hover:bg-gray-600 
        ${isActive ? 'bg-purple-600 text-white' : 'text-gray-300'} 
        ${isOpen ? 'justify-start pl-4' : 'justify-center'}
      `}
    >
      {icon}
      {isOpen && <span className="ml-4 font-medium">{text}</span>}
    </Link>
  );
};

export default Navbar;
