import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  orgId: string | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  const signIn = async (email: string) => {
    // TODO: Implement actual authentication
    setUser({ email });
    setOrgId('default-org');
  };

  const signOut = async () => {
    setUser(null);
    setOrgId(null);
  };

  return (
    <AuthContext.Provider value={{ user, orgId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
