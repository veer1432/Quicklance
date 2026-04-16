import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  ExternalLink,
  Ban,
  CheckCircle2
} from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { UserProfile } from '@/src/types';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function ClientManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || "");

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date instanceof Timestamp) return date.toDate().toLocaleDateString();
    if (date.toDate) return date.toDate().toLocaleDateString();
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  useEffect(() => {
    const path = "users";
    const q = query(collection(db, path), where("role", "==", "client"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params: any = {};
    if (search) params.search = search;
    setSearchParams(params, { replace: true });
  }, [search]);

  const toggleBlock = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    try {
      await updateDoc(doc(db, "users", uid), { status: newStatus });
      alert(`Client ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.displayName?.toLowerCase().includes(search.toLowerCase()) || 
                          c.email?.toLowerCase().includes(search.toLowerCase()) ||
                          c.phoneNumber?.includes(search);
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">Client Directory</h3>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            className="h-12 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pl-12 pr-4 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none transition-all sm:w-80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-4">
        {filteredClients.map((client) => (
          <Card key={client.uid} className="p-6" hover={false}>
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-4 min-w-[250px]">
                {client.photoURL ? (
                  <img src={client.photoURL} alt={client.displayName} className="h-14 w-14 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                    {client.displayName?.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{client.displayName}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 flex-grow md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Contact Number</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    {client.phoneNumber || <span className="text-gray-400 dark:text-gray-600 italic font-normal">Not provided</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Joined On</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    {formatDate(client.createdAt)}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</p>
                  <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    client.status === 'blocked' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}>
                    {client.status || 'active'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={client.status === 'blocked' ? 'text-green-600' : 'text-red-600'}
                  onClick={() => toggleBlock(client.uid, client.status || 'active')}
                >
                  {client.status === 'blocked' ? (
                    <><CheckCircle2 className="h-4 w-4 mr-2" /> Unblock</>
                  ) : (
                    <><Ban className="h-4 w-4 mr-2" /> Block</>
                  )}
                </Button>
                <Button variant="secondary" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredClients.length === 0 && !loading && (
          <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 font-medium italic">No clients found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
