"use client"
import { getSubscriptionPrice } from '@/actions/subscriptions';
import React, { createContext, useContext, useState, useEffect } from 'react';

export const PriceContext = createContext(null);

export const PriceProvider = ({ children }) => {
  const [price, setPrice] = useState(null);

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

export const usePrice = () => useContext(PriceContext);