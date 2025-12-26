import React from 'react';

export const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className || "h-5 w-5"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
    >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0" fill="currentColor"/>
        <rect x="9" y="9" width="6" height="6" fill="#a21caf" stroke="none" />
    </svg>
);