import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-9l2.293-2.293a1 1 0 011.414 0L16 11.414l-2.293 2.293a1 1 0 01-1.414 0L10 11.414M16 5l2.293-2.293a1 1 0 011.414 0L22 5l-2.293 2.293a1 1 0 01-1.414 0L16 5zM12 21l-2.293-2.293a1 1 0 010-1.414L12 15l2.293 2.293a1 1 0 010 1.414L12 21z" 
        />
    </svg>
);