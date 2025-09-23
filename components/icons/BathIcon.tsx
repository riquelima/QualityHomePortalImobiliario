
import React from 'react';

const BathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
        {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75H14.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75v3.75a3 3 0 003 3h1.5a3 3 0 003-3V3.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h7.5v7.5a3 3 0 01-3 3h-1.5a3 3 0 01-3-3v-7.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25v3" />
    </svg>
);

export default BathIcon;
