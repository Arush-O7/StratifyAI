import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  MapIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftStartOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

import { api } from '../../services/api';
import { PageHeaderProvider } from '../../context/PageHeaderContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Pulse Hub', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Copilot Assistant', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Signal Engine', href: '/feedback', icon: DocumentTextIcon },
  { name: 'Horizons Board', href: '/roadmap', icon: MapIcon },
  { name: 'Horizons Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Analytics Console', href: '/analytics', icon: ChartBarIcon },
];

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    localStorage.getItem('activeProjectId')
  );
  
  const { user, logout } = useAuth();
  const location = useLocation();

  // Fetch all projects to populate project selector
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response: any = await api.get('/projects');
        if (response.success && response.data) {
          setProjects(response.data);
          
          // Auto-set active project if none selected yet
          if (response.data.length > 0 && !localStorage.getItem('activeProjectId')) {
            handleProjectChange(response.data[0]._id, response.data[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching projects in layout:', error);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Monitor active project changes in localStorage
  useEffect(() => {
    const checkStorage = () => {
      const storedId = localStorage.getItem('activeProjectId');
      if (storedId !== activeProjectId) {
        setActiveProjectId(storedId);
      }
    };

    window.addEventListener('storage', checkStorage);
    const interval = setInterval(checkStorage, 1000);

    return () => {
      window.removeEventListener('storage', checkStorage);
      clearInterval(interval);
    };
  }, [activeProjectId]);

  const handleProjectChange = (id: string, name: string) => {
    localStorage.setItem('activeProjectId', id);
    localStorage.setItem('activeProjectName', name);
    setActiveProjectId(id);
    window.dispatchEvent(new Event('storage'));
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard' && location.pathname === '/dashboard') return true;
    if (href !== '/dashboard' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <PageHeaderProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden bg-grid-glow">
        
        {/* Decorative background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

        {/* Mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 flex w-64 flex-col bg-slate-900/90 backdrop-blur-md border-r border-white/5 text-white shadow-2xl z-50"
              >
                <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    StratifyAI
                  </span>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <SidebarContent
                  navigation={navigation}
                  isActiveRoute={isActiveRoute}
                  user={user}
                  logout={logout}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:flex-col lg:w-64 bg-slate-950/60 backdrop-blur-md border-r border-white/5 text-white">
          <div className="flex h-16 items-center px-6 border-b border-white/5">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent tracking-tight text-glow-indigo">
              StratifyAI
            </span>
          </div>
          <SidebarContent
            navigation={navigation}
            isActiveRoute={isActiveRoute}
            user={user}
            logout={logout}
          />
        </div>

        {/* Main layout container */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen z-10">
          {/* Top header bar */}
          <header className="sticky top-0 z-30 bg-slate-950/40 backdrop-blur-md border-b border-white/5 h-16 flex items-center px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-slate-200 p-2 -ml-2 rounded-lg"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex-1 flex justify-between items-center ml-4 lg:ml-0">
              {/* Project selector dropdown */}
              <div className="flex items-center space-x-3">
                <span className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider hidden sm:inline">
                  Current Pulse:
                </span>
                
                {projects.length > 0 ? (
                  <div className="relative">
                    <select
                      value={activeProjectId || ''}
                      onChange={(e) => {
                        const selectedProj = projects.find(p => p._id === e.target.value);
                        if (selectedProj) {
                          handleProjectChange(selectedProj._id, selectedProj.name);
                        }
                      }}
                      className="appearance-none bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-indigo-500/30 rounded-xl py-1.5 pl-4 pr-10 text-xs font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all"
                    >
                      {projects.map((proj) => (
                        <option key={proj._id} value={proj._id} className="bg-slate-950 text-slate-300">
                          {proj.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                      <ChevronDownIcon className="h-3 w-3" />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-500">
                    No active pulse. Initialize one!
                  </span>
                )}
              </div>

              {/* User settings / Info */}
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-slate-400 hidden md:inline">
                  Welcome, <strong className="text-indigo-400">{user?.name}</strong>
                </span>
                
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                  {user?.role?.replace('-', ' ')}
                </span>
              </div>
            </div>
          </header>

          {/* Main workspace content with route animations */}
          <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </PageHeaderProvider>
  );
};

interface SidebarContentProps {
  navigation: Array<{ name: string; href: string; icon: any }>;
  isActiveRoute: (href: string) => boolean;
  user: any;
  logout: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  navigation,
  isActiveRoute,
  user,
  logout,
}) => {
  return (
    <div className="flex flex-col flex-1 justify-between overflow-y-auto custom-scrollbar">
      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navigation.map((item) => {
          const active = isActiveRoute(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 relative ${
                active
                  ? 'text-white bg-gradient-to-r from-indigo-600/30 to-violet-600/25 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User profile / Logout card */}
      <div className="p-4 border-t border-white/5">
        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white uppercase text-sm shadow-md shadow-indigo-600/20">
              {user?.name?.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
              <p className="text-3xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-3xs font-extrabold border border-rose-500/20 transition-all cursor-pointer"
          >
            <ArrowLeftStartOnRectangleIcon className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Layout;
