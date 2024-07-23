"use client"
import { getSubscriptionPrice } from '@/actions/subscriptions';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface PriceContextType {
  price: number | null;
  setPrice: React.Dispatch<React.SetStateAction<number | null>>;
}

export const PriceContext = createContext<PriceContextType | null>(null);

export const PriceProvider = ({ children }: any) => {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      const price = await getSubscriptionPrice()
      setPrice(price)
    }

    fetchPrice();
  }, []);

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