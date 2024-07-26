"use client"
import { ContentProps } from '@/actions/get-content';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ContentsContextType {
  contents: Record<string, ContentProps> | null | undefined;
  setContents: React.Dispatch<React.SetStateAction<Record<string, ContentProps> | null | undefined>>;
}

export const ContentsContext = createContext<ContentsContextType | null | undefined>(null);

export const ContentsProvider = ({ children }: any) => {
  const [contents, setContents] = useState<Record<string, ContentProps> | null | undefined>(undefined);

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