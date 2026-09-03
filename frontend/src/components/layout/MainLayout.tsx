import React, { useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showMobileActions?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title = "Dashboard",
  showMobileActions = true 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile Sub-header — Only visible on mobile for sidebar toggle */}
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between sticky top-16 z-30 transition-colors">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </button>
          <h1 className="text-sm font-semibold text-gray-700 dark:text-slate-200">{title}</h1>
          {showMobileActions ? (
            <Link
              to="/upload"
              className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </Link>
          ) : (
            <div className="w-7" /> /* Spacer for alignment */
          )}
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;