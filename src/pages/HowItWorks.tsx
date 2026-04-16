import { Zap, Video, ShieldCheck, CreditCard, Clock, MousePointer2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  const steps = [
    {
      title: "Post your specific issue",
      description: "Describe the technical hurdle you're facing. Whether it's a broken Wix layout, a Shopify app conflict, or a database error, be as detailed as possible.",
      icon: MousePointer2,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Connect with a Quicklancer",
      description: "Our platform matches you with experts who specialize in your specific problem. Review their ratings, reviews, and hourly rates before connecting.",
      icon: Zap,
      color: "bg-yellow-50 text-yellow-600"
    },
    {
      title: "Jump on a live video call",
      description: "Collaborate in real-time via video call. Share your screen or even give temporary control to the expert to resolve the issue together.",
      icon: Video,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Pay only for the resolution",
      description: "Once the issue is resolved, you pay for the specific fix or the time spent. No hefty project fees, just fair pricing for quick results.",
      icon: CreditCard,
      color: "bg-green-50 text-green-600"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#f0f9ff,transparent)] dark:bg-[radial-gradient(circle_at_top_right,#1e293b,transparent)] opacity-70" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl">How Quicklance Works</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            We've simplified the freelancing process to focus on what matters: getting your technical issues fixed fast.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col gap-12 md:flex-row md:items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 space-y-6">
                  <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} dark:bg-opacity-20`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{step.title}</h2>
                  <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">{step.description}</p>
                  <div className="flex items-center gap-4 text-sm font-bold text-blue-600 dark:text-blue-400">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">0{idx + 1}</span>
                    Step {idx + 1} of 4
                  </div>
                </div>
                <div className="flex-1">
                  <div className="aspect-video rounded-[2.5rem] bg-gray-100 dark:bg-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-gray-950/50 overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
                    <img 
                      src={`https://picsum.photos/seed/step${idx}/800/450`} 
                      alt={step.title} 
                      className="h-full w-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Why choose Quicklance?</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { title: "Time Efficient", desc: "No more waiting days for a freelancer to respond. Connect with experts instantly.", icon: Clock },
              { title: "Secure Payments", desc: "Your payments are held in escrow and only released once you're satisfied with the fix.", icon: ShieldCheck },
              { title: "Expert Vetting", desc: "We verify the skills of our Quicklancers to ensure you get high-quality assistance.", icon: Zap }
            ].map((feature, idx) => (
              <div key={idx} className="rounded-3xl bg-white dark:bg-gray-900 p-8 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[3rem] bg-gray-900 dark:bg-blue-900 px-8 py-20 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold sm:text-5xl">Ready to get started?</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-gray-400 dark:text-blue-100">
              Post your first issue today and see how quickly you can get back to building.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/post-issue" className="group flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white hover:bg-blue-700 transition-all">
                Post an Issue
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
