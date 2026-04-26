import { Link } from "react-router-dom";
import { Zap, Monitor, Code, Database, Search, Layout, ShoppingCart, Globe, TrendingUp, ArrowRight, Star, CheckCircle2, Phone, Calendar, ShieldCheck, ChevronRight, MessageSquare, Video, Lock, Banknote, Scissors, FileText, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { CATEGORIES } from "@/src/types";
import { useCurrency } from "@/src/contexts/CurrencyContext";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { FEEDBACK_MODE } from "@/src/config";

const categoryIcons: Record<string, any> = {
  "Wix/Websites": Layout,
  "Shopify/Store": ShoppingCart,
  "WordPress": Globe,
  "Video Editing": Scissors,
  "Finance/GST": FileText,
  "Ads/Marketing": TrendingUp,
  "UI/UX Design": Monitor,
  "Coding/Tech": Code,
  "SEO": Search,
  "General Assistance": HelpCircle
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
} as const;

export default function Home() {
  const { formatPrice } = useCurrency();
  return (
    <div className="flex flex-col bg-white dark:bg-[#0F172A] transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-50 dark:bg-[#111827] pt-24 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#e2e8f0,transparent)] dark:bg-[radial-gradient(circle_at_top_right,#1e293b,transparent)] opacity-40" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center text-center"
          >
            <motion.div 
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-blue-600/20"
            >
              <Zap className="h-4 w-4 fill-blue-600" />
              <span>Micro-Freelancing for Quick Tasks</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-7xl leading-[1.1]"
            >
              Stuck on a project task? <br />
              <span className="text-blue-600 dark:text-blue-400">Get it cleared in minutes.</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 font-medium"
            >
              Don't hire for a whole project. Connect with experts for specific tasks like GST filing, video edits, ad campaigns, or website fixes via live video calls.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Button asChild size="lg" className="h-16 px-10 text-lg shadow-2xl shadow-blue-100">
                <Link to={FEEDBACK_MODE ? "/feedback" : "/post-issue"} className="flex items-center gap-2">
                  {FEEDBACK_MODE ? "Join the Waitlist" : "Clear a Task Now"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500"
            >
              <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /> Pay only for the result</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /> Live expert assistance</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /> Instant unblocking</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white dark:bg-[#0F172A] py-24 border-y border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">What do you need help with?</h2>
              <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 font-medium">Choose a category and find a Quicklancer ready to help you right now.</p>
            </div>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          >
            {CATEGORIES.map((category) => {
              const Icon = categoryIcons[category] || Zap;
              return (
                <motion.div key={category} variants={itemVariants}>
                  <Link to={FEEDBACK_MODE ? "/feedback" : `/category/${(category || "").toLowerCase()}`} className="block">
                    <Card className="group relative flex flex-col items-center p-8 text-center h-full dark:bg-[#111827] dark:border-gray-800">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{category}</h3>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-gray-50 dark:bg-[#111827] transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl tracking-tight">How Quicklance Works</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 font-medium">Get your project hurdles cleared in four simple steps.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 gap-12 md:grid-cols-4"
          >
            {[
              { step: "01", icon: MessageSquare, title: "Describe Task", desc: "Post the specific digital hurdle you're facing with your project." },
              { step: "02", icon: Video, title: "Connect", desc: "Instantly match with a Quicklancer who specializes in that area." },
              { step: "03", icon: Lock, title: "Test Credits", desc: "Use test credits for sessions while real payment processing is being connected." },
              { step: "04", icon: CheckCircle2, title: "Live Help & Review", desc: "Join the call, get the issue resolved, and confirm the session outcome." }
            ].map((item, idx) => (
              <motion.div key={idx} variants={itemVariants} className="relative group">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-6xl font-black text-blue-600/10 dark:text-blue-600/5 group-hover:text-blue-600/30 transition-colors duration-500">{item.step}</div>
                  <item.icon className="h-10 w-10 text-gray-300 dark:text-gray-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all duration-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vetting / Coming Soon Section */}
      <section className="bg-white dark:bg-[#0F172A] py-24 overflow-hidden relative border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center gap-12 text-center">
            {/* Header Content */}
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">Top High-Trust Experts</h2>
              <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Hand-picking the top 1% of tech talent to resolve your issues in minutes.
              </p>
            </div>

            {/* Focused Waitlist Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              whileInView={{ scale: 1, opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl w-full bg-white dark:bg-[#111827] p-8 md:p-16 rounded-[3.5rem] shadow-[0_48px_80px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 space-y-10 relative"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest ring-1 ring-blue-100 dark:ring-blue-900/30">
                <ShieldCheck className="h-4 w-4" />
                Waitlist Now Open
              </div>
              
              <div className="space-y-6">
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                  Expert Network <br /> <span className="text-blue-600 dark:text-blue-400">Arriving Soon</span>
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                  We are currently verifying certificates and live-fixing capabilities. Join today to get your early sessions secured.
                </p>
              </div>

              <div className="space-y-4">
                <Link 
                  to="/feedback" 
                  className="inline-flex items-center justify-center gap-3 w-full h-18 px-10 rounded-[2rem] bg-blue-600 text-white font-bold text-xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-3xl shadow-blue-500/20 group overflow-hidden relative"
                >
                  <span className="relative z-10">Claim 2 Free Sessions</span>
                  <ChevronRight className="h-6 w-6 relative z-10 group-hover:translate-x-1.5 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                </Link>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Limited Early Bird Slots Remaining
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gray-50 dark:bg-[#111827] transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[4rem] bg-blue-600 px-8 py-24 text-center shadow-[0_32px_64px_-16px_rgba(37,99,235,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,white,transparent)] opacity-10" />
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Ready to unblock your project?</h2>
            <p className="mx-auto mt-8 max-w-xl text-xl text-blue-50 font-medium">
              Join thousands of makers, marketers, and business owners who use Quicklance to solve digital hurdles in record time.
            </p>
            <div className="mt-12 flex justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="h-20 px-12 text-xl bg-white text-blue-600 hover:bg-gray-50 dark:bg-white dark:text-blue-600">
                <Link to={FEEDBACK_MODE ? "/feedback" : "/post-issue"}>
                  {FEEDBACK_MODE ? "Claim Your 2 Free Sessions" : "Get Started Now"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
