"use client"
import { UserProps } from '@/actions/get-user';
import React, { createContext, useContext, useState, useEffect } from 'react';

type UsersType = Record<string, UserProps> | null | undefined

interface UsersContextType {
  users: UsersType;
  setUsers: React.Dispatch<React.SetStateAction<UsersType>>;
}

export const UsersContext = createContext<UsersContextType | null>(null);

export const UsersProvider = ({ children }: any) => {
  const [users, setUsers] = useState<UsersType>(undefined);

  return (
    <UsersContext.Provider value={{users, setUsers}}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};