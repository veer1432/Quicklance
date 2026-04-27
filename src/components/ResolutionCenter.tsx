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
  const { user, profile, processTransaction } = useFirebase();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;

    // Listen for sessions that need resolution
    const q = query(
      collection(db, 'sessions'),
      where('status', 'in', ['completed', 'dispute']),
      where(profile.role === 'expert' ? 'expertId' : 'clientId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Session)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sessions');
    });

    return () => unsubscribe();
  }, [user, profile]);

  const handleResolution = async (sessionId: string, resolved: boolean) => {
    setIsProcessing(true);
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      
      if (profile?.role === 'client') {
        if (resolved) {
          // YES, ISSUE RESOLVED
          await updateDoc(sessionRef, {
            status: 'resolved',
            clientResolution: 'resolved',
            updatedAt: serverTimestamp()
          });
          
          // Release payment logic (simplified for demo)
          // In a real app, this would trigger the Razorpay release
          const session = sessions.find(s => s.id === sessionId);
          if (session) {
            const commission = session.totalPaid * 0.2; // 20% platform commission
            const expertEarnings = session.totalPaid - commission;
            
            // Update expert wallet (this should be a cloud function)
            const expertRef = doc(db, 'users', session.expertId);
            await updateDoc(expertRef, {
              totalEarnings: (profile?.totalEarnings || 0) + expertEarnings,
              walletBalance: (profile?.walletBalance || 0) + expertEarnings
            });
          }
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
          
          // Create Dispute Ticket
          await addDoc(collection(db, 'disputes'), {
            sessionId,
            clientId: sessions.find(s => s.id === sessionId)?.clientId,
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
          
          // Refund Client logic (simplified for demo)
          const session = sessions.find(s => s.id === sessionId);
          if (session) {
            const clientRef = doc(db, 'users', session.clientId);
            await updateDoc(clientRef, {
              walletBalance: (profile?.walletBalance || 0) + session.totalPaid
            });
          }
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
    <div className="fixed bottom-24 right-8 z-[50] flex flex-col gap-4 max-w-sm w-full">
      <AnimatePresence>
        {sessions.map((session) => {
          const isClient = profile?.role === 'client';
          const isExpert = profile?.role === 'expert';
          
          // Client needs to confirm resolution
          if (isClient && session.status === 'completed' && !session.clientResolution) {
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
              >
                <Card className="p-6 border-2 border-blue-100 dark:border-blue-900/30 shadow-2xl bg-white dark:bg-gray-900">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-gray-100">Confirm Resolution</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Session {session.id.slice(-6)} has ended. Was your issue resolved?</p>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          onClick={() => setShowConfirmModal(session.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-[10px] uppercase font-black tracking-widest"
                        >
                          Yes, Resolved
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleResolution(session.id, false)}
                          className="text-red-600 border-red-100 text-[10px] uppercase font-black tracking-widest"
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          }

          // Expert needs to respond if client said no
          if (isExpert && session.status === 'completed' && session.clientResolution === 'not-resolved' && !session.expertResolution) {
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
              >
                <Card className="p-6 border-2 border-red-100 dark:border-red-900/30 shadow-2xl bg-white dark:bg-gray-900">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-gray-100">Resolution Dispute</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">The client marked the issue as NOT resolved. What is your status?</p>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          onClick={() => handleResolution(session.id, true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] uppercase font-black tracking-widest"
                        >
                          It was Resolved
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleResolution(session.id, false)}
                          className="text-gray-600 border-gray-100 text-[10px] uppercase font-black tracking-widest"
                        >
                          Not Resolved
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          }

          // Dispute Status
          if (session.status === 'dispute') {
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
              >
                <Card className="p-6 border-2 border-orange-100 dark:border-orange-900/30 shadow-2xl bg-white dark:bg-gray-900">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center shrink-0">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-gray-100">Under Review</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">
                        This session has been marked as disputed. The Quiklance team will review the recording and resolve within 48 hours.
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        Est. Resolution: 48h
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          }

          return null;
        })}
      </AnimatePresence>

      {/* Confirmation Modal for Client */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
              onClick={() => setShowConfirmModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-900 p-8 shadow-2xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                <Info className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Confirm Resolution</h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Please confirm: Are you satisfied that your issue has been fully resolved? 
                <span className="block mt-2 font-bold text-red-500">Once confirmed, the payment will be released to the Quiklancer and cannot be reversed.</span>
              </p>

              <div className="mt-8 space-y-4">
                <Button
                  onClick={() => handleResolution(showConfirmModal, true)}
                  disabled={isProcessing}
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-blue-100 dark:shadow-blue-900/40"
                >
                  {isProcessing ? 'Processing...' : 'YES, ISSUE RESOLVED'}
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
