
import React from 'react';

interface BedIconProps extends React.HTMLAttributes<HTMLImageElement> {
  className?: string;
}

const BedIcon: React.FC<BedIconProps> = ({ className, style, ...props }) => {
  // Função para converter classe de cor em filtro CSS
  const getColorFilter = (className: string) => {
    if (className?.includes('text-red-600')) {
      return 'brightness(0) saturate(100%) invert(17%) sepia(95%) saturate(7471%) hue-rotate(356deg) brightness(91%) contrast(135%)';
    }
    if (className?.includes('text-blue-900')) {
      return 'brightness(0) saturate(100%) invert(12%) sepia(87%) saturate(4466%) hue-rotate(224deg) brightness(89%) contrast(107%)';
    }
    return 'brightness(0) saturate(100%)'; // Preto por padrão
  };

  return (
    <img
      src="https://static.thenounproject.com/png/bedroom-icon-7701005-512.png"
      alt="Quartos"
      className={className}
      style={{ 
        filter: getColorFilter(className || ''),
        ...style 
      }}
      {...props}
    />
  );
};

export default BedIcon;