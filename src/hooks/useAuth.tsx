
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAsClient: () => Promise<void>;
  signInAsDesigner: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signInAsClient = async () => {
    console.log('Signing in as Client...');
    const mockClient: User = {
      uid: 'demo-client-1',
      email: 'client@example.com',
      displayName: 'Demo Client',
      role: 'client'
    };
    setUser(mockClient);
    localStorage.setItem('user', JSON.stringify(mockClient));
  };

  const signInAsDesigner = async () => {
    console.log('Signing in as Designer...');
    const mockDesigner: User = {
      uid: 'demo-designer-1',
      email: 'designer@example.com',
      displayName: 'Demo Designer',
      role: 'designer'
    };
    setUser(mockDesigner);
    localStorage.setItem('user', JSON.stringify(mockDesigner));
  };

  const signOut = async () => {
    console.log('Signing out...');
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInAsClient, signInAsDesigner, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
