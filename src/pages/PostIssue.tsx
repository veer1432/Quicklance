import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORIES } from "@/src/types";
import { useFirebase } from "@/src/contexts/FirebaseContext";
import { db, handleFirestoreError, OperationType } from "@/src/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/src/components/ui/Button";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function PostIssue() {
  const navigate = useNavigate();
  const { user, signIn } = useFirebase();
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      signIn();
      return;
    }

    setIsSubmitting(true);
    const path = "issues";
    try {
      await addDoc(collection(db, path), {
        clientId: user.uid,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      navigate("/experts");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20 transition-colors duration-300">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-12 flex items-center justify-center px-4 gap-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-4 flex-1 last:flex-none max-w-[200px]">
              <motion.div 
                initial={false}
                animate={{
                  backgroundColor: step >= s ? "#2563eb" : (theme === 'dark' ? "#1e293b" : "#ffffff"),
                  color: step >= s ? "#ffffff" : "#9ca3af",
                  scale: step === s ? 1.1 : 1,
                }}
                className={`flex h-12 w-12 items-center justify-center rounded-full font-bold shadow-sm ring-1 ring-gray-200 dark:ring-gray-800`}
              >
                {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
              </motion.div>
              {s < 2 && (
                <div className="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <motion.div 
                    initial={false}
                    animate={{ width: step > s ? "100%" : "0%" }}
                    className="h-full bg-blue-600"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="rounded-[2.5rem] bg-white dark:bg-gray-900 p-8 sm:p-12 shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 ring-1 ring-gray-100 dark:ring-gray-800"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">What's the issue?</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Give your issue a clear, descriptive title.</p>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Issue Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Shopify checkout button not working on mobile"
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-6 py-4 text-lg text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Category</label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {CATEGORIES.map((cat) => (
                        <motion.button
                          key={cat}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                            formData.category === cat 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40" 
                              : "bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {cat}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Describe the details</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Explain what happened and what you've tried so far.</p>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Description</label>
                    <textarea 
                      rows={6}
                      placeholder="Describe the technical hurdle in detail..."
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-6 py-4 text-lg text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none transition-all"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-700 dark:text-blue-400"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>Experts will review this description to see if they can help you via video call. Pricing will be as per the expert's rate.</p>
                  </motion.div>
                </div>
              )}

              <div className="flex gap-4 pt-8">
                {step > 1 && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-14 text-lg"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back
                  </Button>
                )}
                {step < 2 ? (
                  <Button 
                    type="button"
                    onClick={handleNext}
                    disabled={step === 1 && (!formData.title || !formData.category)}
                    className="flex-[2] h-14 text-lg"
                  >
                    Continue
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] h-14 text-lg"
                  >
                    {isSubmitting ? "Posting..." : user ? "Post Issue" : "Sign in to Post"}
                    {!isSubmitting && <Zap className="h-5 w-5 ml-2 fill-white" />}
                  </Button>
                )}

              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
