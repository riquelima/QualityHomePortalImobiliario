
import React from 'react';

const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        d="M20.25 14.15v4.05a2.25 2.25 0 0 1-2.25 2.25h-12a2.25 2.25 0 0 1-2.25-2.25V14.15M12 18.375a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-1.5 0V19.125a.75.75 0 0 1 .75-.75Z" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 9.75a2.25 2.25 0 0 0-2.25 2.25v.008a2.25 2.25 0 0 0 4.5 0v-.008A2.25 2.25 0 0 0 12 9.75Zm.75-5.625A2.25 2.25 0 0 0 10.5 6h-3a2.25 2.25 0 0 0-2.25 2.25v3.75a2.25 2.25 0 0 0 2.25 2.25h3.75a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25h-1.5Z" 
    />
  </svg>
);

export default BriefcaseIcon;
