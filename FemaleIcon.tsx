import React from 'react';

export const FemaleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a5 5 0 100-10 5 5 0 000 10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v5m-2.5-2.5h5" />
    </svg>
);
