

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
        <div className="flex items-start mb-12">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <React.Fragment key={stepNumber}>
                        <div 
                            className={`flex flex-col items-center text-center w-24 ${isCompleted ? 'cursor-pointer' : ''}`}
                            onClick={isCompleted ? () => setStep(stepNumber) : undefined}
                        >
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
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);


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

    const handleLocationPermission = (allowed: boolean) => {
        setIsLocationPermissionModalOpen(false);
        if (allowed && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`);
                        const data = await response.json();
                        if (data.address) {
                            const city = data.address.city || data.address.town || data.address.village || data.address.city_district;
                            const state = data.address.state;
                            if (city && state) {
                                setFormData(prev => ({ ...prev, city: `${city}, ${state}` }));
                            }
                        }
                    } catch (error) { console.error("Error reverse geocoding:", error); }
                },
                (error) => { console.error("Geolocation error:", error); }
            );
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleCounterChange = (field: 'bedrooms' | 'bathrooms', delta: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: Math.max(0, prev[field] + delta)
        }));
    };

    const handleCheckboxChange = (group: 'homeFeatures' | 'buildingFeatures' | 'rentalConditions', value: string) => {
        setFormData(prev => {
            const currentValues = prev[group];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [group]: newValues };
        });
    };

    const handleVerifyAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const query = `${formData.street}, ${formData.number}, ${formData.city}`;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=pt-BR`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setFormData(prev => ({ ...prev, coordinates: { lat: parseFloat(lat), lng: parseFloat(lon) } }));
                setLocationConfirmationModalOpen(true);
            } else {
                props.onRequestModal({type: 'error', title: 'Endereço não encontrado', message: 'Não foi possível localizar o endereço. Verifique os dados e tente novamente.'});
            }
        } catch (error) {
             props.onRequestModal({type: 'error', title: 'Erro de Conexão', message: 'Não foi possível verificar o endereço. Tente novamente mais tarde.'});
        }
        setIsSubmitting(false);
    };

    const handleConfirmAddress = (coords: { lat: number, lng: number }) => {
        setFormData(prev => ({
            ...prev,
            coordinates: coords,
            isAddressVerified: true,
            verifiedAddress: `${prev.street}, ${prev.number}, ${prev.city}`
        }));
        setLocationConfirmationModalOpen(false);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };
    
    const handleRemoveFile = (fileToRemove: MediaItem) => {
        if ('id' in fileToRemove && fileToRemove.type === 'existing') {
            setFilesToRemove(prev => [...prev, fileToRemove.id]);
        }
        setFiles(prev => prev.filter(f => f !== fileToRemove));
    };

    const handleNextStep = (currentStep: number) => {
        if (currentStep === 1) {
            if (!formData.isAddressVerified) {
                 props.onRequestModal({type: 'error', title: 'Endereço não verificado', message: 'Por favor, verifique o endereço do imóvel para continuar.'});
                 return;
            }
            if (!formData.contactName || !formData.contactPhone) {
                props.onRequestModal({type: 'error', title: 'Campos obrigatórios', message: 'Por favor, preencha seu nome e telefone.'});
                return;
            }
        }
        if (currentStep === 2) {
             if (formData.title.trim().length < 10) {
                props.onRequestModal({type: 'error', title: t('systemModal.errorTitle'), message: 'O título do anúncio deve ter pelo menos 10 caracteres.'});
                return;
            }
        }
        setStep(currentStep + 1);
        window.scrollTo(0, 0);
    };
    
    const handlePrevStep = (currentStep: number) => {
        setStep(currentStep - 1);
        window.scrollTo(0, 0);
    }
    
    const handlePublish = async () => {
        if (!user || !formData.coordinates) {
            onPublishError("Usuário não autenticado ou endereço inválido.");
            return;
        }
        setIsSubmitting(true);

        try {
            // 1. Upload new files to storage
            const uploadedMediaUrls: { url: string, tipo: 'imagem' | 'video' }[] = [];
            for (const file of files) {
                if (file instanceof File) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `${user.id}/${Date.now()}-${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('midia')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('midia')
                        .getPublicUrl(filePath);
                    
                    uploadedMediaUrls.push({ url: publicUrl, tipo: file.type.startsWith('video') ? 'video' : 'imagem' });
                }
            }

            // 2. Prepare property data for Supabase
            const propertyData = {
                anunciante_id: user.id,
                titulo: formData.title,
                descricao: formData.description,
                endereco_completo: formData.verifiedAddress,
                cidade: formData.city,
                rua: formData.street,
                numero: formData.number,
                latitude: formData.coordinates.lat,
                longitude: formData.coordinates.lng,
                tipo_operacao: formData.operation,
                tipo_imovel: formData.detailsPropertyType,
                quartos: formData.bedrooms,
                banheiros: formData.bathrooms,
                area_bruta: parseInt(formData.grossArea) || null,
                area_util: parseInt(formData.netArea) || null,
                possui_elevador: formData.hasElevator,
                caracteristicas_imovel: formData.homeFeatures,
                caracteristicas_condominio: formData.buildingFeatures,
                situacao_ocupacao: formData.occupationSituation,
                taxa_condominio: parseFloat(formData.condoFee) || null,
                preco: 0, // Set price based on operation
                valor_iptu: null as number | null,
                aceita_financiamento: formData.acceptsFinancing,
                condicoes_aluguel: formData.rentalConditions,
                permite_animais: formData.petsAllowed,
                minimo_diarias: parseInt(formData.minStay) || null,
                maximo_hospedes: parseInt(formData.maxGuests) || null,
                taxa_limpeza: parseFloat(formData.cleaningFee) || null,
                datas_disponiveis: formData.availableDates,
            };

            if (formData.operation === 'venda') {
                propertyData.preco = parseFloat(formData.salePrice) || 0;
                propertyData.valor_iptu = parseFloat(formData.iptuAnnual) || null;
            } else if (formData.operation === 'aluguel') {
                propertyData.preco = parseFloat(formData.monthlyRent) || 0;
                propertyData.valor_iptu = parseFloat(formData.iptuMonthly) || null;
            } else if (formData.operation === 'temporada') {
                propertyData.preco = parseFloat(formData.dailyRate) || 0;
            }


            if (propertyToEdit) {
                // UPDATE LOGIC
                const { data: updatedProperty, error: updateError } = await supabase
                    .from('imoveis')
                    .update({ ...propertyData, data_atualizacao: new Date().toISOString() })
                    .eq('id', propertyToEdit.id)
                    .select('id')
                    .single();
                
                if (updateError) throw updateError;
                const propertyId = updatedProperty.id;

                // Remove deleted media
                if (filesToRemove.length > 0) {
                    const { error: deleteMediaError } = await supabase.from('midias_imovel').delete().in('id', filesToRemove);
                    if (deleteMediaError) console.error("Error deleting media:", deleteMediaError);
                }

                // Add new media
                if (uploadedMediaUrls.length > 0) {
                    const newMediaData = uploadedMediaUrls.map(media => ({
                        imovel_id: propertyId,
                        url: media.url,
                        tipo: media.tipo
                    }));
                    const { error: insertMediaError } = await supabase.from('midias_imovel').insert(newMediaData);
                    if (insertMediaError) throw insertMediaError;
                }
                
                await onUpdateProperty();

            } else {
                // INSERT LOGIC
                const { data: newProperty, error: insertError } = await supabase
                    .from('imoveis')
                    .insert(propertyData)
                    .select('id')
                    .single();

                if (insertError) throw insertError;
                const propertyId = newProperty.id;
                
                if (uploadedMediaUrls.length > 0) {
                     const newMediaData = uploadedMediaUrls.map(media => ({
                        imovel_id: propertyId,
                        url: media.url,
                        tipo: media.tipo
                    }));
                    const { error: insertMediaError } = await supabase.from('midias_imovel').insert(newMediaData);
                    if (insertMediaError) throw insertMediaError;
                }

                await onAddProperty(propertyData as unknown as Property);
            }
        } catch (error: any) {
            console.error("Publish error:", error);
            onPublishError(error.message || "Ocorreu um erro desconhecido.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleGenerateAITitle = async () => {
        if (!formData.title.trim()) return;
        setIsGeneratingTitle(true);
        try {
            if (typeof process === 'undefined' || !process.env.API_KEY) {
                console.warn("Chave de API do Gemini não configurada para título. Usando simulação.");
                const newTitle = await mockAITitleGeneration(formData.title);
                setFormData(prev => ({...prev, title: newTitle}));
                return;
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = t('publishJourney.detailsForm.aiTitlePrompt', { title: formData.title });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const newTitle = response.text.trim().replace(/["']/g, "");
            if (newTitle) {
                setFormData(prev => ({...prev, title: newTitle}));
            }
        } catch (error) {
            console.error("AI Title generation error:", error);
            props.onRequestModal({type: 'error', title: t('systemModal.errorTitle'), message: t('publishJourney.detailsForm.aiTitleError')});
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const handleGenerateAIDescription = async () => {
        setIsGeneratingDescription(true);
        try {
            if (typeof process === 'undefined' || !process.env.API_KEY) {
                console.warn("Chave de API do Gemini não configurada para descrição. Usando simulação.");
                const newDescription = await mockAIDescriptionGeneration(formData);
                setFormData(prev => ({...prev, description: newDescription}));
                return;
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const details = `
                - Tipo: ${formData.detailsPropertyType} para ${formData.operation}
                - Área Bruta: ${formData.grossArea} m²
                - Quartos: ${formData.bedrooms}
                - Banheiros: ${formData.bathrooms}
                - Elevador: ${formData.hasElevator ? 'Sim' : 'Não'}
                - Características do Imóvel: ${formData.homeFeatures.join(', ')}
                - Características do Condomínio: ${formData.buildingFeatures.join(', ')}
            `;
            const prompt = t('publishJourney.detailsForm.aiDescriptionPrompt', { details });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const newDescription = response.text.trim();
            if (newDescription) {
                 setFormData(prev => ({...prev, description: newDescription}));
            }
        } catch (error) {
            console.error("AI Description generation error:", error);
            props.onRequestModal({type: 'error', title: t('systemModal.errorTitle'), message: t('publishJourney.detailsForm.aiDescriptionError')});
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const renderStep1 = () => (
        <form onSubmit={formData.isAddressVerified ? (e) => { e.preventDefault(); handleNextStep(1); } : handleVerifyAddress}>
            {!formData.isAddressVerified ? (
                <div className="space-y-6">
                    <div>
                        <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.propertyType.label')}</label>
                        <select id="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red">
                            <option>Apartamento</option> <option>Casa</option> <option>Terreno</option> <option>Escritório</option> <option>Quarto</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.operation.label')}</label>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                           {['venda', 'aluguel', 'temporada'].map(op => (
                               <label key={op} className="flex items-center space-x-2 cursor-pointer">
                                   <input type="radio" name="operation" value={op} checked={formData.operation === op} onChange={(e) => setFormData(p => ({...p, operation: e.target.value}))} className="h-5 w-5 text-brand-red focus:ring-brand-red border-gray-300" />
                                   <span>{t(`publishJourney.form.operation.${op === 'venda' ? 'sell' : op === 'aluguel' ? 'rent' : 'season'}`)}</span>
                               </label>
                           ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.form.location.label')}</label>
                        <div className="space-y-4">
                            <div><label htmlFor="city" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.city')}</label><input type="text" id="city" value={formData.city} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required /></div>
                            <div><label htmlFor="street" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.street')}</label><input type="text" id="street" value={formData.street} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required /></div>
                            <div><label htmlFor="number" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.number')}</label><input type="text" id="number" value={formData.number} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required /></div>
                        </div>
                    </div>
                    <div><button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-gray-300 text-brand-dark font-bold rounded-md hover:bg-gray-400 disabled:opacity-50">{isSubmitting ? 'Verificando...' : t('publishJourney.form.submitButton')}</button></div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <label className="block text-base font-bold text-brand-navy mb-2">{t('publishJourney.verifiedAddress.label')}</label>
                        <div className="bg-green-50 p-4 border border-green-200 rounded-md flex justify-between items-center"><div className="flex items-center"><VerifiedIcon className="w-6 h-6 text-green-600 mr-3" /><p className="text-brand-dark">{formData.verifiedAddress}</p></div><button type="button" onClick={() => setFormData(p => ({ ...p, isAddressVerified: false }))} className="text-brand-red hover:underline font-medium text-sm">{t('publishJourney.verifiedAddress.edit')}</button></div>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-brand-navy pt-4 border-t">{t('publishJourney.contactDetails.title')}</h2>
                        <div><label className="block text-sm font-medium text-brand-dark">{t('publishJourney.contactDetails.emailLabel')}</label><div className="mt-1 p-3 bg-gray-100 border rounded-md text-brand-gray">{user?.email}</div><p className="text-xs text-brand-gray mt-1">{t('publishJourney.contactDetails.emailDescription')}</p></div>
                        <div><label htmlFor="contactPhone" className="block text-sm font-medium text-brand-dark">{t('publishJourney.contactDetails.phoneLabel')}</label><input type="tel" id="contactPhone" value={formData.contactPhone} onChange={handleChange} className="mt-1 w-full p-3 border border-gray-300 rounded-md" placeholder={t('publishJourney.contactDetails.phonePlaceholder')} required/></div>
                        <div><label htmlFor="contactName" className="block text-sm font-medium text-brand-dark">{t('publishJourney.contactDetails.nameLabel')}</label><input type="text" id="contactName" value={formData.contactName} onChange={handleChange} className="mt-1 w-full p-3 border border-gray-300 rounded-md" required /><p className="text-xs text-brand-gray mt-1">{t('publishJourney.contactDetails.nameDescription')}</p></div>
                        <div>
                            <label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.contactDetails.preferenceLabel')}</label>
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-md border"><label className="flex items-center space-x-3"><input type="radio" name="contactPreference" value="prefChatAndPhone" checked={formData.contactPreference === 'prefChatAndPhone'} onChange={handleChange} className="h-5 w-5 text-brand-red"/><div><p className="font-medium">{t('publishJourney.contactDetails.prefChatAndPhone')}</p><p className="text-xs text-brand-gray">{t('publishJourney.contactDetails.prefChatAndPhoneDesc')}</p></div></label></div>
                                <div className="bg-gray-50 p-3 rounded-md border"><label className="flex items-center space-x-3"><input type="radio" name="contactPreference" value="prefChatOnly" checked={formData.contactPreference === 'prefChatOnly'} onChange={handleChange} className="h-5 w-5 text-brand-red"/><div><p className="font-medium">{t('publishJourney.contactDetails.prefChatOnly')}</p><p className="text-xs text-brand-gray">{t('publishJourney.contactDetails.prefChatOnlyDesc')}</p></div></label></div>
                                <div className="bg-gray-50 p-3 rounded-md border"><label className="flex items-center space-x-3"><input type="radio" name="contactPreference" value="prefPhoneOnly" checked={formData.contactPreference === 'prefPhoneOnly'} onChange={handleChange} className="h-5 w-5 text-brand-red"/><p className="font-medium">{t('publishJourney.contactDetails.prefPhoneOnly')}</p></label></div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center pt-6"><button type="submit" className="w-full max-w-xs mx-auto px-6 py-3 bg-[#93005a] text-white font-bold rounded-md hover:opacity-90">{t('publishJourney.contactDetails.continueButton')}</button></div>
                </div>
            )}
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(2); }} className="space-y-8">
            <h2 className="text-xl font-bold text-brand-navy">{t('publishJourney.detailsForm.title')}</h2>
            
            <div>
                <label htmlFor="title" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.adTitle')}</label>
                <div className="relative">
                    <input type="text" id="title" value={formData.title} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md pr-12" minLength={10} placeholder={t('publishJourney.detailsForm.adTitlePlaceholder')} required/>
                    <button type="button" onClick={handleGenerateAITitle} disabled={isGeneratingTitle} className="absolute top-1/2 right-3 -translate-y-1/2 text-brand-navy hover:text-brand-red disabled:opacity-50" title={t('publishJourney.detailsForm.aiTitleButtonLabel')}>
                        {isGeneratingTitle ? <SpinnerIcon className="w-6 h-6 animate-spin"/> : <AIIcon className="w-6 h-6"/>}
                    </button>
                </div>
            </div>

            <div>
                 <label className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.propertyType')}</label>
                <select id="detailsPropertyType" value={formData.detailsPropertyType} onChange={handleChange} className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md">
                    <option>{t('publishJourney.detailsForm.apartment')}</option> <option>{t('publishJourney.detailsForm.house')}</option> <option>{t('publishJourney.detailsForm.room')}</option> <option>{t('publishJourney.detailsForm.office')}</option> <option>{t('publishJourney.detailsForm.land')}</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="grossArea" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.grossArea')}</label>
                    <div className="relative"><input type="number" id="grossArea" value={formData.grossArea} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">m²</span></div>
                </div>
                <div>
                    <label htmlFor="netArea" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.netArea')}</label>
                    <div className="relative"><input type="number" id="netArea" value={formData.netArea} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">m²</span></div>
                </div>
            </div>

             <div className="grid grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.detailsForm.bedrooms')}</label>
                    <div className="flex items-center space-x-3"><button type="button" onClick={() => handleCounterChange('bedrooms', -1)} className="p-2 border rounded-full"><MinusIcon className="w-5 h-5"/></button><span className="text-xl font-bold w-8 text-center">{formData.bedrooms}</span><button type="button" onClick={() => handleCounterChange('bedrooms', 1)} className="p-2 border rounded-full"><PlusIcon className="w-5 h-5"/></button></div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.detailsForm.bathrooms')}</label>
                    <div className="flex items-center space-x-3"><button type="button" onClick={() => handleCounterChange('bathrooms', -1)} className="p-2 border rounded-full"><MinusIcon className="w-5 h-5"/></button><span className="text-xl font-bold w-8 text-center">{formData.bathrooms}</span><button type="button" onClick={() => handleCounterChange('bathrooms', 1)} className="p-2 border rounded-full"><PlusIcon className="w-5 h-5"/></button></div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.detailsForm.hasElevator')}</label>
                <div className="flex space-x-4"><label className="flex items-center"><input type="radio" name="hasElevator" onChange={() => setFormData(p => ({ ...p, hasElevator: true }))} checked={formData.hasElevator === true} className="h-4 w-4 mr-2"/> {t('publishJourney.detailsForm.yes')}</label><label className="flex items-center"><input type="radio" name="hasElevator" onChange={() => setFormData(p => ({ ...p, hasElevator: false }))} checked={formData.hasElevator === false} className="h-4 w-4 mr-2"/> {t('publishJourney.detailsForm.no')}</label></div>
            </div>
            
            {/* Other features checkboxes */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-navy border-t pt-6">{t('publishJourney.detailsForm.otherHomeFeatures')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['builtInWardrobes', 'airConditioning', 'terrace', 'balcony', 'garage', 'mobiliado', 'cozinhaEquipada', 'suite', 'escritorio'].map(feature => (
                        <label key={feature} className="flex items-center"><input type="checkbox" checked={formData.homeFeatures.includes(feature)} onChange={() => handleCheckboxChange('homeFeatures', feature)} className="h-4 w-4 mr-2"/> {t(`publishJourney.detailsForm.${feature}`)}</label>
                    ))}
                </div>
                <h3 className="text-lg font-bold text-brand-navy border-t pt-6">{t('publishJourney.detailsForm.otherBuildingFeatures')}</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['pool', 'greenArea', 'portaria24h', 'academia', 'salaoDeFestas', 'churrasqueira', 'parqueInfantil', 'quadraEsportiva', 'sauna', 'espacoGourmet'].map(feature => (
                        <label key={feature} className="flex items-center"><input type="checkbox" checked={formData.buildingFeatures.includes(feature)} onChange={() => handleCheckboxChange('buildingFeatures', feature)} className="h-4 w-4 mr-2"/> {t(`publishJourney.detailsForm.${feature}`)}</label>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-base sm:text-lg font-bold text-brand-navy mb-3">{t('publishJourney.detailsForm.adDescription')}</label>
                <div className="relative">
                    <textarea id="description" value={formData.description} onChange={handleChange} rows={5} className="w-full p-3 border rounded-md" placeholder={t('publishJourney.detailsForm.descriptionPlaceholder')}></textarea>
                    <button type="button" onClick={handleGenerateAIDescription} disabled={isGeneratingDescription} className="absolute top-3 right-3 text-brand-navy hover:text-brand-red disabled:opacity-50" title={t('publishJourney.detailsForm.aiDescriptionButtonLabel')}>
                        {isGeneratingDescription ? <SpinnerIcon className="w-6 h-6 animate-spin"/> : <AIIcon className="w-6 h-6"/>}
                    </button>
                </div>
            </div>

            <div className="border-t pt-8 space-y-6">
                {formData.operation === 'venda' && ( /* Venda fields */
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-brand-navy">{t('publishJourney.detailsForm.sellTitle')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label htmlFor="salePrice" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.salePrice')}</label><div className="relative"><input type="text" inputMode="numeric" id="salePrice" value={formData.salePrice} onChange={handleChange} className="w-full p-3 border rounded-md"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reais')}</span></div></div>
                             <div><label htmlFor="iptuAnnual" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.iptuAnnual')}</label><div className="relative"><input type="text" inputMode="numeric" id="iptuAnnual" value={formData.iptuAnnual} onChange={handleChange} className="w-full p-3 border rounded-md"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reais')}</span></div></div>
                        </div>
                        <div><label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.detailsForm.acceptsFinancing')}</label><div className="flex space-x-4"><label className="flex items-center"><input type="radio" name="acceptsFinancing" onChange={() => setFormData(p => ({...p, acceptsFinancing: true}))} checked={formData.acceptsFinancing === true}/> {t('publishJourney.detailsForm.yes')}</label><label className="flex items-center"><input type="radio" name="acceptsFinancing" onChange={() => setFormData(p => ({...p, acceptsFinancing: false}))} checked={formData.acceptsFinancing === false}/> {t('publishJourney.detailsForm.no')}</label></div></div>
                        <div><label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.detailsForm.occupationSituation')}</label><div className="flex space-x-4"><label className="flex items-center"><input type="radio" name="occupationSituation" value="rented" checked={formData.occupationSituation === 'rented'} onChange={handleChange}/> {t('publishJourney.detailsForm.rented')}</label><label className="flex items-center"><input type="radio" name="occupationSituation" value="vacant" checked={formData.occupationSituation === 'vacant'} onChange={handleChange}/> {t('publishJourney.detailsForm.vacant')}</label></div></div>
                    </div>
                )}
                {formData.operation === 'aluguel' && ( /* Aluguel fields */
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-brand-navy">{t('publishJourney.detailsForm.rentTitle')}</h3>
                         <div className="grid grid-cols-3 gap-4">
                             <div><label htmlFor="monthlyRent" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.monthlyRent')}</label><div className="relative"><input type="text" inputMode="numeric" id="monthlyRent" value={formData.monthlyRent} onChange={handleChange} className="w-full p-3 border rounded-md"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reaisMonth')}</span></div></div>
                             <div><label htmlFor="condoFee" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.condoFee')}</label><div className="relative"><input type="text" inputMode="numeric" id="condoFee" value={formData.condoFee} onChange={handleChange} className="w-full p-3 border rounded-md"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reaisMonth')}</span></div></div>
                             <div><label htmlFor="iptuMonthly" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.iptuMonthly')}</label><div className="relative"><input type="text" inputMode="numeric" id="iptuMonthly" value={formData.iptuMonthly} onChange={handleChange} className="w-full p-3 border rounded-md"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reaisMonth')}</span></div></div>
                        </div>
                        <div><label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.detailsForm.rentalConditions')}</label><div className="grid grid-cols-3 gap-2">{['deposit', 'guarantor', 'insurance'].map(cond => <label key={cond} className="flex items-center"><input type="checkbox" checked={formData.rentalConditions.includes(cond)} onChange={() => handleCheckboxChange('rentalConditions', cond)}/> {t(`publishJourney.detailsForm.${cond}`)}</label>)}</div></div>
                        <div><label className="block text-sm font-medium text-brand-dark mb-2">{t('publishJourney.detailsForm.petsAllowed')}</label><div className="flex space-x-4"><label className="flex items-center"><input type="radio" name="petsAllowed" onChange={() => setFormData(p => ({...p, petsAllowed: true}))} checked={formData.petsAllowed === true}/> {t('publishJourney.detailsForm.yes')}</label><label className="flex items-center"><input type="radio" name="petsAllowed" onChange={() => setFormData(p => ({...p, petsAllowed: false}))} checked={formData.petsAllowed === false}/> {t('publishJourney.detailsForm.no')}</label></div></div>
                    </div>
                )}
                 {formData.operation === 'temporada' && ( /* Temporada fields */
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-brand-navy">{t('publishJourney.detailsForm.seasonTitle')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label htmlFor="dailyRate" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.dailyRate')}</label><div className="relative"><input type="text" inputMode="numeric" id="dailyRate" value={formData.dailyRate} onChange={handleChange} className="w-full p-3 border rounded-md"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reais')}</span></div></div>
                             <div><label htmlFor="cleaningFee" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.cleaningFee')}</label><div className="relative"><input type="text" inputMode="numeric" id="cleaningFee" value={formData.cleaningFee} onChange={handleChange} className="w-full p-3 border rounded-md"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">{t('publishJourney.detailsForm.currency.reais')}</span></div></div>
                             <div><label htmlFor="minStay" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.minStay')}</label><input type="number" id="minStay" value={formData.minStay} onChange={handleChange} className="w-full p-3 border rounded-md"/></div>
                             <div><label htmlFor="maxGuests" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.maxGuests')}</label><input type="number" id="maxGuests" value={formData.maxGuests} onChange={handleChange} className="w-full p-3 border rounded-md"/></div>
                        </div>
                        {/* Calendar would go here if needed */}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-8">
                <button type="button" onClick={() => handlePrevStep(2)} className="text-brand-dark hover:underline">{t('publishJourney.photosForm.backButton')}</button>
                <button type="submit" className="px-6 py-3 bg-[#93005a] text-white font-bold rounded-md hover:opacity-90">{t('publishJourney.detailsForm.continueToPhotosButton')}</button>
            </div>
        </form>
    );

    const renderStep3 = () => (
        <div className="space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{t('publishJourney.photosForm.title')}</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" accept="image/*,video/*"/>
                <label htmlFor="file-upload" className="cursor-pointer">
                    <p className="text-brand-gray mb-4">{t('publishJourney.photosForm.dragAndDrop')}</p>
                    <span className="px-6 py-3 bg-gray-200 text-brand-dark font-bold rounded-md hover:bg-gray-300">{t('publishJourney.photosForm.addButton')}</span>
                </label>
                <p className="text-xs text-brand-gray mt-4">{t('publishJourney.photosForm.limitsInfo')}</p>
            </div>
            {files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {files.map((file, index) => {
                        let url: string;
                        let type: 'imagem' | 'video';
                        let key: string | number;

                        if (file instanceof File) {
                            url = URL.createObjectURL(file);
                            type = file.type.startsWith('image') ? 'imagem' : 'video';
                            key = file.name + index;
                        } else {
                            url = file.url;
                            type = file.tipo;
                            key = file.id;
                        }
                        
                        return (
                            <div key={key} className="relative group aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                                {type === 'imagem' ? <img src={url} alt={`preview ${index}`} className="w-full h-full object-cover"/> : <video src={url} className="w-full h-full object-cover"/>}
                                <button onClick={() => handleRemoveFile(file)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><CloseIcon className="w-4 h-4"/></button>
                            </div>
                        )
                    })}
                </div>
            )}
             <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-md space-y-4">
                <h3 className="text-lg font-bold text-brand-navy">{t('publishJourney.photosForm.rememberTitle')}</h3>
                <ul className="list-disc list-inside space-y-2 text-brand-dark">
                    <li>{t('publishJourney.photosForm.tip1')}</li>
                    <li>{t('publishJourney.photosForm.tip2')}</li>
                    <li>{t('publishJourney.photosForm.tip3')}</li>
                </ul>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4">
                <button type="button" onClick={() => handlePrevStep(3)} className="text-brand-dark hover:underline">{t('publishJourney.photosForm.backButton')}</button>
                <button onClick={handlePublish} disabled={isSubmitting} className="w-full sm:w-auto px-8 py-4 bg-[#93005a] text-white font-bold rounded-md hover:opacity-90 disabled:opacity-50">
                    {isSubmitting 
                        ? (propertyToEdit ? t('publishJourney.photosForm.updatingButton') : t('publishJourney.photosForm.publishingButton'))
                        : (propertyToEdit ? t('publishJourney.photosForm.updateButton') : t('publishJourney.photosForm.publishButton'))
                    }
                </button>
            </div>
        </div>
    );


    return (
        <div className="bg-brand-light-gray min-h-screen">
            <Header {...props} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-2/3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-8">{propertyToEdit ? t('publishJourney.editTitle') : t('publishJourney.title')}</h1>
                        <Stepper currentStep={step} setStep={setStep} />
                        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                           {step === 1 && renderStep1()}
                           {step === 2 && renderStep2()}
                           {step === 3 && renderStep3()}
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
                               <div className="flex items-start space-x-3"><BoltIcon className="w-6 h-6 text-brand-red flex-shrink-0 mt-1" /><div><h3 className="font-bold text-brand-dark">{t('publishJourney.sidebar.quickSell.title')}</h3><a href="#" onClick={(e) => {e.preventDefault();}} className="text-sm text-brand-red hover:underline">{t('publishJourney.sidebar.quickSell.link')}</a></div></div>
                               <div className="flex items-start space-x-3"><BriefcaseIcon className="w-6 h-6 text-brand-red flex-shrink-0 mt-1" /><div><h3 className="font-bold text-brand-dark">{t('publishJourney.sidebar.professional.title')}</h3><a href="#" onClick={(e) => {e.preventDefault();}} className="text-sm text-brand-red hover:underline">{t('publishJourney.sidebar.professional.link')}</a></div></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            {isLocationPermissionModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-md p-6 sm:p-8 m-4">
                        <div className="text-center">
                            <WarningIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-brand-navy mb-2">{t('publishJourney.locationPermissionModal.title')}</h2>
                            <p className="text-brand-gray mb-6">{t('publishJourney.locationPermissionModal.message')}</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => handleLocationPermission(false)} className="flex-1 px-4 py-2 bg-gray-200 text-brand-dark font-semibold rounded-md hover:bg-gray-300">Cancelar</button>
                            <button onClick={() => handleLocationPermission(true)} className="flex-1 px-4 py-2 bg-brand-red text-white font-semibold rounded-md hover:opacity-90">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
            <LocationConfirmationModal 
                isOpen={isLocationConfirmationModalOpen}
                onClose={() => setLocationConfirmationModalOpen(false)}
                onConfirm={handleConfirmAddress}
                initialCoordinates={formData.coordinates}
            />
        </div>
    );
};