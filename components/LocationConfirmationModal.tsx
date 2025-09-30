

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useLanguage } from '../contexts/LanguageContext';
import CloseIcon from './icons/CloseIcon';
import InfoIcon from './icons/InfoIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface LocationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coordinates: { lat: number; lng: number }) => void;
  initialCoordinates: { lat: number; lng: number } | null;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const libraries: ('drawing' | 'places' | 'visualization')[] = ['drawing', 'places', 'visualization'];

const LocationConfirmationModal: React.FC<LocationConfirmationModalProps> = ({ isOpen, onClose, onConfirm, initialCoordinates }) => {
  const { t } = useLanguage();
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [markerPosition, setMarkerPosition] = useState(initialCoordinates);
  const [mapView, setMapView] = useState<'roadmap' | 'satellite'>('roadmap');

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-confirmation',
    // FIX: Use process.env for environment variables.
    googleMapsApiKey: process.env.VITE_MAPS_KEY!,
    libraries,
  });

  useEffect(() => {
    if (isOpen) {
      setMarkerPosition(initialCoordinates);
    }
  }, [isOpen, initialCoordinates]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // FIX: Replace google.maps.MapMouseEvent with any to resolve missing namespace error.
  const onMarkerDragEnd = useCallback((event: any) => {
    if (event.latLng) {
      setMarkerPosition({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    }
  }, []);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (markerPosition) {
      onConfirm(markerPosition);
    }
  };

  const renderMap = () => {
    if (loadError) {
      return <div>Error loading maps</div>;
    }
    if (!isLoaded || !initialCoordinates) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <SpinnerIcon className="w-12 h-12 text-brand-gray animate-spin" />
        </div>
      );
    }
    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialCoordinates}
        zoom={18}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
          mapTypeId: mapView
        }}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
          />
        )}
      </GoogleMap>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" role="dialog" aria-modal="true">
      <div ref={modalContentRef} className="bg-white rounded-lg shadow-xl w-11/12 max-w-3xl h-[90vh] max-h-[700px] flex flex-col p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">{t('publishJourney.locationConfirmationModal.title')}</h2>
            <p className="text-sm text-brand-gray">{t('publishJourney.locationConfirmationModal.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-4">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 text-sm flex items-center space-x-2 mb-4">
            <InfoIcon className="w-5 h-5 flex-shrink-0" />
            <span>{t('publishJourney.locationConfirmationModal.countryInfo')}</span>
        </div>

        <div className="relative flex-grow bg-gray-200 rounded overflow-hidden">
            {renderMap()}
            <div className="absolute top-2 left-2 z-[1] bg-white rounded shadow-md">
                <button 
                    onClick={() => setMapView('roadmap')} 
                    className={`px-3 py-1 text-sm font-medium rounded-l ${mapView === 'roadmap' ? 'bg-brand-navy text-white' : 'bg-white text-brand-dark'}`}
                >
                    Mapa
                </button>
                <button 
                    onClick={() => setMapView('satellite')} 
                    className={`px-3 py-1 text-sm font-medium rounded-r ${mapView === 'satellite' ? 'bg-brand-navy text-white' : 'bg-white text-brand-dark'}`}
                >
                    Satélite
                </button>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6">
            <button
                onClick={handleConfirm}
                className="w-full sm:w-auto bg-brand-red hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-md transition duration-300 order-1 sm:order-2"
            >
                {t('publishJourney.locationConfirmationModal.confirmButton')}
            </button>
             <button onClick={onClose} className="w-full sm:w-auto text-brand-dark hover:underline mt-4 sm:mt-0 order-2 sm:order-1">
                {t('publishJourney.locationConfirmationModal.backButton')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LocationConfirmationModal;
