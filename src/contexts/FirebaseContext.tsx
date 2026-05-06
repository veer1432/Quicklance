import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  googleProvider, 
  signOut, 
  handleFirestoreError, 
  OperationType,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  sendEmailVerification,
  RecaptchaVerifier,
  ConfirmationResult,
  updateAuthProfile,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  isFirebaseConfigured
} from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { UserProfile, Session } from '../types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  activeRole: 'client' | 'expert' | 'admin' | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, pass: string, targetRole?: 'client' | 'expert' | 'admin') => Promise<void>;
  switchRole: (role: 'client' | 'expert' | 'admin') => void;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<User>;
  verifyEmail: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  processTransaction: (amount: number, type: 'debit' | 'credit', description: string) => Promise<void>;
  setupRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendOTP: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  uploadFile: (file: File, path: string) => Promise<string>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<'client' | 'expert' | 'admin' | null>(null);

  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('quiklance_active_role') as any;
    if (savedRole) setActiveRole(savedRole);

    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    // Safety timeout to prevent stuck loading screen
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      clearTimeout(timeoutId);
      setUser(user);
      if (user) {
        // Fetch or create profile
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            
            // If no active role set, default to their profile role
            if (!localStorage.getItem('quiklance_active_role')) {
              const defaultRole = data.role === 'admin' ? 'admin' : data.role;
              setActiveRole(defaultRole as any);
              localStorage.setItem('quiklance_active_role', defaultRole);
            }
          } else {
            // New user profile
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Anonymous',
              photoURL: user.photoURL || '', // Use empty string instead of undefined
              role: 'client',
              walletBalance: 0,
              totalEarnings: 0,
              country: 'India',
              currency: 'INR',
              createdAt: new Date().toISOString(),
              status: 'active' // Clients are active immediately
            };
            try {
              await setDoc(doc(db, 'users', user.uid), {
                ...newProfile,
                createdAt: serverTimestamp(),
              });
              setProfile(newProfile);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
            }
          }
        } catch (error) {
          console.error("Error fetching/creating profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const signIn = async () => {
    if (!isFirebaseConfigured || !auth) {
      alert("Firebase is not configured. Features will be available once setup is complete.");
      return;
    }
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        alert("Please enable popups for this site to sign in.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore this error as it's usually harmless
      } else {
        console.error("Sign in error:", error);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string, targetRole?: 'client' | 'expert' | 'admin') => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured.");
    }
    await signInWithEmailAndPassword(auth, email, pass);
    if (targetRole) {
      setActiveRole(targetRole);
      localStorage.setItem('quiklance_active_role', targetRole);
    }
  };

  const switchRole = (role: 'client' | 'expert' | 'admin') => {
    setActiveRole(role);
    localStorage.setItem('quiklance_active_role', role);
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateAuthProfile(userCredential.user, { displayName });
    await sendEmailVerification(userCredential.user);
    return userCredential.user;
  };

  const verifyEmail = async () => {
    if (isFirebaseConfigured && auth && auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured || !auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !db) return;
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const processTransaction = async (amount: number, type: 'debit' | 'credit', description: string) => {
    if (!user || !profile || !db) return;
    const path = `users/${user.uid}`;
    const newBalance = type === 'debit' ? (profile.walletBalance || 0) - amount : (profile.walletBalance || 0) + amount;
    
    if (type === 'debit' && newBalance < 0) {
      throw new Error('Insufficient balance');
    }

    try {
      await setDoc(doc(db, 'users', user.uid), {
        walletBalance: newBalance,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      // Record transaction
      const txPath = `users/${user.uid}/transactions`;
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        amount,
        type,
        description,
        createdAt: serverTimestamp(),
      });

      setProfile(prev => prev ? { ...prev, walletBalance: newBalance } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const setupRecaptcha = (containerId: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured.");
    }
    return new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
    });
  };

  const sendOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured.");
    }
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!isFirebaseConfigured || !storage) {
      throw new Error("Firebase is not configured or storage is unavailable.");
    }
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      profile, 
      activeRole,
      loading, 
      signIn, 
      signInWithEmail,
      switchRole,
      signUpWithEmail,
      verifyEmail,
      logout, 
      updateProfile,
      processTransaction,
      setupRecaptcha,
      sendOTP,
      uploadFile
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};


export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
