import { Link } from "react-router-dom";
import { Search, Menu, X, Zap, LogOut, User as UserIcon, ShieldCheck, Sun, Moon, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { useFirebase } from "@/src/contexts/FirebaseContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signIn, logout } = useFirebase();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { to: "/how-it-works", label: "How it Works" },
    { to: "/post-issue", label: "Post an Issue" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="group flex items-center gap-2 text-2xl font-bold tracking-tight text-blue-600">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Zap className="h-8 w-8 fill-blue-600 transition-colors group-hover:fill-blue-700" />
            </motion.div>
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Quicklance</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className="relative text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                {link.label}
                <motion.span 
                  className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-600 transition-all group-hover:w-full"
                  layoutId="nav-underline"
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 transition-all"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </motion.button>

          <motion.div 
            className="relative"
            whileFocus={{ scale: 1.02 }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search issues or experts..." 
              className="h-10 w-64 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
            />
          </motion.div>
          
          {user ? (
            <div className="flex items-center gap-6">
              {profile?.role === 'admin' ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/admin" 
                    className="text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-blue-300 flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl transition-all border border-red-100 dark:border-red-900/30"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </motion.div>
              ) : profile?.role === 'expert' ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/dashboard" 
                    className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-all border border-blue-100 dark:border-blue-900/30"
                  >
                    <Zap className="h-4 w-4" />
                    Quicklancer Panel
                  </Link>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/dashboard" 
                    className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900/40 rounded-xl transition-all border border-gray-100 dark:border-gray-800"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </motion.div>
              )}
              
              <div className="flex items-center gap-3 border-l border-gray-100 dark:border-gray-800 pl-6">
                <motion.div 
                  className="flex items-center gap-2 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent hover:ring-blue-100 dark:hover:ring-blue-900 transition-all" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{user.displayName?.split(' ')[0]}</span>
                </motion.div>
                <motion.button 
                  whileHover={{ scale: 1.1, color: "#ef4444" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={logout}
                  className="flex items-center justify-center h-8 w-8 rounded-full text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login"
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 transition-colors"
              >
                Client Login
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/become-quicklancer"
                  className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
                >
                  Become a Quicklancer
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="text-gray-600 dark:text-gray-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="block text-lg font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-3">
                <Link to="/login" className="block w-full rounded-full border border-gray-200 dark:border-gray-800 py-3 text-center font-medium text-gray-600 dark:text-gray-400">Client Login</Link>
                <Link to="/become-quicklancer" className="block w-full rounded-full bg-blue-600 py-3 text-center font-semibold text-white">Become a Quicklancer</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
