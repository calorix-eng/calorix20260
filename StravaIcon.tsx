
import React from 'react';

export const StravaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className || "w-8 h-8"} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.061l-2.089 4.116zM10.756 0L0 21.192h5.13l5.626-11.13 5.626 11.13h5.13L10.756 0z" fill="#FC6100"/>
    </svg>
);
