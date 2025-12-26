
import React from 'react';

export const FitbitIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className || "w-8 h-8"} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="12" cy="12" r="2" fill="#00B0B9"/>
        <circle cx="12" cy="5" r="2" fill="#00B0B9"/>
        <circle cx="12" cy="19" r="2" fill="#00B0B9"/>
        <circle cx="5" cy="12" r="2" fill="#00B0B9"/>
        <circle cx="19" cy="12" r="2" fill="#00B0B9"/>
        <circle cx="17" cy="7" r="1.5" fill="#00B0B9"/>
        <circle cx="17" cy="17" r="1.5" fill="#00B0B9"/>
        <circle cx="7" cy="7" r="1.5" fill="#00B0B9"/>
        <circle cx="7" cy="17" r="1.5" fill="#00B0B9"/>
    </svg>
);
