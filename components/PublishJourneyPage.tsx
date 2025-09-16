import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';
import { useLanguage } from '../contexts/LanguageContext';
import type { User } from '../types';
import BoltIcon from './icons/BoltIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import LocationConfirmationModal from './LocationConfirmationModal';

// Declara a variável global 'google' para o TypeScript, para evitar erros de compilação
declare const google: any;

interface PublishJourneyPageProps {
  onBack: () => void;
  onPublishAdClick: () => void;
  onOpenLoginModal: () => void;
  user: User | null;
  onLogout: () => void;
}

const PublishJourneyPage: React.FC<PublishJourneyPageProps> = ({ onBack, onPublishAdClick, onOpenLoginModal, user, onLogout }) => {
  const { t } = useLanguage();
  const [operation, setOperation] = useState('sell');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [address, setAddress] = useState({ city: '', street: '', number: '' });
  const [initialCoords, setInitialCoords] = useState<{ lat: number; lng: number } | null>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Verifica se o script do Google Maps foi carregado antes de inicializar o autocomplete
    if (typeof google !== 'undefined' && google.maps && cityInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(cityInputRef.current, {
        types: ['(cities)'],
        componentRestrictions: { country: 'br' },
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address) {
          // Nota: Isto atualiza o estado para consistência, mas o input em si não é controlado pelo React.
          // O widget do Google atualiza o valor do input diretamente no DOM.
          setAddress(prev => ({ ...prev, city: place.formatted_address }));
        }
      });
    }
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAddress(prev => ({ ...prev, [id]: value }));
  };

  const handleVerifyAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof google === 'undefined' || !google.maps) {
      alert('Ocorreu um erro ao carregar o mapa. Tente novamente.');
      return;
    }
    
    const geocoder = new google.maps.Geocoder();
    // Lê o valor da cidade diretamente do ref do input para obter o valor mais atualizado
    const cityValue = cityInputRef.current?.value || '';
    const fullAddress = `${address.street}, ${address.number}, ${cityValue}`;
    
    geocoder.geocode({ address: fullAddress, componentRestrictions: { country: 'BR' } }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        setInitialCoords({ lat: location.lat(), lng: location.lng() });
        setIsLocationModalOpen(true);
      } else {
        alert('Não foi possível encontrar o endereço. Verifique os dados e tente novamente.');
      }
    });
  };

  const handleConfirmLocation = (coords: { lat: number; lng: number }) => {
    console.log('Localização confirmada:', coords);
    // TODO: Salvar as coordenadas finais e avançar para a próxima etapa
    setIsLocationModalOpen(false);
  };

  return (
    <>
      <div className="bg-brand-light-gray min-h-screen">
        <Header onPublishAdClick={onPublishAdClick} onAccessClick={onOpenLoginModal} user={user} onLogout={onLogout} />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Stepper */}
          <div className="max-w-4xl mx-auto mb-8">
              <div className="flex items-center text-sm sm:text-base">
                  <div className="relative flex-1 h-12 flex items-center justify-center bg-brand-dark text-white font-bold tracking-wide z-10">
                      <span>{t('publishJourney.stepper.step1')}</span>
                      <div 
                          className="absolute top-0 -right-6 h-full w-12 bg-brand-dark transform -skew-x-12 z-0"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 75% 50%, 100% 100%, 0 100%)' }}
                      ></div>
                  </div>
                  <div className="flex-1 h-12 flex items-center justify-center bg-gray-200 text-brand-gray font-bold tracking-wide pl-6">
                      {t('publishJourney.stepper.step2')}
                  </div>
                  <div className="flex-1 h-12 flex items-center justify-center bg-gray-200 text-brand-gray font-bold tracking-wide">
                      {t('publishJourney.stepper.step3')}
                  </div>
              </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Form Section */}
            <div className="w-full lg:w-2/3">
              <h1 className="text-2xl font-bold text-brand-navy mb-8">{t('publishJourney.title')}</h1>
              <form className="space-y-8" onSubmit={handleVerifyAddress}>
                {/* Property Type */}
                <div>
                  <label className="block text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.propertyType.label')}</label>
                  <select className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red">
                    <option>{t('publishJourney.form.propertyType.apartment')}</option>
                    <option>{t('publishJourney.form.propertyType.house')}</option>
                    <option>{t('publishJourney.form.propertyType.land')}</option>
                    <option>{t('publishJourney.form.propertyType.office')}</option>
                  </select>
                </div>

                {/* Operation */}
                <div>
                  <label className="block text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.operation.label')}</label>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="operation" 
                        value="sell" 
                        checked={operation === 'sell'}
                        onChange={() => setOperation('sell')}
                        className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"
                      />
                      <span>{t('publishJourney.form.operation.sell')}</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="operation" 
                        value="rent"
                        checked={operation === 'rent'}
                        onChange={() => setOperation('rent')}
                        className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"
                      />
                      <span>{t('publishJourney.form.operation.rent')}</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="operation" 
                        value="season"
                        checked={operation === 'season'}
                        onChange={() => setOperation('season')}
                        className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"
                      />
                      <span>{t('publishJourney.form.operation.season')}</span>
                    </label>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.location.label')}</label>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.city')}</label>
                      <input 
                        type="text" 
                        id="city" 
                        ref={cityInputRef} 
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" 
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.street')}</label>
                      <input 
                        type="text" 
                        id="street" 
                        value={address.street} 
                        onChange={handleAddressChange} 
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" 
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="number" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.number')}</label>
                      <input 
                        type="text" 
                        id="number" 
                        value={address.number} 
                        onChange={handleAddressChange} 
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" 
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Hide Address */}
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.form.hideAddress.label')}</label>
                  <div className="flex items-center">
                      <input id="hide-address" type="checkbox" className="h-4 w-4 text-brand-red border-gray-300 rounded focus:ring-brand-red" />
                      <label htmlFor="hide-address" className="ml-2 block text-sm text-brand-dark">
                          {t('publishJourney.form.hideAddress.option')}
                      </label>
                  </div>
                </div>

                {/* Submit */}
                <div>
                  <button type="submit" className="px-6 py-3 bg-gray-300 text-brand-dark font-bold rounded-md hover:bg-gray-400 transition-colors">
                    {t('publishJourney.form.submitButton')}
                  </button>
                </div>

              </form>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-1/3">
              <div className="bg-white p-6 border border-gray-200 rounded-lg space-y-4 text-sm">
                  <h2 className="text-lg font-bold text-brand-navy">{t('publishJourney.sidebar.title')}</h2>
                  <p>{t('publishJourney.sidebar.p1')}</p>
                  <p>{t('publishJourney.sidebar.p2')}</p>
                  <p>{t('publishJourney.sidebar.p3')}</p>
                  <p>{t('publishJourney.sidebar.p4')}</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                      <li>{t('publishJourney.sidebar.case1')}</li>
                      <li>{t('publishJourney.sidebar.case2')}</li>
                      <li>{t('publishJourney.sidebar.case3')}</li>
                      <li>{t('publishJourney.sidebar.case4')}</li>
                  </ul>
                  <div className="border-t pt-4 space-y-4">
                      <div className="flex items-start space-x-3">
                          <BoltIcon className="w-6 h-6 text-brand-navy flex-shrink-0 mt-1"/>
                          <div>
                              <h3 className="font-bold">{t('publishJourney.sidebar.quickSell.title')}</h3>
                              <a href="#" className="text-brand-red hover:underline">{t('publishJourney.sidebar.quickSell.link')}</a>
                          </div>
                      </div>
                      <div className="flex items-start space-x-3">
                          <BriefcaseIcon className="w-6 h-6 text-brand-navy flex-shrink-0 mt-1"/>
                          <div>
                              <h3 className="font-bold">{t('publishJourney.sidebar.professional.title')}</h3>
                              <a href="#" className="text-brand-red hover:underline">{t('publishJourney.sidebar.professional.link')}</a>
                          </div>
                      </div>
                  </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
      <LocationConfirmationModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={handleConfirmLocation}
        initialCoordinates={initialCoords}
      />
    </>
  );
};

export default PublishJourneyPage;