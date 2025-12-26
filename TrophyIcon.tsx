import React from 'react';

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.5 9.5l-3.5 3.5-2-2m5.5 4.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
        />
        <path 
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.5 21V18.5C9.5 16.567 11.067 15 13 15h0c1.933 0 3.5 1.567 3.5 3.5V21M12 15V12"
        />
         <path 
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 9.5H2m20 0h-2.5"
        />
    </svg>
);