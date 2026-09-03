import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, LogOut, BookOpen, Heart, Upload, Settings, Menu, X, MessageCircle, Bell, Home, TrendingUp, FileText, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import Button from '../ui/Button';
import NotificationsDropdown, { NotificationBadge, useNotifications } from '../ui/NotificationsDropdown';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Detect OS for shortcut badge
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const shortcutKey = isMac ? '⌘K' : 'Ctrl+K';

  const navigationItems = [
    { path: '/home', label: 'Dashboard', icon: Home },
    { path: '/trending', label: 'Trending', icon: TrendingUp },
    { path: '/advanced-search', label: 'Search', icon: Search },
  ];

  // Close menus on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
        setShowMobileMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
    setShowMobileMenu(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debouncedSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(debouncedSearch)}`);
      setShowMobileMenu(false);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? "/home" : "/"} className="flex items-center space-x-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Notes<span className="text-blue-600 dark:text-blue-400">Exchange</span>
              </span>
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white sm:hidden">
              N<span className="text-blue-600 dark:text-blue-400">E</span>
            </span>
          </Link>

          {/* Search Bar — Hidden on mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notes, subjects, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-16 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400"
              />
              <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                <kbd className="px-1.5 py-0.5 text-[10px] text-gray-400 bg-gray-100 dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 font-mono">{shortcutKey}</kbd>
              </div>
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 text-sm ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => navigate('/upload')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                >
                  Upload
                </Button>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-0.5 ml-1">
                  <button 
                    onClick={() => navigate('/favorites')}
                    className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-500 transition-colors duration-150 rounded-lg hover:bg-red-50 dark:hover:bg-slate-800"
                    title="Favorites"
                  >
                    <Heart className="w-[18px] h-[18px]" />
                  </button>

                  <button
                    onClick={() => navigate('/chat')}
                    className="p-2 text-gray-500 dark:text-slate-400 hover:text-emerald-500 transition-colors duration-150 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800"
                    title="Messages"
                  >
                    <MessageCircle className="w-[18px] h-[18px]" />
                  </button>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-gray-500 dark:text-slate-400 hover:text-blue-500 transition-colors duration-150 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800"
                      title="Notifications"
                    >
                      <Bell className="w-[18px] h-[18px]" />
                      <NotificationBadge count={unreadCount} />
                    </button>
                    <NotificationsDropdown
                      isOpen={showNotifications}
                      onClose={() => setShowNotifications(false)}
                    />
                  </div>
                </div>

                {/* Profile Menu */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden shadow-2xs">
                      {user.avatarUrl || (user as any).avatar_url || user.profileImage ? (
                        <img 
                          src={user.avatarUrl || (user as any).avatar_url || user.profileImage} 
                          alt={user.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="hidden xl:block text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-28">{user.name}</div>
                    </div>
                  </button>

                  {showProfileMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowProfileMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-20 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
                        {/* User Info */}
                        <div className="px-4 py-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden shadow-2xs shrink-0">
                              {user.avatarUrl || (user as any).avatar_url || user.profileImage ? (
                                <img 
                                  src={user.avatarUrl || (user as any).avatar_url || user.profileImage} 
                                  alt={user.name} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <span className="text-white font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{user.name}</div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 3 Core Menu Items */}
                        <div className="py-1">
                          {[
                            { to: '/profile', icon: User, label: 'Your Profile', color: 'text-blue-600 dark:text-blue-400' },
                            { to: '/rewards', icon: Award, label: 'NoteCoins & Rewards', color: 'text-amber-600 dark:text-amber-400', badge: `${user.contributionScore || 50} 🪙` },
                            { to: '/settings', icon: Settings, label: 'Settings & Privacy', color: 'text-slate-600 dark:text-slate-400' },
                          ].map(({ to, icon: Icon, label, color, badge }) => (
                            <Link
                              key={to}
                              to={to}
                              className="flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                                <span className="truncate">{label}</span>
                              </div>
                              {badge && (
                                <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono text-[11px] font-bold border border-amber-200/60 dark:border-amber-800/60">
                                  {badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                        
                        {/* Sign Out */}
                        <div className="pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2.5 w-full px-4 py-2.5 text-xs sm:text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors text-sm px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-1 md:hidden">
            {user && (
              <>
                <button 
                  onClick={() => navigate('/favorites')}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="p-2 text-gray-500 hover:text-emerald-500 transition-colors rounded-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </>
            )}
            
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-100 bg-white pb-4 animate-slide-down">
            {/* Mobile Search */}
            <div className="p-4 border-b border-gray-50">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-sm"
                  />
                </div>
              </form>
            </div>

            {/* Mobile Navigation */}
            <div className="p-4 space-y-1">
              {user ? (
                <>
                  {/* User Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">Welcome back!</div>
                      </div>
                    </div>
                  </div>

                  {/* Nav Links */}
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                          isActive 
                            ? 'bg-blue-50 text-blue-600 font-medium' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {navigationItems.slice(0, 2).map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                    <Link
                      to="/login"
                      className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm shadow-md"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;