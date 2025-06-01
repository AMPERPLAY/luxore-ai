
import React from 'react';

interface IconProps {
  className?: string;
}

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.51 1.713-6.636 4.389-8.482zM10.029 4.3A8.495 8.495 0 006 7.5c0 4.69 3.81 8.5 8.5 8.5a8.495 8.495 0 003.201-1.029 8.97 8.97 0 01-3.463.69c-4.968 0-9-4.032-9-9a8.97 8.97 0 01.69-3.463z" clipRule="evenodd" />
  </svg>
);