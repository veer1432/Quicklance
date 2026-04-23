import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Clock,
  MessageSquare,
  Gift,
  ArrowRight,
  Star,
  Sun,
  Moon
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FeedbackResponse } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const STEPS = [
  {
    id: 'background',
    title: "Let's get to know you",
    subtitle: 'Help us tailor Quicklance to your specific needs.',
  },
  {
    id: 'problem',
    title: 'The Struggle is Real',
    subtitle: 'Understanding how tech issues impact your day.',
  },
  {
    id: 'payment',
    title: 'Value & Trust',
    subtitle: 'Most important section: Help us build a fair platform.',
  },
  {
    id: 'product',
    title: 'Product Vision',
    subtitle: 'Help us design the features that matter most.',
  },
  {
    id: 'early-access',
    title: 'Claim Your Reward',
    subtitle: 'Get 2 free sessions (30-min) when we launch!',
  }
];

export default function Feedback() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const [formData, setFormData] = useState<Partial<FeedbackResponse>>({
    userPersona: '',
    techStack: [],
    issueFrequency: '',
    currentMove: [],
    timeWastedPerIssue: '',
    failureRate: '',
    willingnessToPay: '',
    pricePoint: '',
    barrierToPay: [],
    trustTriggers: [],
    chatBeforeBooking: '',
    bookingPreference: '',
    likelihoodToTry: 5,
    wantEarlyAccess: '',
    name: '',
    email: '',
    whatsapp: '',
    recentIssueStory: '',
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleMultiSelect = (field: keyof FeedbackResponse, value: string) => {
    const currentValues = (formData[field] as string[]) || [];
    if (currentValues.includes(value)) {
      setFormData({ ...formData, [field]: currentValues.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...currentValues, value] });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const path = 'feedbackResponses';
    try {
      await addDoc(collection(db, path), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setIsDone(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center p-6 transition-colors duration-300">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="h-24 w-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">You're on the list!</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            Thank you for helping us build Quicklance. We'll reach out to you with your early access sessions soon.
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full h-16 text-xl rounded-full font-bold">
            Return to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] transition-colors duration-300">
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800 z-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          className="h-full bg-blue-600"
        />
      </div>

      <div className="max-w-3xl mx-auto pt-8 px-6 flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Zap className="h-8 w-8 fill-blue-600 transition-colors" />
          </motion.div>
          <span>Quicklance</span>
        </Link>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </motion.button>
      </div>

      <div className="max-w-3xl mx-auto pt-12 pb-20 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <header className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest ring-1 ring-blue-100 dark:ring-blue-900/30">
                Step {currentStep + 1} of {STEPS.length}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                {STEPS[currentStep].title}
              </h1>
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                {STEPS[currentStep].subtitle}
              </p>
            </header>

            <Card className="p-8 md:p-12 space-y-10 shadow-xl border border-gray-100 dark:border-gray-800 transition-colors dark:bg-gray-900/50">
              {currentStep === 0 && (
                <div className="space-y-8">
                  {/* Q1 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      What best describes you?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {['Student', 'Freelancer', 'Business Owner', 'Working Professional', 'Other'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFormData({ ...formData, userPersona: opt })}
                          className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.userPersona === opt
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q2 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      Have you worked on any of these? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['WordPress', 'Shopify', 'Coding (Python, JS, etc.)', 'SEO / Marketing tools', 'Excel / BI / Tableau', 'Tax Filings (Monthly/Quarterly)'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => toggleMultiSelect('techStack', opt)}
                          className={`flex items-center px-6 h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.techStack?.includes(opt)
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          <div className={`mr-4 h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                            formData.techStack?.includes(opt) ? 'bg-blue-600 border-blue-600' : 'border-gray-200 dark:border-gray-700'
                          }`}>
                            {formData.techStack?.includes(opt) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                          </div>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q3 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      How often do you face technical issues while working?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['Very often (weekly)', 'Sometimes (monthly)', 'Rarely', 'Never'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFormData({ ...formData, issueFrequency: opt })}
                          className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.issueFrequency === opt
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleNext} disabled={!formData.userPersona || !formData.issueFrequency} className="h-16 px-10 text-xl rounded-full w-full font-bold">
                      Continue <ChevronRight className="ml-2 h-6 w-6" />
                    </Button>
                  </div>
                </div>
              )}

               {currentStep === 1 && (
                <div className="space-y-8">
                  {/* Q4 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      What do you usually do when you get stuck?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Google search', 'YouTube', 'ChatGPT', 'Ask friends', 'Hire freelancer'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => toggleMultiSelect('currentMove', opt)}
                          className={`flex items-center px-6 h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.currentMove?.includes(opt)
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q5 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      How much time do you spend solving one issue?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {['<15 mins', '15–30 mins', '30–60 mins', '1–3 hours', '3+ hours'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFormData({ ...formData, timeWastedPerIssue: opt })}
                          className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.timeWastedPerIssue === opt
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                           {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q6 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      How often are you unable to solve it?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Very often', 'Sometimes', 'Rarely', 'Never'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFormData({ ...formData, failureRate: opt })}
                          className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.failureRate === opt
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleBack} className="h-16 px-8 rounded-full border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                      <ChevronLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    <Button 
                      onClick={handleNext} 
                      disabled={!formData.timeWastedPerIssue || !formData.failureRate}
                      className="h-16 px-10 rounded-full flex-grow font-bold"
                    >
                      Continue <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  {/* Q8 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      If someone could fix your issue instantly via a live call, would you pay?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Yes', 'Maybe', 'No'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFormData({ ...formData, willingnessToPay: opt })}
                          className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.willingnessToPay === opt
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q9 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      How much would you pay for 30 mins help?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {['₹250', '₹500', '₹1000+', '₹1500', 'I won’t pay'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFormData({ ...formData, pricePoint: opt })}
                          className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.pricePoint === opt
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q10 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      What would stop you from paying?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {["Don't trust expert", 'Too expensive', 'Prefer solving myself', 'Not sure if it will be solved', 'Privacy concerns', 'Paying online'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => toggleMultiSelect('barrierToPay', opt)}
                          className={`flex items-center px-4 h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.barrierToPay?.includes(opt)
                              ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q11 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      What would make you trust this service?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {['Reviews & ratings', 'Verified experts', 'Refund guarantee', 'Session recording', 'Low price'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => toggleMultiSelect('trustTriggers', opt)}
                          className={`flex items-center px-4 h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.trustTriggers?.includes(opt)
                              ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleBack} className="h-16 px-8 rounded-full border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                      <ChevronLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    <Button onClick={handleNext} disabled={!formData.willingnessToPay || !formData.pricePoint} className="h-16 px-10 rounded-full flex-grow font-bold">
                      Continue <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  {/* Q12 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      Would you like to chat with expert before booking?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Yes', 'No', 'Maybe'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFormData({ ...formData, chatBeforeBooking: opt })}
                          className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.chatBeforeBooking === opt
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q13 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      What would you prefer?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {['Fix instantly', 'Schedule later', 'Both'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFormData({ ...formData, bookingPreference: opt })}
                          className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.bookingPreference === opt
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q14 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      How likely are you to try this? (1–5)
                    </label>
                    <div className="flex justify-between gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          onClick={() => setFormData({ ...formData, likelihoodToTry: num })}
                          className={`h-16 flex-1 rounded-2xl border-2 font-black text-xl transition-all ${
                            formData.likelihoodToTry === num
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-400 px-1 uppercase tracking-widest">
                      <span>Not Likely</span>
                      <span>Extremely Likely</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleBack} className="h-16 px-8 rounded-full border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                      <ChevronLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    <Button onClick={handleNext} disabled={!formData.chatBeforeBooking || !formData.bookingPreference} className="h-16 px-10 rounded-full flex-grow font-bold">
                      Almost Done <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="p-10 rounded-[2.5rem] bg-blue-600 text-white space-y-6 relative overflow-hidden shadow-xl shadow-blue-500/20">
                    <div className="absolute top-0 right-0 p-8 transform translate-x-1/4 -translate-y-1/4 opacity-20">
                      <Gift size={160} />
                    </div>
                    <div className="relative z-10 space-y-2">
                       <h3 className="text-3xl font-bold italic uppercase tracking-tight">Co-founder Early Access</h3>
                       <p className="font-bold opacity-90 leading-relaxed text-lg">
                         Submit your email/WhatsApp now and you will get 2 free sessions (30-min each) by joining today.
                       </p>
                    </div>
                  </div>

                  {/* Q15 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      Want early access?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Yes', 'No'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFormData({ ...formData, wantEarlyAccess: opt })}
                          className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                            formData.wantEarlyAccess === opt
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q16: Profile Details */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500 dark:text-gray-400 block ml-1 uppercase tracking-widest leading-none mb-4">
                        Your Name
                      </label>
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full h-16 rounded-3xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 font-bold text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-200 dark:placeholder:text-gray-700"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 block ml-1 uppercase tracking-widest leading-none mb-4">
                          Email Address
                        </label>
                        <input 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@email.com"
                          className="w-full h-16 rounded-3xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 font-bold text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-200 dark:placeholder:text-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 block ml-1 uppercase tracking-widest leading-none mb-4">
                          WhatsApp Number
                        </label>
                        <input 
                          type="text"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          placeholder="+91..."
                          className="w-full h-16 rounded-3xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 font-bold text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-200 dark:placeholder:text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Q17 */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-900 dark:text-white block">
                      Describe a recent issue you struggled with (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.recentIssueStory}
                      onChange={(e) => setFormData({ ...formData, recentIssueStory: e.target.value })}
                      placeholder="What was the last digital hurdle that took too long to solve?"
                      className="w-full rounded-3xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 font-bold text-gray-900 dark:text-white focus:border-blue-500 outline-none placeholder:text-gray-200 dark:placeholder:text-gray-700"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleBack} className="h-16 px-8 rounded-full border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                      <ChevronLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={!formData.wantEarlyAccess || isSubmitting}
                      className="h-16 px-10 rounded-full flex-grow shadow-xl shadow-blue-500/20 font-bold"
                    >
                      {isSubmitting ? 'Securing Access...' : 'Get My 2 Free Sessions'} <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <div className="text-center space-y-6 pt-12">
               <div className="flex items-center justify-center gap-10">
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">
                    <Clock className="h-4 w-4" /> 3 Min Survey
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">
                    <MessageSquare className="h-4 w-4" /> Your voice matters
                  </div>
               </div>
               <p className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
                 Your data is safe with us. We use it only to improve the platform experience.
               </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
