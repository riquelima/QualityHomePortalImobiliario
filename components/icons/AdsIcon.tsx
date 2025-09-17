
import React from 'react';

const AdsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
    >
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5h-1.5m-1.5 0h-3m-3.75 0H5.25c-.621 0-1.125.504-1.125 1.125V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.625c0-.621-.504-1.125-1.125-1.125h-3.375Z" 
    />
  </svg>
);

export default AdsIcon;
