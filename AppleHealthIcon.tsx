import React from 'react';

export const AppleHealthIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className || "w-8 h-8"} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path 
            d="M16.8396 3.51581C14.3405 2.57393 11.2365 3.59388 9.85295 5.72861L9.08332 6.88339C8.6152 7.59363 8.8016 8.5448 9.47502 9.07094L12.3842 11.2785C12.8727 11.6601 13.6015 11.538 13.9485 11.0118L15.0213 9.44473C16.9211 6.8415 19.3387 4.45769 16.8396 3.51581Z" 
            fill="#FF596D"
        />
    </svg>
);
