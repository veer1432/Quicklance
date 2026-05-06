import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Video,
  MessageSquare,
  Star,
  UserCircle,
  Calendar,
  Wallet,
  Zap,
  ZapOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useFirebase } from '@/src/contexts/FirebaseContext';
import { useCurrency } from '@/src/contexts/CurrencyContext';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import ChatList from '@/src/components/ChatList';
import ChatWindow from '@/src/components/ChatWindow';
import { AnimatePresence } from 'motion/react';

export default function DashboardHome() {
  const { profile, activeRole, updateProfile } = useFirebase();
  const { formatPrice } = useCurrency();
  const [selectedChat, setSelectedChat] = React.useState<{ roomId: string, expertId: string, expertName: string } | null>(null);

  const toggleAvailability = async () => {
    await updateProfile({ isAvailable: !profile?.isAvailable });
  };

  const isExpert = activeRole === 'expert';
  const isAdmin = activeRole === 'admin';

  const stats = isExpert ? [
    { label: 'Total Earnings', value: formatPrice(profile?.totalEarnings || 0), icon: DollarSign, trend: '0.0%', color: 'blue' },
    { label: 'Completed Sessions', value: profile?.totalCalls || '0', icon: Video, trend: '0.0%', color: 'green' },
    { label: 'Avg. Rating', value: profile?.rating || '0.0', icon: Star, trend: '0.0%', color: 'yellow' },
    { label: 'Active Requests', value: '0', icon: MessageSquare, trend: '0.0%', color: 'purple' },
  ] : [
    { label: 'Wallet Balance', value: formatPrice(profile?.walletBalance || 0), icon: Wallet, trend: '0.0%', color: 'blue' },
    { label: 'Issues Posted', value: '0', icon: MessageSquare, trend: '0.0%', color: 'green' },
    { label: 'Sessions Attended', value: '0', icon: Video, trend: '0.0%', color: 'purple' },
    { label: 'Review Score', value: '0.0', icon: Star, trend: '0.0%', color: 'yellow' },
  ];

  return (
    <div className="space-y-12 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100">
            Welcome back, {(profile?.displayName || (isExpert ? "Expert" : "Client")).split(' ')[0]}! 👋
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">
            {isExpert 
              ? "Here's what's happening with your Quiklance profile today."
              : "Manage your issues and get help from experts in real-time."}
          </p>
        </div>
        
        {isExpert && (
          <Card className={`p-4 flex items-center gap-6 border-2 transition-all ${
            profile?.isAvailable !== false 
              ? 'border-green-100 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10' 
              : 'border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                profile?.isAvailable !== false ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
              }`}>
                {profile?.isAvailable !== false ? <Zap className="h-5 w-5 fill-green-600 dark:fill-green-400" /> : <ZapOff className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</p>
                <p className={`text-sm font-black ${profile?.isAvailable !== false ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {profile?.isAvailable !== false ? 'Available Now' : 'Offline'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleAvailability}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                profile?.isAvailable !== false ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out ${
                  profile?.isAvailable !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </Card>
        )}
      </header>

      {isExpert && profile?.status === 'pending' && (
        <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-900/40">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100">Profile Under Review</h3>
              <p className="mt-1 text-yellow-700 dark:text-yellow-300 font-medium leading-relaxed">
                Your profile is currently being reviewed by our team. You'll be notified once you're approved and visible on the client portal.
              </p>
            </div>
          </div>
        </Card>
      )}

      {profile?.status === 'rejected' && (
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900/40">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <ZapOff className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Profile Rejected</h3>
              <p className="mt-1 text-red-700 dark:text-red-300 font-medium leading-relaxed">
                Your application was rejected. Please check the remarks in your profile settings and resubmit.
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/dashboard/profile">View Remarks & Edit</Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {profile?.status === 'blocked' && (
        <Card className="p-6 bg-gray-900 text-white border-2 border-gray-800">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-red-500 shrink-0">
              <ZapOff className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Profile Blocked</h3>
              <p className="mt-1 text-gray-400 font-medium leading-relaxed">
                Your account has been blocked by the administrator. Please contact support for more information.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
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
                  stat.trend.startsWith('+') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  {stat.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
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
        {/* Recent Requests / Issues */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isExpert ? 'Recent Help Requests' : 'My Recent Issues'}
              </h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            
            <div className="space-y-4">
              <Card className="p-12 text-center bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem]">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No requests yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">New help requests from clients will appear here.</p>
              </Card>
            </div>
          </div>

          {/* Messages Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                Recent Messages
              </h2>
            </div>
            <ChatList onSelectRoom={(roomId, expertId, expertName) => setSelectedChat({ roomId, expertId, expertName })} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            {isExpert ? (
              <>
                <Button className="h-16 w-full justify-start px-6 text-lg rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/40" asChild>
                  <Link to="/dashboard/profile">
                    <UserCircle className="mr-3 h-6 w-6" />
                    Update Profile
                  </Link>
                </Button>
                <Button variant="secondary" className="h-16 w-full justify-start px-6 text-lg rounded-2xl" asChild>
                  <Link to="/dashboard/calendar">
                    <Calendar className="mr-3 h-6 w-6" />
                    Set Availability
                  </Link>
                </Button>
                <Button variant="outline" className="h-16 w-full justify-start px-6 text-lg rounded-2xl" asChild>
                  <Link to="/dashboard/wallet">
                    <Wallet className="mr-3 h-6 w-6" />
                    Withdraw Funds
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button className="h-16 w-full justify-start px-6 text-lg rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/40" asChild>
                  <Link to="/post-issue">
                    <Zap className="mr-3 h-6 w-6" />
                    Post New Issue
                  </Link>
                </Button>
                <Button variant="secondary" className="h-16 w-full justify-start px-6 text-lg rounded-2xl" asChild>
                  <Link to="/dashboard/wallet">
                    <Wallet className="mr-3 h-6 w-6" />
                    Add Funds
                  </Link>
                </Button>
                <Button variant="outline" className="h-16 w-full justify-start px-6 text-lg rounded-2xl" asChild>
                  <Link to="/dashboard/profile">
                    <UserCircle className="mr-3 h-6 w-6" />
                    Edit Profile
                  </Link>
                </Button>
              </>
            )}
          </div>

          <Card className="p-8 bg-blue-600 dark:bg-blue-900 text-white">
            <TrendingUp className="h-10 w-10 mb-4 text-blue-200 dark:text-blue-300" />
            <h3 className="text-xl font-bold mb-2">
              {isExpert ? 'Grow your earnings' : 'Get help faster'}
            </h3>
            <p className="text-sm text-blue-100 dark:text-blue-200 leading-relaxed">
              {isExpert 
                ? 'Experts who update their availability daily receive 40% more requests. Keep your calendar fresh!'
                : 'Add funds to your wallet to instantly connect with experts when you have an urgent issue.'}
            </p>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {selectedChat && (
          <ChatWindow 
            expertId={selectedChat.expertId}
            expertName={selectedChat.expertName}
            onClose={() => setSelectedChat(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
