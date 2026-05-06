import React from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  CreditCard, 
  History,
  TrendingUp,
  Banknote
} from 'lucide-react';
import { useFirebase } from '@/src/contexts/FirebaseContext';
import { useCurrency } from '@/src/contexts/CurrencyContext';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/firebase';

export default function Wallet() {
  const { profile, user, processTransaction } = useFirebase();
  const { formatPrice } = useCurrency();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    
    const txRef = collection(db, 'users', user.uid, 'transactions');
    const q = query(txRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate().toLocaleString() || 'Just now'
      }));
      setTransactions(txData);
      setLoadingTransactions(false);
    });

    return () => unsubscribe();
  }, [user]);

  const isExpert = profile?.role === 'expert';

  const handleAddFunds = async () => {
    const amount = prompt("Enter amount to add (₹):", "500");
    if (amount && !isNaN(Number(amount))) {
      try {
        await processTransaction(Number(amount), 'credit', 'Added funds to wallet');
        alert(`Successfully added ${formatPrice(Number(amount))} to your wallet.`);
      } catch (error) {
        alert("Failed to add funds.");
      }
    }
  };

  return (
    <div className="space-y-12 transition-colors duration-300">
      <header>
        <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100">
          {isExpert ? 'Wallet & Earnings' : 'My Wallet'}
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">
          {isExpert 
            ? 'Manage your funds and track your financial growth.' 
            : 'Manage your balance and track your session payments.'}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Balance Card */}
        <Card className={`${isExpert ? 'lg:col-span-2' : 'lg:col-span-3'} p-12 bg-blue-600 dark:bg-blue-900 text-white relative overflow-hidden`}>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 dark:bg-blue-800 text-white shadow-lg">
                <WalletIcon className="h-6 w-6" />
              </div>
              <span className="text-lg font-bold text-blue-100 dark:text-blue-200">Available Balance</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div>
                <h2 className="text-6xl font-black">{formatPrice(profile?.walletBalance || 0)}</h2>
                <p className="mt-4 text-blue-100 dark:text-blue-200 font-medium flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-200 dark:text-blue-400" />
                  Real-time wallet balance
                </p>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleAddFunds}
                  variant="secondary" 
                  className="h-14 px-8 text-lg rounded-2xl bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-100 dark:text-blue-900"
                >
                  <ArrowUpRight className="mr-2 h-5 w-5" />
                  Add Funds
                </Button>
                {isExpert && (
                  <Button variant="outline" className="h-14 px-8 text-lg rounded-2xl border-white text-white hover:bg-blue-700 dark:hover:bg-blue-800">
                    <Download className="mr-2 h-5 w-5" />
                    Withdraw
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500 dark:bg-blue-800 opacity-20" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-700 dark:bg-blue-950 opacity-20" />
        </Card>

        {/* Total Earnings Card (Expert Only) */}
        {isExpert && (
          <Card className="p-10 flex flex-col justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-6">
                <Banknote className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Lifetime Earnings</p>
              <h3 className="mt-2 text-4xl font-black text-gray-900 dark:text-gray-100">{formatPrice(profile?.totalEarnings || 0)}</h3>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-500 dark:text-gray-400">Pending Clearance</span>
                <span className="font-black text-gray-900 dark:text-gray-100">{formatPrice(0)}</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Transaction History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <History className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Transaction History
          </h2>
          <Button variant="outline" size="sm">Download CSV</Button>
        </div>

        <div className="space-y-4">
          {loadingTransactions ? (
            <div className="h-20 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          ) : transactions.length > 0 ? transactions.map((tx) => (
            <Card key={tx.id} className="p-6" hover={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    tx.type === 'credit' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  }`}>
                    {tx.type === 'credit' ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{tx.description}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tx.date}</p>
                  </div>
                </div>
                <div className={`text-xl font-black ${
                  tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {tx.type === 'credit' ? '+' : '-'}{formatPrice(tx.amount)}
                </div>
              </div>
            </Card>
          )) : (
            <Card className="p-12 text-center bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem]">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No history to be shown</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">Your financial transactions will appear here.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
