import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CurrentUser = {
  id: number;
  fullName: string;
  email: string;
  roleCode: 'REQUESTOR' | 'FINANCE_MEMBER' | 'FINANCE_SUPERVISOR' | 'ADMIN';
  regionCode: string | null;
};

type UserContextType = {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  login: (user: CurrentUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const STORAGE_KEY = 'motor_claims_current_user';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        setCurrentUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setCurrentUser = (user: CurrentUser | null) => {
    setCurrentUserState(user);

    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  };

  const login = (user: CurrentUser) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      login,
      logout,
      isAuthenticated: !!currentUser,
    }),
    [currentUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
}