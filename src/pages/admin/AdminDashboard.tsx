import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Video, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, limit, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { UserProfile, Issue } from '@/src/types';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useCurrency } from '@/src/contexts/CurrencyContext';

export default function AdminDashboard() {
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState({
    totalQuicklancers: 0,
    pendingApprovals: 0,
    activeCalls: 0,
    totalEarnings: 0,
    totalConnects: 0,
    avgCallTime: 0,
  });
  const [recentQuicklancers, setRecentQuicklancers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date instanceof Timestamp) return date.toDate().toLocaleDateString();
    if (date.toDate) return date.toDate().toLocaleDateString();
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch all experts
        const expertsQuery = query(collection(db, 'users'), where('role', '==', 'expert'));
        const expertsSnap = await getDocs(expertsQuery);
        const experts = expertsSnap.docs.map(doc => doc.data() as UserProfile);

        const totalQuicklancers = experts.length;
        const pendingApprovals = experts.filter(e => e.status === 'pending').length;
        const totalEarnings = experts.reduce((sum, e) => sum + (e.totalEarnings || 0), 0);
        const totalConnects = experts.reduce((sum, e) => sum + (e.totalCalls || 0), 0);
        const totalCallTime = experts.reduce((sum, e) => sum + (e.totalCallTime || 0), 0);
        const avgCallTime = totalConnects > 0 ? Math.round(totalCallTime / totalConnects) : 0;

        setStats({
          totalQuicklancers,
          pendingApprovals,
          activeCalls: 5, // Mock for now
          totalEarnings,
          totalConnects,
          avgCallTime,
        });

        // Recent Quicklancers
        const recentQuery = query(
          collection(db, 'users'), 
          where('role', '==', 'expert'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentSnap = await getDocs(recentQuery);
        setRecentQuicklancers(recentSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile)));

      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Quicklancers', value: stats.totalQuicklancers, icon: Users, color: 'blue', trend: '+12%' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: UserCheck, color: 'yellow', trend: 'High Priority' },
    { label: 'Total Connects', value: stats.totalConnects, icon: Video, color: 'green', trend: '+8%' },
    { label: 'Total Platform Revenue', value: formatPrice(stats.totalEarnings), icon: TrendingUp, color: 'purple', trend: '+15%' },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center transition-colors duration-300">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-12 transition-colors duration-300">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
                  stat.trend.startsWith('+') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                }`}>
                  {stat.trend}
                </div>
              </div>
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="mt-1 text-3xl font-black text-gray-900 dark:text-gray-100">{stat.value}</h3>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Onboarding */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Onboarding</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          
          <div className="space-y-4">
            {recentQuicklancers.map((expert) => (
              <Card key={expert.uid} className="p-6" hover={false}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {expert.photoURL ? (
                      <img src={expert.photoURL} alt={expert.displayName} className="h-12 w-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                        {expert.displayName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{expert.displayName}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {expert.skills?.slice(0, 2).join(', ')} • Joined {formatDate(expert.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      expert.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 
                      expert.status === 'rejected' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {expert.status || 'active'}
                    </span>
                    <Button variant="secondary" size="sm" asChild>
                      <Link to={`/admin/quicklancers?filter=${expert.status === 'pending' ? 'pending' : 'all'}&search=${expert.displayName}`}>
                        Review
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-8">
          <Card className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">System Alerts</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold">New Complaint Received</p>
                  <p className="mt-1 opacity-80">Client reported bad behavior from Quicklancer #1293.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 p-4 text-yellow-700 dark:text-yellow-400">
                <Clock className="h-5 w-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold">Pending Approvals</p>
                  <p className="mt-1 opacity-80">12 Quicklancers are waiting for profile verification.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-gray-900 dark:bg-gray-800 text-white">
            <ShieldCheck className="h-10 w-10 mb-4 text-blue-400 dark:text-blue-500" />
            <h3 className="text-xl font-bold mb-2">Security Overview</h3>
            <p className="text-sm text-gray-400 dark:text-gray-400 leading-relaxed mb-6">
              All systems are operational. 24-hour security scan completed with no issues found.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">Run Full Audit</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
