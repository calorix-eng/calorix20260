import React from 'react';

export const MaleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a7 7 0 11-14 0 7 7 0 0114 0z" transform="translate(1, 1)" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 5l-7 7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5h4v4" />
    </svg>
);
