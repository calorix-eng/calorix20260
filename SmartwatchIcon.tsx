import React from 'react';

export const SmartwatchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className || "w-8 h-8"} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect 
            x="5" 
            y="2" 
            width="14" 
            height="20" 
            rx="4" 
            stroke="currentColor" 
            strokeWidth="1.5"
            fill="none"
        />
        <path 
            d="M12 10V14" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <path 
            d="M12 7V7.01" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <path 
            d="M15 14H9" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
);
