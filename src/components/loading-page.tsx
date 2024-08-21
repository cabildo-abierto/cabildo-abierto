"use client"

import React, { ReactNode } from 'react';
import styles from './LoadingPage.module.css'; // Adjust the path as necessary
import Image from 'next/image'
import { useUser } from '@/app/hooks/user';
import { Logo } from './home-page';


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
  const user = useUser()
  return <>{user.isLoading ? 
    <div className="flex flex-col justify-center items-center w-screen h-screen space-y-4">
      <div className="relative">
        <Logo className="w-16 h-16"/>
      </div>
    </div> : children
  }</>
}

export default LoadingPage