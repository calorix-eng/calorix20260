import React from 'react';

interface BookmarkIconProps {
    filled?: boolean;
    className?: string;
}

export const BookmarkIcon: React.FC<BookmarkIconProps> = ({ filled = false, className }) => {
    if (filled) {
        return (
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={className || "h-5 w-5"}
                viewBox="0 0 20 20" 
                fill="currentColor"
            >
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
        );
    }
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={className || "h-5 w-5"}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
    );
};