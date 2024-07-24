"use client"
import { ContentProps, getPosts } from '@/actions/get-content';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ContentsContextType {
  contents: Record<string, ContentProps> | null;
  setContents: React.Dispatch<React.SetStateAction<Record<string, ContentProps> | null>>;
}

export const ContentsContext = createContext<ContentsContextType | null>(null);

export const ContentsProvider = ({ children }: any) => {
  const [contents, setContents] = useState<Record<string, ContentProps> | null>(null);

  useEffect(() => {
    async function fetch() {
        const _contents = await getPosts()
        const map: Record<string, ContentProps> = _contents.reduce((acc, obj) => {
          acc[obj.id] = obj;
          return acc;
        }, {} as Record<string, ContentProps>);
        setContents(map)
    }

    fetch();
  }, []);

  return (
    <ContentsContext.Provider value={{contents, setContents}}>
      {children}
    </ContentsContext.Provider>
  );
};

export const useContents = () => {
  const context = useContext(ContentsContext);
  if (!context) {
    throw new Error('useContents must be used within a UserProvider');
  }
  return context;
};