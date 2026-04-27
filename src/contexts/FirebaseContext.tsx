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
  getDownloadURL
} from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { UserProfile, Session } from '../types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
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

  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            // Force admin role for users with admin role in DB
            setProfile(data);
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
              status: 'pending' // Default to pending for new users
            };
            await setDoc(doc(db, 'users', user.uid), {
              ...newProfile,
              createdAt: serverTimestamp(),
            });
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching/creating profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
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

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateAuthProfile(userCredential.user, { displayName });
    await sendEmailVerification(userCredential.user);
    return userCredential.user;
  };

  const verifyEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
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
    if (!user || !profile) return;
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
    return new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
    });
  };

  const sendOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signIn, 
      signInWithEmail,
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
