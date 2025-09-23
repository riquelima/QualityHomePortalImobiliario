
import React from 'react';

const AreaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
        {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25V15.75a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 15.75V8.25a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 8.25z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3.75m0 9.75V21" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3.75m9.75 0H21" />
    </svg>
);

export default AreaIcon;
