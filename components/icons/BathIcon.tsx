
import React from 'react';

const BathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 18.75h16.5M13.5 6.75h3.75m-3.75 3h3.75m-3.75 3h3.75M9 6.75h1.5v3H9v-3Z" />
    </svg>
);

export default BathIcon;