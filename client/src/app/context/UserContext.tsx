import React, { createContext, useContext, useMemo, useState } from 'react';

type CurrentUser = {
  id: number;
  fullName: string;
  email: string;
  roleCode: 'REQUESTOR' | 'FINANCE_MEMBER' | 'FINANCE_SUPERVISOR' | 'ADMIN';
  regionCode: string | null;
};

type UserContextType = {
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  demoUsers: CurrentUser[];
};

const demoUsers: CurrentUser[] = [
  {
    id: 1,
    fullName: 'Requestor Demo User',
    email: 'requestor@example.com',
    roleCode: 'REQUESTOR',
    regionCode: 'RUH',
  },
  {
    id: 2,
    fullName: 'Finance Member Riyadh',
    email: 'finance.member.ruh@example.com',
    roleCode: 'FINANCE_MEMBER',
    regionCode: 'RUH',
  },
  {
    id: 3,
    fullName: 'Finance Supervisor Riyadh',
    email: 'finance.supervisor.ruh@example.com',
    roleCode: 'FINANCE_SUPERVISOR',
    regionCode: 'RUH',
  },
  {
    id: 4,
    fullName: 'Admin User',
    email: 'admin@example.com',
    roleCode: 'ADMIN',
    regionCode: 'RUH',
  },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(demoUsers[0]);

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      demoUsers,
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