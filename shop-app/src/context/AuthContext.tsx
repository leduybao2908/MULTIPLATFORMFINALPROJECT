import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../service/firebase';
import { Role, UserProfile } from '../types';

type Ctx = {
  user: UserProfile | null;
  role: Role;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      unsubProfile?.();
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      // Lắng nghe hồ sơ realtime: admin đổi role thì app tự cập nhật
      unsubProfile = onSnapshot(
        doc(db, 'users', fbUser.uid),
        (snap) => {
          const data = snap.data();
          if (data) {
            if (data.isBanned) {
              signOut(auth);
              return;
            }
            setUser({ uid: fbUser.uid, ...(data as Omit<UserProfile, 'uid'>) });
          } else {
            setUser(null);
          }
          setLoading(false);
        },
        () => setLoading(false)
      );
    });

    return () => {
      unsubProfile?.();
      unsubAuth();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), {
      name,
      email,
      role: 'buyer',
      sellerStatus: 'none',
      isBanned: false,
      createdAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const role: Role = user?.role ?? 'guest';

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}