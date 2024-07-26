"use client"
import React, { createContext, useContext, useState } from 'react';


type PoolSizeType = number | null | undefined

interface PoolSizeContextType {
  poolSize: PoolSizeType;
  setPoolSize: React.Dispatch<React.SetStateAction<PoolSizeType>>;
}

export const PoolSizeContext = createContext<PoolSizeContextType | null>(null);

export const PoolSizeProvider = ({ children }: any) => {
  const [poolSize, setPoolSize] = useState<PoolSizeType>(undefined);

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