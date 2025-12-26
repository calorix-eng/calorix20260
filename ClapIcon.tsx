import React from 'react';

interface ClapIconProps {
    filled?: boolean;
    className?: string;
}

export const ClapIcon: React.FC<ClapIconProps> = ({ filled = false, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className || "h-5 w-5"}
        viewBox="0 0 20 20" 
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
    >
        <path 
            strokeWidth={filled ? 1 : 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.46 3.59a2 2 0 012.83 0L18.4 5.7a2 2 0 010 2.83l-1.42 1.42a2 2 0 01-2.83 0L12.04 8a2 2 0 010-2.83l1.42-1.42zM4.54 12.41a2 2 0 012.83 0L9.48 14.5a2 2 0 010 2.83l-1.42 1.42a2 2 0 01-2.83 0L3.12 17a2 2 0 010-2.83l1.42-1.42zM15 12l-5.5 5.5M12 2L2 12"
        />
    </svg>
);