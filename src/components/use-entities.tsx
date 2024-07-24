"use client"
import { EntityProps, getEntities } from '@/actions/get-entity';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface EntitiesContextType {
  entities: Record<string, EntityProps> | null;
  setEntities: React.Dispatch<React.SetStateAction<Record<string, EntityProps> | null>>;
}

export const EntitiesContext = createContext<EntitiesContextType | null>(null);

export const EntitiesProvider = ({ children }: any) => {
  const [entities, setEntities] = useState<Record<string, EntityProps> | null>(null);

  useEffect(() => {
    async function fetch() {
        const _entities = await getEntities()
        const map: Record<string, EntityProps> = _entities.reduce((acc, obj) => {
          acc[obj.id] = obj;
          return acc;
        }, {} as Record<string, EntityProps>);
        setEntities(map)
    }

    fetch();
  }, []);

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