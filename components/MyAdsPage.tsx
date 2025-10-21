import React, { useEffect } from 'react';
import type { Property } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import AdminLayout from './admin/AdminLayout';
import CloseIcon from './icons/CloseIcon';
import SuccessIcon from './icons/SuccessIcon';

interface MyAdsPageProps {
  onBack: () => void;
  properties: Property[];
  onViewDetails: (id: number) => void;
  onDeleteProperty: (id: number) => void;
  onEditProperty: (property: Property) => void;
  onPublishClick: () => void;
  onAdminLogout: () => void;
  onShareProperty: (id: number) => void;
  showSuccessBanner?: 'published' | 'updated';
  onDismissSuccessBanner: () => void;
  adminUser: any;
  onAddProperty: () => Promise<void>;
  onUpdateProperty: () => Promise<void>;
  onPublishError: (message: string) => void;
  propertyToEdit?: Property | null;
}

const MyAdsPage: React.FC<MyAdsPageProps> = ({
  onBack,
  properties,
  onViewDetails,
  onDeleteProperty,
  onEditProperty,
  onPublishClick,
  onAdminLogout,
  onShareProperty,
  showSuccessBanner,
  onDismissSuccessBanner,
  adminUser,
  onAddProperty,
  onUpdateProperty,
  onPublishError,
  propertyToEdit
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (showSuccessBanner) {
      const timer = setTimeout(() => {
        onDismissSuccessBanner();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessBanner, onDismissSuccessBanner]);

  const handlePublishSuccess = (status: 'published' | 'updated') => {
    // Trigger the success banner
    onDismissSuccessBanner(); // Clear any existing banner first
    // The parent component should handle showing the new banner
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SuccessIcon className="w-5 h-5 text-green-400 mr-3" />
              <p className="text-green-700">
                {showSuccessBanner === 'published' 
                  ? t('publishJourney.adPublishedSuccess')
                  : 'Anúncio atualizado com sucesso!'
                }
              </p>
            </div>
            <button
              onClick={onDismissSuccessBanner}
              className="text-green-400 hover:text-green-600"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <AdminLayout
        properties={properties}
        onViewDetails={onViewDetails}
        onDeleteProperty={onDeleteProperty}
        onEditProperty={onEditProperty}
        onPublishClick={onPublishClick}
        onAdminLogout={onAdminLogout}
        onShareProperty={onShareProperty}
        adminUser={adminUser}
        onAddProperty={onAddProperty}
        onUpdateProperty={onUpdateProperty}
        onPublishError={onPublishError}
        onPublishSuccess={handlePublishSuccess}
        propertyToEdit={propertyToEdit}
        onBack={onBack}
      />
    </div>
  );
};

export default MyAdsPage;
