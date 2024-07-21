"use client"
import { getSubscriptionPoolSize } from '@/actions/subscriptions';
import React, { createContext, useContext, useState, useEffect } from 'react';

export const PoolSizeContext = createContext(null);

export const PoolSizeProvider = ({ children }) => {
  const [poolSize, setPoolSize] = useState(null);

  useEffect(() => {
    async function fetchPoolSize() {
      const poolSize = await getSubscriptionPoolSize()
      setPoolSize(poolSize)
    }

    fetchPoolSize();
  }, []);

  return (
    <PoolSizeContext.Provider value={{poolSize, setPoolSize}}>
      {children}
    </PoolSizeContext.Provider>
  );
};

export const usePoolSize = () => useContext(PoolSizeContext);