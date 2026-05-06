import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, RefreshCw, Sun, Moon } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { motion } from 'motion/react';
import { useFirebase } from '@/src/contexts/FirebaseContext';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithEmail, signUpWithEmail, signIn, user, profile, activeRole, switchRole } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (activeRole === 'admin') {
        navigate('/admin');
      } else if (activeRole === 'expert' || profile.role === 'expert') {
        if (activeRole !== 'expert') switchRole('expert');
        navigate('/dashboard');
      } else if (activeRole === 'client') {
        navigate('/experts');
      }
    }
  }, [user, profile, activeRole, navigate, switchRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password, 'client');
      } else {
        await signUpWithEmail(email, password, displayName);
        await switchRole('client');
        alert("Account created! Please check your email for verification.");
      }
      // Redirection handled by useEffect for login
      // For signup, they stay on page until verified or redirect
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn();
      switchRole('client');
    } catch (err: any) {
      setError(err.message || "Google sign in failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] flex flex-col items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-100/50 dark:bg-blue-900/20 blur-[120px] rounded-full" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50/50 dark:bg-blue-800/10 blur-[120px] rounded-full" />

      <div className="absolute top-8 right-8 z-10">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-xl"
        >
          {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link to="/" className="flex items-center gap-3 text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-10 group">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
          >
            <Zap className="h-12 w-12 fill-blue-600" />
          </motion.div>
          <span>Quiklance</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 dark:opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <Card className="relative w-full p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border-gray-100 dark:border-gray-800 rounded-[2rem] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {mode === 'login' ? 'Log in to your account.' : 'Join Quiklance as a client.'}
            </p>
          </div>
          
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-600" />
                  <input 
                    type="text" 
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pl-12 pr-6 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-600" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pl-12 pr-6 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-600" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pl-12 pr-6 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/40">
              {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : (mode === 'login' ? 'Log in' : 'Sign up')}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400 font-bold">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleSignIn} 
            disabled={isLoading}
            className="w-full h-14 rounded-2xl"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 mr-2" />
            Google
          </Button>

          <div className="text-center space-y-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setMode('signup')} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Sign up as Client
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Log in
                  </button>
                </>
              )}
            </p>
            <div className="pt-2 flex flex-col gap-3">
              <Link to="/become-quiklancer" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                Want to earn? Become a Quiklancer
              </Link>
            </div>
          </div>
        </div>
      </Card>
      </motion.div>
    </div>
  );
}
