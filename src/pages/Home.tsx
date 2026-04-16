import { Link } from "react-router-dom";
import { Zap, Monitor, Code, Database, Search, Layout, ShoppingCart, Globe, TrendingUp, ArrowRight, Star, CheckCircle2, Phone, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { CATEGORIES } from "@/src/types";
import { useCurrency } from "@/src/contexts/CurrencyContext";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";

const categoryIcons: Record<string, any> = {
  "Wix": Layout,
  "Shopify": ShoppingCart,
  "WordPress": Globe,
  "Coding": Code,
  "Database": Database,
  "SEO": Search,
  "Marketing": TrendingUp,
  "Design": Monitor,
  "General Tech": Zap
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
    <div className="flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-950 pt-24 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,#f0f7ff_0%,#ffffff_100%)] dark:bg-[radial-gradient(45%_45%_at_50%_50%,#0f172a_0%,#030712_100%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center text-center"
          >
            <motion.div 
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/20"
            >
              <Zap className="h-4 w-4 fill-blue-600 dark:fill-blue-400" />
              <span>Micro-Freelancing for Quick Fixes</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-7xl"
            >
              Stuck on a technical issue? <br />
              <span className="text-blue-600 dark:text-blue-400">Get it fixed in minutes.</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400"
            >
              Don't hire for a whole project. Connect with experts for specific fixes on Wix, Shopify, WordPress, Coding, and more via live video calls.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Button asChild size="lg" className="h-16 px-10 text-lg shadow-2xl shadow-blue-200 dark:shadow-blue-900/40">
                <Link to="/post-issue" className="flex items-center gap-2">
                  Post Your Issue Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-400 dark:text-gray-500"
            >
              <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Pay only for the fix</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Live video assistance</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Screen share control</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">What do you need help with?</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Choose a category and find a Quicklancer ready to help you right now.</p>
            </div>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          >
            {CATEGORIES.map((category, index) => {
              const Icon = categoryIcons[category] || Zap;
              return (
                <motion.div key={category} variants={itemVariants}>
                  <Link to={`/category/${(category || "").toLowerCase()}`} className="block">
                    <Card className="group relative flex flex-col items-center p-8 text-center h-full">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{category}</h3>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">How Quicklance Works</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Get your technical hurdles cleared in four simple steps.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 gap-12 md:grid-cols-4"
          >
            {[
              { step: "01", title: "Describe Issue", desc: "Post the specific problem you're facing with your project." },
              { step: "02", title: "Connect", desc: "Instantly match with a Quicklancer who specializes in that area." },
              { step: "03", title: "Live Fix", desc: "Jump on a video call, share your screen, and get it resolved." },
              { step: "04", title: "Pay per Fix", desc: "Only pay for the specific issue or the time spent on the call." }
            ].map((item, idx) => (
              <motion.div key={idx} variants={itemVariants} className="relative group">
                <div className="text-6xl font-black text-blue-50 dark:text-blue-900/10 mb-6 group-hover:text-blue-100 dark:group-hover:text-blue-900/20 transition-colors duration-500">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Experts */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">Top Quicklancers</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Highly rated Quicklancers available to help you right now.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
          >
            {[
              { name: "Alex Rivera", role: "Shopify Quicklancer", rating: 4.9, reviews: 124, img: "https://i.pravatar.cc/150?u=alex" },
              { name: "Sarah Chen", role: "WordPress & SEO", rating: 5.0, reviews: 89, img: "https://i.pravatar.cc/150?u=sarah" },
              { name: "Marcus Thorne", role: "Full Stack Dev", rating: 4.8, reviews: 215, img: "https://i.pravatar.cc/150?u=marcus" }
            ].map((expert, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="p-8 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.img 
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      src={expert.img} 
                      alt={expert.name} 
                      className="h-16 w-16 rounded-2xl object-cover shadow-md dark:shadow-gray-950" 
                      referrerPolicy="no-referrer" 
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{expert.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{expert.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900 dark:text-gray-100">{expert.rating}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({expert.reviews} reviews)</span>
                    <div className="ml-auto flex items-center gap-1 text-[10px] font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      Available
                    </div>
                  </div>
                  <div className="mt-auto space-y-3">
                    <Button variant="success" className="w-full h-12 gap-2">
                      <Phone className="h-4 w-4" />
                      Call Now
                    </Button>
                    <Button variant="secondary" className="w-full h-12">
                      View Profile
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3rem] bg-blue-600 px-8 py-20 text-center shadow-2xl"
          >
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#3b82f6,transparent)] opacity-50" />
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Ready to unblock your project?</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-blue-100">
              Join thousands of developers and business owners who use Quicklance to solve technical issues in record time.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="h-16 px-10 text-lg bg-white text-blue-600 hover:bg-blue-50">
                <Link to="/post-issue">
                  Get Started Now
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
