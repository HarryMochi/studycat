
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { createUserProfile, getUserProfile } from '@/lib/firestore';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<any>;
  reloadProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserProfile = async (firebaseUser: User) => {
    let profile = await getUserProfile(firebaseUser.uid);
    if (!profile) {
      await createUserProfile(firebaseUser.uid, {
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
      profile = await getUserProfile(firebaseUser.uid);
    }
    setUserProfile(profile);
  };

  const reloadProfile = async () => {
    if (user) {
        await fetchUserProfile(user);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && user && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
        router.push('/learn');
    }
  }, [user, loading, pathname, router]);

  const signup = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  const logout = () => {
    return signOut(auth).then(() => {
      setUser(null);
      setUserProfile(null);
      router.push('/login');
    });
  };

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    reloadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
