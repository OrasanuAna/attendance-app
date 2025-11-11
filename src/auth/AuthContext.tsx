import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../../config/firebaseConfig";

type Role = "teacher" | "student" | null;

type AuthState = {
  user: User | null;
  role: Role;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setRole(null);
        setLoading(false);
        return;
      }
      // citește rolul din Firestore: users/{uid}
      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        setRole((snap.data()?.role as Role) ?? null);
      } catch (e) {
        console.log("Eroare citire rol:", e);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      logout: async () => {
        await signOut(auth);
      },
    }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
