import { Link } from "react-router-dom";
import { Zap, Twitter, Github, Linkedin, Mail, ShieldCheck, Sun, Moon } from "lucide-react";
import { useFirebase } from "@/src/contexts/FirebaseContext";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function Footer() {
  const { profile, user } = useFirebase();
  const { theme, toggleTheme } = useTheme();

  const adminPath = profile?.role === 'admin' ? "/admin" : "/login";

  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#111827] pt-20 pb-10 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              <Zap className="h-8 w-8 fill-blue-600" />
              <span>Quiklance</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              The micro-freelancing platform for quick digital fixes. Get expert help via video calls and screen sharing, exactly when you need it.
            </p>
            <div className="flex gap-5">
              <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" />
              <Github className="h-5 w-5 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-blue-700 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white leading-none">Platform</h3>
            <ul className="space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              <li><Link to="/post-issue" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Post an Issue</Link></li>
              <li><Link to="/how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How it Works</Link></li>
              <li>
                <Link to={adminPath} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white leading-none">Categories</h3>
            <ul className="space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              <li><Link to="/category/wix" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Wix & Shopify</Link></li>
              <li><Link to="/category/wordpress" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">WordPress</Link></li>
              <li><Link to="/category/coding" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Web Development</Link></li>
              <li><Link to="/category/seo" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">SEO & Marketing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white leading-none">Support</h3>
            <ul className="space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              <li><Link to="/refund-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Refund Policy</Link></li>
              <li><Link to="/feedback" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Feedback</Link></li>
              <li><a href="mailto:support@quiklance.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8 space-y-6">
          <div className="text-center">
            <p className="text-xs font-bold text-blue-600/60 dark:text-blue-400/60 uppercase tracking-widest">
              Note: Quiklance is currently in a testing phase. The complete working website is under process; this version is for feedback and validation purposes only.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-medium text-gray-400">
            <p>© {new Date().getFullYear()} Quiklance Inc. All rights reserved.</p>
            
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-all font-bold"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>{theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
