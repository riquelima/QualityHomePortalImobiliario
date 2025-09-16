import React from 'react';

const FlagBRIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 900 600"
    {...props}
  >
    <rect width="900" height="600" fill="#009c3b"/>
    <path d="M450 90L90 300l360 210L810 300z" fill="#ffdf00"/>
    <circle cx="450" cy="300" r="105" fill="#002776"/>
  </svg>
);

export default FlagBRIcon;