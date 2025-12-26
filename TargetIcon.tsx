import React from 'react';

export const TargetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 10-7.07 7.072m7.07-7.072a5 5 0 010 7.072m-7.07-7.072a5 5 0 007.07 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a1 1 0 100-2 1 1 0 000 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
