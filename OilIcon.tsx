import React from 'react';

export const OilIcon: React.FC<{ className?: string }> = ({ className }) => (
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
            d="M19.5 12.75a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 12.75V15m0-6.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V8.25z"
        />
    </svg>
);
