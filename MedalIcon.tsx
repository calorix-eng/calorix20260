import React from 'react';

export const MedalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path 
            fillRule="evenodd" 
            d="M12.001 2C6.478 2 2.001 6.477 2.001 12s4.477 10 10.00002 10 9.999-4.477 9.999-10-4.476-10-9.999-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.451-11.832l-1.061-1.061-5.656 5.657-2.829-2.829-1.06 1.061 3.889 3.889 6.717-6.717z" 
            clipRule="evenodd" 
            fill="#FFD700" 
        />
        <path 
            d="M12.001 2C6.478 2 2.001 6.477 2.001 12s4.477 10 10.00002 10 9.999-4.477 9.999-10-4.476-10-9.999-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
            stroke="#DAA520" 
            strokeWidth="1" 
        />
         <path
            d="M15.452 8.168l-1.06-1.06-5.657 5.657-2.828-2.828-1.061 1.06 3.889 3.889 6.717-6.717z"
            fill="white"
        />
    </svg>
);