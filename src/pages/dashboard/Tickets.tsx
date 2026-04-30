import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search,
  MessageSquare,
  ArrowRight,
  Info
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { useFirebase } from '@/src/contexts/FirebaseContext';
import { Dispute } from '@/src/types';
import { Card } from '@/src/components/ui/Card';

export default function Tickets() {
  const { user, profile } = useFirebase();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;

    const roleField = profile.role === 'client' ? 'clientId' : 'expertId';
    const q = query(
      collection(db, 'disputes'),
      where(roleField, '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dispute));
      // Sort in memory if index not yet ready
      setDisputes(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'disputes');
    });

    return () => unsubscribe();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">Support Tickets</h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">Track resolution status for disputed sessions.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by ID..."
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disputes.map((dispute) => (
            <Card key={dispute.id} className="p-8 border-2 border-transparent hover:border-blue-500 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  <Ticket className="h-6 w-6" />
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  dispute.status === 'open' 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'bg-green-50 text-green-600'
                }`}>
                  {dispute.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket ID</p>
                  <p className="text-sm font-mono font-bold text-blue-600 mt-1">#TKT-{dispute.id.slice(-6)}</p>
                </div>

                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Session</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">Ref: {dispute.sessionId.slice(-12)}</p>
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Created {new Date(dispute.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {dispute.adminResolution && (
                <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-3 w-3 text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Admin Note</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium italic">"{dispute.adminResolution}"</p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between group-hover:text-blue-500 transition-colors">
                <span className="text-xs font-black uppercase tracking-widest">View Details</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Card>
          ))}

          {disputes.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
              <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No active tickets</h3>
              <p className="text-sm text-gray-400 mt-2">Disputed sessions will appear here as tickets for tracking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
