
import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';
import { useLanguage } from '../contexts/LanguageContext';
import type { User } from '../types';
import BoltIcon from './icons/BoltIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import LocationConfirmationModal from './LocationConfirmationModal';
import InfoIcon from './icons/InfoIcon';
import VerifiedIcon from './icons/VerifiedIcon';

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
  
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [isCitySuggestionsOpen, setIsCitySuggestionsOpen] = useState(false);
  const citySuggestionsRef = useRef<HTMLDivElement>(null);
  
  const [isAddressVerified, setIsAddressVerified] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState('');
  const [contactInfo, setContactInfo] = useState({ phone: '', preference: 'chat_and_phone' });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (citySuggestionsRef.current && !citySuggestionsRef.current.contains(event.target as Node)) {
        setIsCitySuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (address.city.length < 3) {
      setCitySuggestions([]);
      setIsCitySuggestionsOpen(false);
      return;
    }

    const getSuggestions = async () => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&city=${encodeURIComponent(address.city)}&countrycodes=br&limit=5&addressdetails=1`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
          const uniqueSuggestions = data.reduce((acc: any[], current: any) => {
              const displayName = current.display_name;
              if (!acc.some(item => item.display_name === displayName)) {
                  acc.push(current);
              }
              return acc;
          }, []);
          setCitySuggestions(uniqueSuggestions);
          setIsCitySuggestionsOpen(true);
        } else {
          setCitySuggestions([]);
          setIsCitySuggestionsOpen(false);
        }
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
        setCitySuggestions([]);
        setIsCitySuggestionsOpen(false);
      }
    };
    const handler = setTimeout(getSuggestions, 300);
    return () => clearTimeout(handler);
  }, [address.city]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };
  
  const handleSuggestionClick = (suggestion: { display_name: string }) => {
    setAddress(prev => ({ ...prev, city: suggestion.display_name }));
    setIsCitySuggestionsOpen(false);
  };

  const handleVerifyAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullAddress = `${address.street}, ${address.number}, ${address.city}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&countrycodes=br&limit=1`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setInitialCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setIsLocationModalOpen(true);
      } else {
        alert('Não foi possível encontrar o endereço. Verifique os dados e tente novamente.');
      }
    } catch (error) {
      console.error(`Geocoding failed for address: ${fullAddress}`, error);
      alert('Ocorreu um erro ao verificar o endereço. Tente novamente mais tarde.');
    }
  };

  const handleConfirmLocation = async (coords: { lat: number; lng: number }) => {
    setIsLocationModalOpen(false);
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.address) {
        const { road, house_number, city, town, village, suburb, state, postcode } = data.address;
        const street = road || '';
        const number = house_number || '';
        const locality = city || town || village || suburb || '';
        const fullLocality = `${locality}, ${state || ''}`.replace(/^, |,$/g, '').trim();
        const fullAddressString = `${street}, ${number}, ${fullLocality}, ${postcode || ''}`.replace(/, ,/g, ',').replace(/^, |,$/g, '').trim();
        setAddress({ city: fullLocality, street, number });
        setVerifiedAddress(fullAddressString);
        setIsAddressVerified(true);
      } else {
        alert('Não foi possível obter o endereço para a localização selecionada.');
      }
    } catch (error) {
        alert('Ocorreu um erro ao processar a localização.');
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };
  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo(prev => ({ ...prev, preference: e.target.value }));
  };
  const handleEditAddress = () => setIsAddressVerified(false);
  const handleContinueToDetails = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Continuando para a próxima etapa: Detalhes do Imóvel');
  };

  return (
    <>
      <div className="bg-brand-light-gray min-h-screen">
        <Header onPublishAdClick={onPublishAdClick} onAccessClick={onOpenLoginModal} user={user} onLogout={onLogout} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-4xl mx-auto mb-8">
              <div className="flex items-center text-sm sm:text-base">
                  <div className="relative flex-1 h-12 flex items-center justify-center bg-brand-dark text-white font-bold tracking-wide z-10">
                      <span>{t('publishJourney.stepper.step1')}</span>
                      <div className="absolute top-0 -right-6 h-full w-12 bg-brand-dark transform -skew-x-12 z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 75% 50%, 100% 100%, 0 100%)' }} />
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
            <div className="w-full lg:w-2/3">
              <h1 className="text-2xl font-bold text-brand-navy mb-8">{t('publishJourney.title')}</h1>
              <form className="space-y-8" onSubmit={!isAddressVerified ? handleVerifyAddress : handleContinueToDetails}>
                <div>
                  <label className="block text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.propertyType.label')}</label>
                  <select className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red">
                    <option>Apartamento</option>
                    <option>Casa</option>
                    <option>Terreno</option>
                    <option>Escritório</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.operation.label')}</label>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="operation" value="sell" checked={operation === 'sell'} onChange={() => setOperation('sell')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                      <span>Vender</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="operation" value="rent" checked={operation === 'rent'} onChange={() => setOperation('rent')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                      <span>Alugar</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="operation" value="season" checked={operation === 'season'} onChange={() => setOperation('season')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                      <span>Temporada</span>
                    </label>
                  </div>
                </div>
                {isAddressVerified ? (
                  <div>
                    <label className="block text-lg font-bold text-brand-navy mb-3">{t('publishJourney.verifiedAddress.label')}</label>
                    <div className="bg-green-50 p-4 border border-green-200 rounded-md flex justify-between items-center">
                      <div className="flex items-center">
                        <VerifiedIcon className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                        <p className="text-brand-dark">{verifiedAddress}</p>
                      </div>
                      <button type="button" onClick={handleEditAddress} className="text-brand-red hover:underline font-medium text-sm flex-shrink-0 ml-4">{t('publishJourney.verifiedAddress.edit')}</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.location.label')}</label>
                    <div className="space-y-4">
                      <div className="relative" ref={citySuggestionsRef}>
                        <label htmlFor="city" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.city')}</label>
                        <div className="relative">
                          <InfoIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          <input type="text" id="city" value={address.city} onChange={handleAddressChange} onFocus={() => { if (citySuggestions.length > 0) setIsCitySuggestionsOpen(true); }} className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" required autoComplete="off" />
                        </div>
                        {isCitySuggestionsOpen && citySuggestions.length > 0 && (
                          <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-md shadow-lg z-20">
                            {citySuggestions.map((s) => (
                              <button type="button" key={s.place_id} onClick={() => handleSuggestionClick(s)} className="w-full text-left px-4 py-3 text-brand-dark hover:bg-gray-100">{s.display_name}</button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="street" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.street')}</label>
                        <input type="text" id="street" value={address.street} onChange={handleAddressChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" required />
                      </div>
                      <div>
                        <label htmlFor="number" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.number')}</label>
                        <input type="text" id="number" value={address.number} onChange={handleAddressChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" required />
                      </div>
                    </div>
                  </div>
                )}
                {isAddressVerified && user && (
                  <div className="bg-white p-6 rounded-md border border-gray-200">
                    <h2 className="text-xl font-bold text-brand-navy mb-6">{t('publishJourney.contactDetails.title')}</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-brand-dark">{t('publishJourney.contactDetails.emailLabel')}</label>
                        <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md text-brand-gray">{user.email}</div>
                        <p className="text-xs text-brand-gray mt-1">{t('publishJourney.contactDetails.emailDescription')}</p>
                        <button type="button" onClick={onLogout} className="text-sm text-brand-red hover:underline mt-1">{t('publishJourney.contactDetails.changeAccount')}</button>
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-brand-dark">{t('publishJourney.contactDetails.phoneLabel')}</label>
                        <div className="flex mt-1">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">+55</span>
                          <input type="tel" id="phone" value={contactInfo.phone} onChange={handleContactChange} className="flex-1 w-full p-3 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder={t('publishJourney.contactDetails.phonePlaceholder')} />
                        </div>
                        <button type="button" className="text-sm text-brand-red hover:underline mt-1">{t('publishJourney.contactDetails.addPhone')}</button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark">{t('publishJourney.contactDetails.nameLabel')}</label>
                        <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md text-brand-gray">{user.name}</div>
                        <p className="text-xs text-brand-gray mt-1">{t('publishJourney.contactDetails.nameDescription')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.contactDetails.preferenceLabel')}</label>
                        <div className="space-y-3">
                          <div className="bg-gray-50 p-3 rounded-md border">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input type="radio" name="preference" value="chat_and_phone" checked={contactInfo.preference === 'chat_and_phone'} onChange={handlePreferenceChange} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/>
                              <div>
                                <p className="font-medium">{t('publishJourney.contactDetails.prefChatAndPhone')}</p>
                                <p className="text-xs text-brand-gray">{t('publishJourney.contactDetails.prefChatAndPhoneDesc')}</p>
                              </div>
                            </label>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md border">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input type="radio" name="preference" value="chat_only" checked={contactInfo.preference === 'chat_only'} onChange={handlePreferenceChange} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/>
                               <div>
                                <p className="font-medium">{t('publishJourney.contactDetails.prefChatOnly')}</p>
                                <p className="text-xs text-brand-gray">{t('publishJourney.contactDetails.prefChatOnlyDesc')}</p>
                              </div>
                            </label>
                          </div>
                           <div className="bg-gray-50 p-3 rounded-md border">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input type="radio" name="preference" value="phone_only" checked={contactInfo.preference === 'phone_only'} onChange={handlePreferenceChange} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/>
                              <p className="font-medium">{t('publishJourney.contactDetails.prefPhoneOnly')}</p>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.form.hideAddress.label')}</label>
                  <div className="flex items-center">
                      <input id="hide-address" type="checkbox" className="h-4 w-4 text-brand-red border-gray-300 rounded focus:ring-brand-red" />
                      <label htmlFor="hide-address" className="ml-2 block text-sm text-brand-dark">{t('publishJourney.form.hideAddress.option')}</label>
                  </div>
                </div>
                <div>
                  {!isAddressVerified ? (
                    <button type="submit" className="px-6 py-3 bg-gray-300 text-brand-dark font-bold rounded-md hover:bg-gray-400 transition-colors">
                      {t('publishJourney.form.submitButton')}
                    </button>
                  ) : (
                    <div className="text-center">
                      <button type="submit" className="w-full max-w-xs mx-auto px-6 py-3 bg-[#93005a] text-white font-bold rounded-md hover:opacity-90 transition-opacity">
                        {t('publishJourney.contactDetails.continueButton')}
                      </button>
                      <p className="text-sm text-brand-gray mt-2">{t('publishJourney.contactDetails.nextStepInfo')}</p>
                    </div>
                  )}
                </div>
              </form>
            </div>
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
