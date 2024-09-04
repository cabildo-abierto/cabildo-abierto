"use client"

import React, { ReactNode } from 'react';
import styles from './LoadingPage.module.css'; // Adjust the path as necessary
import Image from 'next/image'
import { useUser } from 'src/app/hooks/user';
import { Logo } from './home-page';
import ReadOnlyEditor from './editor/read-only-editor';


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
  const user = useUser()
  
  return <>{(user.isLoading || user.isError || !user) ? 
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