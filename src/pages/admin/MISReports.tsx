import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Video, 
  Clock, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  Download,
  Filter,
  Zap,
  ZapOff,
  Star,
  Smile,
  Meh,
  Frown,
  MessageSquare,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { UserProfile, CATEGORIES, Session } from '@/src/types';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useCurrency } from '@/src/contexts/CurrencyContext';
import * as XLSX from 'xlsx';

export default function MISReports() {
  const { formatPrice } = useCurrency();
  const [experts, setExperts] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch experts
        const expertQ = query(collection(db, 'users'), where('role', '==', 'expert'));
        const expertSnap = await getDocs(expertQ);
        const expertsData = expertSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
        setExperts(expertsData);

        // Fetch all sessions (for reporting we need all, not just completed)
        const sessionQ = query(collection(db, 'sessions'), orderBy('startTime', 'desc'));
        const sessionSnap = await getDocs(sessionQ);
        const sessionsData = sessionSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Session));
        setSessions(sessionsData);
        setFilteredSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching MIS data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...sessions];

    if (dateRange.start) {
      result = result.filter(s => s.startTime && s.startTime >= dateRange.start);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(s => s.startTime && s.startTime <= endDate.toISOString());
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'success') {
        result = result.filter(s => s.status === 'completed' && s.clientResolution === 'resolved');
      } else if (statusFilter === 'not-success') {
        result = result.filter(s => s.status === 'completed' && s.clientResolution === 'not-resolved');
      } else if (statusFilter === 'disputed') {
        result = result.filter(s => s.status === 'dispute' || s.status === 'resolved' || s.status === 'not-resolved-mutual');
      } else {
        result = result.filter(s => s.status === statusFilter);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.id.toLowerCase().includes(q) || 
        s.clientId.toLowerCase().includes(q) || 
        s.expertId.toLowerCase().includes(q)
      );
    }

    setFilteredSessions(result);
  }, [sessions, dateRange, statusFilter, searchQuery]);

  // Excel Export
  const exportToExcel = () => {
    const dataToExport = filteredSessions.map(s => ({
      'Session ID': s.id,
      'Date': new Date(s.startTime || '').toLocaleDateString(),
      'Status': s.status,
      'Resolution': s.clientResolution || 'N/A',
      'Client ID': s.clientId,
      'Expert ID': s.expertId,
      'Duration (Min)': s.durationMinutes || 0,
      'Amount Paid': s.totalPaid || 0,
      'Rating': s.feedback?.rating || 'N/A',
      'Comment': s.feedback?.comment || ''
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sessions Report');
    XLSX.writeFile(wb, `Quiklance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Aggregations (based on filtered data for accurate reporting)
  const totalOnboarded = experts.length;
  const currentSessions = filteredSessions;
  const totalCallTime = currentSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const totalConnects = currentSessions.length;
  const totalSuccessCalls = currentSessions.filter(s => s.status === 'completed' && s.clientResolution === 'resolved').length;
  const avgCallTime = totalConnects > 0 ? Math.round(totalCallTime / totalConnects) : 0;

  // Feedback Analysis (based on filtered data)
  const sessionsWithFeedback = currentSessions.filter(s => s.feedback);
  const avgRating = sessionsWithFeedback.length > 0 
    ? (sessionsWithFeedback.reduce((sum, s) => sum + (s.feedback?.rating || 0), 0) / sessionsWithFeedback.length).toFixed(1)
    : 'N/A';
  
  const satisfactionCounts = {
    satisfied: sessionsWithFeedback.filter(s => s.feedback?.satisfaction === 'satisfied').length,
    neutral: sessionsWithFeedback.filter(s => s.feedback?.satisfaction === 'neutral').length,
    unsatisfied: sessionsWithFeedback.filter(s => s.feedback?.satisfaction === 'unsatisfied').length,
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center transition-colors duration-300">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-12 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">MIS Reports</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">Platform analytics and session data management.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={exportToExcel}
            className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Excel
          </Button>
        </div>
      </header>

      {/* Filters Bar */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Call Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
            >
              <option value="all">All Calls</option>
              <option value="success">Success (Resolved)</option>
              <option value="not-success">Not Resolved</option>
              <option value="disputed">Disputed/Under Review</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Session/User</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-8 border-l-4 border-blue-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Onboarded</p>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100">{totalOnboarded}</h3>
          <p className="mt-2 text-xs font-bold text-gray-400">Total Experts</p>
        </Card>

        <Card className="p-8 border-l-4 border-green-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Avg. Call Time</p>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100">{avgCallTime} min</h3>
          <p className="mt-2 text-xs font-bold text-gray-400">Filtered Average</p>
        </Card>

        <Card className="p-8 border-l-4 border-purple-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Video className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Success Calls</p>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100">{totalSuccessCalls}</h3>
          <p className="mt-2 text-xs font-bold text-green-600 dark:text-green-400">
            {totalConnects > 0 ? Math.round((totalSuccessCalls / totalConnects) * 100) : 0}% Success Rate
          </p>
        </Card>

        <Card className="p-8 border-l-4 border-yellow-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <Zap className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Filtered Connects</p>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100">{totalConnects}</h3>
          <p className="mt-2 text-xs font-bold text-gray-400">In selected range</p>
        </Card>
      </div>

      {/* Session Table (Simplified preview) */}
      <Card className="overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Session Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Session ID</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expert/Client</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Resolution</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSessions.slice(0, 10).map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-8 py-4">
                    <span className="text-sm font-mono font-bold text-blue-600">#{s.id.slice(-8)}</span>
                  </td>
                  <td className="px-8 py-4 text-sm font-medium">{new Date(s.startTime || '').toLocaleDateString()}</td>
                  <td className="px-8 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Expert: {s.expertId.slice(-6)}</span>
                      <span className="text-xs text-gray-400">Client: {s.clientId.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                       {s.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                       {s.status === 'dispute' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                       {s.status === 'cancelled' && <XCircle className="h-4 w-4 text-red-500" />}
                       <span className="text-xs font-bold uppercase">{s.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                      s.clientResolution === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {s.clientResolution || 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm font-black text-right">{formatPrice(s.totalPaid || 0)}</td>
                </tr>
              ))}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-gray-400 font-medium italic">
                    No sessions match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredSessions.length > 10 && (
            <div className="p-4 text-center border-t border-gray-100 dark:border-gray-800 bg-gray-50/30">
              <p className="text-xs text-gray-400 font-medium">Showing top 10 sessions. Export to Excel for full data.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
