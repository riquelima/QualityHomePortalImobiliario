
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
  navigateToGuideToSell: () => void;
  navigateToDocumentsForSale: () => void;
  onAccessClick: () => void;
}

interface AddressState { city: string; street: string; number: string; state: string; }
interface ContactInfoState { phone: string; preference: string; name: string; }
interface DetailsState {
    title: string;
    propertyType: string;
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

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const { t } = useLanguage();
    const steps = [
        { label: t('publishJourney.stepper.step1') },
        { label: t('publishJourney.stepper.step2') },
        { label: t('publishJourney.stepper.step3') },
    ];

    return (
        <div className="flex items-start mb-12">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <React.Fragment key={stepNumber}>
                        <div className="flex flex-col items-center text-center w-24">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-colors duration-300 ${isActive || isCompleted ? 'bg-brand-red text-white' : 'bg-gray-300 text-brand-dark'}`}>
                                {isCompleted ? <CheckIcon className="w-6 h-6" /> : stepNumber}
                            </div>
                            <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${isActive ? 'text-brand-red' : 'text-brand-gray'}`}>{step.label}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mt-5 mx-2 transition-colors duration-300 ${isCompleted ? 'bg-brand-red' : 'bg-gray-300'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};


export const PublishJourneyPage: React.FC<PublishJourneyPageProps> = (props) => {
    const { t, language } = useLanguage();
    const { user, profile, onLogout, onAddProperty, onUpdateProperty, onPublishError, propertyToEdit } = props;
    
    // Form State
    const [step, setStep] = useState(1);
    const [operation, setOperation] = useState('venda');
    const [propertyType, setPropertyType] = useState('Apartamento');
    const [address, setAddress] = useState<AddressState>({ city: '', street: '', number: '', state: '' });
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
    const [isAddressVerified, setIsAddressVerified] = useState(false);
    const [verifiedAddress, setVerifiedAddress] = useState('');
    const [contactInfo, setContactInfo] = useState<ContactInfoState>({
        phone: profile?.telefone || '',
        preference: 'chat_and_phone',
        name: profile?.nome_completo || ''
    });
    const [details, setDetails] = useState<DetailsState>({
        title: '', propertyType: 'Apartamento', condition: '', grossArea: '', netArea: '', bedrooms: 1, bathrooms: 1, hasElevator: null, homeFeatures: [], buildingFeatures: [], description: '',
        salePrice: '', iptuAnnual: '', acceptsFinancing: null, occupationSituation: 'vacant',
        monthlyRent: '', condoFee: '', iptuMonthly: '', rentalConditions: [], petsAllowed: null,
        dailyRate: '', minStay: '1', maxGuests: '2', cleaningFee: '',
    });
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [files, setFiles] = useState<MediaItem[]>([]);
    const [filesToRemove, setFilesToRemove] = useState<number[]>([]);

    // UI State
    const [isLocationModalOpen, setLocationModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAITitleLoading, setIsAITitleLoading] = useState(false);
    const [isAIDescriptionLoading, setIsAIDescriptionLoading] = useState(false);
    
    // Address Suggestions State (Simplified for brevity)
    const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
    const [isCitySuggestionsOpen, setIsCitySuggestionsOpen] = useState(false);
    const citySuggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (propertyToEdit && user) {
            setOperation(propertyToEdit.tipo_operacao || 'venda');
            setPropertyType(propertyToEdit.tipo_imovel || 'Apartamento');
            const newAddress = {
                city: propertyToEdit.cidade || '',
                street: propertyToEdit.rua || '',
                number: propertyToEdit.numero || '',
                state: '' // Assuming state is part of city for now
            };
            setAddress(newAddress);
            setCoordinates({ lat: propertyToEdit.latitude, lng: propertyToEdit.longitude });
            setIsAddressVerified(true);
            setVerifiedAddress(propertyToEdit.endereco_completo);
            
            setContactInfo({
                name: profile?.nome_completo || '',
                phone: profile?.telefone || '',
                preference: 'chat_and_phone' // Assuming a default
            });

            setDetails({
                title: propertyToEdit.titulo,
                propertyType: propertyToEdit.tipo_imovel || 'Apartamento',
                grossArea: String(propertyToEdit.area_bruta || ''),
                netArea: '', // Assuming not present
                bedrooms: propertyToEdit.quartos,
                bathrooms: propertyToEdit.banheiros,
                hasElevator: propertyToEdit.possui_elevador ?? null,
                homeFeatures: propertyToEdit.caracteristicas_imovel || [],
                buildingFeatures: propertyToEdit.caracteristicas_condominio || [],
                description: propertyToEdit.descricao,
                salePrice: propertyToEdit.tipo_operacao === 'venda' ? String(propertyToEdit.preco) : '',
                iptuAnnual: String(propertyToEdit.valor_iptu || ''),
                acceptsFinancing: propertyToEdit.aceita_financiamento ?? null,
                occupationSituation: propertyToEdit.situacao_ocupacao || 'vacant',
                monthlyRent: propertyToEdit.tipo_operacao === 'aluguel' ? String(propertyToEdit.preco) : '',
                condoFee: String(propertyToEdit.taxa_condominio || ''),
                iptuMonthly: '', // Assuming not present
                rentalConditions: propertyToEdit.condicoes_aluguel || [],
                petsAllowed: propertyToEdit.permite_animais ?? null,
                dailyRate: propertyToEdit.tipo_operacao === 'temporada' ? String(propertyToEdit.preco) : '',
                minStay: String(propertyToEdit.minimo_diarias || '1'),
                maxGuests: String(propertyToEdit.maximo_hospedes || '2'),
                cleaningFee: String(propertyToEdit.taxa_limpeza || ''),
                condition: '', // Not in model
            });
            setAvailableDates(propertyToEdit.datas_disponiveis || []);
            setFiles(propertyToEdit.midias_imovel || []);
        }
    }, [propertyToEdit, user, profile]);


    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleVerifyAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        // Mock geocoding
        const mockCoords = { lat: -12.97, lng: -38.50 };
        setCoordinates(mockCoords);
        setLocationModalOpen(true);
    };

    const confirmAddress = (coords: { lat: number, lng: number }) => {
        setCoordinates(coords);
        setVerifiedAddress(`${address.street}, ${address.number}, ${address.city}`);
        setIsAddressVerified(true);
        setLocationModalOpen(false);
    };
    
    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContactInfo(prev => ({...prev, [e.target.id]: e.target.value }));
    };
    
    const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContactInfo(prev => ({ ...prev, preference: e.target.value }));
    };
    
    const handleContinueToDetails = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactInfo.name || !contactInfo.phone) {
            props.onRequestModal({
                type: 'error',
                title: t('systemModal.errorTitle'),
                message: 'Nome e telefone são obrigatórios.'
            });
            return;
        }
        setStep(2);
    };

    const handleDetailsChange = (value: any, name: string) => {
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const incrementCounter = (field: 'bedrooms' | 'bathrooms') => {
        setDetails(prev => ({ ...prev, [field]: (prev[field] || 0) + 1 }));
    };

    const decrementCounter = (field: 'bedrooms' | 'bathrooms') => {
        setDetails(prev => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) - 1) }));
    };
    
    const handleBack = () => setStep(prev => prev - 1);
    
    const handleContinueToPhotos = () => {
        if (details.title.trim().length < 10) {
            props.onRequestModal({
                type: 'error',
                title: t('systemModal.errorTitle'),
                message: 'O título do anúncio deve ter pelo menos 10 caracteres.'
            });
            return;
        }
        if (!details.grossArea || parseInt(details.grossArea, 10) <= 0) {
            props.onRequestModal({
                type: 'error',
                title: t('systemModal.errorTitle'),
                message: 'A área bruta deve ser um número positivo.'
            });
            return;
        }
        setStep(3);
    };

    const removeFile = (fileToRemove: MediaItem) => {
        if (typeof fileToRemove !== 'string' && 'id' in fileToRemove) {
            setFilesToRemove(prev => [...prev, fileToRemove.id]);
        }
        setFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const handlePublish = async () => {
        if (!user || !coordinates) {
            onPublishError("Usuário não autenticado ou endereço inválido.");
            return;
        }
        setIsSubmitting(true);

        try {
            // 1. Upload new files
            const uploadedMediaUrls: { url: string; tipo: 'imagem' | 'video' }[] = [];
            for (const file of files) {
                if (file instanceof File) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                    const { data, error: uploadError } = await supabase.storage
                        .from('imoveis')
                        .upload(fileName, file);

                    if (uploadError) throw new Error(`Falha no upload do arquivo: ${uploadError.message}`);
                    
                    const { data: { publicUrl } } = supabase.storage.from('imoveis').getPublicUrl(data.path);
                    uploadedMediaUrls.push({
                        url: publicUrl,
                        tipo: file.type.startsWith('image') ? 'imagem' : 'video'
                    });
                }
            }

            // 2. Prepare property data
            const propertyData: Omit<Property, 'id' | 'images' | 'bedrooms' | 'bathrooms' | 'area' | 'address' | 'title' | 'lat' | 'lng' | 'price' | 'description'> = {
                anunciante_id: user.id,
                titulo: details.title,
                descricao: details.description,
                endereco_completo: verifiedAddress,
                cidade: address.city,
                rua: address.street,
                numero: address.number,
                latitude: coordinates.lat,
                longitude: coordinates.lng,
                preco: parseFloat(details.salePrice || details.monthlyRent || details.dailyRate || '0'),
                tipo_operacao: operation,
                tipo_imovel: propertyType,
                quartos: details.bedrooms,
                banheiros: details.bathrooms,
                area_bruta: parseInt(details.grossArea, 10),
                possui_elevador: details.hasElevator ?? undefined,
                caracteristicas_imovel: details.homeFeatures,
                caracteristicas_condominio: details.buildingFeatures,
                situacao_ocupacao: details.occupationSituation,
                taxa_condominio: parseFloat(details.condoFee || '0'),
                valor_iptu: parseFloat(details.iptuAnnual || details.iptuMonthly || '0'),
                aceita_financiamento: details.acceptsFinancing ?? undefined,
                condicoes_aluguel: details.rentalConditions,
                permite_animais: details.petsAllowed ?? undefined,
                minimo_diarias: parseInt(details.minStay, 10),
                maximo_hospedes: parseInt(details.maxGuests, 10),
                taxa_limpeza: parseFloat(details.cleaningFee || '0'),
                datas_disponiveis: availableDates,
                status: 'ativo'
            };

            if (propertyToEdit) {
                // Update existing property
                const { data: updatedProperty, error } = await supabase
                    .from('imoveis')
                    .update(propertyData)
                    .eq('id', propertyToEdit.id)
                    .select()
                    .single();
                
                if (error) throw error;
                
                // Handle media changes
                if (filesToRemove.length > 0) {
                    await supabase.from('midias_imovel').delete().in('id', filesToRemove);
                    // Also delete from storage if needed
                }
                if (uploadedMediaUrls.length > 0) {
                    const newMedia = uploadedMediaUrls.map(m => ({ imovel_id: updatedProperty.id, ...m }));
                    await supabase.from('midias_imovel').insert(newMedia);
                }
                await onUpdateProperty();

            } else {
                 // Insert new property
                const { data: newProperty, error } = await supabase
                    .from('imoveis')
                    .insert(propertyData)
                    .select()
                    .single();

                if (error) throw error;
                
                if (uploadedMediaUrls.length > 0) {
                    const newMedia = uploadedMediaUrls.map(m => ({ imovel_id: newProperty.id, ...m }));
                    await supabase.from('midias_imovel').insert(newMedia);
                }

                await onAddProperty(newProperty as Property);
            }

            setStep(1); // Reset form or navigate away

        } catch (error: any) {
            console.error("Publishing error:", error);
            onPublishError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // AI Handlers (Simplified)
    const onGenerateAITitle = async () => {
        setIsAITitleLoading(true);
        // Mock AI call
        setTimeout(() => {
            setDetails(prev => ({...prev, title: `${prev.title} - Oportunidade Única!`}));
            setIsAITitleLoading(false);
        }, 1000);
    };
    const onGenerateAIDescription = async () => {
        setIsAIDescriptionLoading(true);
        setTimeout(() => {
            setDetails(prev => ({...prev, description: `Descubra este incrível imóvel com ${prev.bedrooms} quartos. ${prev.description}`}));
            setIsAIDescriptionLoading(false);
        }, 1500);
    };
    

    const renderCurrentStep = () => {
        switch (step) {
            case 1:
                return (
                    <form className="space-y-8" onSubmit={!isAddressVerified ? handleVerifyAddress : handleContinueToDetails}>
                        <div>
                            <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.propertyType.label')}</label>
                            <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red">
                                <option>Apartamento</option>
                                <option>Casa</option>
                                <option>Terreno</option>
                                <option>Escritório</option>
                                <option>Quarto</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.operation.label')}</label>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="operation" value="venda" checked={operation === 'venda'} onChange={() => setOperation('venda')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" /><span>{t('publishJourney.form.operation.sell')}</span></label>
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="operation" value="aluguel" checked={operation === 'aluguel'} onChange={() => setOperation('aluguel')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" /><span>{t('publishJourney.form.operation.rent')}</span></label>
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="operation" value="temporada" checked={operation === 'temporada'} onChange={() => setOperation('temporada')} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" /><span>{t('publishJourney.form.operation.season')}</span></label>
                            </div>
                        </div>
                        {isAddressVerified ? (
                           <div>
                                <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.verifiedAddress.label')}</label>
                                <div className="bg-green-50 p-4 border border-green-200 rounded-md flex justify-between items-center"><div className="flex items-center"><VerifiedIcon className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" /><p className="text-brand-dark">{verifiedAddress}</p></div><button type="button" onClick={() => setIsAddressVerified(false)} className="text-brand-red hover:underline font-medium text-sm flex-shrink-0 ml-4">{t('publishJourney.verifiedAddress.edit')}</button></div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.location.label')}</label>
                                <div className="space-y-4">
                                    <div className="relative" ref={citySuggestionsRef}><label htmlFor="city" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.city')}</label><div className="relative"><input type="text" id="city" value={address.city} onChange={handleAddressChange} onFocus={() => { if (citySuggestions.length > 0) setIsCitySuggestionsOpen(true); }} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" required autoComplete="off" /></div></div>
                                    <div><label htmlFor="street" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.street')}</label><input type="text" id="street" value={address.street} onChange={handleAddressChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" required autoComplete="off" /></div>
                                    <div><label htmlFor="number" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.number')}</label><input type="text" id="number" value={address.number} onChange={handleAddressChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" required /></div>
                                </div>
                            </div>
                        )}
                        {isAddressVerified && user && (
                            <div className="bg-white p-6 rounded-md border border-gray-200">
                                <h2 className="text-xl font-bold text-brand-navy mb-6">{t('publishJourney.contactDetails.title')}</h2>
                                <div className="space-y-6">
                                    <div><label className="block text-sm font-medium text-brand-dark">{t('publishJourney.contactDetails.emailLabel')}</label><div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md text-brand-gray">{user.email}</div><p className="text-xs text-brand-gray mt-1">{t('publishJourney.contactDetails.emailDescription')}</p><button type="button" onClick={onLogout} className="text-sm text-brand-red hover:underline mt-1">{t('publishJourney.contactDetails.changeAccount')}</button></div>
                                    <div><label htmlFor="phone" className="block text-sm font-medium text-brand-dark">{t('publishJourney.contactDetails.phoneLabel')}</label><div className="flex mt-1"><span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">+55</span><input type="tel" id="phone" value={contactInfo.phone} onChange={handleContactChange} className="flex-1 w-full p-3 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder={t('publishJourney.contactDetails.phonePlaceholder')} /></div></div>
                                    <div><label htmlFor="name" className="block text-sm font-medium text-brand-dark">{t('publishJourney.contactDetails.nameLabel')}</label><input type="text" id="name" value={contactInfo.name} onChange={handleContactChange} className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" required /><p className="text-xs text-brand-gray mt-1">{t('publishJourney.contactDetails.nameDescription')}</p></div>
                                    <div><label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.contactDetails.preferenceLabel')}</label><div className="space-y-3"><div className="bg-gray-50 p-3 rounded-md border"><label className="flex items-center space-x-3 cursor-pointer"><input type="radio" name="preference" value="chat_and_phone" checked={contactInfo.preference === 'chat_and_phone'} onChange={handlePreferenceChange} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/><div><p className="font-medium">{t('publishJourney.contactDetails.prefChatAndPhone')}</p><p className="text-xs text-brand-gray">{t('publishJourney.contactDetails.prefChatAndPhoneDesc')}</p></div></label></div><div className="bg-gray-50 p-3 rounded-md border"><label className="flex items-center space-x-3 cursor-pointer"><input type="radio" name="preference" value="chat_only" checked={contactInfo.preference === 'chat_only'} onChange={handlePreferenceChange} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/><div><p className="font-medium">{t('publishJourney.contactDetails.prefChatOnly')}</p><p className="text-xs text-brand-gray">{t('publishJourney.contactDetails.prefChatOnlyDesc')}</p></div></label></div><div className="bg-gray-50 p-3 rounded-md border"><label className="flex items-center space-x-3 cursor-pointer"><input type="radio" name="preference" value="phone_only" checked={contactInfo.preference === 'phone_only'} onChange={handlePreferenceChange} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300"/><p className="font-medium">{t('publishJourney.contactDetails.prefPhoneOnly')}</p></label></div></div></div>
                                </div>
                            </div>
                        )}
                         <div>{!isAddressVerified ? (<button type="submit" className="px-6 py-3 bg-gray-300 text-brand-dark font-bold rounded-md hover:bg-gray-400 transition-colors">{t('publishJourney.form.submitButton')}</button>) : (<div className="text-center"><button type="submit" className="w-full max-w-xs mx-auto px-6 py-3 bg-[#93005a] text-white font-bold rounded-md hover:opacity-90 transition-opacity">{t('publishJourney.contactDetails.continueButton')}</button><p className="text-sm text-brand-gray mt-2">{t('publishJourney.contactDetails.nextStepInfo')}</p></div>)}</div>
                    </form>
                );
            case 2:
                // This is a simplified details form render
                return (
                     <div className="space-y-8">
                        {/* Common Details */}
                        <div>
                             <label htmlFor="adTitle" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.adTitle')}</label>
                             <input type="text" id="adTitle" value={details.title} onChange={(e) => handleDetailsChange(e.target.value, 'title')} className="w-full p-3 border border-gray-300 rounded-md" required minLength={10} />
                        </div>
                        <div>
                            <label htmlFor="grossArea" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.grossArea')}</label>
                            <input type="number" id="grossArea" value={details.grossArea} onChange={(e) => handleDetailsChange(e.target.value, 'grossArea')} className="w-full p-3 border border-gray-300 rounded-md" required />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="flex items-center space-x-4"><label>{t('publishJourney.detailsForm.bedrooms')}</label><button type="button" onClick={() => decrementCounter('bedrooms')} className="p-2 border rounded-full">-</button><span>{details.bedrooms}</span><button type="button" onClick={() => incrementCounter('bedrooms')} className="p-2 border rounded-full">+</button></div>
                             <div className="flex items-center space-x-4"><label>{t('publishJourney.detailsForm.bathrooms')}</label><button type="button" onClick={() => decrementCounter('bathrooms')} className="p-2 border rounded-full">-</button><span>{details.bathrooms}</span><button type="button" onClick={() => incrementCounter('bathrooms')} className="p-2 border rounded-full">+</button></div>
                        </div>
                        <div>
                            <label htmlFor="adDescription" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.adDescription')}</label>
                             <textarea id="adDescription" rows={6} value={details.description} onChange={(e) => handleDetailsChange(e.target.value, 'description')} className="w-full p-3 border border-gray-300 rounded-md" />
                        </div>

                        {/* Operation Specific Details */}
                        {operation === 'venda' && (
                             <div>
                                <label htmlFor="salePrice" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.salePrice')}</label>
                                <input type="text" inputMode="numeric" id="salePrice" value={details.salePrice} onChange={(e) => handleDetailsChange(e.target.value, 'salePrice')} className="w-full p-3 border border-gray-300 rounded-md" />
                            </div>
                        )}
                        {operation === 'aluguel' && (
                             <div>
                                <label htmlFor="monthlyRent" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.monthlyRent')}</label>
                                <input type="text" inputMode="numeric" id="monthlyRent" value={details.monthlyRent} onChange={(e) => handleDetailsChange(e.target.value, 'monthlyRent')} className="w-full p-3 border border-gray-300 rounded-md" />
                            </div>
                        )}
                        {operation === 'temporada' && (
                             <div>
                                <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.availability')}</label>
                                <CalendarWidget selectedDates={availableDates} onDateChange={setAvailableDates} />
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <button type="button" onClick={handleBack} className="text-brand-dark hover:underline">Voltar</button>
                            <button type="button" onClick={handleContinueToPhotos} className="px-6 py-3 bg-[#93005a] text-white font-bold rounded-md">{t('publishJourney.detailsForm.continueToPhotosButton')}</button>
                        </div>
                     </div>
                );
             case 3:
                const fileInputRef = React.useRef<HTMLInputElement>(null);
                const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                    if (event.target.files) {
                        const newFiles = Array.from(event.target.files);
                        setFiles(prev => [...prev, ...newFiles]);
                    }
                };
                return (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-brand-navy">{t('publishJourney.photosForm.title')}</h2>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*"/>
                            <p className="mb-4 text-brand-gray">{t('publishJourney.photosForm.dragAndDrop')}</p>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-gray-200 text-brand-dark font-bold rounded-md hover:bg-gray-300">{t('publishJourney.photosForm.addButton')}</button>
                            <p className="text-xs text-brand-gray mt-4">{t('publishJourney.photosForm.limitsInfo')}</p>
                        </div>
                        {files.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {files.map((file, index) => {
                                    const isUploaded = typeof file !== 'string' && 'url' in file;
                                    const url = isUploaded ? file.url : URL.createObjectURL(file as File);
                                    return (
                                        <div key={index} className="relative group"><img src={url} alt="preview" className="w-full h-32 object-cover rounded-md"/><button onClick={() => removeFile(file)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100">&times;</button></div>
                                    )
                                })}
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                             <button type="button" onClick={handleBack} className="text-brand-dark hover:underline">Voltar</button>
                            <button onClick={handlePublish} disabled={isSubmitting} className="px-6 py-4 bg-[#93005a] text-white font-bold rounded-md hover:opacity-90 disabled:bg-gray-400">
                                {isSubmitting ? (propertyToEdit ? t('publishJourney.photosForm.updatingButton') : t('publishJourney.photosForm.publishingButton')) : (propertyToEdit ? t('publishJourney.photosForm.updateButton') : t('publishJourney.photosForm.publishButton'))}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    // Calendar Widget Component (included here to fix the bug)
    const CalendarWidget: React.FC<{ selectedDates: string[]; onDateChange: (dates: string[]) => void; }> = ({ selectedDates, onDateChange }) => {
        const [currentDate, setCurrentDate] = useState(new Date());

        const handleDateClick = (date: Date) => {
            const dateString = date.toISOString().split('T')[0];
            const newDates = selectedDates.includes(dateString) ? selectedDates.filter(d => d !== dateString) : [...selectedDates, dateString];
            onDateChange(newDates.sort());
        };

        const renderCalendar = () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const startDayOfWeek = firstDay.getDay();

            let dates = Array(startDayOfWeek).fill(null).map((_, i) => <div key={`empty-${i}`} className="w-10 h-10"></div>);
            
            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(year, month, i);
                const dateString = date.toISOString().split('T')[0];
                const isSelected = selectedDates.includes(dateString);
                const isPast = date < new Date() && date.toDateString() !== new Date().toDateString();

                dates.push(
                    <button type="button" key={i} onClick={() => !isPast && handleDateClick(date)} disabled={isPast}
                        className={`w-10 h-10 rounded-full transition-colors ${isPast ? 'text-gray-400 cursor-not-allowed' : isSelected ? 'bg-brand-red text-white' : 'hover:bg-red-100'}`}>
                        {i}
                    </button>
                );
            }
            return dates;
        };
        
        return (
            <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                    <button type="button" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>&lt; {t('publishJourney.detailsForm.calendar.prev')}</button>
                    <span className="font-bold">{new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(currentDate)}</span>
                    <button type="button" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>{t('publishJourney.detailsForm.calendar.next')} &gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-brand-gray mb-2">
                    <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 justify-items-center">{renderCalendar()}</div>
            </div>
        );
    };

    return (
        <div className="bg-brand-light-gray min-h-screen">
            <Header {...props} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-2/3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-2">{propertyToEdit ? t('publishJourney.editTitle') : t('publishJourney.title')}</h1>
                        <p className="text-brand-gray mb-8">Preencha os dados abaixo para publicar seu anúncio.</p>
                        <Stepper currentStep={step} />
                        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                           {renderCurrentStep()}
                        </div>
                    </div>
                    <aside className="lg:w-1/3">
                        <div className="sticky top-24 bg-white p-6 rounded-lg shadow-md space-y-6">
                            <h2 className="text-xl font-bold text-brand-navy">{t('publishJourney.sidebar.title')}</h2>
                            <p className="text-sm text-brand-gray">{t('publishJourney.sidebar.p1')}</p>
                            <p className="text-sm text-brand-gray">{t('publishJourney.sidebar.p2')}</p>
                            <p className="text-sm text-brand-gray">{t('publishJourney.sidebar.p3')}</p>
                            <p className="text-sm text-brand-gray">{t('publishJourney.sidebar.p4')}</p>
                            <ul className="list-disc list-inside text-sm text-brand-gray space-y-1">
                                <li>{t('publishJourney.sidebar.case1')}</li>
                                <li>{t('publishJourney.sidebar.case2')}</li>
                                <li>{t('publishJourney.sidebar.case3')}</li>
                                <li>{t('publishJourney.sidebar.case4')}</li>
                            </ul>
                            <div className="border-t pt-6 space-y-4">
                               <div className="flex items-start space-x-3"><BoltIcon className="w-6 h-6 text-brand-red flex-shrink-0 mt-1" /><div><h3 className="font-bold text-brand-dark">{t('publishJourney.sidebar.quickSell.title')}</h3><a href="#" className="text-sm text-brand-red hover:underline">{t('publishJourney.sidebar.quickSell.link')}</a></div></div>
                               <div className="flex items-start space-x-3"><BriefcaseIcon className="w-6 h-6 text-brand-red flex-shrink-0 mt-1" /><div><h3 className="font-bold text-brand-dark">{t('publishJourney.sidebar.professional.title')}</h3><a href="#" className="text-sm text-brand-red hover:underline">{t('publishJourney.sidebar.professional.link')}</a></div></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            <LocationConfirmationModal 
                isOpen={isLocationModalOpen}
                onClose={() => setLocationModalOpen(false)}
                onConfirm={confirmAddress}
                initialCoordinates={coordinates}
            />
        </div>
    );
};
