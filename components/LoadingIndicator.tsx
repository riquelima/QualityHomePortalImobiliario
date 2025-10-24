import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SpinnerIcon from './icons/SpinnerIcon';

interface LoadingIndicatorProps {
  type?: 'initial' | 'loadMore' | 'refresh' | 'search';
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  type = 'initial', 
  message, 
  size = 'medium',
  showMessage = true 
}) => {
  const { t } = useLanguage();

  const getDefaultMessage = () => {
    switch (type) {
      case 'initial':
        return t('loading.initialLoad');
      case 'loadMore':
        return t('loading.loadingMore');
      case 'refresh':
        return t('loading.refreshing');
      case 'search':
        return t('loading.searching');
      default:
        return t('loading.general');
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getContainerClasses = () => {
    switch (type) {
      case 'loadMore':
        return 'flex items-center justify-center py-4';
      case 'initial':
        return 'flex flex-col items-center justify-center min-h-[200px] space-y-3';
      default:
        return 'flex items-center justify-center py-6 space-x-3';
    }
  };

  return (
    <div className={getContainerClasses()}>
      <SpinnerIcon className={`${getSizeClasses()} text-blue-600 animate-spin`} />
      {showMessage && (
        <p className={`text-gray-600 ${size === 'small' ? 'text-sm' : 'text-base'} ${type === 'initial' ? 'text-center' : ''}`}>
          {message || getDefaultMessage()}
        </p>
      )}
    </div>
  );
};

export default LoadingIndicator;