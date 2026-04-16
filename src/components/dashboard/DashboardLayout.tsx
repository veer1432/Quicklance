import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  Wallet, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Zap,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useFirebase } from '@/src/contexts/FirebaseContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, loading, logout } = useFirebase();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  if (!profile || (profile.role !== 'expert' && profile.role !== 'admin')) {
    return <Navigate to="/experts" replace />;
  }

  const expertMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: UserCircle, label: 'Edit Profile', path: '/dashboard/profile' },
    { icon: Wallet, label: 'Wallet & Earnings', path: '/dashboard/wallet' },
    { icon: Calendar, label: 'Availability', path: '/dashboard/calendar' },
    { icon: MessageSquare, label: 'Requests', path: '/dashboard/requests' },
    { icon: BarChart3, label: 'Analytics & MIS', path: '/dashboard/analytics' },
  ];

  const clientMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: UserCircle, label: 'My Profile', path: '/dashboard/profile' },
    { icon: Wallet, label: 'My Wallet', path: '/dashboard/wallet' },
    { icon: MessageSquare, label: 'My Issues', path: '/dashboard/requests' },
  ];

  const menuItems = profile?.role === 'expert' ? expertMenuItems : clientMenuItems;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        <div className="flex-grow overflow-y-auto px-6 py-8">
          <Link to="/" className="flex items-center gap-2 px-2 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
              <Zap className="h-6 w-6 fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">Quicklance</span>
          </Link>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all group",
                    isActive 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-100 dark:shadow-blue-900/40" 
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-100")} />
                    {item.label}
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <div className="rounded-3xl bg-gray-50 dark:bg-gray-800 p-4">
            <div className="flex items-center gap-3">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold">
                  {(profile.displayName || "E").charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">{profile.displayName}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quicklancer</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-grow p-12">
        {children}
      </main>
    </div>
  );
}
