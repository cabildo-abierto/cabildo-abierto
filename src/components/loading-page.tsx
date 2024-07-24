import React from 'react';
import styles from './LoadingPage.module.css'; // Adjust the path as necessary

const LoadingPage: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen space-y-4">
      <div className="relative w-16 h-16">
        <img
          src="/favicon.ico"
          alt="Loading..."
          className="w-full h-full object-contain animate-bounce"
        />
      </div>
    </div>
  );
};

export default LoadingPage