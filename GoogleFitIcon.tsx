import React from 'react';

export const GoogleFitIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className || "w-8 h-8"} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M11.87 12.42L6 17.15V14.28L9.46 12.42L6 10.55V7.69L11.87 12.42Z" fill="#34A853"/>
        <path d="M12.13 11.58L15.45 9.11L14.32 8.2L12.13 9.47V11.58Z" fill="#FBC005"/>
        <path d="M15.45 15.72L12.13 13.25V11.58L14.32 12.85L15.45 13.72V15.72Z" fill="#EA4335"/>
        <path d="M15.45 12.42L12.13 9.95V6L18 10.73V14.1L15.45 12.42Z" fill="#4285F4"/>
    </svg>
);
