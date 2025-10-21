import React from 'react';

interface GestureIndicatorProps {
  type: 'swipe-back' | 'swipe-next' | 'swipe-prev' | 'pull-refresh';
  isActive: boolean;
  progress?: number; // 0 to 1
  className?: string;
}

const GestureIndicator: React.FC<GestureIndicatorProps> = ({ 
  type, 
  isActive, 
  progress = 0, 
  className = '' 
}) => {
  if (!isActive) return null;

  const getIndicatorContent = () => {
    switch (type) {
      case 'swipe-back':
        return (
          <div className="flex items-center gap-2 text-white">
            <div className="flex">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full mx-0.5 animate-pulse"
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    opacity: progress > (i * 0.33) ? 1 : 0.3 
                  }}
                />
              ))}
            </div>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Deslize para voltar</span>
          </div>
        );
      
      case 'swipe-next':
        return (
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-medium">Próxima</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full mx-0.5 animate-pulse"
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    opacity: progress > (i * 0.33) ? 1 : 0.3 
                  }}
                />
              ))}
            </div>
          </div>
        );
      
      case 'swipe-prev':
        return (
          <div className="flex items-center gap-2 text-white">
            <div className="flex">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full mx-0.5 animate-pulse"
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    opacity: progress > (i * 0.33) ? 1 : 0.3 
                  }}
                />
              ))}
            </div>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Anterior</span>
          </div>
        );
      
      case 'pull-refresh':
        return (
          <div className="flex items-center gap-2 text-white">
            <svg 
              className={`w-6 h-6 ${progress >= 1 ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            <span className="text-sm font-medium">
              {progress >= 1 ? 'Atualizando...' : 'Puxe para atualizar'}
            </span>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={`
        fixed z-50 bg-black bg-opacity-70 backdrop-blur-sm rounded-full px-4 py-2 
        transition-all duration-300 transform
        ${type === 'swipe-back' ? 'left-4 top-1/2 -translate-y-1/2' : ''}
        ${type === 'swipe-next' ? 'right-4 top-1/2 -translate-y-1/2' : ''}
        ${type === 'swipe-prev' ? 'left-4 top-1/2 -translate-y-1/2' : ''}
        ${type === 'pull-refresh' ? 'top-4 left-1/2 -translate-x-1/2' : ''}
        ${className}
      `}
      style={{
        opacity: Math.min(progress * 2, 1),
        transform: `
          ${type === 'swipe-back' ? 'translateY(-50%) translateX(' + (progress * 20 - 20) + 'px)' : ''}
          ${type === 'swipe-next' ? 'translateY(-50%) translateX(' + (20 - progress * 20) + 'px)' : ''}
          ${type === 'swipe-prev' ? 'translateY(-50%) translateX(' + (progress * 20 - 20) + 'px)' : ''}
          ${type === 'pull-refresh' ? 'translateX(-50%) translateY(' + (progress * 10 - 10) + 'px)' : ''}
        `
      }}
    >
      {getIndicatorContent()}
    </div>
  );
};

export default GestureIndicator;