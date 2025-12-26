import React from 'react';

export const CoachIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M5 16s-1-3-1-5 2-4 4-4 5 2 5 2m-8 7s-1 3-1 5" />
        <path d="M12 11V3H6l2 4 2-2 2 4" />
        <path d="M18 11V3h-2l2 4 2-2 2 4" />
        <path d="M14 11h1" />
        <path d="M12 21a2 2 0 002-2V13" />
        <path d="M14 13a2 2 0 012-2h1a2 2 0 012 2v2a2 2 0 01-2 2h-1a2 2 0 01-2-2v-2z" />
    </svg>
);
