"use client"
import { getUserById, getUserId, UserProps } from '@/actions/get-user';
import React, { createContext, useContext, useState, useEffect } from 'react';

export const UserContext = createContext<UserProps | null>(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState<UserProps | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      const userId = await getUserId()
      if(!userId){
        setUser(null)
      } else {
        const user = await getUserById(userId)
        setUser(user)
      }
    }
    fetchUserData();
  }, []);

  return <UserContext.Provider value={{user, setUser}}>
      {children}
  </UserContext.Provider>
};

export const useUser = () => useContext(UserContext);