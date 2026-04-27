import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, ArrowRight, X, AlertCircle } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { Button } from './ui/Button';

export default function PhonePromptModal() {
  const { user, profile, updateProfile } = useFirebase();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Only show if user is logged in, profile exists, but phone number is missing
  const showModal = user && profile && !profile.phoneNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      await updateProfile({ 
        phoneNumber: fullPhoneNumber,
        // Ensure client status is active once they provide phone number
        status: profile?.role === 'client' ? 'active' : profile?.status
      });
    } catch (err) {
      setError('Failed to save phone number. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-900 p-8 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <Phone className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Complete your profile</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Please provide your mobile number to receive important updates and exclusive offers from Quiklance.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">+91</span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pl-14 pr-4 py-4 text-lg font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none transition-all"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || phoneNumber.length < 10}
                className="h-14 w-full rounded-2xl text-lg shadow-xl shadow-blue-100 dark:shadow-blue-900/40"
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
                {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
              By continuing, you agree to receive marketing communications. You can opt-out anytime in settings.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
