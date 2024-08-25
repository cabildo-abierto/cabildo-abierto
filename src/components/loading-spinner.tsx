import React from 'react';
import {LineWave} from 'react-loader-spinner'

const LoadingSpinnerOld = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin"></div>
    </div>
  );
};

const LoadingSpinner = () => {
  return <div className="flex items-center justify-center h-full w-full">
    <LineWave
        visible={true}
        height="80"
        width="80"
        color="var(--primary)"
        ariaLabel="line-wave-loading"
        wrapperStyle={{}}
        wrapperClass=""
        firstLineColor=""
        middleLineColor=""
        lastLineColor=""
    />
  </div>
}

export default LoadingSpinner;
