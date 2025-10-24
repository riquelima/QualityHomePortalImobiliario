import React from 'react';

interface ZoomOutIconProps {
  className?: string;
}

const ZoomOutIcon: React.FC<ZoomOutIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" 
      />
    </svg>
  );
};

export default ZoomOutIcon;