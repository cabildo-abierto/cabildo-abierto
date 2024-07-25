import React from 'react';
import styles from './LoadingPage.module.css'; // Adjust the path as necessary
import Image from 'next/image'

const LoadingPage: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen space-y-4">
      <div className="relative w-16 h-16">
        <Image
          src="/favicon.ico"
          alt="Loading..."
          width={64}
          height={64}
          priority={true}
          className="object-contain animate-bounce"
        />
      </div>
    </div>
  );
};

export default LoadingPage