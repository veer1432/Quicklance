import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Zap, CheckCircle2, MessageSquare, Video, Globe, Github, Twitter, Calendar, ShieldCheck, Award, Lock, Phone, AlertCircle, Briefcase, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { useFirebase } from "@/src/contexts/FirebaseContext";
import { db, handleFirestoreError, OperationType } from "@/src/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { UserProfile, Session } from "@/src/types";
import { useCurrency } from "@/src/contexts/CurrencyContext";
import { useNavigate } from "react-router-dom";
import ChatWindow from "@/src/components/ChatWindow";
import { IS_TEST_CREDITS_MODE, SESSION_BASE_PRICE } from "@/src/config";

export default function ExpertProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, signIn, loading: authLoading, processTransaction } = useFirebase();
  const { formatPrice } = useCurrency();
  const [expert, setExpert] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'reviews'>('about');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleCallNow = async (skipPayment = false) => {
    if (!user) {
      signIn();
      return;
    }

    if (!expert) return;

    if (user.uid === expert.uid) {
      alert("You cannot start a session with yourself.");
      return;
    }

    if (hasActiveSession) {
      alert("You already have an active session. Please complete it before starting a new one.");
      navigate('/dashboard');
      return;
    }

    if (!skipPayment && (profile?.walletBalance || 0) < SESSION_BASE_PRICE) {
      alert(`Insufficient test credits. Please add at least ${formatPrice(SESSION_BASE_PRICE)} in test credits to start a session.`);
      navigate('/dashboard/wallet');
      return;
    }

    setIsStartingSession(true);
    try {
      if (!skipPayment) {
        await processTransaction(SESSION_BASE_PRICE, 'debit', `${IS_TEST_CREDITS_MODE ? 'Test credit' : 'Session'} charge with ${expert.displayName}`);
      }

      // Create session
      const sessionData: Partial<Session> = {
        clientId: user.uid,
        expertId: expert.uid,
        status: 'active',
        startTime: new Date().toISOString(),
        durationMinutes: 30,
        basePrice: skipPayment ? 0 : SESSION_BASE_PRICE,
        totalPaid: skipPayment ? 0 : SESSION_BASE_PRICE,
        isExtended: false,
        extensionCount: 0,
        meetingLink: `Quicklance-${expert.uid.substring(0, 5)}-${user.uid.substring(0, 5)}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Redirect to dashboard where SessionManager will take over
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.message || "Failed to start session. Please try again.");
    } finally {
      setIsStartingSession(false);
    }
  };

  useEffect(() => {
    if (!id || !user) {
      setLoading(false);
      return;
    }

    const checkActiveSession = async () => {
      try {
        const q = query(
          collection(db, 'sessions'),
          where('status', '==', 'active'),
          where('clientId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        setHasActiveSession(!snapshot.empty);
      } catch (error) {
        console.error("Error checking active session:", error);
      }
    };

    const fetchExpert = async () => {
      setLoading(true);
      const path = `users/${id}`;
      try {
        await checkActiveSession();
        const docSnap = await getDoc(doc(db, "users", id));
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          // Only allow viewing active experts, unless the viewer is an admin or the expert themselves
          if (data.status === 'active' || profile?.role === 'admin' || profile?.uid === id) {
            setExpert(data);
          } else {
            setExpert(null);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    };

    fetchExpert();
  }, [id, user]);

  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20 px-4 transition-colors duration-300">
        <div className="mx-auto max-w-2xl text-center bg-white dark:bg-gray-900 p-12 rounded-[3rem] shadow-xl shadow-blue-100/50 dark:shadow-blue-950/50 border border-blue-50 dark:border-gray-800">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <Lock className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4">Quicklancer Profile Locked</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">Sign in to view full Quicklancer profiles, reviews, and start a live session.</p>
          <Button onClick={signIn} className="h-16 px-12 text-xl rounded-2xl shadow-2xl shadow-blue-200 dark:shadow-blue-900/40">
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20 text-center transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quicklancer not found</h2>
        <Link to="/experts" className="mt-4 inline-block font-bold text-blue-600 dark:text-blue-400 hover:underline">Back to Quicklancers</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10">
          <Card className="p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6">
              <div className="flex items-center gap-2 rounded-2xl bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-bold">Verified Quicklancer</span>
              </div>
            </div>

            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              <div className="relative shrink-0">
                {expert.photoURL ? (
                  <img src={expert.photoURL} alt={expert.displayName} className="h-32 w-32 md:h-40 md:w-40 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white dark:border-gray-800" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-32 w-32 md:h-40 md:w-40 items-center justify-center rounded-[2.5rem] bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-5xl font-bold shadow-2xl border-4 border-white dark:border-gray-800">
                    {(expert.displayName || "E").charAt(0)}
                  </div>
                )}
                <div className={`absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center ${
                  expert.isAvailable !== false ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  {expert.isAvailable !== false && <Zap className="h-5 w-5 text-white fill-white" />}
                </div>
              </div>
              
              <div className="flex-grow space-y-4">
                <div className="space-y-1">
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{expert.displayName}</h1>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{expert.role === 'expert' ? 'Technical Quicklancer' : expert.role}</p>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-xl">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-black text-gray-900 dark:text-gray-100">{expert.rating || 5.0}</span>
                    <span className="text-gray-500 dark:text-gray-400 font-bold">({expert.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                    <Calendar className="h-5 w-5" />
                    <span>Joined {new Date(expert.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                    <Globe className="h-5 w-5" />
                    <span>Remote</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs Navigation */}
            <div className="flex p-1.5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              {(['about', 'experience', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all uppercase tracking-wider ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'about' && (
                  <Card className="p-8 md:p-10 space-y-10">
                    <section className="space-y-4">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                        About Me
                      </h2>
                      <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400 font-medium whitespace-pre-wrap">
                        {expert.bio || "No bio provided."}
                      </p>
                    </section>

                    <section className="space-y-6 pt-8 border-t border-gray-100 dark:border-gray-800">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Zap className="h-6 w-6 text-blue-600" />
                        Skills & Specialties
                      </h2>
                      <div className="flex flex-wrap gap-3">
                        {expert.skills?.map(skill => (
                          <span key={skill} className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 px-6 py-3 text-sm font-black text-blue-700 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-900/30">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  </Card>
                )}

                {activeTab === 'experience' && (
                  <Card className="p-8 md:p-10 space-y-12">
                    {expert.isFresher ? (
                      <div className="text-center py-10">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          <Zap className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">Fresher Quicklancer</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto font-medium">
                          This expert is starting their professional journey but has verified skills to help you.
                        </p>
                      </div>
                    ) : (
                      <>
                        {expert.experience && expert.experience.length > 0 && (
                          <section className="space-y-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3">
                              <Briefcase className="h-6 w-6 text-blue-600" />
                              Work Experience
                            </h2>
                            <div className="space-y-8">
                              {expert.experience.map((exp, idx) => (
                                <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-100 dark:before:bg-blue-900/40 before:rounded-full">
                                  <div className="absolute left-[-4px] top-0 h-3 w-3 rounded-full bg-blue-600 border-4 border-white dark:border-gray-900" />
                                  <h4 className="text-xl font-black text-gray-900 dark:text-gray-100">{exp.role}</h4>
                                  <div className="flex items-center gap-2 text-sm font-black text-blue-600 dark:text-blue-400 mt-1 mb-3">
                                    <Calendar className="h-4 w-4" />
                                    {exp.company} • {exp.duration}
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{exp.description}</p>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </>
                    )}

                    {expert.certificates && expert.certificates.length > 0 && (
                      <section className="space-y-8 pt-10 border-t border-gray-100 dark:border-gray-800">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3">
                          <Award className="h-6 w-6 text-blue-600" />
                          Certificates & Proof
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {expert.certificates.map((cert, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-start gap-5 rounded-[2rem] bg-gray-50 dark:bg-gray-800/50 p-6 border border-gray-100 dark:border-gray-800 ${cert.fileUrl ? 'cursor-pointer hover:border-blue-500 transition-all' : ''}`}
                              onClick={() => cert.fileUrl && window.open(cert.fileUrl, '_blank')}
                            >
                              <div className="h-14 w-14 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm shrink-0">
                                <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h4 className="font-black text-gray-900 dark:text-gray-100 leading-tight">{cert.name}</h4>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">{cert.issuer || 'Verified Issuer'}</p>
                                <div className="mt-3 flex items-center gap-2">
                                  <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                                    <ShieldCheck className="h-3 w-3" />
                                    Verified
                                  </div>
                                  {cert.fileUrl && (
                                    <span className="text-[10px] font-bold text-gray-400">Click to view</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </Card>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      {[1, 2, 3].map(i => (
                        <Card key={i} className="p-8" hover={false}>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center font-black text-blue-600 dark:text-blue-400 text-lg">JD</div>
                            <div>
                              <h4 className="font-black text-gray-900 dark:text-gray-100">John Doe</h4>
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
                              </div>
                            </div>
                            <span className="ml-auto text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">2 days ago</span>
                          </div>
                          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">
                            "{expert.displayName} fixed my issue in less than 15 minutes. Super professional and knowledgeable! Highly recommended for any technical hurdles."
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Booking Sidebar */}
          <div className="space-y-8">
            <Card className="sticky top-28 p-8 border-2 border-blue-600 dark:border-blue-500 shadow-2xl shadow-blue-100/50 dark:shadow-blue-950/50 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-blue-600/10 rounded-full blur-3xl" />
              
              <div className="mb-8 flex items-end justify-between relative">
                <div>
                  <div className="text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">{formatPrice(expert.hourlyRate || 250)}</div>
                  <div className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">per 30-min session</div>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                  expert.isAvailable !== false ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    expert.isAvailable !== false ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  {expert.isAvailable !== false ? 'Available Now' : 'Offline'}
                </div>
              </div>

              <div className="space-y-4 relative">
                {expert.isAvailable !== false ? (
                  <>
                    {(profile?.walletBalance || 0) >= SESSION_BASE_PRICE ? (
                      <Button 
                        onClick={() => handleCallNow(false)}
                        disabled={isStartingSession}
                        className="w-full py-8 text-xl font-black bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 shadow-xl shadow-green-100 dark:shadow-green-900/40 rounded-2xl group" 
                        size="lg"
                      >
                        <Phone className="mr-3 h-7 w-7 group-hover:rotate-12 transition-transform" />
                        {isStartingSession ? 'Starting...' : 'Call Now'}
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                          <p className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-black uppercase tracking-tight">
                            <AlertCircle className="h-5 w-5" />
                            Insufficient balance
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-bold">You need at least {formatPrice(SESSION_BASE_PRICE)} in test credits to start a session.</p>
                        </div>
                        <Button 
                          onClick={() => navigate('/dashboard/wallet')}
                          variant="outline"
                          className="w-full py-6 text-sm font-black border-amber-200 text-amber-700 hover:bg-amber-50 rounded-2xl"
                        >
                          Add Test Credits
                        </Button>
                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                          </div>
                          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-gray-400 bg-white dark:bg-gray-900 px-2">
                            Or for testing
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleCallNow(true)}
                          disabled={isStartingSession}
                          className="w-full py-8 text-xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 dark:shadow-blue-900/40 rounded-2xl"
                          size="lg"
                        >
                          <Zap className="mr-3 h-7 w-7" />
                          {isStartingSession ? 'Starting...' : 'Skip & Test Call'}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Button className="w-full py-8 text-xl font-black bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xl shadow-blue-100 dark:shadow-blue-900/40 rounded-2xl" size="lg">
                    <Calendar className="mr-3 h-7 w-7" />
                    Schedule Session
                  </Button>
                )}
                  <Button 
                    onClick={() => setIsChatOpen(true)}
                    variant="outline" className="w-full py-6 text-lg font-black rounded-2xl" size="lg"
                  >
                    <MessageSquare className="mr-3 h-6 w-6" />
                    Message {(expert.displayName || "Quicklancer").split(' ')[0]}
                  </Button>
                </div>

              <div className="mt-10 space-y-5 border-t border-gray-100 dark:border-gray-800 pt-8 relative">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-bold">
                  <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <Video className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Screen sharing & remote control</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-bold">
                  <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>{IS_TEST_CREDITS_MODE ? 'Test-credit session balance' : 'Secure escrow payments'}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-bold">
                  <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>100% Satisfaction guarantee</span>
                </div>
              </div>

              <div className="mt-10 rounded-2xl bg-gray-50 dark:bg-gray-800 p-5 text-center relative">
                <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Avg. Response Time</p>
                <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1">2 Minutes</p>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-xl shadow-blue-200 dark:shadow-none">
              <Award className="h-12 w-12 mb-6 text-blue-200" />
              <h3 className="text-2xl font-black mb-3 tracking-tight">Quicklance Top Rated</h3>
              <p className="text-blue-100 leading-relaxed font-medium">
                This expert is in the top 1% of Quicklancers based on client satisfaction and technical proficiency.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <ChatWindow 
            expertId={id!} 
            expertName={expert.displayName} 
            onClose={() => setIsChatOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
