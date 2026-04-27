import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Ban, 
  MoreVertical,
  Star,
  Video,
  Clock,
  ExternalLink
} from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { UserProfile, UserStatus } from '@/src/types';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useCurrency } from '@/src/contexts/CurrencyContext';

export default function QuiklancerManagement() {
  const { formatPrice } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const [experts, setExperts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || "");
  const [filter, setFilter] = useState<UserStatus | 'all'>((searchParams.get('filter') as any) || 'all');

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date instanceof Timestamp) return date.toDate().toLocaleDateString();
    if (date.toDate) return date.toDate().toLocaleDateString();
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  useEffect(() => {
    const path = "users";
    const q = query(collection(db, path), where("role", "==", "expert"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExperts(snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update URL when search or filter changes
  useEffect(() => {
    const params: any = {};
    if (search) params.search = search;
    if (filter !== 'all') params.filter = filter;
    setSearchParams(params, { replace: true });
  }, [search, filter]);

  const updateStatus = async (uid: string, status: UserStatus, remarks?: string) => {
    try {
      const updateData: any = { status };
      if (remarks) updateData.rejectionRemarks = remarks;
      else if (status === 'active') updateData.rejectionRemarks = ""; // Clear remarks on approval

      await updateDoc(doc(db, "users", uid), updateData);
      alert(`Quiklancer status updated to ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDecline = (uid: string) => {
    const remarks = prompt("Please enter the reason for rejection (remarks):");
    if (remarks !== null) {
      updateStatus(uid, 'rejected', remarks);
    }
  };

  const filteredExperts = experts.filter(e => {
    const matchesSearch = e.displayName?.toLowerCase().includes(search.toLowerCase()) || 
                          e.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || e.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 transition-colors duration-300">
      {/* Filters & Search */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          {['all', 'pending', 'active', 'rejected', 'blocked', 'suspended'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                filter === s 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40" 
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-800"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input 
            type="text" 
            placeholder="Search Quiklancers..." 
            className="h-12 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pl-12 pr-4 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none transition-all sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table-like Grid */}
      <div className="space-y-4">
        {filteredExperts.map((expert) => (
          <Card key={expert.uid} className="p-6" hover={false}>
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-4 min-w-[250px]">
                {expert.photoURL ? (
                  <img src={expert.photoURL} alt={expert.displayName} className="h-14 w-14 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                    {expert.displayName?.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{expert.displayName}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{expert.email}</p>
                  {expert.phoneNumber && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1">{expert.phoneNumber}</p>
                  )}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest font-bold">Joined {formatDate(expert.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 flex-grow md:grid-cols-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    expert.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    expert.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    expert.status === 'rejected' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                    expert.status === 'blocked' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                  }`}>
                    {expert.status || 'active'}
                  </span>
                  {expert.rejectionRemarks && expert.status === 'rejected' && (
                    <p className="mt-1 text-[10px] text-red-500 font-medium truncate max-w-[150px]" title={expert.rejectionRemarks}>
                      Reason: {expert.rejectionRemarks}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{expert.rating || 5.0}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Earnings</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatPrice(expert.totalEarnings || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Connects</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{expert.totalCalls || 0} calls</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {expert.status === 'pending' || expert.status === 'rejected' ? (
                  <>
                    {expert.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDecline(expert.uid)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                      onClick={() => updateStatus(expert.uid, 'active')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                ) : (
                  <>
                    {expert.status === 'blocked' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateStatus(expert.uid, 'active')}
                      >
                        Unblock
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => updateStatus(expert.uid, 'blocked')}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Block
                      </Button>
                    )}
                    <Button variant="secondary" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredExperts.length === 0 && (
          <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 font-medium italic">No Quiklancers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
