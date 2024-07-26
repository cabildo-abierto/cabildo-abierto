"use client"
import { getSubscriptionPrice } from '@/actions/subscriptions';
import React, { createContext, useContext, useState, useEffect } from 'react';


type PriceType = number | null | undefined

interface PriceContextType {
  price: PriceType;
  setPrice: React.Dispatch<React.SetStateAction<PriceType>>;
}

export const PriceContext = createContext<PriceContextType | null>(null);

export const PriceProvider = ({ children }: any) => {
  const [price, setPrice] = useState<PriceType>(undefined);

  return (
    <PriceContext.Provider value={{price, setPrice}}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePrice = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrice must be used within a UserProvider');
  }
  return context;
};