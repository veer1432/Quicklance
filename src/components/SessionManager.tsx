import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, AlertCircle, Zap, PhoneOff, ArrowRight, Video, Star, Smile, Meh, Frown, CheckCircle2 } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Session, SessionFeedback } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import VideoCall from './VideoCall';
import JitsiMeeting from './JitsiMeeting';
import SessionTimer from './SessionTimer';
import { IS_TEST_CREDITS_MODE, SESSION_BASE_PRICE } from '../config';

export default function SessionManager() {
  const { user, profile, processTransaction } = useFirebase();
  const { formatPrice } = useCurrency();
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [isLowTime, setIsLowTime] = useState(false);
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [satisfaction, setSatisfaction] = useState<'satisfied' | 'neutral' | 'unsatisfied'>('satisfied');
  const [comment, setComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const endSession = useCallback(async () => {
    if (!activeSession) return;
    const sessionId = activeSession.id;
    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        status: 'completed',
        endTime: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
      
      // If client, show feedback modal
      if (profile?.role === 'client') {
        setFeedbackSessionId(sessionId);
        setShowFeedback(true);
      }
      
      setActiveSession(null);
      setShowAlert(false);
      setShowMeeting(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `sessions/${sessionId}`);
    }
  }, [activeSession, profile?.role]);

  const submitFeedback = async () => {
    if (!feedbackSessionId) return;
    setIsSubmittingFeedback(true);
    try {
      const feedback: SessionFeedback = {
        rating,
        satisfaction,
        comment,
        createdAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'sessions', feedbackSessionId), {
        feedback,
        updatedAt: serverTimestamp()
      });
      
      // Also update expert's rating if applicable
      const sessionDoc = await getDoc(doc(db, 'sessions', feedbackSessionId));
      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data() as Session;
        const expertId = sessionData.expertId;
        
        // This would ideally be a cloud function to be accurate, 
        // but we can do a simple update here for the demo
        const expertDoc = await getDoc(doc(db, 'users', expertId));
        if (expertDoc.exists()) {
          const expertData = expertDoc.data();
          const currentRating = expertData.rating || 5;
          const currentCount = expertData.reviewCount || 0;
          const newCount = currentCount + 1;
          const newRating = ((currentRating * currentCount) + rating) / newCount;
          
          await updateDoc(doc(db, 'users', expertId), {
            rating: Number(newRating.toFixed(1)),
            reviewCount: newCount
          });
        }
      }
      
      setShowFeedback(false);
      setFeedbackSessionId(null);
      setComment('');
      setRating(5);
      setSatisfaction('satisfied');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `sessions/${feedbackSessionId}`);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleFiveMinutesLeft = useCallback(() => {
    if (profile?.role === 'client' && activeSession && !activeSession.isExtended) {
      setShowAlert(true);
    }
  }, [profile?.role, activeSession]);

  const extendSession = useCallback(async () => {
    if (!activeSession || !user) return;
    setIsExtending(true);
    try {
      const isTestSession = activeSession.basePrice === 0;
      
      if (!isTestSession) {
        await processTransaction(SESSION_BASE_PRICE, 'debit', `${IS_TEST_CREDITS_MODE ? 'Test credit' : 'Session'} extension for ${activeSession.id}`);
      }
      
      await updateDoc(doc(db, 'sessions', activeSession.id), {
        durationMinutes: activeSession.durationMinutes + 30,
        isExtended: true,
        extensionCount: (activeSession.extensionCount || 0) + 1,
        totalPaid: activeSession.totalPaid + (isTestSession ? 0 : SESSION_BASE_PRICE),
        updatedAt: serverTimestamp(),
      });
      
      setShowAlert(false);
    } catch (error: any) {
      alert(error.message || "Failed to extend session. Please check your balance.");
    } finally {
      setIsExtending(false);
    }
  }, [activeSession, user, processTransaction]);

  const handleCloseMeeting = useCallback(() => {
    setShowMeeting(false);
  }, []);

  const handleShowMeeting = useCallback(() => {
    setShowMeeting(true);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setShowAlert(false);
  }, []);

  const handleLowTime = useCallback((isLow: boolean) => {
    setIsLowTime(isLow);
  }, []);

  useEffect(() => {
    if (!user || !profile) return;

    const q = query(
      collection(db, 'sessions'),
      where('status', '==', 'active'),
      where(profile.role === 'expert' ? 'expertId' : 'clientId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const sessionData = { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as Session;
        
        // Only update if something actually changed to prevent redundant re-renders
        setActiveSession(prev => {
          if (prev && prev.id === sessionData.id && 
              prev.status === sessionData.status && 
              prev.durationMinutes === sessionData.durationMinutes &&
              prev.isExtended === sessionData.isExtended) {
            return prev;
          }
          return sessionData;
        });
      } else {
        setActiveSession(null);
        setShowAlert(false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sessions');
    });

    return () => unsubscribe();
  }, [user, profile]);

  if (!activeSession) return null;

  return (
    <>
      {/* Jitsi Meeting Overlay */}
      <AnimatePresence>
        {showMeeting && activeSession?.meetingLink && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-gray-950 flex flex-col"
          >
            {/* Premium Header */}
            <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/5 p-4 md:p-6">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-2xl shadow-blue-500/20">
                      <Video className="h-7 w-7" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-gray-900 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic tracking-tight">Live Session</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <SessionTimer 
                          startTime={activeSession.startTime} 
                          durationMinutes={activeSession.durationMinutes}
                          onFiveMinutesLeft={handleFiveMinutesLeft}
                          onTimeUp={endSession}
                          className="tabular-nums text-white"
                        /> remaining
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCloseMeeting}
                    className="h-12 px-6 rounded-2xl text-white border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95"
                  >
                    Minimize
                  </Button>
                  <Button 
                    onClick={endSession}
                    className="h-12 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-red-900/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    End Call
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-black relative">
              <JitsiMeeting 
                roomName={activeSession.meetingLink} 
                displayName={profile?.displayName}
                onClose={handleCloseMeeting}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Call Feed (Preview) */}
      {!showMeeting && (
        <VideoCall 
          autoStart={profile?.role === 'expert'} 
          isExpert={profile?.role === 'expert'} 
        />
      )}

      {/* Persistent Timer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isLowTime ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'
            }`}>
              <Timer className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Session</p>
              <p className="text-xl font-black text-gray-900 dark:text-gray-100">
                <SessionTimer 
                  startTime={activeSession.startTime} 
                  durationMinutes={activeSession.durationMinutes}
                  onLowTime={handleLowTime}
                  className="tabular-nums"
                />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activeSession.meetingLink && (
              <Button 
                onClick={handleShowMeeting}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
              >
                <Video className="h-4 w-4 mr-2" />
                {showMeeting ? 'Meeting Active' : 'Join Video Call'}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={endSession} className="text-red-600 border-red-200 hover:bg-red-50">
              <PhoneOff className="h-4 w-4 mr-2" />
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Extension Alert Modal */}
      <AnimatePresence>
        {showAlert && profile?.role === 'client' && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={handleCloseAlert}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-900 p-8 shadow-2xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <AlertCircle className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Session ending soon</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Your session is about to end in 5 minutes. Do you want to extend for another 30 minutes for {formatPrice(SESSION_BASE_PRICE)}{IS_TEST_CREDITS_MODE ? ' in test credits' : ''}?
              </p>

              <div className="mt-8 space-y-4">
                <Button
                  onClick={extendSession}
                  disabled={isExtending}
                  className="w-full h-14 rounded-2xl text-lg shadow-xl shadow-blue-100 dark:shadow-blue-900/40"
                >
                  {isExtending ? 'Extending...' : 'Extend Session'}
                  {!isExtending && <Zap className="ml-2 h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseAlert}
                  className="w-full h-14 rounded-2xl text-lg"
                >
                  Not Required
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[3rem] bg-white dark:bg-gray-900 p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">Session Completed!</h2>
                <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium text-lg">How was your experience with the Quicklancer?</p>
              </div>

              <div className="mt-10 space-y-8">
                {/* Satisfaction Selection */}
                <div className="flex justify-center gap-6">
                  {[
                    { id: 'unsatisfied', icon: Frown, label: 'Poor', color: 'text-red-500 bg-red-50' },
                    { id: 'neutral', icon: Meh, label: 'Okay', color: 'text-yellow-500 bg-yellow-50' },
                    { id: 'satisfied', icon: Smile, label: 'Great', color: 'text-green-500 bg-green-50' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSatisfaction(item.id as any)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all duration-300 ${
                        satisfaction === item.id 
                          ? `${item.color} ring-2 ring-current ring-offset-4 dark:ring-offset-gray-900 scale-110` 
                          : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="h-10 w-10" />
                      <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Star Rating */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Star Rating</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-125"
                      >
                        <Star 
                          className={`h-8 w-8 ${
                            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-700'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Your Feedback (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us more about the session..."
                    className="w-full h-32 rounded-3xl bg-gray-50 dark:bg-gray-800 border-none p-6 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>

                <Button
                  onClick={submitFeedback}
                  disabled={isSubmittingFeedback}
                  className="w-full h-16 rounded-[2rem] text-xl font-black italic tracking-tight shadow-2xl shadow-blue-200 dark:shadow-blue-900/40"
                >
                  {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  {!isSubmittingFeedback && <ArrowRight className="ml-2 h-6 w-6" />}
                </Button>
                
                <button 
                  onClick={() => setShowFeedback(false)}
                  className="w-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
