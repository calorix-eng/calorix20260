
import React from 'react';

export const DumbbellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12h21" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9v6h-3V9h3zm18 0v6h-3V9h3z" />
    </svg>
);
