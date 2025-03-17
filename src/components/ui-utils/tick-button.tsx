import React, { ReactNode } from 'react';

type TickButtonProps = {
  ticked: boolean
  setTicked: (v: boolean) => void
  size?: number
  color?: string
  text: ReactNode
}

export const TickButton = ({ text, ticked, setTicked, size = 24, color = '#455dc0' }: TickButtonProps) => {

  const tick = (
    <button
      onClick={() => {setTicked(!ticked)}}
      style={{
        width: size,
        height: size,
        backgroundColor: ticked ? color : 'var(--background-dark)',
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
      {ticked && (
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

  return <div className="flex items-center space-x-2 px-2">
      {tick}
      {text}
  </div>
};

export default TickButton;
