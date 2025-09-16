import React from 'react';

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    {...props}
  >
    <path 
      fillRule="evenodd" 
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 13a1 1 0 112 0 1 1 0 01-2 0zm-1-8a1 1 0 011-1h.008a1 1 0 011 1v4a1 1 0 01-1 1h-.008a1 1 0 01-1-1V5z"
      clipRule="evenodd" 
    />
  </svg>
);

export default InfoIcon;