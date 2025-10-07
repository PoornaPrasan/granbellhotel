import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (userData: SignUpData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'travel_company';
  companyName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - in production, this would come from your backend
let mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@granbell.com',
    name: 'System Administrator',
    role: 'admin',
    phone: '+1-555-0001',
    password: 'admin123',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'manager@granbell.com',
    name: 'Hotel Manager',
    role: 'manager',
    phone: '+1-555-0002',
    password: 'manager123',
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'clerk@granbell.com',
    name: 'Front Desk Clerk',
    role: 'clerk',
    phone: '+1-555-0003',
    password: 'clerk123',
    createdAt: new Date(),
  },
  {
    id: '4',
    email: 'customer@example.com',
    name: 'John Customer',
    role: 'customer',
    phone: '+1-555-0004',
    password: 'customer123',
    createdAt: new Date(),
  },
  {
    id: '5',
    email: 'travel@company.com',
    name: 'Travel Partners Inc.',
    role: 'travel_company',
    phone: '+1-555-0005',
    password: 'travel123',
    createdAt: new Date(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('hotel_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('hotel_user', JSON.stringify(data.user));
        localStorage.setItem('hotel_token', data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signUp = async (userData: SignUpData): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const text = await response.text(); // read server error
        console.error('Signup failed:', response.status, text);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('hotel_user', JSON.stringify(data.user));
      localStorage.setItem('hotel_token', data.token);
      return true;
    } catch (error) {
      console.error('Sign up error (network):', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hotel_user');
    localStorage.removeItem('hotel_token');
  };

  const hasRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signUp,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};