import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import { useFirebase } from '@/src/contexts/FirebaseContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Button } from '@/src/components/ui/Button';
import { motion } from 'motion/react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout, signIn } = useFirebase();
  const { theme, toggleTheme } = useTheme();

  // Simple admin check
  if (profile?.role !== 'admin') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 text-center transition-colors duration-300">
        <ShieldCheck className="mb-6 h-20 w-20 text-red-500" />
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">Admin Access Required</h1>
        <p className="mt-4 max-w-md text-lg text-gray-600 dark:text-gray-400">
          {!user 
            ? "Please sign in with your administrator account to access this area." 
            : "You do not have administrative privileges to access this area."}
        </p>
        <div className="mt-8 flex gap-4">
          {!user && (
            <Button onClick={signIn} className="bg-blue-600 hover:bg-blue-700">
              Sign In as Admin
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: UserCheck, label: 'Quicklancer Approval', path: '/admin/approvals' },
    { icon: Users, label: 'Manage Quicklancers', path: '/admin/quicklancers' },
    { icon: Users, label: 'Manage Clients', path: '/admin/clients' },
    { icon: BarChart3, label: 'MIS Reports', path: '/admin/reports' },
    { icon: ShieldAlert, label: 'Disputes', path: '/admin/disputes' },
    { icon: AlertTriangle, label: 'Complaints', path: '/admin/complaints' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-72 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:flex">
        <div className="flex h-24 items-center px-8 border-b border-gray-100 dark:border-gray-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xl">Q</div>
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-grow space-y-2 p-6 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-blue-900/40'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <button 
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow lg:ml-72">
        {/* Header */}
        <header className="flex h-24 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 lg:px-12">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </motion.button>

            <button className="relative rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
            </button>
            
            <div className="flex items-center gap-3 border-l border-gray-100 dark:border-gray-800 pl-6">
              <div className="text-right">
                <p className="text-sm font-black text-gray-900 dark:text-gray-100">{profile?.displayName}</p>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Site Manager</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                {profile?.displayName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
