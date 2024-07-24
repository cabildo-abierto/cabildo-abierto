"use client"
import { getUser, getUserById, getUserId, UserProps } from '@/actions/get-user';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  user: UserProps | null;
  setUser: React.Dispatch<React.SetStateAction<UserProps | null>>;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<UserProps | null>(null);

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