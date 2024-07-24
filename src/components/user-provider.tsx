"use client"
import { getUser, getUserById, getUserId, UserProps } from '@/actions/get-user';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  user: UserProps | null | undefined;
  setUser: React.Dispatch<React.SetStateAction<UserProps | null | undefined>>;
}

export const UserContext = createContext<UserContextType | null | undefined>(null);

export const UserProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<UserProps | null | undefined>(undefined);

  useEffect(() => {
    async function fetchUserData() {
      const user = await getUser()
      setUser(user)
    }
    fetchUserData();
  }, []);

  return <UserContext.Provider value={{user, setUser}}>
      {children}
  </UserContext.Provider>
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};