
import React from 'react';

interface IconProps {
  className?: string;
}

export const CopyIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.121A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
    <path d="M4.5 6A1.5 1.5 0 003 7.5v10A1.5 1.5 0 004.5 19h8a1.5 1.5 0 001.5-1.5v-5.5a.75.75 0 00-1.5 0V17.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-10a.5.5 0 01.5-.5h3.5a.75.75 0 000-1.5h-3.5z" />
  </svg>
);