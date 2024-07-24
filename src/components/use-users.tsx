"use client"
import { getUsers, UserProps } from '@/actions/get-user';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface UsersContextType {
  users: Record<string, UserProps> | null;
  setUsers: React.Dispatch<React.SetStateAction<Record<string, UserProps> | null>>;
}

export const UsersContext = createContext<UsersContextType | null>(null);

export const UsersProvider = ({ children }: any) => {
  const [users, setUsers] = useState<Record<string, UserProps> | null>(null);

  useEffect(() => {
    async function fetch() {
        const _users = await getUsers()
        const map: Record<string, UserProps> = _users.reduce((acc, obj) => {
          acc[obj.id] = obj;
          return acc;
        }, {} as Record<string, UserProps>);
        setUsers(map)
    }

    fetch();
  }, []);

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