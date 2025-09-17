
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import CloseIcon from './icons/CloseIcon';
import InfoIcon from './icons/InfoIcon';
import FullScreenIcon from './icons/FullScreenIcon';

interface LocationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coordinates: { lat: number; lng: number }) => void;
  initialCoordinates: { lat: number; lng: number } | null;
}

const LocationConfirmationModal: React.FC<LocationConfirmationModalProps> = ({ isOpen, onClose, onConfirm, initialCoordinates }) => {
  const { t } = useLanguage();
  const modalContentRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const tileLayerInstance = useRef<any>(null);
  
  const [mapView, setMapView] = useState<'map' | 'satellite'>('map');
  const [markerPosition, setMarkerPosition] = useState(initialCoordinates);

  const mapLayerUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const satelliteLayerUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  useEffect(() => {
    if (isOpen && initialCoordinates && mapRef.current) {
        // Atraso para garantir que o DOM do modal esteja totalmente visível para o Leaflet calcular o tamanho
        setTimeout(() => {
            if (!mapRef.current) return;
            
            mapInstance.current = L.map(mapRef.current).setView([initialCoordinates.lat, initialCoordinates.lng], 18);
            
            tileLayerInstance.current = L.tileLayer(mapView === 'map' ? mapLayerUrl : satelliteLayerUrl).addTo(mapInstance.current);

            markerInstance.current = L.marker([initialCoordinates.lat, initialCoordinates.lng], {
                draggable: true,
            }).addTo(mapInstance.current);

            markerInstance.current.on('dragend', (event: any) => {
                const { lat, lng } = event.target.getLatLng();
                setMarkerPosition({ lat, lng });
            });
            
            setMarkerPosition(initialCoordinates);

        }, 100); 
    }

    return () => {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
            markerInstance.current = null;
        }
    };
  }, [isOpen, initialCoordinates]);

  useEffect(() => {
      if (tileLayerInstance.current) {
          tileLayerInstance.current.setUrl(mapView === 'map' ? mapLayerUrl : satelliteLayerUrl);
      }
  }, [mapView]);

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


  if (!isOpen) return null;

  const handleConfirm = () => {
    if(markerPosition) {
        onConfirm(markerPosition);
    }
  }

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
            <div ref={mapRef} className="w-full h-full" />
            <div className="absolute top-2 left-2 z-[400] bg-white rounded shadow-md">
                <button 
                    onClick={() => setMapView('map')} 
                    className={`px-3 py-1 text-sm font-medium rounded-l ${mapView === 'map' ? 'bg-brand-navy text-white' : 'bg-white text-brand-dark'}`}
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
             <button className="absolute top-2 right-2 z-[400] bg-white rounded p-2 shadow-md">
                <FullScreenIcon className="w-5 h-5 text-brand-dark" />
            </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6">
            <button
                onClick={handleConfirm}
                className="w-full sm:w-auto bg-[#93005a] hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-md transition duration-300 order-1 sm:order-2"
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
