
import React from 'react';

const PlanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M3.75 21h16.5M3.75 3h16.5M3.75 12h16.5m-16.5 3.75h16.5M3.75 8.25h16.5m-16.5-3.75h16.5M9 3v18m6-18v18" 
    />
  </svg>
);

export default PlanIcon;
