import { motion } from "motion/react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function RefundPolicy() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0F172A]">
      <Navbar />
      <main className="flex-grow pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="prose prose-blue dark:prose-invert max-w-none"
          >
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-8">Refund & Dispute Policy</h1>
            
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8">
              At Quiklance, we aim to provide fast and effective problem-solving through live expert sessions. This policy ensures a fair and transparent experience for both our Clients and Experts through a secure escrow system.
            </p>

            <section className="mt-12 space-y-12 pb-12">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Payment & Escrow System</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>• <span className="font-bold text-gray-900 dark:text-white">Advance Payment:</span> All sessions must be paid for in advance by the Client to initialize an expert request.</p>
                  <p>• <span className="font-bold text-gray-900 dark:text-white">Secure Escrow:</span> Payments are held securely by Quiklance in a temporary system until the session result is finalized.</p>
                  <p>• <span className="font-bold text-gray-900 dark:text-white">Outcome-Based Release:</span> Funds are only released to the Expert when the Client confirms the issue has been resolved or as determined by the Quiklance Resolution Center in the event of a dispute.</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Payout to Experts</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Payment is released to the Expert when the Client selects <span className="font-bold text-blue-600">"Issue Resolved"</span> on the platform and acknowledges satisfaction via the post-session confirmation prompt.
                </p>
                <div className="rounded-xl bg-orange-50 dark:bg-orange-900/10 p-4 border border-orange-100 dark:border-orange-900/30 text-sm text-orange-800 dark:text-orange-300">
                  <strong>Finality Note:</strong> Once the Client confirms resolution through the platform UI, the payment is considered final and non-refundable.
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Full Refund Eligibility</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Clients are eligible for a full refund in the following scenarios:</p>
                <ul className="list-disc pl-6 space-y-3 text-gray-600 dark:text-gray-400">
                  <li><span className="font-bold text-gray-900 dark:text-white">Mutual Agreement:</span> Both the Client and Expert agree during the session that the issue was not resolved.</li>
                  <li><span className="font-bold text-gray-900 dark:text-white">Expert No-Show:</span> The Expert fails to initialize or join a requested session within a reasonable timeframe.</li>
                  <li><span className="font-bold text-gray-900 dark:text-white">Expert Technical Failure:</span> The session could not be completed specifically due to connectivity or hardware failures on the Expert's side.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Dispute Resolution Process</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  If there is a disagreement regarding the session outcome (e.g., Client marks "Issue Not Resolved" while Expert claims "Resolved"):
                </p>
                <div className="mt-4 space-y-3 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                  <p>1. The funds will remain securely held by Quiklance in escrow.</p>
                  <p>2. Quiklance Support will review the dispute using platform interaction logs and shared evidence.</p>
                  <p>3. We aim to resolve all disputes within <span className="text-gray-900 dark:text-white font-bold">48 hours</span>. The platform's final decision on the payout or refund outcome is binding.</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Non-Refundable Scenarios</h2>
                <ul className="list-disc pl-6 space-y-3 text-gray-600 dark:text-gray-400">
                  <li>The Client has already manually marked the issue as "Resolved" on the platform.</li>
                  <li><span className="font-bold text-gray-900 dark:text-white">Client No-Show:</span> The Client fails to attend the requested session. In these cases, Quiklance reserves the right to deduct a <span className="font-bold underline italic">Reservation Fee</span> to compensate the Expert's time.</li>
                  <li>The issue falls outside the originally described scope or selected technical category at the time of the request.</li>
                  <li>The Client refuses to provide necessary information or cooperation required to perform the fix.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Abuse & Integrity Policy</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  To protect our community of Experts and genuine Clients, Quiklance reserves the right to:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-600 dark:text-gray-400">
                  <li>Deny refund requests in cases of suspected fraudulent claims or platform misuse.</li>
                  <li>Suspend or restrict accounts found to be involved in repeated disputes, harassment, or attempts to bypass our secure payment system.</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 p-8 border border-blue-100 dark:border-blue-800">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">Support Contact</h3>
                <p className="text-blue-700 dark:text-blue-300">
                  For queries regarding a specific session or payout, please reach out to our team at <a href="mailto:support@quiklance.com" className="font-bold underline">support@quiklance.com</a>.
                </p>
              </div>
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
