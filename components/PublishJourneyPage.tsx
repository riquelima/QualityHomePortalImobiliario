

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './Header';
import { useLanguage } from '../contexts/LanguageContext';
import type { User, Property, Profile } from '../types';
import BoltIcon from './icons/BoltIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import LocationConfirmationModal from './LocationConfirmationModal';
import VerifiedIcon from './icons/VerifiedIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import CheckIcon from './icons/CheckIcon';
import PhotoIcon from './icons/PhotoIcon';
import PlanIcon from './icons/PlanIcon';
import VideoIcon from './icons/VideoIcon';
import { supabase } from '../supabaseClient';
import CloseIcon from './icons/CloseIcon';
// FIX: Import InfoIcon component to resolve 'Cannot find name' error.
import InfoIcon from './icons/InfoIcon';


interface PublishJourneyPageProps {
  onBack: () => void;
  onPublishAdClick: () => void;
  onOpenLoginModal: () => void;
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
  onNavigateToFavorites: () => void;
  onAddProperty: (propertyData: Property) => void;
  onNavigateToChatList: () => void;
  // FIX: Add onNavigateToMyAds prop to resolve typing error.
  onNavigateToMyAds: () => void;
}

// Define state shapes for props
interface AddressState { city: string; street: string; number: string; }
interface ContactInfoState { phone: string; preference: string; name: string; }
interface DetailsState {
    title: string;
    propertyType: string[];
    condition: string;
    grossArea: string;
    netArea: string;
    bedrooms: number;
    bathrooms: number;
    hasElevator: boolean | null;
    homeFeatures: string[];
    buildingFeatures: string[];
    price: string;
    condoFee: string;
    saleSituation: string;
    description: string;
}

// Props for Step1Form
interface Step1FormProps {
  isAddressVerified: boolean;
  handleVerifyAddress: (e: React.FormEvent) => Promise<void>;
  handleContinueToDetails: (e: React.FormEvent) => void;
  operation: string;
  setOperation: (op: string) => void;
  address: AddressState;
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  citySuggestionsRef: React.RefObject<HTMLDivElement>;
  isCitySuggestionsOpen: boolean;
  setIsCitySuggestionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  citySuggestions: any[];
  handleSuggestionClick: (suggestion: any) => void;
  verifiedAddress: string;
  handleEditAddress: () => void;
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
  contactInfo: ContactInfoState;
  handleContactChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePreferenceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Step1Form: React.FC<Step1FormProps> = ({
    isAddressVerified,
    handleVerifyAddress,
    handleContinueToDetails,
    operation,
    setOperation,
    address,
    handleAddressChange,
    citySuggestionsRef,
    isCitySuggestionsOpen,
    setIsCitySuggestionsOpen,
    citySuggestions,
    handleSuggestionClick,
    verifiedAddress,
    handleEditAddress,
    user,
    profile,
    onLogout,
    contactInfo,
    handleContactChange,
    handlePreferenceChange
}) => {
    const { t } = useLanguage();

    return (
        <form className="space-y-8" onSubmit={!isAddressVerified ? handleVerifyAddress : handleContinueToDetails}>
            <div>
                <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.propertyType.label')}</label>
                <select className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red">
                <option>Apartamento</option>
                <option>Casa</option>
                <option>Terreno</option>
                <option>Escritório</option>
                </select>
            </div>
            <div>
                <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.operation.label')}</label>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="operation" value="venda" checked={operation === 'venda'} onChange={() => setOperation('venda')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                    <span>Vender</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="operation" value="aluguel" checked={operation === 'aluguel'} onChange={() => setOperation('aluguel')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                    <span>Alugar</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="operation" value="temporada" checked={operation === 'temporada'} onChange={() => setOperation('temporada')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                    <span>Temporada</span>
                </label>
                </div>
            </div>
            {isAddressVerified ? (
                <div>
                <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.verifiedAddress.label')}</label>
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
                <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.location.label')}</label>
                <div className="space-y-4">
                    <div className="relative" ref={citySuggestionsRef}>
                    <label htmlFor="city" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.city')}</label>
                    <div className="relative">
                        <input type="text" id="city" value={address.city} onChange={handleAddressChange} onFocus={() => { if (citySuggestions.length > 0) setIsCitySuggestionsOpen(true); }} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" required autoComplete="off" />
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
                        <label htmlFor="name" className="block text-sm font-medium text-brand-dark">{t('publishJourney.contactDetails.nameLabel')}</label>
                        <input
                            type="text"
                            id="name"
                            value={contactInfo.name}
                            onChange={handleContactChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red"
                            required
                        />
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
    )
};


// Props for Step2Details
interface Step2DetailsProps {
    details: DetailsState;
    handleDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>, field: keyof DetailsState) => void;
    handleCounterChange: (field: 'bedrooms' | 'bathrooms', amount: number) => void;
    handleContinueToPhotos: (e: React.FormEvent) => void;
    setDetails: React.Dispatch<React.SetStateAction<DetailsState>>;
}

const Step2Details: React.FC<Step2DetailsProps> = ({
    details,
    handleDetailsChange,
    handleCheckboxChange,
    handleCounterChange,
    handleContinueToPhotos,
    setDetails
}) => {
    const { t } = useLanguage();
    return (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-md border border-gray-200">
            <h2 className="text-base sm:text-lg font-bold text-brand-navy mb-4">{t('publishJourney.detailsForm.title')}</h2>
            
            <form className="space-y-8" onSubmit={handleContinueToPhotos}>

                 {/* Título do Anúncio */}
                <div className="space-y-6 border-b pb-8">
                     <h3 className="text-lg sm:text-xl font-bold text-brand-dark">{t('publishJourney.detailsForm.adTitle')}</h3>
                     <div>
                        <label htmlFor="title" className="sr-only">{t('publishJourney.detailsForm.adTitle')}</label>
                        <input 
                            type="text" 
                            id="title" 
                            name="title" 
                            value={details.title} 
                            onChange={handleDetailsChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red"
                            placeholder={t('publishJourney.detailsForm.adTitlePlaceholder')}
                            required
                        />
                    </div>
                </div>


                {/* Características do apartamento */}
                <div className="space-y-6 border-b pb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-brand-dark">{t('publishJourney.detailsForm.apartmentCharacteristics')}</h3>
                    
                    {/* Tipo de Imóvel */}
                    <div>
                        <label className="block text-base sm:text-md font-semibold text-brand-navy mb-3">{t('publishJourney.detailsForm.propertyType')}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {['apartment', 'house', 'room', 'office', 'land'].map(type => (
                                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" value={type} checked={details.propertyType.includes(type)} onChange={(e) => handleCheckboxChange(e, 'propertyType')} className="h-4 w-4 text-brand-red border-gray-300 rounded focus:ring-brand-red" />
                                    <span>{t(`publishJourney.detailsForm.${type}`)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="block text-base sm:text-md font-semibold text-brand-navy mb-3">{t('publishJourney.detailsForm.condition')}</label>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="condition" value="for_renovation" checked={details.condition === 'for_renovation'} onChange={handleDetailsChange} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                                <span>{t('publishJourney.detailsForm.forRenovation')}</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="condition" value="good_condition" checked={details.condition === 'good_condition'} onChange={handleDetailsChange} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                                <span>{t('publishJourney.detailsForm.goodCondition')}</span>
                            </label>
                        </div>
                    </div>

                    {/* Área */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="grossArea" className="block text-base sm:text-md font-semibold text-brand-navy mb-2">{t('publishJourney.detailsForm.grossArea')}</label>
                            <div className="relative">
                                <input type="number" id="grossArea" name="grossArea" value={details.grossArea} onChange={handleDetailsChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">m²</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="netArea" className="block text-base sm:text-md font-semibold text-brand-navy mb-2">{t('publishJourney.detailsForm.netArea')}</label>
                            <div className="relative">
                                <input type="number" id="netArea" name="netArea" value={details.netArea} onChange={handleDetailsChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">m²</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Quartos e Banheiros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-base sm:text-md font-semibold text-brand-navy mb-2">{t('publishJourney.detailsForm.bedrooms')}</label>
                            <div className="flex items-center space-x-3">
                                <button type="button" onClick={() => handleCounterChange('bedrooms', -1)} className="p-2 border rounded-md hover:bg-gray-100"><MinusIcon className="w-5 h-5"/></button>
                                <span className="text-lg font-bold w-12 text-center">{details.bedrooms}</span>
                                <button type="button" onClick={() => handleCounterChange('bedrooms', 1)} className="p-2 border rounded-md hover:bg-gray-100"><PlusIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-base sm:text-md font-semibold text-brand-navy mb-2">{t('publishJourney.detailsForm.bathrooms')}</label>
                            <div className="flex items-center space-x-3">
                                <button type="button" onClick={() => handleCounterChange('bathrooms', -1)} className="p-2 border rounded-md hover:bg-gray-100"><MinusIcon className="w-5 h-5"/></button>
                                <span className="text-lg font-bold w-12 text-center">{details.bathrooms}</span>
                                <button type="button" onClick={() => handleCounterChange('bathrooms', 1)} className="p-2 border rounded-md hover:bg-gray-100"><PlusIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>

                    {/* Elevador */}
                    <div>
                        <label className="block text-base sm:text-md font-semibold text-brand-navy mb-3">{t('publishJourney.detailsForm.hasElevator')}</label>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="hasElevator" value="yes" checked={details.hasElevator === true} onChange={() => setDetails(p => ({...p, hasElevator: true}))} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                                <span>{t('publishJourney.detailsForm.yes')}</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="hasElevator" value="no" checked={details.hasElevator === false} onChange={() => setDetails(p => ({...p, hasElevator: false}))} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                                <span>{t('publishJourney.detailsForm.no')}</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Outras Características */}
                <div className="space-y-6 border-b pb-8">
                    <div>
                        <label className="block text-base sm:text-md font-semibold text-brand-navy mb-3">{t('publishJourney.detailsForm.otherHomeFeatures')}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {['builtInWardrobes', 'airConditioning', 'terrace', 'balcony', 'garage', 'mobiliado', 'cozinhaEquipada', 'suite', 'escritorio'].map(f => (
                                <label key={f} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" value={f} checked={details.homeFeatures.includes(f)} onChange={(e) => handleCheckboxChange(e, 'homeFeatures')} className="h-4 w-4 text-brand-red border-gray-300 rounded focus:ring-brand-red" />
                                    <span>{t(`publishJourney.detailsForm.${f}`)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-base sm:text-md font-semibold text-brand-navy mb-3">{t('publishJourney.detailsForm.otherBuildingFeatures')}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {['pool', 'greenArea', 'portaria24h', 'academia', 'salaoDeFestas', 'churrasqueira', 'parqueInfantil', 'quadraEsportiva', 'sauna', 'espacoGourmet'].map(f => (
                                <label key={f} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" value={f} checked={details.buildingFeatures.includes(f)} onChange={(e) => handleCheckboxChange(e, 'buildingFeatures')} className="h-4 w-4 text-brand-red border-gray-300 rounded focus:ring-brand-red" />
                                    <span>{t(`publishJourney.detailsForm.${f}`)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button type="button" className="text-brand-red font-semibold hover:underline">{t('publishJourney.detailsForm.showMoreDetails')}</button>
                </div>
                
                {/* Preço */}
                <div className="space-y-6 border-b pb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-brand-dark">{t('publishJourney.detailsForm.propertyPrice')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-base sm:text-md font-semibold text-brand-navy mb-2">{t('publishJourney.detailsForm.price')}</label>
                            <div className="relative">
                                <input type="number" id="price" name="price" value={details.price} onChange={handleDetailsChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.price')}</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="condoFee" className="block text-base sm:text-md font-semibold text-brand-navy mb-2">{t('publishJourney.detailsForm.condoFee')}</label>
                            <div className="relative">
                                <input type="number" id="condoFee" name="condoFee" value={details.condoFee} onChange={handleDetailsChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.fee')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Situação e Descrição */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-base sm:text-md font-semibold text-brand-navy mb-3">{t('publishJourney.detailsForm.saleSituation')}</label>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="saleSituation" value="rented" checked={details.saleSituation === 'rented'} onChange={handleDetailsChange} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                                <span>{t('publishJourney.detailsForm.rentedWithTenants')}</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="saleSituation" value="vacant" checked={details.saleSituation === 'vacant'} onChange={handleDetailsChange} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                                <span>{t('publishJourney.detailsForm.withoutTenants')}</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-base sm:text-md font-semibold text-brand-navy mb-2">{t('publishJourney.detailsForm.adDescription')}</label>
                        <textarea id="description" name="description" rows={5} value={details.description} onChange={handleDetailsChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder={t('publishJourney.detailsForm.descriptionPlaceholder')}></textarea>
                    </div>
                </div>

                <div className="text-center pt-4">
                    <button type="submit" className="w-full max-w-xs mx-auto px-6 py-3 bg-[#93005a] text-white font-bold rounded-md hover:opacity-90 transition-opacity">
                        {t('publishJourney.detailsForm.continueToPhotosButton')}
                    </button>
                </div>

            </form>
        </div>
    );
};

interface Step3PhotosProps {
  onBack: () => void;
  onFinish: () => Promise<void>;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isPublishing: boolean;
}

const Step3Photos: React.FC<Step3PhotosProps> = ({ onBack, onFinish, files, setFiles, isPublishing }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    
    useEffect(() => {
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);

        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(prev => [...prev, ...Array.from(event.target.files!)]);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files) {
            setFiles(prev => [...prev, ...Array.from(event.dataTransfer.files)]);
        }
    };
    
    const handleRemoveFile = (indexToRemove: number) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const hasFiles = files.length > 0;

    return (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-md border border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-brand-dark mb-4">{t('publishJourney.photosForm.title')}</h2>

            <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center mb-6 cursor-pointer hover:border-brand-red transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex justify-center items-center space-x-2 mb-4 pointer-events-none">
                     <div className="relative transform -rotate-12"><PhotoIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" /></div>
                    <div className="relative"><PlanIcon className="w-20 h-20 sm:w-24 sm:h-24 text-gray-400" /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><PlusIcon className="w-8 h-8 text-gray-500 bg-white rounded-full p-1" /></div></div>
                    <div className="relative transform rotate-12"><VideoIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" /></div>
                </div>
                <p className="text-brand-gray mb-4 pointer-events-none">{t('publishJourney.photosForm.dragAndDrop')}</p>
                <button type="button" className="px-6 py-3 bg-[#93005a] text-white font-bold rounded-md hover:opacity-90 transition-opacity pointer-events-none">
                    {t('publishJourney.photosForm.addButton')}
                </button>
            </div>
            
            {hasFiles && (
                <div className="mb-6">
                    <h3 className="text-base font-semibold text-brand-navy mb-3">Pré-visualização:</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {previews.map((src, index) => (
                            <div key={index} className="relative aspect-square group">
                                {files[index].type.startsWith('video') ? (
                                    <video src={src} className="w-full h-full object-cover rounded-md bg-black" />
                                ) : (
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleRemoveFile(index)}
                                        className="text-white bg-brand-red/80 rounded-full p-1.5 hover:bg-brand-red"
                                        title={t('publishJourney.photosForm.removeFile')}
                                    >
                                        <CloseIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md text-sm mb-8 flex items-start space-x-3">
                <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{t('publishJourney.photosForm.limitsInfo')}</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-brand-navy">{t('publishJourney.photosForm.rememberTitle')}</h3>
                <ul className="space-y-3 text-brand-dark list-disc list-inside text-sm">
                    <li>{t('publishJourney.photosForm.tip1')}</li>
                    <li>{t('publishJourney.photosForm.tip2')}</li>
                    <li>{t('publishJourney.photosForm.tip3')}</li>
                </ul>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-10 pt-6 border-t">
                <button onClick={onBack} type="button" className="text-brand-dark font-medium hover:underline mt-4 sm:mt-0" disabled={isPublishing}>
                    {t('publishJourney.photosForm.backButton')}
                </button>
                <button onClick={onFinish} type="button" className="px-6 py-3 bg-gray-200 text-brand-dark font-bold rounded-md hover:bg-gray-300 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={isPublishing}>
                    {isPublishing ? t('publishJourney.photosForm.publishingButton') : (hasFiles ? t('publishJourney.photosForm.publishButton') : t('publishJourney.photosForm.continueButton'))}
                </button>
            </div>
        </div>
    );
};


const PublishJourneyPage: React.FC<PublishJourneyPageProps> = ({ onBack, onPublishAdClick, onOpenLoginModal, user, profile, onLogout, onNavigateToFavorites, onAddProperty, onNavigateToChatList, onNavigateToMyAds }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 State
  const [operation, setOperation] = useState('venda');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [address, setAddress] = useState<AddressState>({ city: '', street: '', number: '' });
  const [initialCoords, setInitialCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [isCitySuggestionsOpen, setIsCitySuggestionsOpen] = useState(false);
  const citySuggestionsRef = useRef<HTMLDivElement>(null);
  const [isAddressVerified, setIsAddressVerified] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState('');
  const [contactInfo, setContactInfo] = useState<ContactInfoState>({ phone: '', preference: 'chat_and_phone', name: '' });

  // Step 2 State
  const [details, setDetails] = useState<DetailsState>({
    title: '',
    propertyType: [] as string[],
    condition: '',
    grossArea: '',
    netArea: '',
    bedrooms: 0,
    bathrooms: 1,
    hasElevator: null as boolean | null,
    homeFeatures: [] as string[],
    buildingFeatures: [] as string[],
    price: '',
    condoFee: '',
    saleSituation: '',
    description: ''
  });

  // Step 3 State
  const [files, setFiles] = useState<File[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof details) => {
    const { value, checked } = e.target;
    setDetails(prev => {
      const currentValues = (prev[field] as string[]) || [];
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] };
      } else {
        return { ...prev, [field]: currentValues.filter(item => item !== value) };
      }
    });
  };

  const handleCounterChange = (field: 'bedrooms' | 'bathrooms', amount: number) => {
    setDetails(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + amount)
    }));
  };
  

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
  
  const handleSuggestionClick = (suggestion: any) => {
    const { address: suggestionAddress } = suggestion;
    // Nominatim may return city, town, or village for the main locality. Prioritize them.
    const city = suggestionAddress.city || suggestionAddress.town || suggestionAddress.village || '';
    const state = suggestionAddress.state || '';

    // Create a clean "City, State" string, avoiding duplicates.
    const parts = [city, state].filter(Boolean); // Filter out empty strings
    const uniqueParts = [...new Set(parts)]; // Remove duplicates (e.g., if city and state are the same)
    const formattedLocation = uniqueParts.join(', ');

    setAddress(prev => ({ ...prev, city: formattedLocation }));
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
    setInitialCoords(coords);
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
    setCurrentStep(2);
  };
  
  const handleContinueToPhotos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.title.trim()) {
        alert("Por favor, preencha o título do anúncio.");
        return;
    }
    setCurrentStep(3);
  }

  const handleFinish = useCallback(async () => {
    if (!user) {
        alert("Você precisa estar logado para publicar um anúncio.");
        onOpenLoginModal();
        return;
    }

    setIsPublishing(true);

    try {
        // Step 1: Ensure user profile exists and update it
        const { data: userProfile, error: profileError } = await supabase
            .from('perfis')
            .select('id')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
             throw new Error(`Erro ao verificar perfil: ${profileError.message}`);
        }
        if (!userProfile) {
            const { error: insertError } = await supabase.from('perfis').insert({
                id: user.id,
                nome_completo: contactInfo.name,
                url_foto_perfil: user.user_metadata.avatar_url,
                telefone: contactInfo.phone,
            });
            if (insertError) throw new Error(`Erro ao criar perfil: ${insertError.message}`);
        } else {
            // Profile exists, update it with new name and phone
            const { error: updateError } = await supabase
                .from('perfis')
                .update({ 
                    nome_completo: contactInfo.name,
                    telefone: contactInfo.phone 
                })
                .eq('id', user.id);
            if (updateError) {
                // Don't throw, just log, as it might not be critical
                console.error("Erro ao atualizar perfil:", updateError.message);
            }
        }
        
        // Step 2: Upload media to Cloudinary if any
        let uploadedMedia: { url: string; tipo: 'imagem' | 'video' }[] = [];
        if (files.length > 0) {
            const CLOUDINARY_CLOUD_NAME = "dpmviwctq"; 
            const CLOUDINARY_UPLOAD_PRESET = "quallityhome"; 
            
            const uploadPromises = files.map(async file => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                const resourceType = file.type.startsWith('video') ? 'video' : 'image';
                const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
                
                const response = await fetch(url, { method: 'POST', body: formData });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Erro no upload do Cloudinary: ${errorData.error.message}`);
                }
                const data = await response.json();
                return { url: data.secure_url, tipo: resourceType as 'imagem' | 'video' };
            });
            uploadedMedia = await Promise.all(uploadPromises);
        }

        // Step 3: Insert property data into Supabase
        const newPropertyData = {
            anunciante_id: user.id,
            titulo: details.title,
            descricao: details.description,
            endereco_completo: verifiedAddress,
            cidade: address.city,
            rua: address.street,
            numero: address.number,
            latitude: initialCoords?.lat ?? 0,
            longitude: initialCoords?.lng ?? 0,
            preco: parseInt(details.price, 10) || 0,
            tipo_operacao: operation,
            tipo_imovel: details.propertyType.join(', '),
            quartos: details.bedrooms,
            banheiros: details.bathrooms,
            area_bruta: parseInt(details.grossArea, 10) || 0,
            possui_elevador: details.hasElevator,
            taxa_condominio: parseInt(details.condoFee, 10) || 0,
            caracteristicas_imovel: details.homeFeatures,
            caracteristicas_condominio: details.buildingFeatures,
            situacao_ocupacao: details.saleSituation,
            status: 'ativo',
        };

        const { data: insertedProperty, error: propertyError } = await supabase
            .from('imoveis')
            .insert([newPropertyData])
            .select('*, owner:anunciante_id(*)')
            .single();
        
        if (propertyError) throw new Error(`Erro ao Inserir Imóvel: ${propertyError.message}`);
        if (!insertedProperty) throw new Error("Falha ao criar o imóvel.");

        // Step 4: Insert media URLs into Supabase `midias_imovel` table
        if (uploadedMedia.length > 0) {
            const mediaToInsert = uploadedMedia.map(media => ({
                imovel_id: insertedProperty.id,
                url: media.url,
                tipo: media.tipo,
            }));

            const { error: mediaError } = await supabase.from('midias_imovel').insert(mediaToInsert);
            if (mediaError) throw new Error(`Erro ao Salvar Mídias: ${mediaError.message}`);
        }
        
        // Final Step: Construct final property object for UI update
        const imagesForUI = uploadedMedia.filter(m => m.tipo === 'imagem').map(m => m.url);
        
        if (imagesForUI.length === 0) {
            imagesForUI.push('https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
        }

        const finalPropertyData = { 
            ...insertedProperty, 
            midias_imovel: uploadedMedia 
        };

        const frontendProperty: Property = {
            id: finalPropertyData.id,
            title: finalPropertyData.titulo,
            address: finalPropertyData.endereco_completo,
            price: finalPropertyData.preco,
            description: finalPropertyData.descricao || '',
            bedrooms: finalPropertyData.quartos,
            bathrooms: finalPropertyData.banheiros,
            area: finalPropertyData.area_bruta,
            lat: finalPropertyData.latitude,
            lng: finalPropertyData.longitude,
            images: imagesForUI,
            videos: uploadedMedia.filter(m => m.tipo === 'video').map(m => m.url),
            owner: finalPropertyData.owner,
            anunciante_id: finalPropertyData.anunciante_id,
            titulo: finalPropertyData.titulo,
            descricao: finalPropertyData.descricao,
            endereco_completo: finalPropertyData.endereco_completo,
            latitude: finalPropertyData.latitude,
            longitude: finalPropertyData.longitude,
            preco: finalPropertyData.preco,
            quartos: finalPropertyData.quartos,
            banheiros: finalPropertyData.banheiros,
            area_bruta: finalPropertyData.area_bruta,
            midias_imovel: finalPropertyData.midias_imovel,
            caracteristicas_imovel: finalPropertyData.caracteristicas_imovel,
            caracteristicas_condominio: finalPropertyData.caracteristicas_condominio,
            situacao_ocupacao: finalPropertyData.situacao_ocupacao,
        };
        
        onAddProperty(frontendProperty);
        onBack(); // Navigate home on success

    } catch (error: any) {
        console.error("ERRO COMPLETO NA PUBLICAÇÃO:", error);
        alert(`Falha na publicação: ${error.message}`);
    } finally {
        setIsPublishing(false);
    }
}, [user, details, verifiedAddress, address, initialCoords, operation, files, onAddProperty, onOpenLoginModal, contactInfo.phone, contactInfo.name, onBack]);


  const getStepClass = (stepNumber: number) => {
    if (currentStep === stepNumber) return 'bg-brand-dark text-white';
    if (currentStep > stepNumber) return 'bg-green-600 text-white';
    return 'bg-gray-200 text-brand-gray';
  }

  return (
    <>
      <div className="bg-brand-light-gray min-h-screen">
        {/* FIX: Pass onNavigateToMyAds prop to Header. */}
        <Header onPublishAdClick={onPublishAdClick} onAccessClick={onOpenLoginModal} user={user} profile={profile} onLogout={onLogout} onNavigateToFavorites={onNavigateToFavorites} onNavigateToChatList={onNavigateToChatList} onNavigateToMyAds={onNavigateToMyAds} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-4xl mx-auto mb-8">
              <div className="flex items-center text-xs sm:text-sm md:text-base">
                  <div className={`relative flex-1 h-10 sm:h-12 flex items-center justify-center font-bold tracking-tight sm:tracking-wide z-10 ${getStepClass(1)}`}>
                      {currentStep > 1 && <CheckIcon className="w-5 h-5 mr-1 sm:mr-2" />}
                      <span>{t('publishJourney.stepper.step1')}</span>
                      <div className={`absolute top-0 -right-5 sm:-right-6 h-full w-10 sm:w-12 ${getStepClass(1)} transform -skew-x-12 z-0`} style={{ clipPath: 'polygon(0 0, 100% 0, 75% 50%, 100% 100%, 0 100%)' }} />
                  </div>
                  <div className={`relative flex-1 h-10 sm:h-12 flex items-center justify-center font-bold tracking-tight sm:tracking-wide pl-5 sm:pl-6 ${getStepClass(2)}`}>
                      {currentStep > 2 && <CheckIcon className="w-5 h-5 mr-1 sm:mr-2" />}
                      <span>{t('publishJourney.stepper.step2')}</span>
                      <div className="absolute top-0 -left-5 sm:-left-6 h-full w-10 sm:w-12 bg-inherit transform -skew-x-12 z-0" style={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 25% 100%, 0 50%)' }} />
                      <div className={`absolute top-0 -right-5 sm:-right-6 h-full w-10 sm:w-12 ${getStepClass(2)} transform -skew-x-12 z-0`} style={{ clipPath: 'polygon(0 0, 100% 0, 75% 50%, 100% 100%, 0 100%)' }} />
                  </div>
                  <div className={`relative flex-1 h-10 sm:h-12 flex items-center justify-center font-bold tracking-tight sm:tracking-wide pl-5 sm:pl-6 ${getStepClass(3)}`}>
                      {currentStep > 3 && <CheckIcon className="w-5 h-5 mr-1 sm:mr-2" />}
                      {t('publishJourney.stepper.step3')}
                      <div className="absolute top-0 -left-5 sm:-left-6 h-full w-10 sm:w-12 bg-inherit transform -skew-x-12 z-0" style={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 25% 100%, 0 50%)' }} />
                  </div>
              </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            <div className="w-full lg:w-2/3">
              {currentStep === 1 && <h1 className="text-xl sm:text-2xl font-bold text-brand-navy mb-8">{t('publishJourney.title')}</h1>}
              {currentStep === 1 && 
                <Step1Form 
                    isAddressVerified={isAddressVerified}
                    handleVerifyAddress={handleVerifyAddress}
                    handleContinueToDetails={handleContinueToDetails}
                    operation={operation}
                    setOperation={setOperation}
                    address={address}
                    handleAddressChange={handleAddressChange}
                    citySuggestionsRef={citySuggestionsRef}
                    isCitySuggestionsOpen={isCitySuggestionsOpen}
                    setIsCitySuggestionsOpen={setIsCitySuggestionsOpen}
                    citySuggestions={citySuggestions}
                    handleSuggestionClick={handleSuggestionClick}
                    verifiedAddress={verifiedAddress}
                    handleEditAddress={handleEditAddress}
                    user={user}
                    profile={profile}
                    onLogout={onLogout}
                    contactInfo={contactInfo}
                    handleContactChange={handleContactChange}
                    handlePreferenceChange={handlePreferenceChange}
                />
              }
              {currentStep === 2 && 
                <Step2Details
                    details={details}
                    handleDetailsChange={handleDetailsChange}
                    handleCheckboxChange={handleCheckboxChange}
                    handleCounterChange={handleCounterChange}
                    handleContinueToPhotos={handleContinueToPhotos}
                    setDetails={setDetails}
                />
              }
              {currentStep === 3 &&
                <Step3Photos
                    onBack={() => setCurrentStep(2)}
                    onFinish={handleFinish}
                    files={files}
                    setFiles={setFiles}
                    isPublishing={isPublishing}
                />
              }
            </div>
            <aside className="w-full lg:w-1/3">
              <div className="bg-white p-6 border border-gray-200 rounded-lg space-y-4 text-sm">
                  <h2 className="text-base sm:text-lg font-bold text-brand-navy">{t('publishJourney.sidebar.title')}</h2>
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
