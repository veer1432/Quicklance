import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Filter, 
  Search,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, getDocs, Timestamp, limit } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { FeedbackResponse } from '@/src/types';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function FeedbackAnalysis() {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [search, setSearch] = useState("");

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date instanceof Timestamp) return date.toDate().toLocaleString();
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'feedbackResponses'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        const snap = await getDocs(q);
        setFeedbacks(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as FeedbackResponse)));
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const averages = feedbacks.reduce((acc, fb) => {
    acc.likelihoodToTry += (fb.likelihoodToTry || 0);
    return acc;
  }, { likelihoodToTry: 0 });

  const total = feedbacks.length || 1;
  const stats = [
    { label: 'Avg Likelihood', value: (averages.likelihoodToTry / total).toFixed(1), icon: Star, color: 'yellow' },
    { label: 'Responses', value: feedbacks.length, icon: MessageSquare, color: 'blue' },
    { label: 'Will Pay', value: feedbacks.filter(f => f.willingnessToPay === 'Yes').length, icon: CheckCircle2, color: 'green' },
    { label: 'Want Access', value: feedbacks.filter(f => f.wantEarlyAccess === 'Yes').length, icon: Gift, color: 'purple' },
  ];

  const filteredFeedbacks = feedbacks.filter(fb => {
    const searchMatch = (fb.recentIssueStory || "").toLowerCase().includes(search.toLowerCase()) ||
                        (fb.name || "").toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return searchMatch;
    if (filter === 'positive') return fb.likelihoodToTry >= 4 && searchMatch;
    if (filter === 'negative') return fb.likelihoodToTry <= 2 && searchMatch;
    if (filter === 'neutral') return fb.likelihoodToTry === 3 && searchMatch;
    return searchMatch;
  });

  const handleExportCSV = () => {
    if (feedbacks.length === 0) return;

    const headers = [
      'Name',
      'Email',
      'WhatsApp',
      'Persona',
      'Likelihood (1-5)',
      'Willing to Pay',
      'Price Point',
      'Want Early Access',
      'Recent Struggle',
      'Tech Stack',
      'Current Moves',
      'Date'
    ];

    const rows = feedbacks.map(fb => [
      `"${fb.name || 'Anonymous'}"`,
      `"${fb.email || ''}"`,
      `"${fb.whatsapp || ''}"`,
      `"${fb.userPersona || ''}"`,
      fb.likelihoodToTry || 0,
      `"${fb.willingnessToPay || ''}"`,
      `"${fb.pricePoint || ''}"`,
      `"${fb.wantEarlyAccess || ''}"`,
      `"${(fb.recentIssueStory || '').replace(/"/g, '""')}"`,
      `"${(fb.techStack || []).join(', ')}"`,
      `"${(fb.currentMove || []).join(', ')}"`,
      `"${formatDate(fb.createdAt)}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Quicklance_Feedback_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Stats Header */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-8">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">{stat.value}</h3>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Card className="p-0 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Market Feedback</h2>
            <div className="flex gap-2">
              {(['all', 'positive', 'neutral', 'negative'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                    filter === mode 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search feedback..."
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm focus:outline-none focus:border-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredFeedbacks.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">No feedback found matching the criteria.</p>
            </div>
          ) : (
            filteredFeedbacks.map((fb) => (
              <div key={fb.id} className="p-8 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-lg">
                      {fb.name?.charAt(0) || <FileText className="h-6 w-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{fb.name || 'Anonymous User'}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(fb.createdAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                            {fb.userPersona}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Willing to pay</p>
                      <p className={`text-sm font-black ${fb.willingnessToPay === 'Yes' ? 'text-green-600' : 'text-blue-600'}`}>
                        {fb.willingnessToPay}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Likelihood</p>
                      <p className="text-sm font-black text-blue-600">
                        {fb.likelihoodToTry}/5
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pl-16 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Struggle</p>
                    <p className="text-gray-600 dark:text-gray-400 text-lg italic leading-relaxed">
                      "{fb.recentIssueStory || 'No story provided.'}"
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tech Stack</p>
                      <div className="flex flex-wrap gap-1">
                        {fb.techStack?.map(s => <span key={s} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold">{s}</span>)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Moves</p>
                      <div className="flex flex-wrap gap-1">
                        {fb.currentMove?.map(s => <span key={s} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold">{s}</span>)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{fb.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{fb.whatsapp || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price Point</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{fb.pricePoint || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
