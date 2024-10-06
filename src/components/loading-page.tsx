"use client"

import React, { ReactNode, useEffect } from 'react';
import ReadOnlyEditor from './editor/read-only-editor';
import { Logo } from './logo';
import { useUser } from '../app/hooks/user';
import { preload } from 'swr';
import { fetcher } from '../app/hooks/utils';


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
  const user = useUser()
  
  useEffect(() => {
      preload("/api/users", fetcher)
      preload("/api/entities", fetcher)

      // probablemente estos dos no tenga sentido ponerlos acá
      preload("/api/feed/", fetcher)
      preload("/api/following-feed/", fetcher)
  }, [])

  return <>{(user.isLoading) ? 
    <div className="flex flex-col justify-center items-center w-screen h-screen">
      <div className="relative">
        <Logo className="w-16 h-16"/>
      </div>
    </div> : children
  }
  <ReadOnlyEditor initialData={null}/>
  </>
}

export default LoadingPage