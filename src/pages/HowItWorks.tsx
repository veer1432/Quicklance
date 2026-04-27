import { Zap, Video, ShieldCheck, CreditCard, Clock, MousePointer2, ArrowRight, Laptop, Phone, MessageSquare, CheckCircle2, Lock, Banknote, Terminal, IndianRupee, Coffee, Monitor, User } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

const StepIllustration = ({ idx }: { idx: number }) => {
  const containerBase = "relative w-full h-full flex items-center justify-center overflow-hidden";
  
  if (idx === 0) {
    return (
      <div className={`${containerBase} bg-blue-50 dark:bg-blue-900/20`}>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="bg-white dark:bg-[#0F172A] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl relative">
            <Laptop className="h-32 w-32 text-blue-600 dark:text-blue-400" />
            <motion.div 
              animate={{ scale: [1, 1.1, 1], x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-6 -right-6 bg-blue-600 p-4 rounded-2xl shadow-lg border border-blue-400"
            >
              <MessageSquare className="h-8 w-8 text-white" />
            </motion.div>
            <div className="mt-4 h-2 w-24 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-blue-600" 
              />
            </div>
          </div>
        </motion.div>
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 h-32 w-32 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-32 w-32 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
    );
  }

  if (idx === 1) {
    return (
      <div className={`${containerBase} bg-blue-50 dark:bg-blue-900/20`}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex gap-4"
        >
          <div className="bg-white dark:bg-[#0F172A] w-48 h-80 rounded-[2.5rem] border-4 border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
              <div className="h-1 w-12 bg-gray-50 dark:bg-gray-800 rounded-full mt-2" />
            </div>
            <div className="h-full flex flex-col items-center justify-center p-6 space-y-4">
              <div className="h-24 w-24 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center ring-4 ring-blue-100 dark:ring-blue-900/20">
                <Video className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2 w-full text-center">
                <div className="h-2 w-full bg-gray-50 dark:bg-gray-800 rounded-full" />
                <div className="h-2 w-3/4 bg-gray-50 dark:bg-gray-800 rounded-full mx-auto" />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="bg-green-500 rounded-full p-2"
              >
                <CheckCircle2 className="h-6 w-6 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (idx === 2) {
    return (
      <div className={`${containerBase} bg-blue-50 dark:bg-blue-900/20`}>
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="relative z-10"
        >
          <div className="relative">
            <ShieldCheck className="h-48 w-48 text-blue-600/10 dark:text-blue-400/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white dark:bg-[#0F172A] p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-6 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl inline-block">
                  <Lock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-1">
                    <IndianRupee className="h-6 w-6" />
                    2,500
                  </div>
                  <div className="bg-blue-600 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/40">
                    Pay Now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (idx === 3) {
    return (
      <div className={`${containerBase} bg-green-50 dark:bg-green-900/20`}>
        <div className="relative z-10 w-full max-w-sm px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {/* Desk Surface */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-4 bg-gray-200 dark:bg-gray-800 rounded-full blur-[2px] opacity-40" />
            
            {/* Monitor */}
            <div className="relative bg-white dark:bg-[#0F172A] rounded-2xl border-4 border-gray-100 dark:border-gray-800 p-2 shadow-2xl mx-auto w-64 h-48 flex flex-col">
              <div className="flex-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg overflow-hidden relative p-4 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="bg-green-500 rounded-full p-2 mb-2"
                >
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </motion.div>
                <div className="text-gray-900 dark:text-white text-sm font-black uppercase tracking-tighter">Issue Resolved</div>
                <div className="text-blue-600/60 dark:text-blue-400/40 text-[10px] mt-1 font-mono tracking-widest">FUND RELEASE TRIGGERED</div>
                
                {/* Floating Chat/Video bubbles on monitor */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="h-6 w-6 rounded-full bg-blue-600 border border-blue-400 overflow-hidden">
                    <User className="h-full w-full p-1 text-white" />
                  </div>
                  <div className="h-6 w-6 rounded-full bg-purple-600 border border-purple-400 overflow-hidden">
                    <User className="h-full w-full p-1 text-white" />
                  </div>
                </div>
              </div>
              <div className="mt-2 h-1 w-12 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto" />
            </div>
            
            {/* Desk items */}
            <div className="absolute -bottom-2 -left-4">
              <Coffee className="h-8 w-8 text-gray-300 dark:text-gray-700" />
            </div>
            
            <motion.div 
              animate={{ y: [0, -40], opacity: [0, 1, 0], x: [0, 20] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              className="absolute -top-12 right-0"
            >
              <div className="flex items-center gap-1 text-green-600 font-black">
                <IndianRupee className="h-4 w-4" />
                <span className="text-lg">+2,500</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default function HowItWorks() {
  const steps = [
    {
      title: "Post your specific task",
      description: "Describe the digital hurdle you're facing. Whether it's GST filing, a video edit, an ad campaign, or a website fix, be as detailed as possible.",
      icon: MessageSquare,
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
    },
    {
      title: "Connect with a Quiklancer",
      description: "Our platform matches you with experts who specialize in your specific requirement. Review their ratings, reviews, and hourly rates before connecting.",
      icon: Zap,
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
    },
    {
      title: "Secure the session",
      description: "Pay the session fee upfront. Your money doesn't go to the Quiklancer yet—Quiklance holds it safely while you work.",
      icon: ShieldCheck,
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
    },
    {
      title: "Live help & Release funds",
      description: "Jump on the call and get your task resolved. Once you're satisfied, funds are released to the expert. If not solved, you get a full refund.",
      icon: CreditCard,
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
    }
  ];

  return (
    <div className="bg-white dark:bg-[#0F172A] transition-colors duration-300">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#111827]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#e2e8f0,transparent)] dark:bg-[radial-gradient(circle_at_top_right,#1e293b,transparent)] opacity-70" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">How Quiklance Works</h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600 dark:text-gray-400 font-medium">
            We've simplified the process to focus on what matters: getting your digital tasks completed fast.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-32">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col gap-12 md:flex-row md:items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 space-y-6">
                  <div className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl ${step.color}`}>
                    <step.icon className="h-10 w-10" />
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{step.title}</h2>
                  <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-400 font-medium">{step.description}</p>
                  <div className="flex items-center gap-4 text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-100 dark:ring-blue-900/30">0{idx + 1}</span>
                    Step {idx + 1} of 4
                  </div>
                </div>
                <div className="flex-1">
                  <div className="aspect-video rounded-[3.5rem] bg-gray-50 dark:bg-[#111827] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-gray-100 dark:ring-gray-800 group relative">
                    <StepIllustration idx={idx} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-[#111827] py-24 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Why choose Quiklance?</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { title: "Time Efficient", desc: "No more waiting days for a freelancer to respond. Connect with experts instantly.", icon: Clock },
              { title: "Secure Payments", desc: "Your payments are held in escrow and only released once you're satisfied with the fix.", icon: ShieldCheck },
              { title: "Expert Vetting", desc: "We verify the skills of our Quiklancers to ensure you get high-quality assistance.", icon: Zap }
            ].map((feature, idx) => (
              <div key={idx} className="rounded-3xl bg-white dark:bg-[#0F172A] p-8 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 hover:ring-blue-100 dark:hover:ring-blue-900/50 hover:shadow-xl transition-all">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[4rem] bg-blue-600 px-8 py-24 text-center text-white shadow-[0_32px_64px_-16px_rgba(37,99,235,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,white,transparent)] opacity-10" />
            <h2 className="text-4xl font-bold sm:text-6xl tracking-tight">Ready to get started?</h2>
            <p className="mx-auto mt-8 max-w-xl text-xl text-blue-50 font-medium">
              Post your first task today and see how quickly you can get back to building.
            </p>
            <div className="mt-12 flex justify-center gap-4">
              <Link to="/post-issue" className="group flex items-center gap-3 rounded-full bg-white dark:bg-white px-10 py-5 text-xl font-bold text-blue-600 dark:text-blue-600 hover:scale-105 transition-all shadow-xl">
                Clear a Task
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
