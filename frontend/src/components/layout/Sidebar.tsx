import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Search, 
  Upload, 
  Heart, 
  FileText, 
  MessageCircle, 
  User, 
  Settings,
  BarChart3,
  TrendingUp,
  Star,
  Users,
  HelpCircle,
  ChevronRight,
  Calendar,
  Clock,
  Award,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const mainNavItems = [
    { path: '/home', label: 'Dashboard', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { path: '/notes', label: 'Browse Notes', icon: BookOpen, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { path: '/my-notes', label: 'My Notes', icon: FileText, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { path: '/trending', label: 'Trending', icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  const personalItems = [
    { path: '/rewards', label: 'NoteCoins & Store', icon: Award, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { path: '/favorites', label: 'Favorites', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50' },
    { path: '/recently-viewed', label: 'Recently Viewed', icon: Clock, color: 'text-green-600', bgColor: 'bg-green-50' },
    { path: '/chat', label: 'Messages', icon: MessageCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  ];

  const insightItems = [
    { path: '/study-schedule', label: 'Study Schedule', icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { path: '/study-groups', label: 'Study Groups', icon: Users, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  ];

  const accountItems = [
    { path: '/settings', label: 'Settings', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-50' },
    { path: '/help', label: 'Help & Support', icon: HelpCircle, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  ];

  const NavItem = ({ item, onClick }: { item: any; onClick?: () => void }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`group flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 relative ${
          isActive
            ? `${item.bgColor} ${item.color} dark:bg-slate-800 dark:text-white font-bold shadow-2xs`
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
        }`}
      >
        <div className={`p-1.5 rounded-lg transition-all duration-200 ${
          isActive 
            ? `${item.bgColor} dark:bg-slate-700` 
            : 'group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-2xs'
        }`}>
          <Icon className={`w-4 h-4 transition-colors duration-200 ${
            isActive 
              ? item.color 
              : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
          }`} />
        </div>
        
        <span className="text-xs sm:text-sm tracking-tight">{item.label}</span>
        
        {isActive && (
          <div className="ml-auto">
            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
          </div>
        )}
        
        {!isActive && (
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 transform transition-transform duration-300 z-50 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:z-auto overflow-y-auto`}>
        
        {/* Background */}
        <div className="absolute inset-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-colors"></div>
        
        <div className="relative h-full flex flex-col">
          {/* User Profile Bento Card */}
          {user && (
            <div className="p-3.5 mt-1">
              <Link
                to="/profile"
                onClick={onClose}
                className="block p-3 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-purple-50/70 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-800/50 border border-blue-100/70 dark:border-slate-700/60 hover:shadow-xs transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xs text-white font-bold text-sm group-hover:scale-105 transition-transform overflow-hidden">
                      {user.avatarUrl || (user as any).avatar_url || user.profileImage ? (
                        <img 
                          src={user.avatarUrl || (user as any).avatar_url || user.profileImage} 
                          alt={user.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        user.name?.charAt(0).toUpperCase() || <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate text-xs sm:text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</p>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-1.5 py-0.2 rounded font-mono">
                        {user.contributionScore || 50} 🪙
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Karma</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 pb-4 space-y-5 overflow-y-auto">  
            {/* Main */}
            <div>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 px-3">
                Main
              </h3>
              <div className="space-y-0.5">
                {mainNavItems.map((item) => (
                  <NavItem key={item.path} item={item} onClick={onClose} />
                ))}
              </div>
            </div>

            {/* Personal */}
            {user && (
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 px-3">
                  Personal & Rewards
                </h3>
                <div className="space-y-0.5">
                  {personalItems.map((item) => (
                    <NavItem key={item.path} item={item} onClick={onClose} />
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {user && (
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 px-3">
                  Insights & Groups
                </h3>
                <div className="space-y-0.5">
                  {insightItems.map((item) => (
                    <NavItem key={item.path} item={item} onClick={onClose} />
                  ))}
                </div>
              </div>
            )}

            {/* Account */}
            <div>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 px-3">
                Account & Settings
              </h3>
              <div className="space-y-0.5">
                {accountItems.map((item) => (
                  <NavItem key={item.path} item={item} onClick={onClose} />
                ))}
              </div>
            </div>
          </nav>

          {/* Bottom Action */}
          <div className="p-3.5 border-t border-slate-100">
            <Link
              to="/upload"
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg group text-xs sm:text-sm"
              onClick={onClose}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Notes</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;