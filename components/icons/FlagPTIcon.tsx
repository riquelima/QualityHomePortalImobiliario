
import React from 'react';

const FlagPTIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 900 600"
    {...props}
  >
    <rect width="900" height="600" fill="#DA291C"/>
    <rect width="360" height="600" fill="#006241"/>
    <path d="M450 480a180 180 0 100-360 180 180 0 000 360z" fill="#F7F7F7"/>
    <path d="M450 450a150 150 0 100-300 150 150 0 000 300z" fill="#DA291C"/>
    <path d="M450 390a90 90 0 100-180 90 90 0 000 180z" fill="#F7F7F7"/>
    <path d="M450 360a60 60 0 100-120 60 60 0 000 120z" fill="#003893"/>
  </svg>
);

export default FlagPTIcon;