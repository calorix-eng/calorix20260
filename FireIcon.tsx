import React from 'react';

export const FireIcon: React.FC<{ className?: string }> = ({ className }) => (
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
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0122 12c0 3.771-2.5 7-6.343 6.657z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.5 21a8.003 8.003 0 008.003-8.003A8.003 8.003 0 009.5 5.004S7 7 7 9.5c0 3.5 2.5 11.5 2.5 11.5z"
        />
    </svg>
);
