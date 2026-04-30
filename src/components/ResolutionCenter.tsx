import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  MessageSquare,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { Session, Dispute } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export default function ResolutionCenter() {
  const { user, profile } = useFirebase();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;

    // Listen for sessions that need resolution
    // We only show resolution prompts for sessions that just ended (completed) 
    // or those in dispute where one party hasn't responded.
    const q = query(
      collection(db, 'sessions'),
      where('status', 'in', ['completed', 'dispute']),
      where(profile.role === 'expert' ? 'expertId' : 'clientId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Session));
      // Filter out sessions that already have the current user's resolution
      const pendingDocs = docs.filter(s => {
        if (profile.role === 'client') return !s.clientResolution;
        if (profile.role === 'expert') {
          // Expert only needs to resolve if client said 'not-resolved' OR if it was already marked as dispute
          return s.clientResolution === 'not-resolved' && !s.expertResolution;
        }
        return false;
      });
      setSessions(pendingDocs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sessions');
    });

    return () => unsubscribe();
  }, [user, profile]);

  const handleResolution = async (sessionId: string, resolved: boolean) => {
    setIsProcessing(true);
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;
      
      if (profile?.role === 'client') {
        if (resolved) {
          // YES, ISSUE RESOLVED
          await updateDoc(sessionRef, {
            status: 'resolved',
            clientResolution: 'resolved',
            updatedAt: serverTimestamp()
          });
          
          // In a real app, we would release escrow here.
          // For now, we update expert's pending earnings if we had a dedicated field.
        } else {
          // NO, ISSUE NOT RESOLVED
          await updateDoc(sessionRef, {
            clientResolution: 'not-resolved',
            updatedAt: serverTimestamp()
          });
        }
      } else if (profile?.role === 'expert') {
        if (resolved) {
          // Expert says RESOLVED (Dispute)
          await updateDoc(sessionRef, {
            status: 'dispute',
            expertResolution: 'resolved',
            updatedAt: serverTimestamp()
          });
          
          // Create Dispute Ticket for Admin
          await addDoc(collection(db, 'disputes'), {
            sessionId,
            clientId: session.clientId,
            expertId: user?.uid,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          // Expert says NOT RESOLVED (Mutual Refund)
          await updateDoc(sessionRef, {
            status: 'not-resolved-mutual',
            expertResolution: 'not-resolved',
            updatedAt: serverTimestamp()
          });
        }
      }
      setShowConfirmModal(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `sessions/${sessionId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (sessions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-md"
      />
      
      <AnimatePresence mode="wait">
        {sessions.map((session) => {
          const isClient = profile?.role === 'client';
          
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[3rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-center mb-8">
                  <div className={`h-24 w-24 rounded-[2rem] flex items-center justify-center overflow-hidden ${
                    isClient ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {isClient ? <ShieldCheck className="h-12 w-12" /> : <ShieldAlert className="h-12 w-12" />}
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">
                    Post-Session Resolution
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed">
                    {isClient 
                      ? "Your live session has ended. To ensure fair payment and quality service, please confirm if your issue was resolved."
                      : "The client marked the issue as NOT resolved. If you believe you successfully fixed the issue, you can raise a dispute for admin review."
                    }
                  </p>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => isClient ? setShowConfirmModal(session.id) : handleResolution(session.id, true)}
                    disabled={isProcessing}
                    className={`h-16 rounded-2xl text-lg font-black uppercase tracking-wider ${
                      isClient ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isClient ? "Resolved" : "Raise Dispute"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleResolution(session.id, false)}
                    disabled={isProcessing}
                    className="h-16 rounded-2xl text-lg font-black uppercase tracking-wider border-2"
                  >
                    {isClient ? "Not Resolved" : "Accept Refund"}
                  </Button>
                </div>

                <div className="mt-8 flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                  <Info className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium italic">
                    {isClient 
                      ? "If you select 'Not Resolved', the Quiklancer will have a chance to accept a mutual refund or raise a dispute for manual review."
                      : "Selecting 'Accept Refund' will immediately return the session funds to the client. Choosing 'Raise Dispute' sends the session recording to Quiklance Admin for final judgment."
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Internal Confirmation Modal for releasing payment */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl"
              onClick={() => setShowConfirmModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-900 p-8 shadow-2xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Confirm Payment Release</h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Thank you! Once you confirm, the session funds will be released to the Quiklancer. This action cannot be undone.
              </p>

              <div className="mt-8 space-y-4">
                <Button
                  onClick={() => handleResolution(showConfirmModal, true)}
                  disabled={isProcessing}
                  className="w-full h-14 rounded-2xl text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl shadow-green-100 dark:shadow-green-900/20"
                >
                  {isProcessing ? 'Processing...' : 'CONFIRM & RELEASE'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(null)}
                  className="w-full h-14 rounded-2xl text-lg font-bold"
                >
                  CANCEL
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
