"use client"
import { ContentAndChildrenProps, getPostsFollowing } from '@/actions/get-content';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './user-provider';

interface FollowingFeedContextType {
  followingFeed: ContentAndChildrenProps[] | null;
  setFollowingFeed: React.Dispatch<React.SetStateAction<ContentAndChildrenProps[] | null>>;
}

export const FollowingFeedContext = createContext<FollowingFeedContextType | null>(null);

export const FollowingFeedProvider = ({ children }: any) => {
  const [followingFeed, setFollowingFeed] = useState<ContentAndChildrenProps[] | null>(null);
  const {user, setUser} = useUser()

  useEffect(() => {
    async function fetch() {
      if(user){
        const followingFeed = await getPostsFollowing(user)
        setFollowingFeed(followingFeed)
      }
    }

    fetch();
  }, [user]);

  return (
    <FollowingFeedContext.Provider value={{followingFeed, setFollowingFeed}}>
      {children}
    </FollowingFeedContext.Provider>
  );
};

export const useFollowingFeed = () => {
  const context = useContext(FollowingFeedContext);
  if (!context) {
    throw new Error('useFollowingFeed must be used within a UserProvider');
  }
  return context;
};