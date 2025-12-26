import React from 'react';

export const EagleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M18.2 13.3c-2.4 1-5.1 1.4-8.1 1.4-2.2 0-4.3-.3-6.2-.8"/>
        <path d="M18.2 13.3c.4 1 .8 2.1 1.2 3.2 1.4 3.5 4.6 3.5 4.6 3.5-3.5 0-3.5-4.5-3.5-4.5-1.2 0-2.4-.4-3.5-.8"/>
        <path d="M5.1 13.9C3.1 12.2 2 9.8 2 7c0-2.5 1.1-4.9 3.1-6.6"/>
        <path d="M19 19c-1.2-1.2-1.8-2.8-1.8-4.5 0-1.2.3-2.3.8-3.3"/>
        <path d="M12.5 8.8c.7 0 1.3-.2 1.8-.6"/>
    </svg>
);
