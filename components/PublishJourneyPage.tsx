

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
import { GoogleGenAI } from '@google/genai';
import AIIcon from './icons/AIIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import WarningIcon from './icons/WarningIcon';


type MediaItem = File | (Media & { type: 'existing' });

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
  navigateHome: () => void;
  onAccessClick: () => void;
}

// Helper function for mock AI title generation
const mockAITitleGeneration = (baseTitle: string): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (!baseTitle) {
                resolve("Título de Anúncio Incrível Gerado por IA");
                return;
            }
            const enhancements = ["Oportunidade Única", "Seu Novo Lar dos Sonhos", "Localização Perfeita", "Viva com Estilo e Conforto", "Imperdível na Região"];
            const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
            resolve(`${baseTitle} - ${randomEnhancement}`);
        }, 800);
    });
};

// Helper function for mock AI description generation
const mockAIDescriptionGeneration = (formData: any): Promise<string> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const { detailsPropertyType, grossArea, bedrooms, bathrooms, description, homeFeatures } = formData;
            
            let generatedText = `Descubra este incrível ${detailsPropertyType.toLowerCase()} com ${grossArea}m², ideal para quem busca conforto e praticidade. O imóvel conta com ${bedrooms} quarto(s) e ${bathrooms} banheiro(s), oferecendo o espaço perfeito para sua família.\n\n`;
            
            if (homeFeatures.includes('balcony')) {
                generatedText += "Desfrute de momentos relaxantes na varanda, apreciando a vista da cidade. ";
            }
             if (homeFeatures.includes('suite')) {
                generatedText += "A suíte principal é um verdadeiro refúgio de tranquilidade e privacidade. ";
            }

            if (description && description.trim()) {
                generatedText += `\n${description.trim()}\n\n`;
            }

            generatedText += "Não perca a chance de conhecer seu novo lar. Agende uma visita! (Descrição de demonstração gerada por IA).";
            
            resolve(generatedText);
        }, 1200);
    });
}

const Stepper: React.FC<{ currentStep: number, setStep: (step: number) => void }> = ({ currentStep, setStep }) => {
    const { t } = useLanguage();
    const steps = [
        { label: t('publishJourney.stepper.step1') },
        { label: t('publishJourney.stepper.step2') },
        { label: t('publishJourney.stepper.step3') },
    ];

    return (
        <div className="flex items-start justify-between w-full mb-12">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <React.Fragment key={stepNumber}>
                        <div 
                            className={`flex flex-col items-center text-center px-2 ${isCompleted ? 'cursor-pointer' : ''}`}
                            onClick={isCompleted ? () => setStep(stepNumber) : undefined}
                            style={{ minWidth: '60px' }}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-colors duration-300 ${isActive || isCompleted ? 'bg-brand-red text-white' : 'bg-gray-300 text-brand-dark'}`}>
                                {isCompleted ? <CheckIcon className="w-6 h-6" /> : stepNumber}
                            </div>
                            <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${isActive ? 'text-brand-red' : 'text-brand-gray'}`}>{step.label}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mt-5 transition-colors duration-300 ${isCompleted ? 'bg-brand-red' : 'bg-gray-300'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export const PublishJourneyPage: React.FC<PublishJourneyPageProps> = (props) => {
    const { t, language } = useLanguage();
    const { user, profile, onAddProperty, onUpdateProperty, onPublishError, propertyToEdit } = props;
    
    // Form State
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        propertyType: 'Apartamento',
        operation: 'venda',
        city: '', street: '', number: '',
        coordinates: null as { lat: number, lng: number } | null,
        isAddressVerified: false,
        verifiedAddress: '',
        contactName: profile?.nome_completo || '',
        contactPhone: profile?.telefone || '',
        contactPreference: 'prefChatAndPhone',
        title: '', detailsPropertyType: 'Apartamento',
        grossArea: '', netArea: '',
        bedrooms: 1, bathrooms: 1,
        hasElevator: null as boolean | null,
        homeFeatures: [] as string[],
        buildingFeatures: [] as string[],
        description: '', salePrice: '', iptuAnnual: '',
        acceptsFinancing: null as boolean | null,
        occupationSituation: 'vacant',
        monthlyRent: '', condoFee: '', iptuMonthly: '',
        rentalConditions: [] as string[], petsAllowed: null as boolean | null,
        dailyRate: '', minStay: '1', maxGuests: '2', cleaningFee: '',
        availableDates: [] as string[],
    });

    const [files, setFiles] = useState<MediaItem[]>([]);
    const [filesToRemove, setFilesToRemove] = useState<number[]>([]);

    // UI State
    const [isLocationPermissionModalOpen, setIsLocationPermissionModalOpen] = useState(!propertyToEdit);
    const [isLocationConfirmationModalOpen, setLocationConfirmationModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

    const propertyTypes = [
        { key: 'apartment', value: 'Apartamento' },
        { key: 'house', value: 'Casa' },
        { key: 'room', value: 'Quarto' },
        { key: 'office', value: 'Escritório' },
        { key: 'land', value: 'Terreno' }
    ];

    const operationTitleKeyMap = {
        venda: 'sell',
        aluguel: 'rent',
        temporada: 'season'
    };

    useEffect(() => {
        if (propertyToEdit) {
            setFormData({
                propertyType: propertyToEdit.tipo_imovel || 'Apartamento',
                operation: propertyToEdit.tipo_operacao || 'venda',
                city: propertyToEdit.cidade || '',
                street: propertyToEdit.rua || '',
                number: propertyToEdit.numero || '',
                coordinates: { lat: propertyToEdit.latitude, lng: propertyToEdit.longitude },
                isAddressVerified: true,
                verifiedAddress: propertyToEdit.endereco_completo,
                contactName: profile?.nome_completo || '',
                contactPhone: profile?.telefone || '',
                contactPreference: 'prefChatAndPhone',
                title: propertyToEdit.titulo,
                detailsPropertyType: propertyToEdit.tipo_imovel || 'Apartamento',
                grossArea: String(propertyToEdit.area_bruta || ''),
                netArea: String(propertyToEdit.area_util || ''),
                bedrooms: propertyToEdit.quartos,
                bathrooms: propertyToEdit.banheiros,
                hasElevator: propertyToEdit.possui_elevador ?? null,
                homeFeatures: propertyToEdit.caracteristicas_imovel || [],
                buildingFeatures: propertyToEdit.caracteristicas_condominio || [],
                description: propertyToEdit.descricao,
                salePrice: propertyToEdit.tipo_operacao === 'venda' ? String(propertyToEdit.preco) : '',
                iptuAnnual: propertyToEdit.tipo_operacao === 'venda' ? String(propertyToEdit.valor_iptu || '') : '',
                acceptsFinancing: propertyToEdit.aceita_financiamento ?? null,
                occupationSituation: propertyToEdit.situacao_ocupacao || 'vacant',
                monthlyRent: propertyToEdit.tipo_operacao === 'aluguel' ? String(propertyToEdit.preco) : '',
                condoFee: String(propertyToEdit.taxa_condominio || ''),
                iptuMonthly: propertyToEdit.tipo_operacao === 'aluguel' ? String(propertyToEdit.valor_iptu || '') : '',
                rentalConditions: propertyToEdit.condicoes_aluguel || [],
                petsAllowed: propertyToEdit.permite_animais ?? null,
                dailyRate: propertyToEdit.tipo_operacao === 'temporada' ? String(propertyToEdit.preco) : '',
                minStay: String(propertyToEdit.minimo_diarias || '1'),
                maxGuests: String(propertyToEdit.maximo_hospedes || '2'),
                cleaningFee: String(propertyToEdit.taxa_limpeza || ''),
                availableDates: propertyToEdit.datas_disponiveis || [],
            });
            const existingMedia = (propertyToEdit.midias_imovel || []).map(m => ({ ...m, type: 'existing' as const }));
            setFiles(existingMedia);
        }
    }, [propertyToEdit, profile]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'homeFeatures' | 'buildingFeatures' | 'rentalConditions') => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentFeatures = prev[category];
            if (checked) {
                return { ...prev, [category]: [...currentFeatures, value] };
            } else {
                return { ...prev, [category]: currentFeatures.filter(item => item !== value) };
            }
        });
    };
    
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let finalValue: boolean | string | null = value;
        if (value === 'true') finalValue = true;
        if (value === 'false') finalValue = false;
        if (value === 'null') finalValue = null;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleNumberChange = (field: 'bedrooms' | 'bathrooms', delta: number) => {
        setFormData(prev => ({ ...prev, [field]: Math.max(0, prev[field] + delta) }));
    };
    
    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifyingAddress(true);

        const fullAddress = `${formData.street}, ${formData.number}, ${formData.city}, Brasil`;
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const coordinates = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setFormData(prev => ({ ...prev, coordinates }));
                setLocationConfirmationModalOpen(true);
            } else {
                 props.onRequestModal({
                    type: 'error',
                    title: 'Endereço não encontrado',
                    message: 'Não foi possível localizar o endereço fornecido. Por favor, verifique os dados e tente novamente.',
                });
            }
        } catch (error) {
            console.error("Erro de geocodificação:", error);
            props.onRequestModal({
                type: 'error',
                title: t('systemModal.errorTitle'),
                message: 'Ocorreu um erro ao tentar verificar o endereço. Por favor, tente novamente.',
            });
        } finally {
            setIsVerifyingAddress(false);
        }
    };
    
    const handleConfirmLocation = (coords: { lat: number, lng: number }) => {
        const fullAddress = `${formData.street}, ${formData.number}, ${formData.city}`;
        setFormData(prev => ({
            ...prev,
            coordinates: coords,
            isAddressVerified: true,
            verifiedAddress: fullAddress
        }));
        setLocationConfirmationModalOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };
    
    const removeFile = (fileToRemove: MediaItem) => {
        // FIX: Use 'id' as a more robust type guard to differentiate between existing Media and new File objects.
        if ('id' in fileToRemove) { // It's an existing Media object
            setFiles(prev => prev.filter(f => f !== fileToRemove));
            setFilesToRemove(prev => [...prev, fileToRemove.id]);
        } else { // It's a new File
            setFiles(prev => prev.filter(f => f !== fileToRemove));
        }
    };

    const handleSubmitJourney = async () => {
        if (!user) {
            onPublishError("Usuário não autenticado.");
            return;
        }
        setIsSubmitting(true);

        try {
            // 1. Upload new files to Supabase Storage
            const newFilesToUpload = files.filter(f => 'name' in f) as File[];
            const uploadedUrls: { url: string, type: 'imagem' | 'video' }[] = [];

            for (const file of newFilesToUpload) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('midia')
                    .upload(fileName, file);

                if (uploadError) throw new Error(`Erro no upload do arquivo ${file.name}: ${uploadError.message}`);
                
                const { data } = supabase.storage.from('midia').getPublicUrl(fileName);
                uploadedUrls.push({
                    url: data.publicUrl,
                    type: file.type.startsWith('video') ? 'video' : 'imagem'
                });
            }
            
            // 2. Prepare property data for Supabase table
            const propertyData = {
                anunciante_id: user.id,
                titulo: formData.title,
                descricao: formData.description,
                endereco_completo: formData.verifiedAddress,
                cidade: formData.city,
                rua: formData.street,
                numero: formData.number,
                latitude: formData.coordinates?.lat,
                longitude: formData.coordinates?.lng,
                tipo_imovel: formData.detailsPropertyType,
                tipo_operacao: formData.operation,
                preco: Number(formData.salePrice || formData.monthlyRent || formData.dailyRate),
                quartos: formData.bedrooms,
                banheiros: formData.bathrooms,
                area_bruta: Number(formData.grossArea),
                area_util: formData.netArea ? Number(formData.netArea) : null,
                possui_elevador: formData.hasElevator,
                taxa_condominio: formData.condoFee ? Number(formData.condoFee) : null,
                valor_iptu: formData.iptuAnnual || formData.iptuMonthly ? Number(formData.iptuAnnual || formData.iptuMonthly) : null,
                caracteristicas_imovel: formData.homeFeatures,
                caracteristicas_condominio: formData.buildingFeatures,
                situacao_ocupacao: formData.occupationSituation,
                aceita_financiamento: formData.acceptsFinancing,
                condicoes_aluguel: formData.rentalConditions,
                permite_animais: formData.petsAllowed,
                minimo_diarias: formData.minStay ? Number(formData.minStay) : null,
                maximo_hospedes: formData.maxGuests ? Number(formData.maxGuests) : null,
                taxa_limpeza: formData.cleaningFee ? Number(formData.cleaningFee) : null,
                datas_disponiveis: formData.availableDates,
                status: 'ativo'
            };

            let propertyId: number;

            if (propertyToEdit) {
                 // UPDATE existing property
                const { data: updatedProperty, error } = await supabase
                    .from('imoveis')
                    .update(propertyData)
                    .eq('id', propertyToEdit.id)
                    .select('id')
                    .single();
                if (error) throw error;
                propertyId = updatedProperty.id;

                // Handle media removal
                if (filesToRemove.length > 0) {
                    const { error: deleteMediaError } = await supabase
                        .from('midias_imovel')
                        .delete()
                        .in('id', filesToRemove);
                    if (deleteMediaError) console.error("Error removing media:", deleteMediaError);
                }
            } else {
                 // INSERT new property
                const { data: newProperty, error } = await supabase
                    .from('imoveis')
                    .insert(propertyData)
                    .select('id')
                    .single();
                if (error) throw error;
                propertyId = newProperty.id;
            }

            // 3. Insert new media URLs into midias_imovel table
            if (uploadedUrls.length > 0) {
                const mediaToInsert = uploadedUrls.map(media => ({
                    imovel_id: propertyId,
                    url: media.url,
                    tipo: media.type
                }));
                const { error: mediaError } = await supabase.from('midias_imovel').insert(mediaToInsert);
                if (mediaError) throw new Error(`Erro ao salvar mídias: ${mediaError.message}`);
            }

            // 4. Update profile if phone number was added/changed
            if (formData.contactPhone && formData.contactPhone !== profile?.telefone) {
                const { error: profileError } = await supabase
                    .from('perfis')
                    .update({ telefone: formData.contactPhone })
                    .eq('id', user.id);
                if (profileError) console.error("Could not update profile phone:", profileError);
            }

            if (propertyToEdit) {
                await onUpdateProperty();
            } else {
                await onAddProperty(propertyData as any);
            }
            
        } catch (error: any) {
            console.error("Erro ao publicar anúncio:", error);
            onPublishError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // AI Title Generation
    const generateAITitle = useCallback(async () => {
        if (!formData.title.trim()) return;
        setIsGeneratingTitle(true);
        try {
            if (typeof process === 'undefined' || !process.env.API_KEY) {
                console.warn("Chave de API do Gemini não configurada. Usando título simulado.");
                const text = await mockAITitleGeneration(formData.title);
                setFormData(prev => ({ ...prev, title: text }));
                return;
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = t('publishJourney.detailsForm.aiTitlePrompt', { title: formData.title });
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });

            const text = response.text.trim();
            if (text) {
                setFormData(prev => ({ ...prev, title: text.replace(/["']/g, "") }));
            }
        } catch (error) {
            console.error("Erro ao gerar título com IA:", error);
            onPublishError(t('publishJourney.detailsForm.aiTitleError'));
        } finally {
            setIsGeneratingTitle(false);
        }
    }, [formData.title, t, onPublishError]);

    // AI Description Generation
    const generateAIDescription = useCallback(async () => {
        setIsGeneratingDescription(true);
        const details = `
            - Tipo: ${formData.detailsPropertyType}
            - Operação: ${formData.operation}
            - Área Bruta: ${formData.grossArea} m²
            - Quartos: ${formData.bedrooms}
            - Banheiros: ${formData.bathrooms}
            - Tem Elevador: ${formData.hasElevator ? 'Sim' : 'Não'}
            - Características do Imóvel: ${formData.homeFeatures.join(', ')}
            - Características do Condomínio: ${formData.buildingFeatures.join(', ')}
            - Descrição atual (para inspiração): ${formData.description}
        `;
        
        try {
            if (typeof process === 'undefined' || !process.env.API_KEY) {
                console.warn("Chave de API do Gemini não configurada. Usando descrição simulada.");
                const text = await mockAIDescriptionGeneration(formData);
                setFormData(prev => ({ ...prev, description: text }));
                return;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = t('publishJourney.detailsForm.aiDescriptionPrompt', { details });

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            const text = response.text.trim();
            if (text) {
                setFormData(prev => ({ ...prev, description: text }));
            }
        } catch (error) {
            console.error("Erro ao gerar descrição com IA:", error);
            onPublishError(t('publishJourney.detailsForm.aiDescriptionError'));
        } finally {
            setIsGeneratingDescription(false);
        }
    }, [formData, t, onPublishError]);

    const handleAcceptLocation = () => {
        setIsLocationPermissionModalOpen(false);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        if (data && data.address) {
                            const city = data.address.city || data.address.town || data.address.village;
                            const stateName = data.address.state;
                            const stateMap: { [key: string]: string } = {
                                'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA',
                                'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO',
                                'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
                                'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
                                'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
                                'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
                                'Sergipe': 'SE', 'Tocantins': 'TO'
                            };
                            const stateAbbr = stateMap[stateName] || stateName;
                            if (city && stateAbbr) {
                                setFormData(prev => ({ ...prev, city: `${city}, ${stateAbbr}` }));
                            }
                        }
                    } catch (error) {
                        console.error("Erro na geocodificação reversa:", error);
                    }
                },
                (error) => {
                    console.error("Erro de geolocalização:", error);
                }
            );
        }
    };

    return (
        <div className="bg-brand-light-gray min-h-screen">
            <Header {...props} />
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <div className="text-sm mb-6">
                    <span onClick={props.onBack} className="text-brand-red hover:underline cursor-pointer">
                        {t('publishAdPage.breadcrumbHome')}
                    </span>
                    <span className="text-brand-gray mx-2">&gt;</span>
                    <span className="text-brand-dark font-medium">{propertyToEdit ? t('publishJourney.editTitle') : t('publishJourney.title')}</span>
                </div>
                
                <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                            <Stepper currentStep={step} setStep={setStep} />
                            
                            {/* Step 1: Basic Data */}
                            {step === 1 && (
                                <div>
                                    {/* Location Form */}
                                    {!formData.isAddressVerified ? (
                                        <form onSubmit={handleAddressSubmit}>
                                            <h2 className="text-xl font-bold text-brand-navy mb-4">{t('publishJourney.form.propertyType.label')}</h2>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-8">
                                                {propertyTypes.map(item => (
                                                    <button key={item.key} type="button" onClick={() => setFormData(p => ({...p, propertyType: item.value, detailsPropertyType: item.value}))} className={`p-4 border rounded-lg text-center transition-colors ${formData.propertyType === item.value ? 'bg-brand-red text-white border-brand-red' : 'bg-white hover:border-brand-dark'}`}>
                                                        <span className="font-medium text-sm">{t(`publishJourney.detailsForm.${item.key}`)}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <h2 className="text-xl font-bold text-brand-navy mb-4">{t('publishJourney.form.operation.label')}</h2>
                                            <div className="grid grid-cols-3 gap-2 mb-8">
                                                <button type="button" onClick={() => setFormData(p => ({...p, operation: 'venda'}))} className={`p-4 border rounded-lg text-center transition-colors ${formData.operation === 'venda' ? 'bg-brand-red text-white border-brand-red' : 'bg-white hover:border-brand-dark'}`}>
                                                    <span className="font-medium">{t('publishJourney.form.operation.sell')}</span>
                                                </button>
                                                 <button type="button" onClick={() => setFormData(p => ({...p, operation: 'aluguel'}))} className={`p-4 border rounded-lg text-center transition-colors ${formData.operation === 'aluguel' ? 'bg-brand-red text-white border-brand-red' : 'bg-white hover:border-brand-dark'}`}>
                                                    <span className="font-medium">{t('publishJourney.form.operation.rent')}</span>
                                                </button>
                                                <button type="button" onClick={() => setFormData(p => ({...p, operation: 'temporada'}))} className={`p-4 border rounded-lg text-center transition-colors ${formData.operation === 'temporada' ? 'bg-brand-red text-white border-brand-red' : 'bg-white hover:border-brand-dark'}`}>
                                                    <span className="font-medium">{t('publishJourney.form.operation.season')}</span>
                                                </button>
                                            </div>

                                            <h2 className="text-xl font-bold text-brand-navy mb-4">{t('publishJourney.form.location.label')}</h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="sm:col-span-3">
                                                    <label htmlFor="city" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.city')}</label>
                                                    <input type="text" id="city" name="city" value={formData.city} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label htmlFor="street" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.street')}</label>
                                                    <input type="text" id="street" name="street" value={formData.street} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                                </div>
                                                <div>
                                                    <label htmlFor="number" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.number')}</label>
                                                    <input type="text" id="number" name="number" value={formData.number} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                                </div>
                                            </div>
                                            <button type="submit" disabled={isVerifyingAddress} className="mt-6 w-full bg-brand-red text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity flex justify-center items-center disabled:opacity-75 disabled:cursor-wait">
                                                {isVerifyingAddress ? (
                                                    <>
                                                        <SpinnerIcon className="w-5 h-5 animate-spin mr-2" />
                                                        <span>Verificando...</span>
                                                    </>
                                                ) : (
                                                    t('publishJourney.form.submitButton')
                                                )}
                                            </button>
                                        </form>
                                    ) : (
                                        /* Verified Address & Contact Form */
                                        <div>
                                            <div className="mb-8">
                                                <label className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.verifiedAddress.label')}</label>
                                                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-md">
                                                    <div className="flex items-center">
                                                        <VerifiedIcon className="w-6 h-6 text-green-500 mr-3" />
                                                        <span className="font-medium text-green-800">{formData.verifiedAddress}</span>
                                                    </div>
                                                    <button onClick={() => setFormData(p => ({...p, isAddressVerified: false}))} className="text-sm font-medium text-brand-red hover:underline">
                                                        {t('publishJourney.verifiedAddress.edit')}
                                                    </button>
                                                </div>
                                            </div>

                                            <h2 className="text-xl font-bold text-brand-navy mb-4">{t('publishJourney.contactDetails.title')}</h2>
                                            {/* Contact Details Form */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.contactDetails.emailLabel')}</label>
                                                    <p className="text-brand-dark">{user?.email}</p>
                                                    <p className="text-xs text-brand-gray">{t('publishJourney.contactDetails.emailDescription')}</p>
                                                    <button className="text-xs text-brand-red hover:underline mt-1">{t('publishJourney.contactDetails.changeAccount')}</button>
                                                </div>
                                                 <div>
                                                    <label htmlFor="contactPhone" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.contactDetails.phoneLabel')}</label>
                                                    <input type="tel" id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleFormChange} placeholder={t('publishJourney.contactDetails.phonePlaceholder')} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                                </div>
                                                <div>
                                                    <label htmlFor="contactName" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.contactDetails.nameLabel')}</label>
                                                    <input type="text" id="contactName" name="contactName" value={formData.contactName} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                                     <p className="text-xs text-brand-gray mt-1">{t('publishJourney.contactDetails.nameDescription')}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.contactDetails.preferenceLabel')}</label>
                                                    <div className="space-y-3">
                                                        <label className="flex items-start p-3 border rounded-md cursor-pointer has-[:checked]:border-brand-red has-[:checked]:bg-red-50">
                                                            <input type="radio" name="contactPreference" value="prefChatAndPhone" checked={formData.contactPreference === 'prefChatAndPhone'} onChange={handleRadioChange} className="mt-1" />
                                                            <div className="ml-3">
                                                                <p className="font-medium">{t('publishJourney.contactDetails.prefChatAndPhone')}</p>
                                                                <p className="text-xs text-brand-gray">{t('publishJourney.contactDetails.prefChatAndPhoneDesc')}</p>
                                                            </div>
                                                        </label>
                                                        <label className="flex items-start p-3 border rounded-md cursor-pointer has-[:checked]:border-brand-red has-[:checked]:bg-red-50">
                                                            <input type="radio" name="contactPreference" value="prefChatOnly" checked={formData.contactPreference === 'prefChatOnly'} onChange={handleRadioChange} className="mt-1" />
                                                             <div className="ml-3">
                                                                <p className="font-medium">{t('publishJourney.contactDetails.prefChatOnly')}</p>
                                                                <p className="text-xs text-brand-gray">{t('publishJourney.contactDetails.prefChatOnlyDesc')}</p>
                                                            </div>
                                                        </label>
                                                        <label className="flex items-start p-3 border rounded-md cursor-pointer has-[:checked]:border-brand-red has-[:checked]:bg-red-50">
                                                            <input type="radio" name="contactPreference" value="prefPhoneOnly" checked={formData.contactPreference === 'prefPhoneOnly'} onChange={handleRadioChange} className="mt-1" />
                                                             <div className="ml-3">
                                                                <p className="font-medium">{t('publishJourney.contactDetails.prefPhoneOnly')}</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => setStep(2)} className="mt-8 w-full bg-brand-red text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity">
                                                {t('publishJourney.contactDetails.continueButton')}
                                            </button>
                                            <p className="text-xs text-center mt-2 text-brand-gray">{t('publishJourney.contactDetails.nextStepInfo')}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Details */}
                            {step === 2 && (
                                <div>
                                    {/* Details Form content */}
                                    <h2 className="text-2xl font-bold text-brand-navy mb-2">{t('publishJourney.detailsForm.title')}</h2>
                                    <p className="text-brand-gray mb-6">{t(`publishJourney.detailsForm.${operationTitleKeyMap[formData.operation as keyof typeof operationTitleKeyMap]}Title`)}</p>

                                    {/* Title */}
                                    <div className="mb-4">
                                        <label htmlFor="title" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.adTitle')}</label>
                                        <div className="relative">
                                            <input type="text" id="title" name="title" value={formData.title} onChange={handleFormChange} placeholder={t('publishJourney.detailsForm.adTitlePlaceholder')} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red pr-28" />
                                            <button 
                                                type="button" 
                                                onClick={generateAITitle} 
                                                disabled={isGeneratingTitle || !formData.title.trim()}
                                                className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-md flex items-center hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isGeneratingTitle ? <SpinnerIcon className="w-4 h-4 animate-spin mr-1" /> : <AIIcon className="w-4 h-4 mr-1"/>}
                                                {t('publishJourney.detailsForm.aiTitleButtonLabel')}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Price and Financials */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                        {formData.operation === 'venda' && (
                                            <>
                                            <div>
                                                <label htmlFor="salePrice" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.salePrice')}</label>
                                                <div className="relative">
                                                    <input type="number" id="salePrice" name="salePrice" value={formData.salePrice} onChange={handleFormChange} required className="w-full pl-4 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray text-sm">{t('publishJourney.detailsForm.currency.reais')}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="iptuAnnual" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.iptuAnnual')}</label>
                                                <input type="number" id="iptuAnnual" name="iptuAnnual" value={formData.iptuAnnual} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-sm font-medium text-brand-dark mb-2">{t('publishJourney.detailsForm.acceptsFinancing')}</p>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center"><input type="radio" name="acceptsFinancing" value="true" checked={formData.acceptsFinancing === true} onChange={handleRadioChange} className="mr-2"/>{t('publishJourney.detailsForm.yes')}</label>
                                                    <label className="flex items-center"><input type="radio" name="acceptsFinancing" value="false" checked={formData.acceptsFinancing === false} onChange={handleRadioChange} className="mr-2"/>{t('publishJourney.detailsForm.no')}</label>
                                                </div>
                                            </div>
                                            </>
                                        )}
                                        {formData.operation === 'aluguel' && (
                                            <>
                                            <div>
                                                <label htmlFor="monthlyRent" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.monthlyRent')}</label>
                                                 <div className="relative">
                                                    <input type="number" id="monthlyRent" name="monthlyRent" value={formData.monthlyRent} onChange={handleFormChange} required className="w-full pl-4 pr-24 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray text-sm">{t('publishJourney.detailsForm.currency.reaisMonth')}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="condoFee" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.condoFee')}</label>
                                                <input type="number" id="condoFee" name="condoFee" value={formData.condoFee} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                            </div>
                                            </>
                                        )}
                                         {formData.operation === 'temporada' && (
                                            <>
                                            <div>
                                                <label htmlFor="dailyRate" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.dailyRate')}</label>
                                                 <div className="relative">
                                                    <input type="number" id="dailyRate" name="dailyRate" value={formData.dailyRate} onChange={handleFormChange} required className="w-full pl-4 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray text-sm">{t('publishJourney.detailsForm.currency.reais')}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="cleaningFee" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.cleaningFee')}</label>
                                                <input type="number" id="cleaningFee" name="cleaningFee" value={formData.cleaningFee} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                            </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Characteristics */}
                                    <h3 className="text-xl font-bold text-brand-navy mb-4 border-t pt-6">{t('publishJourney.detailsForm.apartmentCharacteristics')}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                        <div>
                                            <label htmlFor="detailsPropertyType" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.propertyType')}</label>
                                            <select id="detailsPropertyType" name="detailsPropertyType" value={formData.detailsPropertyType} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red">
                                                {propertyTypes.map(item => (
                                                     <option key={item.key} value={item.value}>{t(`publishJourney.detailsForm.${item.key}`)}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="grossArea" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.grossArea')}</label>
                                            <input type="number" id="grossArea" name="grossArea" value={formData.grossArea} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                        </div>
                                        <div>
                                            <label htmlFor="netArea" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.netArea')}</label>
                                            <input type="number" id="netArea" name="netArea" value={formData.netArea} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                        </div>
                                         <div>
                                            <label className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.bedrooms')}</label>
                                            <div className="flex items-center border border-gray-300 rounded-md">
                                                <button type="button" onClick={() => handleNumberChange('bedrooms', -1)} className="p-2 text-brand-dark"><MinusIcon className="w-5 h-5"/></button>
                                                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleFormChange} className="w-full text-center border-l border-r px-2 py-1.5 focus:outline-none" />
                                                <button type="button" onClick={() => handleNumberChange('bedrooms', 1)} className="p-2 text-brand-dark"><PlusIcon className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.bathrooms')}</label>
                                             <div className="flex items-center border border-gray-300 rounded-md">
                                                <button type="button" onClick={() => handleNumberChange('bathrooms', -1)} className="p-2 text-brand-dark"><MinusIcon className="w-5 h-5"/></button>
                                                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleFormChange} className="w-full text-center border-l border-r px-2 py-1.5 focus:outline-none" />
                                                <button type="button" onClick={() => handleNumberChange('bathrooms', 1)} className="p-2 text-brand-dark"><PlusIcon className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-brand-dark mb-2">{t('publishJourney.detailsForm.hasElevator')}</p>
                                            <div className="flex gap-4">
                                                <label className="flex items-center"><input type="radio" name="hasElevator" value="true" checked={formData.hasElevator === true} onChange={handleRadioChange} className="mr-2"/>{t('publishJourney.detailsForm.yes')}</label>
                                                <label className="flex items-center"><input type="radio" name="hasElevator" value="false" checked={formData.hasElevator === false} onChange={handleRadioChange} className="mr-2"/>{t('publishJourney.detailsForm.no')}</label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* More Features */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-brand-navy mb-3">{t('publishJourney.detailsForm.otherHomeFeatures')}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {['builtInWardrobes', 'airConditioning', 'terrace', 'balcony', 'garage', 'mobiliado', 'cozinhaEquipada', 'suite', 'escritorio'].map(feature => (
                                                <label key={feature} className="flex items-center">
                                                    <input type="checkbox" value={feature} checked={formData.homeFeatures.includes(feature)} onChange={(e) => handleCheckboxChange(e, 'homeFeatures')} className="mr-2 h-4 w-4 rounded border-gray-300 text-brand-red focus:ring-brand-red" />
                                                    <span className="text-sm">{t(`publishJourney.detailsForm.${feature}`)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-brand-navy mb-3">{t('publishJourney.detailsForm.otherBuildingFeatures')}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                             {['pool', 'greenArea', 'portaria24h', 'academia', 'salaoDeFestas', 'churrasqueira', 'parqueInfantil', 'quadraEsportiva', 'sauna', 'espacoGourmet'].map(feature => (
                                                <label key={feature} className="flex items-center">
                                                    <input type="checkbox" value={feature} checked={formData.buildingFeatures.includes(feature)} onChange={(e) => handleCheckboxChange(e, 'buildingFeatures')} className="mr-2 h-4 w-4 rounded border-gray-300 text-brand-red focus:ring-brand-red" />
                                                    <span className="text-sm">{t(`publishJourney.detailsForm.${feature}`)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Description */}
                                    <div className="mb-4">
                                        <label htmlFor="description" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.adDescription')}</label>
                                        <div className="relative">
                                            <textarea id="description" name="description" value={formData.description} onChange={handleFormChange} rows={6} placeholder={t('publishJourney.detailsForm.descriptionPlaceholder')} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red"></textarea>
                                            <button 
                                                type="button" 
                                                onClick={generateAIDescription} 
                                                disabled={isGeneratingDescription}
                                                className="absolute bottom-2 right-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-md flex items-center hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isGeneratingDescription ? <SpinnerIcon className="w-4 h-4 animate-spin mr-1" /> : <AIIcon className="w-4 h-4 mr-1"/>}
                                                {t('publishJourney.detailsForm.aiDescriptionButtonLabel')}
                                            </button>
                                        </div>
                                    </div>

                                    <button onClick={() => setStep(3)} className="mt-6 w-full bg-brand-red text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity">
                                        {t('publishJourney.detailsForm.continueToPhotosButton')}
                                    </button>
                                </div>
                            )}

                            {/* Step 3: Photos */}
                            {step === 3 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-brand-navy mb-2">{t('publishJourney.photosForm.title')}</h2>
                                    <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-brand-gray">{t('publishJourney.photosForm.dragAndDrop')}</p>
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-brand-red text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity inline-block mt-4">
                                            <span>{t('publishJourney.photosForm.addButton')}</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*,video/*" />
                                        </label>
                                        <p className="mt-2 text-xs text-brand-gray">{t('publishJourney.photosForm.limitsInfo')}</p>
                                    </div>

                                    {/* File Previews */}
                                    {files.length > 0 && (
                                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {files.map((file, index) => {
                                                // FIX: Use a more robust type guard ('id' in file) to differentiate between existing Media and new File objects.
                                                // This resolves TypeScript errors where properties like 'url' and 'tipo' were not found on the union type 'MediaItem'.
                                                const isExisting = 'id' in file;
                                                const url = isExisting ? file.url : URL.createObjectURL(file);
                                                const fileType = isExisting ? file.tipo : file.type;

                                                return (
                                                    <div key={index} className="relative group aspect-w-1 aspect-h-1">
                                                        {fileType.startsWith('video') ? (
                                                            <video src={url} className="w-full h-full object-cover rounded-md shadow-sm" controls />
                                                        ) : (
                                                            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md shadow-sm" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                                             <button onClick={() => removeFile(file)} className="absolute top-1 right-1 bg-white/70 text-brand-red rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={t('publishJourney.photosForm.removeFile')}>
                                                                <CloseIcon className="w-4 h-4"/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* Tips */}
                                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-bold text-blue-800 mb-2">{t('publishJourney.photosForm.rememberTitle')}</h4>
                                        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                                            <li>{t('publishJourney.photosForm.tip1')}</li>
                                            <li>{t('publishJourney.photosForm.tip2')}</li>
                                            <li>{t('publishJourney.photosForm.tip3')}</li>
                                        </ul>
                                    </div>

                                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                        <button onClick={() => setStep(2)} className="flex-1 order-2 sm:order-1 text-center bg-gray-200 text-brand-dark font-bold py-3 px-4 rounded-md hover:bg-gray-300 transition-opacity">
                                            {t('publishJourney.photosForm.backButton')}
                                        </button>
                                         <button onClick={handleSubmitJourney} disabled={isSubmitting} className="flex-1 order-1 sm:order-2 bg-brand-red text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-wait flex items-center justify-center">
                                            {isSubmitting && <SpinnerIcon className="w-5 h-5 animate-spin mr-2" />}
                                            {isSubmitting
                                                ? (propertyToEdit ? t('publishJourney.photosForm.updatingButton') : t('publishJourney.photosForm.publishingButton'))
                                                : (propertyToEdit ? t('publishJourney.photosForm.updateButton') : t('publishJourney.photosForm.publishButton'))
                                            }
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                    
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-1 mt-8 lg:mt-0">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-brand-red">
                                <h3 className="font-bold text-brand-navy mb-3">{t('publishJourney.sidebar.title')}</h3>
                                <div className="text-sm text-brand-gray space-y-3">
                                    <p>{t('publishJourney.sidebar.p1')}</p>
                                    <p>{t('publishJourney.sidebar.p2')}</p>
                                    <p>{t('publishJourney.sidebar.p3')}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                 <div className="text-sm text-brand-gray space-y-3">
                                    <p>{t('publishJourney.sidebar.p4')}</p>
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li>{t('publishJourney.sidebar.case1')}</li>
                                        <li>{t('publishJourney.sidebar.case2')}</li>
                                        <li>{t('publishJourney.sidebar.case3')}</li>
                                        <li>{t('publishJourney.sidebar.case4')}</li>
                                    </ul>
                                </div>
                            </div>
                             <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <BoltIcon className="w-8 h-8 mx-auto text-yellow-500 mb-2"/>
                                <h3 className="font-bold text-brand-navy mb-2">{t('publishJourney.sidebar.quickSell.title')}</h3>
                                <a href="#" className="text-sm text-brand-red font-medium hover:underline">{t('publishJourney.sidebar.quickSell.link')}</a>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <BriefcaseIcon className="w-8 h-8 mx-auto text-brand-navy mb-2"/>
                                <h3 className="font-bold text-brand-navy mb-2">{t('publishJourney.sidebar.professional.title')}</h3>
                                <a href="#" className="text-sm text-brand-red font-medium hover:underline">{t('publishJourney.sidebar.professional.link')}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <LocationConfirmationModal
                isOpen={isLocationConfirmationModalOpen}
                onClose={() => setLocationConfirmationModalOpen(false)}
                onConfirm={handleConfirmLocation}
                initialCoordinates={formData.coordinates}
            />

            {isLocationPermissionModalOpen && (
                 <div className="fixed bottom-4 right-4 z-50 bg-white shadow-2xl rounded-lg p-6 max-w-sm w-11/12">
                     <h3 className="font-bold text-brand-navy mb-2">{t('publishJourney.locationPermissionModal.title')}</h3>
                     <p className="text-sm text-brand-gray mb-4">{t('publishJourney.locationPermissionModal.message')}</p>
                     <div className="flex gap-3">
                         <button onClick={() => setIsLocationPermissionModalOpen(false)} className="flex-1 text-sm bg-gray-200 text-brand-dark font-semibold py-2 px-4 rounded-md hover:bg-gray-300">Não, obrigado</button>
                         <button onClick={handleAcceptLocation} className="flex-1 text-sm bg-brand-red text-white font-semibold py-2 px-4 rounded-md hover:opacity-90">Aceitar</button>
                     </div>
                 </div>
            )}
        </div>
    );
};
