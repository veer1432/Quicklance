import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Zap, 
  Mail, 
  Lock, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  Award,
  Briefcase,
  Upload,
  FileText,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useFirebase } from '@/src/contexts/FirebaseContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ConfirmationResult, RecaptchaVerifier } from '@/src/firebase';
import { Sun, Moon } from 'lucide-react';

type Step = 'account' | 'email-verify' | 'phone' | 'experience' | 'success';

export default function BecomeQuiklancer() {
  const [step, setStep] = useState<Step>('account');
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    countryCode: '+91',
    phone: '',
    isFresher: false,
    experience: [] as any[],
    certificates: [] as any[],
    declarationAccepted: false,
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [fileUploading, setFileUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { signUpWithEmail, updateProfile, verifyEmail, user, profile, activeRole, loading, switchRole, uploadFile, logout } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (user && profile) {
      // If user is already an expert, redirect to dashboard or onboarding
      if (profile.role === 'expert') {
        if (profile.status === 'active' || profile.status === 'pending') {
          if (profile.experience && profile.experience.length > 0) {
            navigate('/dashboard');
          } else {
            setStep('experience');
          }
        }
      } else if (profile.role === 'client') {
        // Logged in as client, just need to upgrade to expert
        setStep('phone');
      }
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user && profile) {
      // Pre-fill form if data exists
      setFormData(prev => ({
        ...prev,
        displayName: profile.displayName || user.displayName || prev.displayName,
        email: profile.email || user.email || prev.email,
        phone: profile.phoneNumber?.replace(/^\+\d+/, '') || prev.phone,
        countryCode: profile.phoneNumber?.match(/^\+\d+/)?.[0] || prev.countryCode,
      }));
    }
  }, [user, profile]);

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);
    try {
      // Create account first
      await signUpWithEmail(formData.email, formData.password, formData.displayName);
      setStep('email-verify');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. This can happen if your connection is unstable or blocked. Please try refreshing the page or using a different browser.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEmailVerifyNext = async () => {
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        setStep('phone');
      } else {
        setError("Please verify your email by clicking the link sent to your inbox. You may need to refresh the page or wait a moment.");
      }
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Ensure phone number is valid length
    if (formData.phone.length < 8) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setIsVerifying(true);
    try {
      const fullPhoneNumber = `${formData.countryCode}${formData.phone.trim()}`;
      
      // Update profile to be a pending expert with the phone number
      if (!user) throw new Error("No authenticated user found.");

      await updateProfile({ 
        uid: user.uid,
        email: user.email || '',
        role: 'expert', 
        status: 'pending',
        phoneNumber: fullPhoneNumber,
        displayName: formData.displayName || user.displayName || 'Quiklancer',
        hourlyRate: 250 
      });
      
      // Crucial: Switch active role to expert so dashboard allows them
      switchRole('expert');
      
      setStep('experience');
    } catch (err: any) {
      setError(err.message || "Failed to save phone number. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.declarationAccepted) {
      setError("Please accept the declaration to continue.");
      return;
    }
    setError(null);
    setIsVerifying(true);
    try {
      await updateProfile({
        isFresher: formData.isFresher,
        experience: formData.experience,
        certificates: formData.certificates,
        declarationAccepted: formData.declarationAccepted,
        status: 'pending' // Ensure it's pending for admin review
      });
      setStep('success');
    } catch (err: any) {
      setError(err.message || "Failed to save experience details.");
    } finally {
      setIsVerifying(false);
    }
  };

  const addExperience = () => {
    setFormData({ 
      ...formData, 
      experience: [...formData.experience, { company: '', role: '', duration: '', description: '' }] 
    });
  };

  const removeExperience = (idx: number) => {
    setFormData({ ...formData, experience: formData.experience.filter((_, i) => i !== idx) });
  };

  const updateExperience = (idx: number, data: any) => {
    const newExp = [...formData.experience];
    newExp[idx] = { ...newExp[idx], ...data };
    setFormData({ ...formData, experience: newExp });
  };

  const addCertificate = () => {
    setFormData({ 
      ...formData, 
      certificates: [...formData.certificates, { name: '', issuer: '', year: '', type: 'certificate' }] 
    });
  };

  const removeCertificate = (idx: number) => {
    setFormData({ ...formData, certificates: formData.certificates.filter((_, i) => i !== idx) });
  };

  const updateCertificate = (idx: number, data: any) => {
    const newCerts = [...formData.certificates];
    newCerts[idx] = { ...newCerts[idx], ...data };
    setFormData({ ...formData, certificates: newCerts });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 'account':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {user ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                  <UserIcon className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Welcome back, {user.displayName || 'Quiklancer'}</h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">You are currently logged in. Would you like to use this account to become an expert?</p>
                </div>
                <Button onClick={() => setStep('phone')} className="w-full h-14 text-lg rounded-2xl">
                  Continue as {user.email}
                </Button>
                <Button variant="ghost" onClick={logout} className="w-full text-gray-500 font-bold">
                  Use a different account
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Create your account</h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Start your journey as a Quiklancer today.</p>
                </div>
                
                {error && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">
                      {error}
                    </div>
                    {(error.includes("already registered") || error.includes("network error")) && (
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/login')}
                        className="w-full h-12 rounded-xl text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
                      >
                        Go to Login
                      </Button>
                    )}
                  </div>
                )}

                <form onSubmit={handleAccountSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-600" />
                      <input 
                        type="text" 
                        required
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pl-12 pr-6 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-600" />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pl-12 pr-6 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isVerifying} className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/40">
                    {isVerifying ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Continue'}
                  </Button>

                  <div className="pt-4 text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Already have an account?{' '}
                      <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                        Login
                      </Link>
                    </p>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        );

      case 'email-verify':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Verify your email</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">We've sent a verification link to {formData.email}. Please click the link in your email to continue.</p>
            </div>
            
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Button onClick={handleEmailVerifyNext} className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/40">
                I've verified my email
              </Button>
              <Button variant="outline" onClick={() => verifyEmail()} className="w-full h-14 rounded-2xl">
                Resend verification email
              </Button>
            </div>
          </motion.div>
        );

      case 'phone':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Mobile Number</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Please provide your contact number for project updates.</p>
            </div>
            
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="w-28 relative">
                    <input 
                      type="text" 
                      required
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
                      placeholder="+91"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-600" />
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pl-12 pr-6 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isVerifying} className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/40">
                {isVerifying ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Complete Registration'}
              </Button>
            </form>
          </motion.div>
        );

      case 'experience':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Experience & Proof</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Help us verify your expertise.</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Are you a Fresher?</h3>
                  <p className="text-xs text-gray-500">Toggle if you have no prior experience.</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, isFresher: !formData.isFresher, experience: !formData.isFresher ? [] : formData.experience })}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.isFresher ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out ${
                      formData.isFresher ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {!formData.isFresher && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Work Experience</h3>
                    <Button variant="outline" size="sm" onClick={addExperience} className="h-8 text-xs">
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </Button>
                  </div>
                  {formData.experience.map((exp, idx) => (
                    <div key={idx} className="relative p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-3">
                      <button onClick={() => removeExperience(idx)} className="absolute right-3 top-3 text-gray-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <input 
                        placeholder="Company Name"
                        value={exp.company}
                        onChange={(e) => updateExperience(idx, { company: e.target.value })}
                        className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 text-sm font-bold focus:border-blue-500 focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          placeholder="Role"
                          value={exp.role}
                          onChange={(e) => updateExperience(idx, { role: e.target.value })}
                          className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 text-sm font-bold focus:border-blue-500 focus:outline-none"
                        />
                        <input 
                          placeholder="Duration"
                          value={exp.duration}
                          onChange={(e) => updateExperience(idx, { duration: e.target.value })}
                          className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 text-sm font-bold focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Documents & Proof</h3>
                  <Button variant="outline" size="sm" onClick={addCertificate} className="h-8 text-xs">
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
                {formData.certificates.map((cert, idx) => (
                  <div key={idx} className="relative p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-3">
                    <button onClick={() => removeCertificate(idx)} className="absolute right-3 top-3 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <select
                      value={cert.type}
                      onChange={(e) => updateCertificate(idx, { type: e.target.value })}
                      className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 text-sm font-bold focus:border-blue-500 focus:outline-none"
                    >
                      <option value="certificate">Certificate</option>
                      {!formData.isFresher && (
                        <>
                          <option value="experience">Experience Letter</option>
                          <option value="offer-letter">Offer Letter</option>
                          <option value="appraisal">Appraisal Letter</option>
                          <option value="salary-slip">Salary Slip</option>
                          <option value="bank-statement">Bank Statement</option>
                        </>
                      )}
                      <option value="other">Other Proof</option>
                    </select>
                    <input 
                      placeholder="Document Title"
                      value={cert.name}
                      onChange={(e) => updateCertificate(idx, { name: e.target.value })}
                      className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 text-sm font-bold focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                      <Upload className="h-4 w-4 text-gray-400" />
                      <span className="flex-1 text-xs font-bold truncate">{cert.fileName || 'Upload Proof'}</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        id={`signup-file-${idx}`}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && user) {
                            setFileUploading(idx);
                            try {
                              const path = `experts/${user.uid}/documents/${Date.now()}_${file.name}`;
                              const url = await uploadFile(file, path);
                              updateCertificate(idx, { fileName: file.name, fileUrl: url });
                            } catch (err: any) {
                              setError("Failed to upload file. Please try again.");
                            } finally {
                              setFileUploading(null);
                            }
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-[10px] px-2" 
                        disabled={fileUploading === idx}
                        onClick={() => document.getElementById(`signup-file-${idx}`)?.click()}
                      >
                        {fileUploading === idx ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Upload'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox"
                    checked={formData.declarationAccepted}
                    onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <p className="text-[10px] leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
                    I declare that all information provided is true to the best of my knowledge. I understand that false information may lead to account suspension.
                  </p>
                </div>
              </div>

              <Button onClick={handleExperienceSubmit} disabled={isVerifying} className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/40">
                {isVerifying ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Submit Application'}
              </Button>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-8"
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">Application Submitted!</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Your profile is now pending approval from our administrators. We'll notify you once you're active.</p>
            </div>
            <Button onClick={() => navigate('/dashboard/profile')} className="w-full h-16 text-xl rounded-2xl shadow-2xl shadow-blue-200 dark:shadow-blue-900/40">
              Complete your Profile
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 transition-colors duration-300 relative">
      <div className="absolute top-8 right-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
        >
          {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
        </motion.button>
      </div>

      <Link to="/" className="flex items-center gap-2 text-3xl font-black tracking-tight text-blue-600 mb-12">
        <Zap className="h-10 w-10 fill-blue-600" />
        <span>Quiklance</span>
      </Link>

      <Card className="w-full max-w-md p-10 shadow-2xl shadow-blue-100/50 dark:shadow-blue-950/50 border-blue-50 dark:border-gray-800">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </Card>

      <div className="mt-12 flex items-center gap-8 text-gray-400 dark:text-gray-600 grayscale opacity-50">
        <ShieldCheck className="h-8 w-8" />
        <span className="font-bold uppercase tracking-widest text-xs">Bank-grade Security</span>
      </div>
    </div>
  );
}
