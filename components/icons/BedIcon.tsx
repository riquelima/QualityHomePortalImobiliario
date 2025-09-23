
import React from 'react';

const BedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18v4.5H3z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 16.5v3m15-3v3"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 9a2.25 2.25 0 012.25-2.25h9a2.25 2.25 0 012.25 2.25v3H5.25v-3z"/>
  </svg>
);

export default BedIcon;
