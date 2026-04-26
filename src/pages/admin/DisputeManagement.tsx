import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Video, 
  User, 
  MessageSquare,
  ArrowRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { Dispute, Session, UserProfile } from '@/src/types';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useCurrency } from '@/src/contexts/CurrencyContext';
import { IS_TEST_CREDITS_MODE } from '@/src/config';

export default function DisputeManagement() {
  const { formatPrice } = useCurrency();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<(Dispute & { session?: Session, client?: UserProfile, expert?: UserProfile }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'disputes'), where('status', '==', 'open'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDisputes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dispute)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'disputes');
    });

    return () => unsubscribe();
  }, []);

  const viewDisputeDetails = async (dispute: Dispute) => {
    setLoading(true);
    try {
      const sessionDoc = await getDoc(doc(db, 'sessions', dispute.sessionId));
      const clientDoc = await getDoc(doc(db, 'users', dispute.clientId));
      const expertDoc = await getDoc(doc(db, 'users', dispute.expertId));

      setSelectedDispute({
        ...dispute,
        session: sessionDoc.exists() ? { ...sessionDoc.data(), id: sessionDoc.id } as Session : undefined,
        client: clientDoc.exists() ? { ...clientDoc.data(), uid: clientDoc.id } as UserProfile : undefined,
        expert: expertDoc.exists() ? { ...expertDoc.data(), uid: expertDoc.id } as UserProfile : undefined,
      });
    } catch (error) {
      console.error('Error fetching dispute details:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async (decision: 'release' | 'refund') => {
    if (!selectedDispute || !selectedDispute.session) return;
    setIsProcessing(true);
    try {
      const disputeRef = doc(db, 'disputes', selectedDispute.id);
      const sessionRef = doc(db, 'sessions', selectedDispute.sessionId);
      
      if (decision === 'release') {
        // Release to Expert
        await updateDoc(disputeRef, {
          status: 'resolved-released',
          updatedAt: serverTimestamp()
        });
        await updateDoc(sessionRef, {
          status: 'resolved',
          updatedAt: serverTimestamp()
        });

        // Update expert wallet (simplified)
        const commission = selectedDispute.session.totalPaid * 0.2;
        const expertEarnings = selectedDispute.session.totalPaid - commission;
        const expertRef = doc(db, 'users', selectedDispute.expertId);
        const expertSnap = await getDoc(expertRef);
        if (expertSnap.exists()) {
          const expertData = expertSnap.data();
          await updateDoc(expertRef, {
            totalEarnings: (expertData.totalEarnings || 0) + expertEarnings,
            walletBalance: (expertData.walletBalance || 0) + expertEarnings
          });
        }
      } else {
        // Refund to Client
        await updateDoc(disputeRef, {
          status: 'resolved-refunded',
          updatedAt: serverTimestamp()
        });
        await updateDoc(sessionRef, {
          status: 'not-resolved-mutual',
          updatedAt: serverTimestamp()
        });

        // Update client wallet
        const clientRef = doc(db, 'users', selectedDispute.clientId);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) {
          const clientData = clientSnap.data();
          await updateDoc(clientRef, {
            walletBalance: (clientData.walletBalance || 0) + selectedDispute.session.totalPaid
          });
        }
      }

      setSelectedDispute(null);
    } catch (error) {
      console.error('Error resolving dispute:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading && disputes.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-12 transition-colors duration-300">
      <header>
        <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">Dispute Management</h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">Review and resolve session disputes within 48 hours.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Dispute List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            Open Disputes ({disputes.length})
          </h2>
          <div className="space-y-3">
            {disputes.map((dispute) => (
              <Card 
                key={dispute.id} 
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedDispute?.id === dispute.id ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 'border-transparent'
                }`}
                onClick={() => viewDisputeDetails(dispute)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{dispute.id.slice(-6)}</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 uppercase">
                    <Clock className="h-3 w-3" />
                    48h left
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Session Dispute</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Session ID: {dispute.sessionId.slice(-8)}</p>
              </Card>
            ))}
            {disputes.length === 0 && (
              <div className="py-12 text-center text-gray-400 font-medium italic">
                No open disputes found.
              </div>
            )}
          </div>
        </div>

        {/* Dispute Details & Review */}
        <div className="lg:col-span-2">
          {selectedDispute ? (
            <Card className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Review Dispute</h2>
                <Button variant="outline" size="sm" onClick={() => setSelectedDispute(null)}>Close</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Session Info */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Session Details</p>
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Duration</span>
                        <span className="text-sm font-bold">{selectedDispute.session?.durationMinutes} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Amount Paid</span>
                        <span className="text-sm font-black text-blue-600">{formatPrice(selectedDispute.session?.totalPaid || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Date</span>
                        <span className="text-sm font-bold">{new Date(selectedDispute.session?.startTime || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Participants</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Client</p>
                          <p className="text-sm font-bold">{selectedDispute.client?.displayName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Expert</p>
                          <p className="text-sm font-bold">{selectedDispute.expert?.displayName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence & Actions */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Evidence</p>
                    <Button variant="outline" className="w-full h-16 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                      <Video className="h-6 w-6 mr-3 text-blue-600" />
                      View Session Recording
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  <div className="p-6 rounded-3xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Info className="h-5 w-5 text-orange-600" />
                      <h4 className="font-bold text-orange-900 dark:text-orange-100">Admin Decision</h4>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-6">
                      Evaluate the recording. If the expert provided a satisfactory solution, release the {IS_TEST_CREDITS_MODE ? 'test credits' : 'payment'}. Otherwise, refund the client.
                    </p>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={() => resolveDispute('release')}
                        disabled={isProcessing}
                        className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Release to Expert
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => resolveDispute('refund')}
                        disabled={isProcessing}
                        className="w-full h-12 rounded-xl text-red-600 border-red-200 hover:bg-red-50 font-bold"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Refund Client
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
              <div className="h-20 w-20 rounded-3xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-300 dark:text-gray-700 mb-6">
                <MessageSquare className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-400">Select a dispute to review</h3>
              <p className="text-sm text-gray-400 mt-2">All open disputes will appear here for your evaluation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
