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
  MessageSquare
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { UserProfile, CATEGORIES, Session } from '@/src/types';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useCurrency } from '@/src/contexts/CurrencyContext';

export default function MISReports() {
  const { formatPrice } = useCurrency();
  const [experts, setExperts] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch experts
        const expertQ = query(collection(db, 'users'), where('role', '==', 'expert'));
        const expertSnap = await getDocs(expertQ);
        setExperts(expertSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile)));

        // Fetch sessions with feedback
        const sessionQ = query(collection(db, 'sessions'), where('status', '==', 'completed'));
        const sessionSnap = await getDocs(sessionQ);
        setSessions(sessionSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Session)));
      } catch (error) {
        console.error('Error fetching MIS data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aggregations
  const totalOnboarded = experts.length;
  const totalCallTime = experts.reduce((sum, e) => sum + (e.totalCallTime || 0), 0);
  const totalConnects = experts.reduce((sum, e) => sum + (e.totalCalls || 0), 0);
  const totalSuccessCalls = experts.reduce((sum, e) => sum + (e.successfulCalls || 0), 0);
  const avgCallTime = totalConnects > 0 ? Math.round(totalCallTime / totalConnects) : 0;

  // Feedback Analysis
  const sessionsWithFeedback = sessions.filter(s => s.feedback);
  const avgRating = sessionsWithFeedback.length > 0 
    ? (sessionsWithFeedback.reduce((sum, s) => sum + (s.feedback?.rating || 0), 0) / sessionsWithFeedback.length).toFixed(1)
    : 'N/A';
  
  const satisfactionCounts = {
    satisfied: sessionsWithFeedback.filter(s => s.feedback?.satisfaction === 'satisfied').length,
    neutral: sessionsWithFeedback.filter(s => s.feedback?.satisfaction === 'neutral').length,
    unsatisfied: sessionsWithFeedback.filter(s => s.feedback?.satisfaction === 'unsatisfied').length,
  };

  // Earnings Analysis
  const sortedByEarnings = [...experts].sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0));
  const highestEarners = sortedByEarnings.slice(0, 5);
  const lowestEarners = sortedByEarnings.filter(e => (e.totalEarnings || 0) > 0).slice(-5).reverse();
  const noEarners = experts.filter(e => (e.totalEarnings || 0) === 0);

  // Connects Analysis
  const sortedByConnects = [...experts].sort((a, b) => (b.totalCalls || 0) - (a.totalCalls || 0));
  const highestConnects = sortedByConnects.slice(0, 5);

  // Skill Demand Analysis (Mocked based on expert skills for now)
  const skillCounts: Record<string, number> = {};
  experts.forEach(e => {
    e.skills?.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center transition-colors duration-300">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-12 transition-colors duration-300">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-12 px-6 rounded-2xl">
            <Filter className="h-4 w-4 mr-2" />
            Filter Date Range
          </Button>
          <Button variant="outline" className="h-12 px-6 rounded-2xl">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Onboarded</p>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100">{totalOnboarded}</h3>
          <p className="mt-2 text-xs font-bold text-green-600 dark:text-green-400">+5 this week</p>
        </Card>

        <Card className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Avg. Call Time</p>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100">{avgCallTime} min</h3>
          <p className="mt-2 text-xs font-bold text-gray-400 dark:text-gray-500">Total: {totalCallTime} min</p>
        </Card>

        <Card className="p-8">
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

        <Card className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <Zap className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Connects</p>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100">{totalConnects}</h3>
          <p className="mt-2 text-xs font-bold text-gray-400 dark:text-gray-500">Across all categories</p>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Call Satisfaction Analysis */}
        <Card className="p-8 space-y-8 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Smile className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Call Satisfaction & Feedback
            </h2>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">Avg Rating: {avgRating}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Satisfaction Breakdown */}
            <div className="space-y-6">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Satisfaction Breakdown</p>
              <div className="space-y-4">
                {[
                  { id: 'satisfied', label: 'Satisfied', icon: Smile, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                  { id: 'unsatisfied', label: 'Unsatisfied', icon: Frown, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' }
                ].map((item) => (
                  <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl ${item.bg}`}>
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.label}</span>
                    </div>
                    <span className={`text-lg font-black ${item.color}`}>{satisfactionCounts[item.id as keyof typeof satisfactionCounts]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Feedback Comments */}
            <div className="md:col-span-2 space-y-6">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Recent Feedback Comments</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessionsWithFeedback.slice(0, 4).map((s) => (
                  <div key={s.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < (s.feedback?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(s.feedback?.createdAt || '').toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 italic">"{s.feedback?.comment || 'No comment provided'}"</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <MessageSquare className="h-3 w-3 text-blue-500" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Session: {s.id.slice(-6)}</span>
                    </div>
                  </div>
                ))}
                {sessionsWithFeedback.length === 0 && (
                  <div className="col-span-2 py-12 text-center text-gray-400 font-medium italic">
                    No feedback received yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Earnings Analysis */}
        <Card className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Earnings Analysis
            </h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Top 5 Earners</p>
              <div className="space-y-3">
                {highestEarners.map((e, idx) => (
                  <div key={e.uid} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-300 dark:text-gray-700">#{idx + 1}</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{e.displayName}</p>
                    </div>
                    <p className="text-sm font-black text-blue-600 dark:text-blue-400">{formatPrice(e.totalEarnings || 0)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                <p className="text-[10px] font-bold text-red-400 dark:text-red-500 uppercase tracking-widest mb-1">No Earners</p>
                <p className="text-2xl font-black text-red-600 dark:text-red-400">{noEarners.length}</p>
                <p className="text-[10px] text-red-400 dark:text-red-500 mt-1">Quiklancers with 0 revenue</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Lowest Earners</p>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{lowestEarners.length}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Active but low revenue</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Connects & Skill Demand */}
        <Card className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Demand & Connects
            </h2>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Highest Number of Connects</p>
              <div className="space-y-3">
                {highestConnects.map((e, idx) => (
                  <div key={e.uid} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-300 dark:text-gray-700">#{idx + 1}</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{e.displayName}</p>
                    </div>
                    <p className="text-sm font-black text-green-600 dark:text-green-400">{e.totalCalls || 0} calls</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">On-Demand Skills (by Supply)</p>
              <div className="flex flex-wrap gap-3">
                {topSkills.map(([skill, count]) => (
                  <div key={skill} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{skill}</span>
                    <span className="text-xs font-black bg-blue-600 dark:bg-blue-700 text-white px-2 py-0.5 rounded-full">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
