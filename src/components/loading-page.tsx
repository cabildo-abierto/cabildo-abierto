"use client"

import React, { ReactNode } from 'react';
import styles from './LoadingPage.module.css'; // Adjust the path as necessary
import Image from 'next/image'
import { useUser } from '@/app/hooks/user';


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
  const user = useUser()
  return <>{user.isLoading ? 
    <div className="flex flex-col justify-center items-center w-screen h-screen space-y-4">
      <div className="relative w-16 h-16">
        <Image
          src="/favicon.ico"
          alt="Loading..."
          width={64}
          height={64}
          priority={true}
          className="object-contain"
        />
      </div>
    </div> : children
  }</>
}

export default LoadingPage