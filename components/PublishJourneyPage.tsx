import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './Header';
import { useLanguage } from '../contexts/LanguageContext';
import type { User, Property, Profile, Media } from '../types';
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
import InfoIcon from './icons/InfoIcon';
import { GoogleGenAI } from '@google/genai';
import AIIcon from './icons/AIIcon';
import SpinnerIcon from './icons/SpinnerIcon';


type MediaItem = File | { id: number; url: string; tipo: 'imagem' | 'video' };

interface ModalRequestConfig {
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
}

interface PublishJourneyPageProps {
  onBack: () => void;
  onPublishAdClick: () => void;
  onOpenLoginModal: () => void;
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
  onNavigateToFavorites: () => void;
  onAddProperty: (propertyData: Property) => Promise<void>;
  onUpdateProperty: () => Promise<void>;
  onPublishError: (message: string) => void;
  onNavigateToChatList: () => void;
  onNavigateToMyAds: () => void;
  propertyToEdit?: Property | null;
  onRequestModal: (config: ModalRequestConfig) => void;
  onNavigateToAllListings: () => void;
  hasUnreadMessages: boolean;
}

// Define state shapes for props
interface AddressState { city: string; street: string; number: string; state: string; }
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
    description: string;
    // Venda
    salePrice: string;
    iptuAnnual: string;
    acceptsFinancing: boolean | null;
    occupationSituation: string;
    // Aluguel
    monthlyRent: string;
    condoFee: string;
    iptuMonthly: string;
    rentalConditions: string[];
    petsAllowed: boolean | null;
    // Temporada
    dailyRate: string;
    minStay: string;
    maxGuests: string;
    cleaningFee: string;
}

// Props for Step1Form
// FIX: Pass setter functions for suggestion visibility to fix call expression error.
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
  setIsCitySuggestionsOpen: (value: boolean) => void;
  citySuggestions: any[];
  handleSuggestionClick: (suggestion: any) => void;
  streetSuggestionsRef: React.RefObject<HTMLDivElement>;
  isStreetSuggestionsOpen: boolean;
  setIsStreetSuggestionsOpen: (value: boolean) => void;
  streetSuggestions: string[];
  handleStreetSuggestionClick: (street: string) => void;
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
    streetSuggestionsRef,
    isStreetSuggestionsOpen,
    setIsStreetSuggestionsOpen,
    streetSuggestions,
    handleStreetSuggestionClick,
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
                    <span>{t('publishJourney.form.operation.sell')}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="operation" value="aluguel" checked={operation === 'aluguel'} onChange={() => setOperation('aluguel')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                    <span>{t('publishJourney.form.operation.rent')}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="operation" value="temporada" checked={operation === 'temporada'} onChange={() => setOperation('temporada')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                    <span>{t('publishJourney.form.operation.season')}</span>
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
{/* FIX: Use setter function setIsCitySuggestionsOpen instead of boolean isCitySuggestionsOpen. */}
                        <input type="text" id="city" value={address.city} onChange={handleAddressChange} onFocus={() => { if (citySuggestions.length > 0) setIsCitySuggestionsOpen(true); }} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" required autoComplete="off" />
                    </div>
                    {isCitySuggestionsOpen && citySuggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-md shadow-lg z-20">
                        {citySuggestions.map((s) => (
                            <button type="button" key={s.place_id} onClick={() => handleSuggestionClick(s)} className="w-full text-left px-4 py-3 text-brand-dark hover:bg-gray-100">{s.displayName}</button>
                        ))}
                        </div>
                    )}
                    </div>
                    <div className="relative" ref={streetSuggestionsRef}>
                        <label htmlFor="street" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.street')}</label>
{/* FIX: Use setter function setIsStreetSuggestionsOpen instead of boolean isStreetSuggestionsOpen. */}
                        <input type="text" id="street" value={address.street} onChange={handleAddressChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" required autoComplete="off" onFocus={() => { if (streetSuggestions.length > 0) setIsStreetSuggestionsOpen(true); }}/>
                        {isStreetSuggestionsOpen && streetSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-md shadow-lg z-10">
                            {streetSuggestions.map((s, index) => (
                                <button 
                                    type="button" 
                                    key={index} 
                                    onClick={() => handleStreetSuggestionClick(s)} 
                                    className="w-full text-left px-4 py-3 text-brand-dark hover:bg-gray-100"
                                >
                                    {s}
                                </button>
                            ))}
                            </div>
                        )}
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
    );
};

interface DetailsFormProps {
    details: DetailsState;
    handleDetailsChange: (value: any, name: string) => void;
    incrementCounter: (field: 'bedrooms' | 'bathrooms') => void;
    decrementCounter: (field: 'bedrooms' | 'bathrooms') => void;
    handleContinueToPhotos: () => void;
    onGenerateAITitle: () => Promise<void>;
    isAITitleLoading: boolean;
    onGenerateAIDescription: () => Promise<void>;
    isAIDescriptionLoading: boolean;
    availableDates: string[];
    setAvailableDates: (dates: string[]) => void;
}

const VendaDetailsForm: React.FC<DetailsFormProps> = ({ details, handleDetailsChange, ...commonProps }) => {
    const { t } = useLanguage();
    return (
        <>
            <h2 className="text-xl font-bold text-brand-navy">{t('publishJourney.detailsForm.sellTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label htmlFor="salePrice" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.salePrice')}</label>
                    <div className="relative"><input type="text" inputMode="numeric" id="salePrice" value={details.salePrice} onChange={(e) => handleDetailsChange(e.target.value, 'salePrice')} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reais')}</span></div>
                </div>
                <div>
                    <label htmlFor="iptuAnnual" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.iptuAnnual')}</label>
                    <div className="relative"><input type="text" inputMode="numeric" id="iptuAnnual" value={details.iptuAnnual} onChange={(e) => handleDetailsChange(e.target.value, 'iptuAnnual')} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reais')}</span></div>
                </div>
            </div>
            <div>
                 <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.acceptsFinancing')}</label>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="acceptsFinancing" value="yes" checked={details.acceptsFinancing === true} onChange={() => handleDetailsChange(true, 'acceptsFinancing')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/><span>{t('publishJourney.detailsForm.yes')}</span></label>
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="acceptsFinancing" value="no" checked={details.acceptsFinancing === false} onChange={() => handleDetailsChange(false, 'acceptsFinancing')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/><span>{t('publishJourney.detailsForm.no')}</span></label>
                </div>
            </div>
            <div>
                 <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.occupationSituation')}</label>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="occupationSituation" value="rented" checked={details.occupationSituation === 'rented'} onChange={(e) => handleDetailsChange(e.target.value, 'occupationSituation')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/><span>{t('publishJourney.detailsForm.rented')}</span></label>
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="occupationSituation" value="vacant" checked={details.occupationSituation === 'vacant'} onChange={(e) => handleDetailsChange(e.target.value, 'occupationSituation')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/><span>{t('publishJourney.detailsForm.vacant')}</span></label>
                </div>
            </div>
        </>
    );
};

const AluguelDetailsForm: React.FC<DetailsFormProps> = ({ details, handleDetailsChange, ...commonProps }) => {
    const { t } = useLanguage();
    const rentalConditionsOptions = [
        { value: 'deposit', label: t('publishJourney.detailsForm.deposit') },
        { value: 'guarantor', label: t('publishJourney.detailsForm.guarantor') },
        { value: 'insurance', label: t('publishJourney.detailsForm.insurance') },
    ];

    const handleCheckboxChange = (value: string) => {
        const newSelection = details.rentalConditions.includes(value)
            ? details.rentalConditions.filter(item => item !== value)
            : [...details.rentalConditions, value];
        handleDetailsChange(newSelection, 'rentalConditions');
    };

    return (
        <>
            <h2 className="text-xl font-bold text-brand-navy">{t('publishJourney.detailsForm.rentTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <label htmlFor="monthlyRent" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.monthlyRent')}</label>
                    <div className="relative"><input type="text" inputMode="numeric" id="monthlyRent" value={details.monthlyRent} onChange={(e) => handleDetailsChange(e.target.value, 'monthlyRent')} className="w-full p-3 border border-gray-300 rounded-md" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reaisMonth')}</span></div>
                </div>
                <div>
                    <label htmlFor="condoFee" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.condoFee')}</label>
                    <div className="relative"><input type="text" inputMode="numeric" id="condoFee" value={details.condoFee} onChange={(e) => handleDetailsChange(e.target.value, 'condoFee')} className="w-full p-3 border border-gray-300 rounded-md" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reaisMonth')}</span></div>
                </div>
                <div>
                    <label htmlFor="iptuMonthly" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.iptuMonthly')}</label>
                    <div className="relative"><input type="text" inputMode="numeric" id="iptuMonthly" value={details.iptuMonthly} onChange={(e) => handleDetailsChange(e.target.value, 'iptuMonthly')} className="w-full p-3 border border-gray-300 rounded-md" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reaisMonth')}</span></div>
                </div>
            </div>
            <div>
                <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.rentalConditions')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {rentalConditionsOptions.map(option => (
                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" value={option.value} checked={details.rentalConditions.includes(option.value)} onChange={() => handleCheckboxChange(option.value)} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300 rounded" />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>
             <div>
                 <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.petsAllowed')}</label>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="petsAllowed" value="yes" checked={details.petsAllowed === true} onChange={() => handleDetailsChange(true, 'petsAllowed')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/><span>{t('publishJourney.detailsForm.yes')}</span></label>
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="petsAllowed" value="no" checked={details.petsAllowed === false} onChange={() => handleDetailsChange(false, 'petsAllowed')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/><span>{t('publishJourney.detailsForm.no')}</span></label>
                </div>
            </div>
        </>
    );
};

const CalendarWidget: React.FC<{ selectedDates: string[]; onDateChange: (dates: string[]) => void; }> = ({ selectedDates, onDateChange }) => {
    const { t } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleDateClick = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        const isSelected = selectedDates.includes(dateString);
        let newDates;
        if (isSelected) {
            newDates = selectedDates.filter(d => d !== dateString);
        } else {
            newDates = [...selectedDates, dateString];
        }
        onDateChange(newDates.sort());
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const dates = [];
        for (let i = 0; i < startDayOfWeek; i++) {
            dates.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateString = date.toISOString().split('T')[0];
            const isSelected = selectedDates.includes(dateString);
            const isPast = date < new Date() && date.toDateString() !== new Date().toDateString();

            dates.push(
                <button
                    type="button"
                    key={i}
                    onClick={() => !isPast && handleDateClick(date)}
                    disabled={isPast}
                    className={`w-10 h-10 rounded-full transition-colors duration-200 flex items-center justify-center
                        ${isPast ? 'text-gray-400 cursor-not-allowed' : ''}
                        ${!isPast && isSelected ? 'bg-brand-red text-white font-bold' : ''}
                        ${!isPast && !isSelected ? 'hover:bg-red-100' : ''}
                    `}
                >
                    {i}
                </button>
            );
        }

        return dates;
    };
    
    return (
        <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">&lt; {t('publishJourney.detailsForm.calendar.prev')}</button>
                <span className="font-bold text-lg text-brand-navy">{new Intl.DateTimeFormat(t('language'), { month: 'long', year: 'numeric' }).format(currentDate)}</span>
                <button type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">{t('publishJourney.detailsForm.calendar.next')} &gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-brand-gray mb-2">
                <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
            </div>
        </div>
    );
};

const TemporadaDetailsForm: React.FC<DetailsFormProps> = ({ details, handleDetailsChange, availableDates, setAvailableDates, ...commonProps }) => {
    const { t } = useLanguage();
    return (
        <>
            <h2 className="text-xl font-bold text-brand-navy">{t('publishJourney.detailsForm.seasonTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label htmlFor="dailyRate" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.dailyRate')}</label>
                    <div className="relative"><input type="text" inputMode="numeric" id="dailyRate" value={details.dailyRate} onChange={(e) => handleDetailsChange(e.target.value, 'dailyRate')} className="w-full p-3 border border-gray-300 rounded-md" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reais')}</span></div>
                </div>
                <div>
                    <label htmlFor="cleaningFee" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.cleaningFee')}</label>
                    <div className="relative"><input type="text" inputMode="numeric" id="cleaningFee" value={details.cleaningFee} onChange={(e) => handleDetailsChange(e.target.value, 'cleaningFee')} className="w-full p-3 border border-gray-300 rounded-md" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reais')}</span></div>
                </div>
                 <div>
                    <label htmlFor="minStay" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.minStay')}</label>
                    <input type="number" id="minStay" value={details.minStay} onChange={(e) => handleDetailsChange(e.target.value, 'minStay')} className="w-full p-3 border border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label htmlFor="maxGuests" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.maxGuests')}</label>
                    <input type="number" id="maxGuests" value={details.maxGuests} onChange={(e) => handleDetailsChange(e.target.value, 'maxGuests')} className="w-full p-3 border border-gray-300 rounded-md" />
                </div>
            </div>
             <div>
                 <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.availability')}</label>
                 <CalendarWidget selectedDates={availableDates} onDateChange={setAvailableDates} />
            </div>
        </>
    );
};


const CommonDetailsForm: React.FC<DetailsFormProps> = ({ 
    details, handleDetailsChange, incrementCounter, decrementCounter, 
    onGenerateAITitle, isAITitleLoading, onGenerateAIDescription, isAIDescriptionLoading 
}) => {
    const { t } = useLanguage();

    const CheckboxGroup: React.FC<{ label: string, options: { value: string, label: string }[], selectedOptions: string[], onChange: (selected: string[]) => void }> = ({ label, options, selectedOptions, onChange }) => {
        const handleCheckboxChange = (value: string) => {
            const newSelection = selectedOptions.includes(value)
                ? selectedOptions.filter(item => item !== value)
                : [...selectedOptions, value];
            onChange(newSelection);
        };

        return (
            <div>
                <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{label}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {options.map(option => (
                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer text-sm">
                            <input type="checkbox" value={option.value} checked={selectedOptions.includes(option.value)} onChange={() => handleCheckboxChange(option.value)} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300 rounded" />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    const NumberCounter: React.FC<{ label: string, value: number, onIncrement: () => void, onDecrement: () => void }> = ({ label, value, onIncrement, onDecrement }) => (
        <div>
            <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{label}</label>
            <div className="flex items-center space-x-4">
                <button type="button" onClick={onDecrement} className="p-2 border rounded-full hover:bg-gray-100"><MinusIcon className="w-5 h-5"/></button>
                <span className="text-xl font-bold w-8 text-center">{value}</span>
                <button type="button" onClick={onIncrement} className="p-2 border rounded-full hover:bg-gray-100"><PlusIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <label htmlFor="adTitle" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.adTitle')}</label>
                 <div className="relative">
                    <input 
                        type="text" 
                        id="adTitle" 
                        value={details.title} 
                        onChange={(e) => handleDetailsChange(e.target.value, 'title')} 
                        placeholder={t('publishJourney.detailsForm.adTitlePlaceholder')} 
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red pr-12" 
                        required 
                    />
                    {details.title.trim().length > 0 && (
                        <button
                            type="button"
                            onClick={onGenerateAITitle}
                            disabled={isAITitleLoading}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-brand-navy hover:text-brand-red disabled:opacity-50 disabled:cursor-wait p-1"
                            title={t('publishJourney.detailsForm.aiTitleButtonLabel')}
                        >
                            {isAITitleLoading 
                                ? <SpinnerIcon className="w-6 h-6 animate-spin text-brand-navy" /> 
                                : <AIIcon className="w-6 h-6" />}
                        </button>
                    )}
                </div>
            </div>

            <CheckboxGroup
                label={t('publishJourney.detailsForm.propertyType')}
                options={[
                    { value: 'Apartamento', label: t('publishJourney.detailsForm.apartment') },
                    { value: 'Casa', label: t('publishJourney.detailsForm.house') },
                    { value: 'Quarto', label: t('publishJourney.detailsForm.room') },
                    { value: 'Escritório', label: t('publishJourney.detailsForm.office') },
                    { value: 'Terreno', label: t('publishJourney.detailsForm.land') },
                ]}
                selectedOptions={details.propertyType}
                onChange={(value) => handleDetailsChange(value, 'propertyType')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="grossArea" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.grossArea')}</label>
                        <div className="relative"><input type="number" id="grossArea" value={details.grossArea} onChange={(e) => handleDetailsChange(e.target.value, 'grossArea')} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">m²</span></div>
                    </div>
                     <div>
                        <label htmlFor="netArea" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.netArea')}</label>
                        <div className="relative"><input type="number" id="netArea" value={details.netArea} onChange={(e) => handleDetailsChange(e.target.value, 'netArea')} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">m²</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <NumberCounter label={t('publishJourney.detailsForm.bedrooms')} value={details.bedrooms} onIncrement={() => incrementCounter('bedrooms')} onDecrement={() => decrementCounter('bedrooms')} />
                 <NumberCounter label={t('publishJourney.detailsForm.bathrooms')} value={details.bathrooms} onIncrement={() => incrementCounter('bathrooms')} onDecrement={() => decrementCounter('bathrooms')} />
            </div>

            <div>
                 <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.hasElevator')}</label>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="hasElevator" value="yes" checked={details.hasElevator === true} onChange={() => handleDetailsChange(true, 'hasElevator')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/><span>{t('publishJourney.detailsForm.yes')}</span></label>
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="hasElevator" value="no" checked={details.hasElevator === false} onChange={() => handleDetailsChange(false, 'hasElevator')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/><span>{t('publishJourney.detailsForm.no')}</span></label>
                </div>
            </div>

            <CheckboxGroup
                label={t('publishJourney.detailsForm.otherHomeFeatures')}
                options={[
                    { value: 'builtInWardrobes', label: t('publishJourney.detailsForm.builtInWardrobes') },
                    { value: 'airConditioning', label: t('publishJourney.detailsForm.airConditioning') },
                    { value: 'terrace', label: t('publishJourney.detailsForm.terrace') },
                    { value: 'balcony', label: t('publishJourney.detailsForm.balcony') },
                    { value: 'garage', label: t('publishJourney.detailsForm.garage') },
                    { value: 'mobiliado', label: t('publishJourney.detailsForm.mobiliado') },
                    { value: 'cozinhaEquipada', label: t('publishJourney.detailsForm.cozinhaEquipada') },
                    { value: 'suite', label: t('publishJourney.detailsForm.suite') },
                    { value: 'escritorio', label: t('publishJourney.detailsForm.escritorio') },
                ]}
                selectedOptions={details.homeFeatures}
                onChange={(value) => handleDetailsChange(value, 'homeFeatures')}
            />

             <CheckboxGroup
                label={t('publishJourney.detailsForm.otherBuildingFeatures')}
                options={[
                    { value: 'pool', label: t('publishJourney.detailsForm.pool') },
                    { value: 'greenArea', label: t('publishJourney.detailsForm.greenArea') },
                    { value: 'portaria24h', label: t('publishJourney.detailsForm.portaria24h') },
                    { value: 'academia', label: t('publishJourney.detailsForm.academia') },
                    { value: 'salaoDeFestas', label: t('publishJourney.detailsForm.salaoDeFestas') },
                    { value: 'churrasqueira', label: t('publishJourney.detailsForm.churrasqueira') },
                    { value: 'parqueInfantil', label: t('publishJourney.detailsForm.parqueInfantil') },
                    { value: 'quadraEsportiva', label: t('publishJourney.detailsForm.quadraEsportiva') },
                    { value: 'sauna', label: t('publishJourney.detailsForm.sauna') },
                    { value: 'espacoGourmet', label: t('publishJourney.detailsForm.espacoGourmet') },
                ]}
                selectedOptions={details.buildingFeatures}
                onChange={(value) => handleDetailsChange(value, 'buildingFeatures')}
            />
            
            <div>
                <label htmlFor="description" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.adDescription')}</label>
                <div className="relative">
                    <textarea 
                        id="description" 
                        value={details.description} 
                        onChange={(e) => handleDetailsChange(e.target.value, 'description')} 
                        rows={6} 
                        placeholder={t('publishJourney.detailsForm.descriptionPlaceholder')} 
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red pr-12"
                    ></textarea>
                    {details.description.trim().length > 0 && (
                        <button
                            type="button"
                            onClick={onGenerateAIDescription}
                            disabled={isAIDescriptionLoading}
                            className="absolute top-3 right-3 text-brand-navy hover:text-brand-red disabled:opacity-50 disabled:cursor-wait p-1"
                            title={t('publishJourney.detailsForm.aiDescriptionButtonLabel')}
                        >
                            {isAIDescriptionLoading 
                                ? <SpinnerIcon className="w-6 h-6 animate-spin text-brand-navy" /> 
                                : <AIIcon className="w-6 h-6" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface Step3FormProps {
    media: MediaItem[];
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveMedia: (index: number) => void;
    handleBackToDetails: () => void;
    handleFinish: () => void;
    isSubmitting: boolean;
    isEditing: boolean;
}

const Step3Form: React.FC<Step3FormProps> = ({ media, handleFileChange, handleRemoveMedia, handleBackToDetails, handleFinish, isSubmitting, isEditing }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-brand-navy">{t('publishJourney.photosForm.title')}</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-brand-gray mb-4">{t('publishJourney.photosForm.dragAndDrop')}</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-brand-red text-white font-bold rounded-md hover:opacity-90 transition-opacity">
                    {t('publishJourney.photosForm.addButton')}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*,video/*" className="hidden" />
                <div className="text-xs text-brand-gray mt-4 flex items-center justify-center space-x-2">
                    <InfoIcon className="w-4 h-4" />
                    <span>{t('publishJourney.photosForm.limitsInfo')}</span>
                </div>
            </div>

            {media.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {media.map((item, index) => (
                        <div key={index} className="relative group">
                            <div className="aspect-w-1 aspect-h-1">
                                <img src={item instanceof File ? URL.createObjectURL(item) : item.url} alt={`Media preview ${index + 1}`} className="object-cover rounded-md w-full h-full" />
                            </div>
                            <button onClick={() => handleRemoveMedia(index)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-6 rounded-md space-y-4">
                <h3 className="text-lg font-bold">{t('publishJourney.photosForm.rememberTitle')}</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>{t('publishJourney.photosForm.tip1')}</li>
                    <li>{t('publishJourney.photosForm.tip2')}</li>
                    <li>{t('publishJourney.photosForm.tip3')}</li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button type="button" onClick={handleBackToDetails} className="text-brand-dark hover:underline">{t('publishJourney.photosForm.backButton')}</button>
                <button 
                    type="button" 
                    onClick={handleFinish}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-4 bg-[#93005a] text-white font-bold rounded-md hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-wait"
                >
                    {isSubmitting
                        ? (isEditing ? t('publishJourney.photosForm.updatingButton') : t('publishJourney.photosForm.publishingButton'))
                        : (isEditing ? t('publishJourney.photosForm.updateButton') : t('publishJourney.photosForm.publishButton'))}
                </button>
            </div>
        </div>
    );
};

// Helper functions for currency formatting and parsing
const formatCurrencyForInput = (value: string): string => {
    if (!value) return '';
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly === '') return '';

    const numberValue = parseFloat(digitsOnly) / 100;
    return numberValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const parseCurrencyToNull = (value: string): number | null => {
    if (!value) return null;
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
};

const parseIntToNull = (value: string): number | null => {
    if (!value) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
};

const formatStoredCurrency = (value?: number): string => {
    if (value === undefined || value === null) return '';
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// Helper function for mock AI response
const mockAITitleGeneration = (originalTitle: string): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const prefixes = ["Oportunidade Única:", "Imperdível:", "Exclusivo:", "Lindo", "Espetacular"];
            const suffixes = ["na melhor localização", "com vista incrível", "perfeito para você", "dos seus sonhos", "acabamento de primeira"];
            
            const capitalizedTitle = originalTitle.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            
            let newTitle = `${randomPrefix} ${capitalizedTitle}`;
            if (Math.random() > 0.5) {
                newTitle += ` ${randomSuffix}`;
            }

            resolve(newTitle.slice(0, 100)); // Limit length
        }, 800); // Simulate network delay
    });
};

const mockAIDescriptionGeneration = (details: DetailsState): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const adjectives = ["Espaçoso", "Aconchegante", "Moderno", "Bem localizado", "Com excelente acabamento"];
            const highlights = ["ideal para famílias", "perfeito para quem busca conforto", "uma oportunidade única", "pronto para morar"];
            
            const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            const randomHighlight = highlights[Math.floor(Math.random() * highlights.length)];

            const baseDescription = details.description ? `Este imóvel se destaca por ser ${details.description.toLowerCase()}.` : '';

            const newDescription = `${randomAdjective} ${details.propertyType[0] || 'imóvel'} com ${details.bedrooms} quarto(s) e ${details.bathrooms} banheiro(s). ${baseDescription} Com uma área de ${details.grossArea}m², é ${randomHighlight}. Não perca essa chance!`;
            
            resolve(newDescription);
        }, 1200);
    });
};


const PublishJourneyPage: React.FC<PublishJourneyPageProps> = (props) => {
  const { onBack, onPublishAdClick, onOpenLoginModal, user, profile, onLogout, onNavigateToFavorites, onAddProperty, onUpdateProperty, onPublishError, onNavigateToChatList, onNavigateToMyAds, propertyToEdit, onRequestModal, onNavigateToAllListings, hasUnreadMessages } = props;
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [operation, setOperation] = useState('venda');
  const [isAddressVerified, setIsAddressVerified] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState('');
  const [address, setAddress] = useState<AddressState>({ city: '', street: '', number: '', state: '' });
  const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [isCitySuggestionsOpen, setIsCitySuggestionsOpen] = useState(false);
  const citySuggestionsRef = useRef<HTMLDivElement>(null);
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [isStreetSuggestionsOpen, setIsStreetSuggestionsOpen] = useState(false);
  const streetSuggestionsRef = useRef<HTMLDivElement>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfoState>({ phone: '', preference: 'chat_and_phone', name: '' });
  const [details, setDetails] = useState<DetailsState>({
    title: '',
    propertyType: [],
    condition: 'good_condition',
    grossArea: '',
    netArea: '',
    bedrooms: 1,
    bathrooms: 1,
    hasElevator: null,
    homeFeatures: [],
    buildingFeatures: [],
    description: '',
    salePrice: '',
    iptuAnnual: '',
    acceptsFinancing: null,
    occupationSituation: 'vacant',
    monthlyRent: '',
    condoFee: '',
    iptuMonthly: '',
    rentalConditions: [],
    petsAllowed: null,
    dailyRate: '',
    minStay: '',
    maxGuests: '',
    cleaningFee: ''
  });
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isAITitleLoading, setIsAITitleLoading] = useState(false);
  const [isAIDescriptionLoading, setIsAIDescriptionLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  useEffect(() => {
    if (propertyToEdit) {
      const [cityPart = '', statePart = ''] = (propertyToEdit.cidade || '').split(',').map(s => s.trim());
      setAddress({
          city: cityPart,
          state: statePart,
          street: propertyToEdit.rua || '',
          number: propertyToEdit.numero || '',
      });
      setVerifiedAddress(propertyToEdit.endereco_completo || '');
      setCoordinates({ lat: propertyToEdit.latitude, lng: propertyToEdit.longitude });
      setOperation(propertyToEdit.tipo_operacao || 'venda');
      setContactInfo({
        phone: propertyToEdit.owner?.phone || '',
        preference: 'chat_and_phone', // Assuming a default, not stored in DB
        name: propertyToEdit.owner?.nome_completo || '',
      });
      
      const price = propertyToEdit.preco;
      setDetails({
        title: propertyToEdit.titulo || '',
        propertyType: propertyToEdit.tipo_imovel ? [propertyToEdit.tipo_imovel] : [],
        condition: 'good_condition', // Assuming default
        grossArea: propertyToEdit.area_bruta?.toString() || '',
        netArea: '', // Not in model
        bedrooms: propertyToEdit.quartos || 0,
        bathrooms: propertyToEdit.banheiros || 0,
        hasElevator: propertyToEdit.possui_elevador ?? null,
        homeFeatures: propertyToEdit.caracteristicas_imovel || [],
        buildingFeatures: propertyToEdit.caracteristicas_condominio || [],
        description: propertyToEdit.descricao || '',
        salePrice: propertyToEdit.tipo_operacao === 'venda' ? formatStoredCurrency(price) : '',
        iptuAnnual: propertyToEdit.tipo_operacao === 'venda' ? formatStoredCurrency(propertyToEdit.valor_iptu) : '',
        acceptsFinancing: propertyToEdit.aceita_financiamento ?? null,
        occupationSituation: propertyToEdit.situacao_ocupacao || 'vacant',
        monthlyRent: propertyToEdit.tipo_operacao === 'aluguel' ? formatStoredCurrency(price) : '',
        condoFee: formatStoredCurrency(propertyToEdit.taxa_condominio),
        iptuMonthly: propertyToEdit.tipo_operacao === 'aluguel' ? formatStoredCurrency(propertyToEdit.valor_iptu) : '',
        rentalConditions: propertyToEdit.condicoes_aluguel || [],
        petsAllowed: propertyToEdit.permite_animais ?? null,
        dailyRate: propertyToEdit.tipo_operacao === 'temporada' ? formatStoredCurrency(price) : '',
        minStay: propertyToEdit.minimo_diarias?.toString() || '',
        maxGuests: propertyToEdit.maximo_hospedes?.toString() || '',
        cleaningFee: formatStoredCurrency(propertyToEdit.taxa_limpeza),
      });
      setAvailableDates(propertyToEdit.datas_disponiveis || []);
      setMedia(propertyToEdit.midias_imovel || []);
      setIsAddressVerified(true);
      setCurrentStep(1); // Start at step 1 for editing
    } else {
        // Request geolocation only for new ads
        onRequestModal({
            type: 'confirm',
            title: t('publishJourney.locationPermissionModal.title'),
            message: t('publishJourney.locationPermissionModal.message'),
            onConfirm: () => {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {},
                    (error) => { console.warn("Could not get user location:", error.message); }
                );
            }
        });
    }
  }, [propertyToEdit, t, onRequestModal]);

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    if (id === 'city') {
        setAddress(prev => ({ ...prev, city: value, state: '', street: '' }));
    } else {
        setAddress(prev => ({ ...prev, [id]: value }));
    }

    if (id === 'city') {
      setIsStreetSuggestionsOpen(false);
      setStreetSuggestions([]);
      if (value.length > 2) {
        const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&countrycodes=br&limit=5`;
        
        try {
          const response = await fetch(endpoint);
          const data = await response.json();
          
            const mappedResults = data
                .map((item: any) => {
                    const city = item.address.city || item.address.town || item.address.village || item.address.municipality;
                    const state = item.address.state;
                    const validAddresstypes = ['city', 'town', 'village', 'municipality'];
                    if (city && state && validAddresstypes.includes(item.addresstype)) {
                        return {
                            place_id: item.place_id,
                            displayName: `${city}, ${state}`,
                            city: city,
                            state: state,
                        };
                    }
                    return null;
                })
                .filter(Boolean);

          const uniqueResults = Array.from(new Map(mappedResults.map(item => [item.displayName, item])).values());
          
          setCitySuggestions(uniqueResults);
          setIsCitySuggestionsOpen(true);
        } catch (error) {
          console.error("Error fetching city suggestions:", error);
          setCitySuggestions([]);
        }

      } else {
        setIsCitySuggestionsOpen(false);
      }
    } else if (id === 'street') {
      if (value.length > 2 && address.city && address.state) {
          const endpoint = `https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(value)}&city=${encodeURIComponent(address.city)}&state=${encodeURIComponent(address.state)}&format=json&addressdetails=1&countrycodes=br&limit=10`;
          
          try {
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (data) {
                const uniqueStreets = [...new Set(data.map((item: any) => item.address.road).filter(Boolean))];
                setStreetSuggestions(uniqueStreets as string[]);
                setIsStreetSuggestionsOpen(true);
            }
          } catch (error) {
            console.error("Error fetching street suggestions:", error);
            setStreetSuggestions([]);
          }
      } else {
        setIsStreetSuggestionsOpen(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setAddress(prev => ({ ...prev, city: suggestion.city, state: suggestion.state, street: '' }));
    setIsCitySuggestionsOpen(false);
  };
  
  const handleStreetSuggestionClick = (street: string) => {
    setAddress(prev => ({ ...prev, street: street }));
    setIsStreetSuggestionsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (citySuggestionsRef.current && !citySuggestionsRef.current.contains(event.target as Node)) {
        setIsCitySuggestionsOpen(false);
      }
      if (streetSuggestionsRef.current && !streetSuggestionsRef.current.contains(event.target as Node)) {
        setIsStreetSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVerifyAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullAddress = `${address.street}, ${address.number}, ${address.city}, ${address.state}, Brasil`;
    const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`;
    const response = await fetch(endpoint);
    const data = await response.json();

    if (data.length > 0) {
      setCoordinates({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      setIsConfirmationModalOpen(true);
    } else {
      alert('Endereço não encontrado. Por favor, verifique os dados.');
    }
  };

  const handleConfirmAddress = (newCoords: { lat: number; lng: number }) => {
    setCoordinates(newCoords);
    setVerifiedAddress(`${address.street}, ${address.number}, ${address.city}`);
    setIsAddressVerified(true);
    setIsConfirmationModalOpen(false);
    if (!user) {
        onOpenLoginModal();
    }
  };

  const handleEditAddress = () => setIsAddressVerified(false);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setContactInfo(prev => ({ ...prev, [id]: value }));
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo(prev => ({ ...prev, preference: e.target.value }));
  };
  
  const handleContinueToDetails = (e: React.FormEvent) => {
      e.preventDefault();
      setCurrentStep(2);
  }

  const handleDetailsChange = (value: any, name: string) => {
    const currencyFields = ['salePrice', 'iptuAnnual', 'monthlyRent', 'condoFee', 'iptuMonthly', 'dailyRate', 'cleaningFee'];
    if (currencyFields.includes(name)) {
        setDetails(prev => ({ ...prev, [name]: formatCurrencyForInput(value) }));
    } else {
        setDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const incrementCounter = (field: 'bedrooms' | 'bathrooms') => {
    setDetails(prev => ({ ...prev, [field]: prev[field] + 1 }));
  };

  const decrementCounter = (field: 'bedrooms' | 'bathrooms') => {
    setDetails(prev => ({ ...prev, [field]: Math.max(0, prev[field] - 1) }));
  };

  const handleContinueToPhotos = () => setCurrentStep(3);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setMedia(prev => [...prev, ...newFiles]);
    }
  };
  
  const handleRemoveMedia = (index: number) => {
      setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateAITitle = useCallback(async () => {
    if (!details.title.trim()) return;

    setIsAITitleLoading(true);
    try {
        if (!process.env.API_KEY) {
            console.warn("Chave de API do Gemini não configurada. Usando resposta simulada para demonstração.");
            const newTitle = await mockAITitleGeneration(details.title);
            setDetails(prev => ({ ...prev, title: newTitle }));
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = t('publishJourney.detailsForm.aiTitlePrompt', { title: details.title });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const newTitle = response.text.trim().replace(/^"|"$/g, '');
        if (newTitle) {
            setDetails(prev => ({ ...prev, title: newTitle }));
        }
    } catch (error) {
        console.error("Erro ao gerar título com IA:", error);
    } finally {
        setIsAITitleLoading(false);
    }
  }, [details.title, t]);

  const handleGenerateAIDescription = useCallback(async () => {
    if (!details.description.trim()) return;

    setIsAIDescriptionLoading(true);
    try {
        if (!process.env.API_KEY) {
            console.warn("Chave de API do Gemini não configurada. Usando resposta simulada para descrição.");
            const newDescription = await mockAIDescriptionGeneration(details);
            setDetails(prev => ({ ...prev, description: newDescription }));
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = t('publishJourney.detailsForm.aiDescriptionPrompt', { 
            title: details.title,
            propertyType: details.propertyType.join(', ') || 'Não especificado',
            bedrooms: details.bedrooms,
            bathrooms: details.bathrooms,
            description: details.description 
        });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const newDescription = response.text.trim();
        if (newDescription) {
            setDetails(prev => ({ ...prev, description: newDescription }));
        }
    } catch (error) {
        console.error("Erro ao gerar descrição com IA:", error);
    } finally {
        setIsAIDescriptionLoading(false);
    }
  }, [details, t]);

  const handleFinish = async () => {
    if (!user || !profile) {
      onOpenLoginModal();
      return;
    }
  
    setPublishError(null); // Limpa erros anteriores a cada nova tentativa
    setIsSubmitting(true);
  
    try {
      const existingMedia = media.filter(m => !(m instanceof File)) as { id: number; url: string; tipo: 'imagem' | 'video' }[];
      const newMediaFiles = media.filter(m => m instanceof File) as File[];
  
      let propertyData: any = {
        anunciante_id: user.id,
        titulo: details.title,
        descricao: details.description,
        endereco_completo: verifiedAddress,
        cidade: address.state ? `${address.city}, ${address.state}` : address.city,
        rua: address.street,
        numero: address.number,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        tipo_operacao: operation,
        tipo_imovel: details.propertyType[0] || null,
        quartos: details.bedrooms,
        banheiros: details.bathrooms,
        area_bruta: parseIntToNull(details.grossArea),
        possui_elevador: details.hasElevator,
        caracteristicas_imovel: details.homeFeatures,
        caracteristicas_condominio: details.buildingFeatures,
        status: 'ativo',
      };
  
      if (operation === 'venda') {
        propertyData = {
            ...propertyData,
            preco: parseCurrencyToNull(details.salePrice) ?? 0,
            valor_iptu: parseCurrencyToNull(details.iptuAnnual),
            aceita_financiamento: details.acceptsFinancing,
            situacao_ocupacao: details.occupationSituation,
        };
      } else if (operation === 'aluguel') {
        propertyData = {
            ...propertyData,
            preco: parseCurrencyToNull(details.monthlyRent) ?? 0,
            taxa_condominio: parseCurrencyToNull(details.condoFee),
            valor_iptu: parseCurrencyToNull(details.iptuMonthly),
            condicoes_aluguel: details.rentalConditions,
            permite_animais: details.petsAllowed,
        };
      } else if (operation === 'temporada') {
        propertyData = {
            ...propertyData,
            preco: parseCurrencyToNull(details.dailyRate) ?? 0,
            minimo_diarias: parseIntToNull(details.minStay),
            maximo_hospedes: parseIntToNull(details.maxGuests),
            taxa_limpeza: parseCurrencyToNull(details.cleaningFee),
            datas_disponiveis: availableDates,
        };
      }
  
      if (propertyToEdit) {
        // Lógica de Atualização
        const { error: updateError } = await supabase
            .from('imoveis')
            .update(propertyData)
            .eq('id', propertyToEdit.id);
        
        if (updateError) throw updateError;
        
        await onUpdateProperty();
  
      } else {
        // Lógica de Criação
        const { data: newProperty, error: propertyError } = await supabase
          .from('imoveis')
          .insert(propertyData)
          .select()
          .single();
  
        if (propertyError) throw propertyError;
  
        await onAddProperty(newProperty as Property);
        onBack();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ocorreu um erro desconhecido.';
      console.error('Falha na publicação:', error);
      setPublishError(errorMessage); // Define o erro para ser exibido na tela
    } finally {
      setIsSubmitting(false); // Garante que o estado de carregamento seja desativado
    }
  };

  const renderDetailsForm = () => {
    const commonProps = {
        details,
        handleDetailsChange,
        incrementCounter,
        decrementCounter,
        handleContinueToPhotos,
        onGenerateAITitle: handleGenerateAITitle,
        isAITitleLoading,
        onGenerateAIDescription: handleGenerateAIDescription,
        isAIDescriptionLoading,
        availableDates,
        setAvailableDates
    };

    let SpecificForm;
    switch (operation) {
        case 'venda':
            SpecificForm = <VendaDetailsForm {...commonProps} />;
            break;
        case 'aluguel':
            SpecificForm = <AluguelDetailsForm {...commonProps} />;
            break;
        case 'temporada':
            SpecificForm = <TemporadaDetailsForm {...commonProps} />;
            break;
        default:
            SpecificForm = <VendaDetailsForm {...commonProps} />;
    }

    return (
        <div className="space-y-8">
            <CommonDetailsForm {...commonProps} />
            <hr className="my-8"/>
            {SpecificForm}
            <div className="text-center mt-8">
                <button type="button" onClick={handleContinueToPhotos} className="w-full max-w-xs mx-auto px-6 py-3 bg-[#93005a] text-white font-bold rounded-md hover:opacity-90 transition-opacity">
                    {t('publishJourney.detailsForm.continueToPhotosButton')}
                </button>
            </div>
        </div>
    );
  };


  return (
    <div className="bg-brand-light-gray min-h-screen">
      <Header 
        onPublishAdClick={onPublishAdClick} 
        onAccessClick={onOpenLoginModal} 
        user={user} 
        profile={profile} 
        onLogout={onLogout} 
        onNavigateToFavorites={onNavigateToFavorites} 
        onNavigateToChatList={onNavigateToChatList} 
        onNavigateToMyAds={onNavigateToMyAds} 
        onNavigateToAllListings={onNavigateToAllListings} 
        hasUnreadMessages={hasUnreadMessages} 
      />
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <ol className="grid grid-cols-3 text-sm font-medium text-center text-gray-500">
            {[1, 2, 3].map(step => (
              <li key={step} className={`flex items-center justify-center p-4 border-b-4 ${currentStep >= step ? 'border-brand-red text-brand-red' : 'border-gray-200'}`}>
                {t(`publishJourney.stepper.step${step}`)}
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-8">
              {propertyToEdit ? t('publishJourney.editTitle') : t('publishJourney.title')}
            </h1>
            
            {currentStep === 1 && (
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
                    streetSuggestionsRef={streetSuggestionsRef}
                    isStreetSuggestionsOpen={isStreetSuggestionsOpen}
                    setIsStreetSuggestionsOpen={setIsStreetSuggestionsOpen}
                    streetSuggestions={streetSuggestions}
                    handleStreetSuggestionClick={handleStreetSuggestionClick}
                    verifiedAddress={verifiedAddress}
                    handleEditAddress={handleEditAddress}
                    user={user}
                    profile={profile}
                    onLogout={onLogout}
                    contactInfo={contactInfo}
                    handleContactChange={handleContactChange}
                    handlePreferenceChange={handlePreferenceChange}
                />
            )}
            {currentStep === 2 && renderDetailsForm()}
            {currentStep === 3 && (
                <>
                    <Step3Form
                        media={media}
                        handleFileChange={handleFileChange}
                        handleRemoveMedia={handleRemoveMedia}
                        handleBackToDetails={() => setCurrentStep(2)}
                        handleFinish={handleFinish}
                        isSubmitting={isSubmitting}
                        isEditing={!!propertyToEdit}
                    />
                    {publishError && (
                        <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-md" role="alert">
                            <p className="font-bold">{t('systemModal.errorTitle')}</p>
                            <p className="text-sm">{publishError}</p>
                        </div>
                    )}
                </>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white p-6 rounded-lg shadow-md space-y-6">
              <div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">{t('publishJourney.sidebar.title')}</h3>
                <p className="text-sm text-brand-gray">{t('publishJourney.sidebar.p1')}</p>
                <p className="text-sm text-brand-gray mt-2">{t('publishJourney.sidebar.p2')}</p>
                <p className="text-sm text-brand-gray mt-2">{t('publishJourney.sidebar.p3')}</p>
              </div>
              <div>
                <p className="text-sm text-brand-gray">{t('publishJourney.sidebar.p4')}</p>
                <ul className="list-disc list-inside text-sm text-brand-gray mt-2 space-y-1">
                  <li>{t('publishJourney.sidebar.case1')}</li>
                  <li>{t('publishJourney.sidebar.case2')}</li>
                  <li>{t('publishJourney.sidebar.case3')}</li>
                  <li>{t('publishJourney.sidebar.case4')}</li>
                </ul>
              </div>
              <div className="border-t pt-6">
                  <div className="flex items-start space-x-3">
                    <BoltIcon className="w-6 h-6 text-brand-red flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-brand-navy">{t('publishJourney.sidebar.quickSell.title')}</h4>
                        <a href="#" className="text-sm text-brand-red hover:underline">{t('publishJourney.sidebar.quickSell.link')}</a>
                    </div>
                  </div>
              </div>
              <div className="border-t pt-6">
                   <div className="flex items-start space-x-3">
                    <BriefcaseIcon className="w-6 h-6 text-brand-red flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-brand-navy">{t('publishJourney.sidebar.professional.title')}</h4>
                        <a href="#" className="text-sm text-brand-red hover:underline">{t('publishJourney.sidebar.professional.link')}</a>
                    </div>
                  </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <LocationConfirmationModal 
        isOpen={isConfirmationModalOpen} 
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmAddress}
        initialCoordinates={coordinates}
      />
    </div>
  );
};

export default PublishJourneyPage;