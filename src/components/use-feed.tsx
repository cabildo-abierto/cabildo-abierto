"use client"
import { ContentAndChildrenProps, getPosts } from '@/actions/get-content';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface FeedContextType {
  feed: ContentAndChildrenProps[] | null;
  setFeed: React.Dispatch<React.SetStateAction<ContentAndChildrenProps[] | null>>;
}

export const FeedContext = createContext<FeedContextType | null>(null);

export const FeedProvider = ({ children }: any) => {
  const [feed, setFeed] = useState<ContentAndChildrenProps[] | null>(null);

  useEffect(() => {
    async function fetch() {
        const _feed = await getPosts()
        setFeed(_feed)
    }

    fetch();
  }, []);

  return (
    <FeedContext.Provider value={{feed, setFeed}}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeed must be used within a UserProvider');
  }
  return context;
};