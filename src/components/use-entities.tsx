"use client"
import { EntityProps, getEntities } from '@/actions/get-entity';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface EntitiesContextType {
  entities: Record<string, EntityProps> | null | undefined;
  setEntities: React.Dispatch<React.SetStateAction<Record<string, EntityProps> | null | undefined>>;
}

export const EntitiesContext = createContext<EntitiesContextType | null | undefined>(null);

export const EntitiesProvider = ({ children }: any) => {
  const [entities, setEntities] = useState<Record<string, EntityProps> | null | undefined>(undefined);

  return (
    <EntitiesContext.Provider value={{entities, setEntities}}>
      {children}
    </EntitiesContext.Provider>
  );
};

export const useEntities = () => {
  const context = useContext(EntitiesContext);
  if (!context) {
    throw new Error('useEntities must be used within a EntityProvider');
  }
  return context;
};