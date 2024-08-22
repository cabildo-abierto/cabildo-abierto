import React, { useState } from 'react';

export const TickButton = ({ onClick, size = 24, color = '#455dc0' }: any) => {
  const [isTicked, setIsTicked] = useState(false);

  const handleClick = () => {
    setIsTicked(!isTicked);
    if (onClick) {
      onClick(!isTicked);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: size,
        height: size,
        backgroundColor: isTicked ? color : '#f8f8f9',
        border: `2px solid ${color}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        outline: 'none',
      }}
      aria-label="Tick button"
    >
      {isTicked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          width={size * 0.6}
          height={size * 0.6}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
};

export default TickButton;
