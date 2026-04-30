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
  ExternalLink,
  Ticket,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { Dispute, Session, UserProfile } from '@/src/types';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useCurrency } from '@/src/contexts/CurrencyContext';

export default function DisputeManagement() {
  const { formatPrice } = useCurrency();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<(Dispute & { session?: Session, client?: UserProfile, expert?: UserProfile }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<'open' | 'resolved'>('open');
  const [adminResolutionNote, setAdminResolutionNote] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'disputes'), 
      where('status', '==', filter === 'open' ? 'open' : 'resolved-released'), // Simplified filter for demo
      orderBy('createdAt', 'desc')
    );
    
    // Fallback if orderBy fails due to missing index
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDisputes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dispute)));
      setLoading(false);
    }, (error) => {
      // If index is missing, try a simpler query
      if (error.message.includes('index')) {
        const simpleQ = query(collection(db, 'disputes'), where('status', '==', filter === 'open' ? 'open' : 'resolved-released'));
        onSnapshot(simpleQ, (snapshot) => {
          setDisputes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dispute)));
          setLoading(false);
        });
      } else {
        handleFirestoreError(error, OperationType.GET, 'disputes');
      }
    });

    return () => unsubscribe();
  }, [filter]);

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
          adminResolution: adminResolutionNote || 'Payment released to Quiklancer after review.',
          resolvedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        await updateDoc(sessionRef, {
          status: 'resolved',
          adminDecision: 'released',
          updatedAt: serverTimestamp()
        });

        // Update expert wallet
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
          adminResolution: adminResolutionNote || 'Refund issued to Client after review.',
          resolvedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        await updateDoc(sessionRef, {
          status: 'not-resolved-mutual',
          adminDecision: 'refunded',
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
      alert(`Dispute ${selectedDispute.id.slice(-6)} has been ${decision === 'release' ? 'released' : 'refunded'}.`);
    } catch (error) {
      console.error('Error resolving dispute:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">Resolution Center</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">Review disputed sessions and manage manual tickets.</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          <button 
            onClick={() => setFilter('open')}
            className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${
              filter === 'open' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            OPEN TICKETS
          </button>
          <button 
            onClick={() => setFilter('resolved')}
            className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${
              filter === 'resolved' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            RESOLVED
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Ticket List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search Ticket ID..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-4">
            {disputes.map((dispute) => (
              <Card 
                key={dispute.id} 
                className={`group p-6 cursor-pointer transition-all border-2 relative overflow-hidden ${
                  selectedDispute?.id === dispute.id 
                    ? 'border-blue-500 bg-blue-50/20 shadow-xl shadow-blue-100/20' 
                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                }`}
                onClick={() => viewDisputeDetails(dispute)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Ticket className={`h-4 w-4 ${dispute.status === 'open' ? 'text-orange-500' : 'text-green-500'}`} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TICKET #{dispute.id.slice(-6)}</span>
                  </div>
                  {dispute.status === 'open' && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md uppercase">
                      <Clock className="h-3 w-3" />
                      Priority
                    </div>
                  )}
                </div>
                
                <h4 className="text-lg font-black text-gray-900 dark:text-gray-100">Session Review Required</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Session: {dispute.sessionId.slice(-12)}</p>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-900 bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">C</div>
                    <div className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-900 bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-black">E</div>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-transform ${selectedDispute?.id === dispute.id ? 'translate-x-1 text-blue-500' : 'text-gray-300 group-hover:translate-x-1'}`} />
                </div>

                {selectedDispute?.id === dispute.id && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                )}
              </Card>
            ))}
            
            {disputes.length === 0 && !loading && (
              <div className="py-20 text-center space-y-4">
                <Ticket className="h-12 w-12 text-gray-200 mx-auto" />
                <p className="text-gray-400 font-medium italic">No tickets found in this category.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dispute Details & Review */}
        <div className="lg:col-span-8">
          {selectedDispute ? (
            <Card className="p-8 md:p-12 space-y-12">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-lg uppercase tracking-widest">
                      TICKET-ID-{selectedDispute.id.slice(-6)}
                    </span>
                    <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest ${
                      selectedDispute.status === 'open' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {selectedDispute.status}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">Manual Investigation</h2>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedDispute(null)} className="md:self-start">Close Detail</Button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Session Info */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Session Audit Trail
                    </h3>
                    <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-medium">Connect Duration</span>
                        <span className="text-sm font-black">{selectedDispute.session?.durationMinutes} Minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-medium">Escrow Amount</span>
                        <span className="text-lg font-black text-blue-600">{formatPrice(selectedDispute.session?.totalPaid || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-medium">Service Type</span>
                        <span className="text-sm font-bold uppercase tracking-wide">Live Video Consultation</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Counterparties
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Claimant (Client)</p>
                        <p className="text-sm font-black truncate">{selectedDispute.client?.displayName}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-1 truncate">{selectedDispute.clientId}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] font-black text-purple-500 uppercase mb-2">Respondent (Expert)</p>
                        <p className="text-sm font-black truncate">{selectedDispute.expert?.displayName}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-1 truncate">{selectedDispute.expertId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence & Decision */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Video className="h-3 w-3" />
                      Master Recording
                    </h3>
                    <button className="w-full group relative h-40 rounded-3xl bg-gray-900 overflow-hidden flex items-center justify-center transition-all hover:ring-4 ring-blue-500/20">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80')] bg-cover opacity-30 group-hover:scale-105 transition-transform" />
                      <div className="relative flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-gray-900 shadow-xl">
                          <ExternalLink className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-black text-white uppercase tracking-widest">Play Recording</span>
                      </div>
                    </button>
                    <p className="text-[10px] text-gray-400 font-medium italic text-center uppercase tracking-wider">Storage ID: rec_cloud_v2_{selectedDispute.id.slice(-8)}</p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-100 dark:border-orange-900/20 space-y-6">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-6 w-6 text-orange-600" />
                      <h4 className="text-lg font-black text-orange-950 dark:text-orange-100 italic">Final Verdict</h4>
                    </div>
                    
                    {selectedDispute.status === 'open' ? (
                      <div className="space-y-4">
                        <p className="text-sm text-orange-700 dark:text-orange-300 font-medium leading-relaxed">
                          Listen to the consultation. Did the expert fulfill the brief? If resolved, release funds. If not, issue refund.
                        </p>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Internal Resolution Remark</label>
                          <textarea 
                            value={adminResolutionNote}
                            onChange={(e) => setAdminResolutionNote(e.target.value)}
                            placeholder="Add a reason for your decision..."
                            className="w-full p-4 rounded-2xl border border-orange-100 bg-white/50 dark:bg-gray-950 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                        </div>

                        <div className="pt-4 grid grid-cols-1 gap-3">
                          <Button 
                            onClick={() => resolveDispute('release')}
                            disabled={isProcessing}
                            className="h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest"
                          >
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Release Payment
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => resolveDispute('refund')}
                            disabled={isProcessing}
                            className="h-14 rounded-2xl text-red-600 border-2 border-red-100 hover:bg-red-50 bg-white font-black uppercase tracking-widest"
                          >
                            <XCircle className="h-5 w-5 mr-2" />
                            Issue Full Refund
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-black text-green-900 dark:text-green-100">Decision Executed</p>
                          <p className="text-xs text-green-700 dark:text-green-400 font-medium mt-1 uppercase tracking-wide">
                            {selectedDispute.status === 'resolved-released' ? 'Funds Released' : 'Client Refunded'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[4rem] bg-gray-50/30">
              <div className="relative mb-8">
                <Ticket className="h-24 w-24 text-gray-200 dark:text-gray-800" />
                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                  <Search className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-400 dark:text-gray-600 italic tracking-tight">Select a ticket to audit</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-3 max-w-xs mx-auto font-medium leading-relaxed">
                Choose a priority dispute from the left panel to begin manual investigation and final resolution.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
