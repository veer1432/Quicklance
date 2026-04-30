import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare,
  Award,
  Link as LinkIcon,
  Briefcase,
  FileText,
  Eye,
  CheckCircle
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { UserProfile } from '@/src/types';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function ExpertVetting() {
  const [experts, setExperts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState<UserProfile | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Only fetch experts who are pending vetting
    const q = query(collection(db, 'users'), where('role', '==', 'expert'), where('status', '==', 'pending'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExperts(snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, []);

  const handleAction = async (decision: 'approve' | 'reject') => {
    if (!selectedExpert) return;

    setIsProcessing(true);
    try {
      const userRef = doc(db, 'users', selectedExpert.uid);
      await updateDoc(userRef, {
        status: decision === 'approve' ? 'active' : 'rejected',
        vettingNote: reviewNote,
        vettedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      alert(`Expert ${selectedExpert.displayName} has been ${decision}d.`);
      setSelectedExpert(null);
      setReviewNote('');
    } catch (error) {
      console.error('Error in vetting action:', error);
      alert('Failed to process. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight uppercase">Expert Vetting</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">Verify credentials and approve Quiklancers for platform access.</p>
        </div>
        
        <div className="bg-blue-600 px-6 py-3 rounded-2xl text-white font-black flex items-center gap-3 shadow-xl shadow-blue-100 dark:shadow-none">
          <CheckCircle className="h-5 w-5" />
          <span>{experts.length} PENDING APPLICATIONS</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Applicants List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search applicants..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            {experts.map((expert) => (
              <Card 
                key={expert.uid}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedExpert?.uid === expert.uid 
                    ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-900/10' 
                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                }`}
                onClick={() => setSelectedExpert(expert)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-gray-400">
                    {expert.photoURL ? (
                      <img src={expert.photoURL} className="h-full w-full rounded-xl object-cover" />
                    ) : expert.displayName?.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{expert.displayName}</h4>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{expert.skills?.[0] || 'Expert'}</p>
                  </div>
                  <Eye className="h-4 w-4 text-gray-300" />
                </div>
              </Card>
            ))}
            
            {experts.length === 0 && (
              <div className="py-20 text-center space-y-4 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                <Users className="h-12 w-12 text-gray-200 mx-auto" />
                <p className="text-gray-400 font-medium italic">All caught up! No pending applications.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Review */}
        <div className="lg:col-span-8">
          {selectedExpert ? (
            <Card className="p-10 md:p-14 space-y-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8">
                <span className="bg-yellow-50 text-yellow-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                  Awaiting Vetting
                </span>
              </div>

              <header className="flex items-start gap-8">
                <div className="h-24 w-24 rounded-[2rem] bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-4xl font-black text-blue-600 dark:text-blue-400">
                  {selectedExpert.photoURL ? (
                    <img src={selectedExpert.photoURL} className="h-full w-full rounded-[2rem] object-cover" />
                  ) : selectedExpert.displayName?.charAt(0)}
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{selectedExpert.displayName}</h2>
                  <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
                    <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {selectedExpert.email}</span>
                    <span className="flex items-center gap-1 font-black text-blue-600">★ {selectedExpert.hourlyRate || 0}/hr</span>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText className="h-3 w-3" /> Professional Bio
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">
                      "{selectedExpert.bio || 'No bio provided.'}"
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Award className="h-3 w-3" /> Core Expertise & Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpert.skills?.map((skill) => (
                        <span key={skill} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                      {(!selectedExpert.skills || selectedExpert.skills.length === 0) && (
                        <p className="text-xs text-gray-400">No skills listed.</p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <LinkIcon className="h-3 w-3" /> External Verification
                    </h3>
                    <div className="space-y-3">
                      <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-900 hover:text-blue-600 transition-all">
                        <span className="text-xs font-bold">LinkedIn Profile</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-900 hover:text-blue-600 transition-all">
                        <span className="text-xs font-bold">Professional Portfolio</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                    <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Briefcase className="h-3 w-3" /> Professional Experience
                    </h3>
                    <div className="space-y-4">
                      {selectedExpert.experience?.map((exp, i) => (
                        <div key={i} className="border-l-2 border-purple-200 dark:border-purple-900 pl-4 py-1">
                          <p className="text-xs font-black text-gray-900 dark:text-gray-100">{exp.role}</p>
                          <p className="text-[10px] font-bold text-purple-600">{exp.company} • {exp.duration}</p>
                        </div>
                      ))}
                      {(!selectedExpert.experience || selectedExpert.experience.length === 0) && (
                        <p className="text-xs text-gray-400 italic">No experience added.</p>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <footer className="pt-12 border-t border-gray-100 dark:border-gray-800 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal Review Notes</label>
                  <textarea 
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Add feedback for the Quiklancer (visible if rejected)..."
                    className="w-full h-32 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 lg:text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handleAction('reject')}
                    disabled={isProcessing}
                    variant="outline" 
                    className="h-16 rounded-2xl text-red-600 border-red-50 hover:bg-red-50 bg-white font-black uppercase tracking-widest"
                  >
                    <XCircle className="h-5 w-5 mr-3" />
                    Decline & Notify
                  </Button>
                  <Button 
                    onClick={() => handleAction('approve')}
                    disabled={isProcessing}
                    className="h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest"
                  >
                    <ShieldCheck className="h-5 w-5 mr-3" />
                    Approve Expert
                  </Button>
                </div>
              </footer>
            </Card>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[5rem] bg-gray-50/30">
              <div className="h-24 w-24 rounded-[2.5rem] bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-200 dark:text-gray-800 mb-8 border-4 border-white dark:border-gray-800 shadow-xl">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="text-3xl font-black text-gray-400 dark:text-gray-600 italic tracking-tight uppercase">Ready for Review</h3>
              <p className="text-gray-400 dark:text-gray-500 mt-4 max-w-sm mx-auto font-medium leading-relaxed">
                Choose an expert from the application queue on the left to start the vetting process.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
