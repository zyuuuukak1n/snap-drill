'use client';

import React from 'react';

interface HanamaruStampProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const HanamaruStamp: React.FC<HanamaruStampProps> = ({
  size = 120,
  className = '',
  showText = true,
}) => {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center animate-pop-in ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md text-hanamaru"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Flower petals (Spiral concentric loops resembling Japanese hanamaru) */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="6 3"
          className="opacity-40"
        />
        {/* Outer petal curve swirls */}
        <path
          d="M 50 10 C 65 5, 80 15, 85 30 C 95 45, 90 65, 80 80 C 65 95, 40 95, 25 85 C 10 75, 5 55, 12 35 C 18 18, 35 10, 50 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Inner double circle */}
        <circle
          cx="50"
          cy="50"
          r="26"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="50"
          r="16"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Central playful mark */}
        <circle cx="50" cy="50" r="4" fill="currentColor" />
      </svg>
      {showText && (
        <span className="text-xs sm:text-sm font-black text-hanamaru tracking-wider -mt-1 font-rounded">
          たいへんよくできました💮
        </span>
      )}
    </div>
  );
};
