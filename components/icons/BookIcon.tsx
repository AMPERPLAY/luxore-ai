
import React from 'react';

interface IconProps {
  className?: string;
}

export const BookIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className}
  >
    <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 7.75A.75.75 0 012.75 7h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 7.75zM2 10.75A.75.75 0 012.75 10h11.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM15.75 2a.75.75 0 00-.75.75v11.5a.75.75 0 00.75.75h1.5a.75.75 0 00.75-.75V2.75a.75.75 0 00-.75-.75h-1.5z" clipRule="evenodd" />
    <path d="M5.929 2.542A.75.75 0 016.32 1.75h8.93a.75.75 0 01.715.526l.002.004.383 1.456A.75.75 0 0116 4.25v11.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V15a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v1.5a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75V4.25a.75.75 0 01.31-.585l.003-.002L5.929 2.542zM7.75 15V4.25h5.5V15h-5.5z" />
  </svg>
);