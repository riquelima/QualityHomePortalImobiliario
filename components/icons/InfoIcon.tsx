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
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 4a1 1 0 011-1h.01a1 1 0 01.99 1.25l-.01.05-1 5a1 1 0 01-1.98 0l-1-5 .01-.05A1 1 0 019 4zm1 10a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd" 
    />
  </svg>
);

export default InfoIcon;