
import React from 'react';

interface IconProps {
  className?: string;
}

export const MicrophoneIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
    <path d="M6 10.5a.75.75 0 01.75.75v.75a4.5 4.5 0 009 0v-.75a.75.75 0 011.5 0v.75a6 6 0 11-12 0v-.75A.75.75 0 016 10.5zM12 18.75a.75.75 0 000 1.5c1.458 0 2.807-.512 3.875-1.373a.75.75 0 00-.967-1.154C14.24 18.373 13.16 18.75 12 18.75zM12 18.75c-1.16 0-2.24-.377-2.908-.977a.75.75 0 10-.967 1.153C9.193 19.388 10.542 19.5 12 19.5a.75.75 0 000-1.5z" />
  </svg>
);
