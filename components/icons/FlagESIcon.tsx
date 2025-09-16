
import React from 'react';

const FlagESIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 750 500"
    {...props}
  >
    <rect width="750" height="500" fill="#c60b1e"/>
    <rect y="125" width="750" height="250" fill="#ffc400"/>
  </svg>
);

export default FlagESIcon;
