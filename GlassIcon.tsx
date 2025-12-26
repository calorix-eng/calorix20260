import React from 'react';

interface GlassIconProps {
  isFilled: boolean;
}

export const GlassIcon: React.FC<GlassIconProps> = ({ isFilled }) => {
  return (
    <svg
      className="w-12 h-12"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 3L6.10184 19.3111C6.17725 20.2834 7.0028 21 7.98184 21H16.0182C16.9972 21 17.8227 20.2834 17.8982 19.3111L19 3H5Z"
        className={`transition-colors duration-300 ${isFilled ? 'stroke-accent-blue/60' : 'stroke-accent-blue'}`}
        strokeWidth="1.5"
      />
      {isFilled && (
         <path
            d="M5 3L6.10184 19.3111C6.17725 20.2834 7.0028 21 7.98184 21H16.0182C16.9972 21 17.8227 20.2834 17.8982 19.3111L19 3H5Z"
            fill="url(#paint0_linear_803_23)"
            className="opacity-50"
         />
      )}
      <defs>
        <linearGradient id="paint0_linear_803_23" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2196F3"/>
          <stop offset="1" stopColor="#2196F3" stopOpacity="0.4"/>
        </linearGradient>
      </defs>
    </svg>
  );
};
