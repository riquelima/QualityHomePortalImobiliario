
import React from 'react';

const BedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 14v-4c0-1.105-.895-2-2-2h-4a2 2 0 00-2 2v4"
    />
  </svg>
);

export default BedIcon;
