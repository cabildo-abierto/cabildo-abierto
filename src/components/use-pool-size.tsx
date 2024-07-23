"use client"
import { getSubscriptionPoolSize } from '@/actions/subscriptions';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface PoolSizeContextType {
  poolSize: number | null;
  setPoolSize: React.Dispatch<React.SetStateAction<number | null>>;
}

export const PoolSizeContext = createContext<PoolSizeContextType | null>(null);

export const PoolSizeProvider = ({ children }: any) => {
  const [poolSize, setPoolSize] = useState<number | null>(null);

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

export const usePoolSize = () => {
  const context = useContext(PoolSizeContext);
  if (!context) {
    throw new Error('usePoolSize must be used within a UserProvider');
  }
  return context;
};