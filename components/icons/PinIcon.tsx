
import React from 'react';

interface IconProps {
  className?: string;
}

// Using a simple "plus" or "add" icon for "Use as Reference" or "Add to Prompt"
export const PinIcon: React.FC<IconProps> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className={className}
        aria-hidden="true"
    >
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

// Alternative "Pin" icon if preferred:
/*
export const PinIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M11.03 2.22a.75.75 0 00-1.06 0l-4.5 4.5a.75.75 0 101.06 1.06L10 4.31l3.47 3.47a.75.75 0 101.06-1.06l-4.5-4.5zM5.75 9.75A.75.75 0 015 9V5.5a.75.75 0 011.5 0V9A.75.75 0 015.75 9.75zM14.25 9.75a.75.75 0 01-.75-.75V5.5a.75.75 0 011.5 0V9a.75.75 0 01-.75.75z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M5.28 11.47a.75.75 0 010 1.06l4.25 4.25a.75.75 0 01-1.06 1.06L4.22 13.59a2.25 2.25 0 010-3.18L8.47 6.16a.75.75 0 111.06 1.06L5.28 11.47zM14.72 11.47a.75.75 0 000 1.06l-4.25 4.25a.75.75 0 101.06 1.06l4.25-4.25a2.25 2.25 0 000-3.18L11.53 6.16a.75.75 0 00-1.06 1.06l4.25 4.25z" clipRule="evenodd" />
  </svg>
);
*/