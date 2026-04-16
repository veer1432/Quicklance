import { Link } from "react-router-dom";
import { Zap, Twitter, Github, Linkedin, Mail, ShieldCheck } from "lucide-react";
import { useFirebase } from "@/src/contexts/FirebaseContext";

export default function Footer() {
  const { profile } = useFirebase();

  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 pt-16 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-blue-600">
              <Zap className="h-8 w-8 fill-blue-600" />
              <span>Quicklance</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              The micro-freelancing platform for quick technical fixes. Get expert help via video calls and screen sharing, exactly when you need it.
            </p>
            <div className="flex gap-4">
              <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Github className="h-5 w-5 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-blue-700 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">Platform</h3>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/post-issue" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Post an Issue</Link></li>
              <li><Link to="/how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How it Works</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li>
                <Link to="/admin" className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">Categories</h3>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/category/wix" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Wix & Shopify</Link></li>
              <li><Link to="/category/wordpress" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">WordPress</Link></li>
              <li><Link to="/category/coding" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Web Development</Link></li>
              <li><Link to="/category/seo" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">SEO & Marketing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">Support</h3>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/help" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Help Center</Link></li>
              <li><Link to="/safety" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Trust & Safety</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Us</Link></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@quicklance.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Quicklance Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
