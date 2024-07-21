"use client"
import { getUserById, getUserId } from '@/actions/get-user';
import React, { createContext, useContext, useState, useEffect } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

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

  return (
    <UserContext.Provider value={{user, setUser}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);