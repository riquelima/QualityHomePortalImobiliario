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
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 011-1h.01a1 1 0 011 1v4a1 1 0 01-1 1h-.01a1 1 0 01-1-1V7zm1 7a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd" 
    />
  </svg>
);

export default InfoIcon;