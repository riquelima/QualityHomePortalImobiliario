import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Property, Media, User } from '../types';
import BoltIcon from './icons/BoltIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import VerifiedIcon from './icons/VerifiedIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import PhotoIcon from './icons/PhotoIcon';
import { supabase } from '../supabaseClient';
import CloseIcon from './icons/CloseIcon';
import { GoogleGenAI } from '@google/genai';
import AIIcon from './icons/AIIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import { Autocomplete } from '@react-google-maps/api';
// FIX: Import LocationIcon to fix "Cannot find name 'LocationIcon'" error.
import LocationIcon from './icons/LocationIcon';
import { PRODUCTION_URL, QUALLITY_HOME_USER_ID } from '../config';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';
import AddressSearchByCEP from './AddressSearchByCEP';
import { validateMediaFiles, type ValidationResult } from '../utils/mediaValidation';

type MediaItem = File | (Media & { type: 'existing' });

interface ModalRequestConfig {
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
}

interface PublishJourneyPageProps {
  onBack: (status?: 'published' | 'updated') => void;
  onAddProperty: () => Promise<void>;
  onUpdateProperty: () => Promise<void>;
  onPublishError: (message: string) => void;
  propertyToEdit?: Property | null;
  onRequestModal: (config: ModalRequestConfig) => void;
  deviceLocation: { lat: number; lng: number } | null;
  adminUser: User | null;
}

const libraries: ('drawing' | 'places' | 'visualization')[] = ['drawing', 'places', 'visualization'];
const MAX_FILES = 10;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'AIzaSyCsX9l10XCu3TtSCU1BSx-qOYrwUKYw2xk' });

const generateContentWithRetry = async (prompt: string, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
      });
      return response; // Success
    } catch (error) {
      attempt++;
      console.warn(`Gemini API call attempt ${attempt} failed:`, error);
      if (attempt >= maxRetries) {
        console.error("Gemini API call failed after all retries.");
        throw error; // Rethrow error after last attempt
      }
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Failed to generate content after multiple retries.");
};


const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined || isNaN(price)) return '';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(price);
};

const unformatCurrencyForSubmission = (value: string): number | null => {
    if (!value || typeof value !== 'string') return null;
    const numberString = value.replace(/[R$\s.]/g, '').replace(',', '.');
    const numberValue = parseFloat(numberString);
    return isNaN(numberValue) ? null : numberValue;
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-10 bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-brand-navy border-b border-gray-200 pb-4 mb-6">{title}</h2>
        {children}
    </section>
);


export const PublishJourneyPage: React.FC<PublishJourneyPageProps> = (props) => {
    const { t } = useLanguage();
    const { onBack, onAddProperty, onUpdateProperty, onPublishError, propertyToEdit, deviceLocation, onRequestModal, adminUser } = props;
    
    // Form State - inicializado uma única vez com useState
    const [formData, setFormData] = useState(() => {
        if (propertyToEdit) {
            return {
                propertyType: propertyToEdit.tipo_imovel || 'Apartamento',
                operation: propertyToEdit.tipo_operacao || 'venda',
                city: propertyToEdit.cidade || '',
                street: propertyToEdit.rua || '',
                number: propertyToEdit.numero || '',
                coordinates: { lat: propertyToEdit.latitude, lng: propertyToEdit.longitude },
                isAddressVerified: true,
                verifiedAddress: propertyToEdit.endereco_completo,
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
                salePrice: propertyToEdit.tipo_operacao === 'venda' ? formatPrice(propertyToEdit.preco) : '',
                iptuAnnual: propertyToEdit.tipo_operacao === 'venda' ? formatPrice(propertyToEdit.valor_iptu) : '',
                acceptsFinancing: propertyToEdit.aceita_financiamento ?? null,
                occupationSituation: propertyToEdit.situacao_ocupacao || 'vacant',
                monthlyRent: propertyToEdit.tipo_operacao === 'aluguel' ? formatPrice(propertyToEdit.preco) : '',
                condoFee: formatPrice(propertyToEdit.taxa_condominio),
                iptuMonthly: propertyToEdit.tipo_operacao === 'aluguel' ? formatPrice(propertyToEdit.valor_iptu) : '',
                rentalConditions: propertyToEdit.condicoes_aluguel || [],
                petsAllowed: propertyToEdit.permite_animais ?? null,
                dailyRate: propertyToEdit.tipo_operacao === 'temporada' ? formatPrice(propertyToEdit.preco) : '',
                minStay: String(propertyToEdit.minimo_diarias || '1'),
                maxGuests: String(propertyToEdit.maximo_hospedes || '2'),
                cleaningFee: formatPrice(propertyToEdit.taxa_limpeza),
                availableDates: propertyToEdit.datas_disponiveis || [],
                topography: propertyToEdit.topografia || '',
                zoning: propertyToEdit.zoneamento || '',
                isWalled: propertyToEdit.murado ?? null,
                isGatedCommunity: propertyToEdit.em_condominio ?? null,
            };
        }
        return {
            propertyType: 'Apartamento',
            operation: 'venda',
            city: '', street: '', number: '',
            coordinates: null as { lat: number, lng: number } | null,
            isAddressVerified: false,
            verifiedAddress: '',
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
            // Land specific
            topography: '',
            zoning: '',
            isWalled: null as boolean | null,
            isGatedCommunity: null as boolean | null,
        };
    });

    const [address, setAddress] = useState({
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        cep: ''
    });

    const [files, setFiles] = useState<(File | { id: number, url: string, tipo: string, type: 'existing' })[]>([]);
    const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [cityAutocomplete, setCityAutocomplete] = useState<any>(null);
    const [streetAutocomplete, setStreetAutocomplete] = useState<any>(null);
    const [cityBounds, setCityBounds] = useState<any>(null);
    const formRef = useRef<HTMLFormElement>(null);


    const { isLoaded, loadError } = useGoogleMaps();

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
    
    const validateDetails = useCallback(() => {
        console.log('Validando título:', formData.title, 'Comprimento:', formData.title.trim().length);
        if (formData.title.trim().length < 10) {
            console.log('Erro: Título muito curto');
            onRequestModal({ type: 'error', title: t('systemModal.errorTitle'), message: t('publishJourney.errors.titleTooShort') });
            return false;
        }
        
        const priceForOperation = {
            venda: formData.salePrice,
            aluguel: formData.monthlyRent,
            temporada: formData.dailyRate
        }[formData.operation];
        
        console.log('Validando preço para operação:', formData.operation, 'Preço:', priceForOperation);
        if (!priceForOperation || !unformatCurrencyForSubmission(priceForOperation)) {
            console.log('Erro: Preço inválido ou vazio');
            onRequestModal({ type: 'error', title: 'Preço Obrigatório', message: 'Por favor, preencha o valor principal para o tipo de operação selecionado (Venda, Aluguel ou Diária).' });
            return false;
        }
        
        console.log('Validando área bruta:', formData.grossArea);
        if (!formData.grossArea) {
            console.log('Erro: Área bruta vazia');
            onRequestModal({ type: 'error', title: 'Área Obrigatória', message: 'Por favor, informe a área bruta do imóvel.' });
            return false;
        }

        console.log('Validação passou com sucesso');
        return true;
    }, [formData.title, formData.operation, formData.salePrice, formData.monthlyRent, formData.dailyRate, formData.grossArea, onRequestModal, t]);

    // useEffect apenas para carregar mídias quando há propriedade para editar
    useEffect(() => {
        const fetchMedia = async (propertyId: number) => {
            const { data, error } = await supabase.from('midias_imovel').select('*').eq('imovel_id', propertyId);
            if (error) {
                console.error("Error fetching media for property to edit:", error);
                return;
            }
            if (data) {
                const existingMedia = data.map(m => ({ ...m, type: 'existing' as const }));
                setFiles(existingMedia);
            }
        };

        if (propertyToEdit?.id) {
            fetchMedia(propertyToEdit.id);
        }
    }, [propertyToEdit?.id]);

    const handleCurrencyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let rawValue = value.replace(/\D/g, '');

        if (!rawValue) {
            setFormData(prev => ({ ...prev, [name]: '' }));
            return;
        }
        
        if (rawValue.length > 15) {
            rawValue = rawValue.substring(0, 15);
        }
        
        const numericValue = parseFloat(rawValue) / 100;
        
        const formattedValue = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(numericValue);

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }, []);

    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);
    
    const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, category: 'homeFeatures' | 'buildingFeatures' | 'rentalConditions') => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentFeatures = prev[category];
            if (checked) {
                return { ...prev, [category]: [...currentFeatures, value] };
            } else {
                return { ...prev, [category]: currentFeatures.filter(item => item !== value) };
            }
        });
    }, []);
    
    const handleRadioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let finalValue: boolean | string | null = value;
        if (value === 'true') finalValue = true;
        if (value === 'false') finalValue = false;
        if (value === 'null') finalValue = null;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    }, []);

    const handleNumberChange = (field: 'bedrooms' | 'bathrooms', delta: number) => {
        setFormData(prev => ({ ...prev, [field]: Math.max(0, prev[field] + delta) }));
    };

    const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
    
            if (value === 'Terreno') {
                newState.bedrooms = 0;
                newState.bathrooms = 0;
                newState.netArea = '';
                newState.hasElevator = null;
                newState.homeFeatures = [];
            } else if (prev.detailsPropertyType === 'Terreno') {
                newState.bedrooms = 1;
                newState.bathrooms = 1;
                newState.topography = '';
                newState.zoning = '';
                newState.isWalled = null;
                newState.isGatedCommunity = null;
            }
    
            return newState;
        });
    };
    
    const handleAddressSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsVerifyingAddress(true);

        const fullAddress = `${formData.street}, ${formData.number}, ${formData.city}, Brasil`;
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const coordinates = { lat: parseFloat(lat), lng: parseFloat(lon) };
                
                // Aceitar automaticamente o endereço sem modal de confirmação
                setFormData(prev => ({
                    ...prev,
                    coordinates,
                    isAddressVerified: true,
                    verifiedAddress: fullAddress
                }));
            } else {
                 onRequestModal({
                    type: 'error',
                    title: 'Endereço não encontrado',
                    message: 'Não foi possível localizar o endereço fornecido. Por favor, verifique os dados e tente novamente.',
                });
            }
        } catch (error) {
            console.error("Erro de geocodificação:", error);
            onRequestModal({
                type: 'error',
                title: t('systemModal.errorTitle'),
                message: 'Ocorreu um erro ao tentar verificar o endereço. Por favor, tente novamente.',
            });
        } finally {
            setIsVerifyingAddress(false);
        }
    };


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            
            // Validate files
            const validation = await validateMediaFiles(newFiles, files.length);
            
            if (!validation.isValid) {
                // Show error for the first validation error
                const firstError = validation.errors[0];
                onRequestModal({
                    type: 'error',
                    title: t('mediaValidation.validationFailed'),
                    message: t(`mediaValidation.${firstError.type}`, firstError.context || {}),
                });
                
                // If some files are valid, show additional message
                if (validation.validFiles.length > 0) {
                    setTimeout(() => {
                        onRequestModal({
                            type: 'error',
                            title: t('mediaValidation.someFilesRejected'),
                            message: `${validation.errors.length} arquivo(s) rejeitado(s), ${validation.validFiles.length} arquivo(s) adicionado(s).`,
                        });
                    }, 2000);
                }
                
                // Add only valid files
                if (validation.validFiles.length > 0) {
                    setFiles(prev => [...prev, ...validation.validFiles]);
                }
                return;
            }
            
            // All files are valid
            setFiles(prev => [...prev, ...validation.validFiles]);
        }
    };
    
    const removeFile = (fileToRemove: File | { id: number, url: string, type: 'existing' }) => {
        if ('id' in fileToRemove) { // It's an existing Media object
            setFiles(prev => prev.filter(f => f !== fileToRemove));
            const url = new URL(fileToRemove.url);
            const path = url.pathname.split('/midia/')[1];
            if (path) {
                setFilesToRemove(prev => [...prev, path]);
            }
        } else { // It's a new File
            setFiles(prev => prev.filter(f => f !== fileToRemove));
        }
    };

    const handleSubmitJourney = async () => {
        let success = false;
        setIsSubmitting(true);
    
        try {
            if (!adminUser) {
                throw new Error("Sessão de administrador inválida. Por favor, faça login novamente.");
            }

            const newFilesToUpload = files.filter(f => f instanceof File) as File[];
            
            // Step 1: Generate unique paths for all new files first.
            const filesToProcess = newFilesToUpload.map(file => {
                const fileExt = file.name.split('.').pop();
                const fileName = `quallity-home/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
                return { file, path: fileName };
            });

            // Step 2: Create an array of upload promises to run in parallel.
            const uploadPromises = filesToProcess.map(({ file, path }) => 
                supabase.storage.from('midia').upload(path, file, {
                    contentType: file.type,
                    upsert: false,
                })
            );

            const uploadResults = await Promise.all(uploadPromises);

            // Step 3: Check for any errors. If an upload failed, clean up all files from this batch.
            const firstError = uploadResults.find(result => result.error)?.error;
            if (firstError) {
                const pathsToRemove = filesToProcess.map(f => f.path);
                if (pathsToRemove.length > 0) {
                    await supabase.storage.from('midia').remove(pathsToRemove);
                }
                throw firstError;
            }
            
            // Step 4: If all uploads were successful, get their public URLs.
            const uploadedUrls = filesToProcess.map(({ file, path }) => {
                const { data } = supabase.storage.from('midia').getPublicUrl(path);
                return {
                    url: data.publicUrl,
                    type: (file.type.startsWith('video') ? 'video' : 'imagem') as 'imagem' | 'video'
                };
            });
    
            const propertyDataForDb = {
                anunciante_id: QUALLITY_HOME_USER_ID,
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
                preco: unformatCurrencyForSubmission(formData.salePrice || formData.monthlyRent || formData.dailyRate) || 0,
                quartos: formData.bedrooms,
                banheiros: formData.bathrooms,
                area_bruta: Number(formData.grossArea),
                area_util: formData.netArea ? Number(formData.netArea) : undefined,
                possui_elevador: formData.hasElevator,
                taxa_condominio: unformatCurrencyForSubmission(formData.condoFee),
                valor_iptu: unformatCurrencyForSubmission(formData.iptuAnnual || formData.iptuMonthly),
                caracteristicas_imovel: formData.homeFeatures,
                caracteristicas_condominio: formData.buildingFeatures,
                situacao_ocupacao: formData.occupationSituation,
                aceita_financiamento: formData.acceptsFinancing,
                condicoes_aluguel: formData.rentalConditions,
                permite_animais: formData.petsAllowed,
                minimo_diarias: formData.minStay ? Number(formData.minStay) : undefined,
                maximo_hospedes: formData.maxGuests ? Number(formData.maxGuests) : undefined,
                taxa_limpeza: unformatCurrencyForSubmission(formData.cleaningFee),
                datas_disponiveis: formData.availableDates,
                topografia: formData.detailsPropertyType === 'Terreno' ? formData.topography : undefined,
                zoneamento: formData.detailsPropertyType === 'Terreno' ? formData.zoning : undefined,
                murado: formData.detailsPropertyType === 'Terreno' ? formData.isWalled : undefined,
                em_condominio: formData.detailsPropertyType === 'Terreno' ? formData.isGatedCommunity : undefined,
                status: 'ativo',
            };
    
            if (propertyToEdit) {
                const { error } = await supabase.from('imoveis').update(propertyDataForDb).eq('id', propertyToEdit.id);
                if (error) throw error;
                
                if (filesToRemove.length > 0) {
                    const { error: storageError } = await supabase.storage.from('midia').remove(filesToRemove);
                    if (storageError) throw new Error(`Falha ao remover mídia antiga do armazenamento: ${storageError.message}`);
                    
                    const supabaseStorageUrl = 'https://ckzhvurabmhvteekyjxg.supabase.co/storage/v1/object/public/midia/';
                    const urlsToRemove = filesToRemove.map(path => `${supabaseStorageUrl}${path}`);
                    if (urlsToRemove.length > 0) {
                        const { error: dbDeleteError } = await supabase.from('midias_imovel').delete().in('url', urlsToRemove);
                        if (dbDeleteError) throw new Error(`Falha ao remover mídia antiga do banco de dados: ${dbDeleteError.message}`);
                    }
                }
    
                if (uploadedUrls.length > 0) {
                    const mediaToInsert = uploadedUrls.map(media => ({
                        imovel_id: propertyToEdit.id,
                        url: media.url,
                        tipo: media.type
                    }));
                    const { error: mediaInsertError } = await supabase.from('midias_imovel').insert(mediaToInsert);
                    if (mediaInsertError) throw mediaInsertError;
                }
                
                await onUpdateProperty();
            } else {
                const { data: insertedProperty, error } = await supabase.from('imoveis').insert(propertyDataForDb).select('id').single();
                if (error) throw error;

                // Generate and save the share URL with the production domain
                const shareUrl = `${PRODUCTION_URL}/?page=propertyDetail&propertyId=${insertedProperty.id}`;
                const { error: updateError } = await supabase
                    .from('imoveis')
                    .update({ share_url: shareUrl })
                    .eq('id', insertedProperty.id);

                if (updateError) {
                    // Log the error, but don't block the user flow as the property is already created.
                    console.error('Failed to save share URL:', updateError.message);
                }
                
                if (uploadedUrls.length > 0) {
                    const mediaToInsert = uploadedUrls.map(media => ({
                        imovel_id: insertedProperty.id,
                        url: media.url,
                        tipo: media.type
                    }));
                    const { error: mediaInsertError } = await supabase.from('midias_imovel').insert(mediaToInsert);
                    if (mediaInsertError) throw mediaInsertError;
                }
                await onAddProperty();
            }
            success = true;
        } catch (error: any) {
            console.error("Erro ao publicar anúncio:", error);
            onPublishError(error.message);
        } finally {
            setIsSubmitting(false);
            if (success) {
                onBack(propertyToEdit ? 'updated' : 'published');
            }
        }
    };
    
    const generateAITitle = useCallback(async () => {
        if (!formData.title.trim()) return;
        setIsGeneratingTitle(true);
        try {
            const prompt = t('publishJourney.detailsForm.aiTitlePrompt', { title: formData.title });
            
            const response = await generateContentWithRetry(prompt);
            if (!response) throw new Error("No response from AI");

            const text = response.text.trim();
            if (text) {
                setFormData(prev => ({ ...prev, title: text.replace(/["']/g, "") }));
            }
        } catch (error) {
            console.error("Erro ao gerar título com IA:", error);
            onRequestModal({ type: 'error', title: t('systemModal.errorTitle'), message: t('publishJourney.detailsForm.aiTitleError')});
        } finally {
            setIsGeneratingTitle(false);
        }
    }, [formData.title, t, onRequestModal]);

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
            const prompt = t('publishJourney.detailsForm.aiDescriptionPrompt', { details });

            const response = await generateContentWithRetry(prompt);
            if (!response) throw new Error("No response from AI");

            const text = response.text.trim();
            if (text) {
                setFormData(prev => ({ ...prev, description: text }));
            }
        } catch (error) {
            console.error("Erro ao gerar descrição com IA:", error);
            onRequestModal({ type: 'error', title: t('systemModal.errorTitle'), message: t('publishJourney.detailsForm.aiDescriptionError')});
        } finally {
            setIsGeneratingDescription(false);
        }
    }, [formData, t, onRequestModal]);

    const onCityLoad = (autocomplete: any) => {
        setCityAutocomplete(autocomplete);
    }
    const onStreetLoad = (autocomplete: any) => {
        setStreetAutocomplete(autocomplete);
    }

    const onCityPlaceChanged = () => {
        if (cityAutocomplete) {
            const place = cityAutocomplete.getPlace();
            if (place) {
                if (place.formatted_address) {
                    setFormData(prev => ({ ...prev, city: place.formatted_address.replace(/, Brazil|, Brasil/i, '').trim() }));
                }
                if (place.geometry && place.geometry.viewport) {
                    setCityBounds(place.geometry.viewport);
                } else {
                    setCityBounds(null);
                }
            }
        }
    }
    
    const onStreetPlaceChanged = () => {
        if (streetAutocomplete) {
            const place = streetAutocomplete.getPlace();
            if (place && place.address_components) {
                const get = (type: string, useShortName = false) => {
                    const component = place.address_components.find((c: any) => c.types.includes(type));
                    return component ? component[useShortName ? 'short_name' : 'long_name'] : '';
                };
                
                const street_number = get('street_number');
                const route = get('route');
                const sublocality_level_1 = get('sublocality_level_1'); // Bairro
                const administrative_area_level_2 = get('administrative_area_level_2'); // Cidade
                const state = get('administrative_area_level_1', true); // Estado (short name)

                const cityValue = [sublocality_level_1, administrative_area_level_2, state].filter(Boolean).join(', ');

                setFormData(prev => ({
                    ...prev,
                    street: route,
                    number: street_number,
                    city: cityValue,
                }));
            } else if (place && place.name) {
                setFormData(prev => ({...prev, street: place.name}));
            }
        }
    }
    
    const handleAddressChange = (newAddress: any) => {
        setAddress(newAddress);
        setFormData(prev => ({
            ...prev,
            city: `${newAddress.city} - ${newAddress.state}`,
            street: newAddress.street,
        }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submit iniciado');
        
        if (!formData.isAddressVerified) {
            console.log('Erro: Endereço não verificado');
            onRequestModal({ type: 'error', title: 'Endereço Pendente', message: 'Por favor, verifique o endereço do imóvel antes de continuar.' });
            const locationElement = document.getElementById('location-section');
            locationElement?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        console.log('Validando detalhes...');
        if (!validateDetails()) {
            console.log('Erro: Validação de detalhes falhou');
            return;
        }
        
        console.log('Iniciando submissão...');
        handleSubmitJourney();
    };


    return (
        <div className="bg-brand-light-gray min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <div className="text-sm mb-6">
                    <span onClick={() => {
                        console.log('Breadcrumb clicado - navegando de volta');
                        onBack();
                    }} className="text-brand-red hover:underline cursor-pointer">
                        {t('myAdsPage.breadcrumb')}
                    </span>
                    <span className="text-brand-gray mx-2">&gt;</span>
                    <span className="text-brand-dark font-medium">{propertyToEdit ? t('publishJourney.editTitle') : t('publishJourney.title')}</span>
                </div>
                
                <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                    <form ref={formRef} onSubmit={handleFormSubmit} className="lg:col-span-2 space-y-8">
                         <Section title="Informações Principais">
                            <h3 className="text-lg font-semibold text-brand-navy mb-4">{t('publishJourney.form.operation.label')}</h3>
                            <div className="grid grid-cols-3 gap-2 mb-8">
                                <button type="button" onClick={() => setFormData(p => ({...p, operation: 'venda'}))} className={`p-4 border rounded-lg text-center transition-colors ${formData.operation === 'venda' ? 'bg-red-600 !text-black font-semibold border-red-600' : 'bg-white hover:border-brand-dark'}`}>
                                    <span className="font-medium">{t('publishJourney.form.operation.sell')}</span>
                                </button>
                                <button type="button" onClick={() => setFormData(p => ({...p, operation: 'aluguel'}))} className={`p-4 border rounded-lg text-center transition-colors ${formData.operation === 'aluguel' ? 'bg-red-600 !text-black font-semibold border-red-600' : 'bg-white hover:border-brand-dark'}`}>
                                    <span className="font-medium">{t('publishJourney.form.operation.rent')}</span>
                                </button>
                                <button type="button" onClick={() => setFormData(p => ({...p, operation: 'temporada'}))} className={`p-4 border rounded-lg text-center transition-colors ${formData.operation === 'temporada' ? 'bg-red-600 !text-black font-semibold border-red-600' : 'bg-white hover:border-brand-dark'}`}>
                                    <span className="font-medium">{t('publishJourney.form.operation.season')}</span>
                                </button>
                            </div>
                         </Section>

                        <section id="location-section" className="mb-10 bg-white p-6 sm:p-8 rounded-lg shadow-md">
                            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy border-b border-gray-200 pb-4 mb-6">{t('publishJourney.form.location.label')}</h2>
                             {formData.isAddressVerified ? (
                                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center text-green-800">
                                                <VerifiedIcon className="w-5 h-5 mr-2" />
                                                <p className="font-semibold">{t('publishJourney.verifiedAddress.label')}</p>
                                            </div>
                                            <p className="text-green-700 mt-1">{formData.verifiedAddress}</p>
                                        </div>
                                        <button type="button" onClick={() => setFormData(prev => ({...prev, isAddressVerified: false}))} className="text-sm font-medium text-brand-red hover:underline">
                                            {t('publishJourney.verifiedAddress.edit')}
                                        </button>
                                    </div>
                                </div>
                             ) : (
                                <div>
                                    <AddressSearchByCEP onAddressChange={handleAddressChange} />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-3">
                                            <label htmlFor="city" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.city')}</label>
                                            {isLoaded ? (
                                                <Autocomplete
                                                    onLoad={onCityLoad}
                                                    onPlaceChanged={onCityPlaceChanged}
                                                    options={{
                                                        types: ['(regions)'],
                                                        componentRestrictions: { country: 'br' },
                                                    }}
                                                >
                                                    <input type="text" id="city" name="city" value={formData.city} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                                </Autocomplete>
                                            ) : (
                                                <input type="text" id="city" name="city" value={formData.city} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label htmlFor="street" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.street')}</label>
                                            {isLoaded ? (
                                                <Autocomplete
                                                    onLoad={onStreetLoad}
                                                    onPlaceChanged={onStreetPlaceChanged}
                                                    options={{
                                                        types: ['address'],
                                                        componentRestrictions: { country: 'br' },
                                                        bounds: cityBounds,
                                                        strictBounds: false,
                                                    }}
                                                >
                                                    <input type="text" id="street" name="street" value={formData.street} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                                </Autocomplete>
                                            ) : (
                                                <input type="text" id="street" name="street" value={formData.street} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="number" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.form.location.number')}</label>
                                            <input type="text" id="number" name="number" value={formData.number} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleAddressSubmit} disabled={isVerifyingAddress} className="mt-6 w-full bg-brand-navy text-white font-bold py-3 px-4 rounded-md hover:bg-brand-dark transition-opacity flex justify-center items-center disabled:opacity-75 disabled:cursor-wait">
                                        {isVerifyingAddress ? <SpinnerIcon className="w-5 h-5 animate-spin mr-2" /> : <LocationIcon className="w-5 h-5 mr-2"/>}
                                        {t('publishJourney.form.submitButton')}
                                    </button>
                                </div>
                             )}
                        </section>

                        <Section title="Detalhes do Anúncio e Preços">
                           <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.adTitle')}</label>
                                <div className="relative">
                                    <input type="text" id="title" name="title" value={formData.title} onChange={handleFormChange} placeholder={t('publishJourney.detailsForm.adTitlePlaceholder')} required minLength={10} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red pr-28" />
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
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {formData.operation === 'venda' && (
                                    <>
                                    <div>
                                        <label htmlFor="salePrice" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.salePrice')}</label>
                                        <input type="text" inputMode="decimal" id="salePrice" name="salePrice" value={formData.salePrice} onChange={handleCurrencyChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                    </div>
                                    <div>
                                        <label htmlFor="iptuAnnual" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.iptuAnnual')}</label>
                                        <input type="text" inputMode="decimal" id="iptuAnnual" name="iptuAnnual" value={formData.iptuAnnual} onChange={handleCurrencyChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                    </div>
                                    </>
                                )}
                                {formData.operation === 'aluguel' && (
                                    <>
                                    <div>
                                        <label htmlFor="monthlyRent" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.monthlyRent')}</label>
                                        <input type="text" inputMode="decimal" id="monthlyRent" name="monthlyRent" value={formData.monthlyRent} onChange={handleCurrencyChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                    </div>
                                    <div>
                                        <label htmlFor="condoFee" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.condoFee')}</label>
                                        <input type="text" inputMode="decimal" id="condoFee" name="condoFee" value={formData.condoFee} onChange={handleCurrencyChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                    </div>
                                    </>
                                )}
                                    {formData.operation === 'temporada' && (
                                    <>
                                    <div>
                                        <label htmlFor="dailyRate" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.dailyRate')}</label>
                                        <input type="text" inputMode="decimal" id="dailyRate" name="dailyRate" value={formData.dailyRate} onChange={handleCurrencyChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                    </div>
                                    <div>
                                        <label htmlFor="cleaningFee" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.cleaningFee')}</label>
                                        <input type="text" inputMode="decimal" id="cleaningFee" name="cleaningFee" value={formData.cleaningFee} onChange={handleCurrencyChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                    </div>
                                    </>
                                )}
                            </div>

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
                        </Section>
                        
                        <Section title="Características do Imóvel">
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label htmlFor="detailsPropertyType" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.propertyType')}</label>
                                    <select id="detailsPropertyType" name="detailsPropertyType" value={formData.detailsPropertyType} onChange={handlePropertyTypeChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red">
                                        {propertyTypes.map(item => (
                                                <option key={item.key} value={item.value}>{t(`publishJourney.detailsForm.${item.key}`)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="grossArea" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.grossArea')}</label>
                                    <input type="number" id="grossArea" name="grossArea" value={formData.grossArea} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red" />
                                </div>

                                {formData.detailsPropertyType !== 'Terreno' && (
                                    <>
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
                                    </>
                                )}
                                {formData.detailsPropertyType === 'Terreno' && (
                                    <>
                                        <div>
                                            <label htmlFor="topography" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.topography')}</label>
                                            <select id="topography" name="topography" value={formData.topography} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red">
                                                <option value="">Selecione</option>
                                                <option value="plano">{t('publishJourney.detailsForm.flat')}</option>
                                                <option value="aclive">{t('publishJourney.detailsForm.uphill')}</option>
                                                <option value="declive">{t('publishJourney.detailsForm.downhill')}</option>
                                                <option value="irregular">{t('publishJourney.detailsForm.irregular')}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="zoning" className="block text-sm font-medium text-brand-dark mb-1">{t('publishJourney.detailsForm.zoning')}</label>
                                            <select id="zoning" name="zoning" value={formData.zoning} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red">
                                                <option value="">Selecione</option>
                                                <option value="residencial">{t('publishJourney.detailsForm.residential')}</option>
                                                <option value="comercial">{t('publishJourney.detailsForm.commercial')}</option>
                                                <option value="misto">{t('publishJourney.detailsForm.mixedUse')}</option>
                                                <option value="industrial">{t('publishJourney.detailsForm.industrial')}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-brand-dark mb-2">{t('publishJourney.detailsForm.walled')}</p>
                                            <div className="flex gap-4">
                                                <label className="flex items-center"><input type="radio" name="isWalled" value="true" checked={formData.isWalled === true} onChange={handleRadioChange} className="mr-2"/>{t('publishJourney.detailsForm.yes')}</label>
                                                <label className="flex items-center"><input type="radio" name="isWalled" value="false" checked={formData.isWalled === false} onChange={handleRadioChange} className="mr-2"/>{t('publishJourney.detailsForm.no')}</label>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-sm font-medium text-brand-dark mb-2">{t('publishJourney.detailsForm.gatedCommunity')}</p>
                                            <div className="flex gap-4">
                                                <label className="flex items-center"><input type="radio" name="isGatedCommunity" value="true" checked={formData.isGatedCommunity === true} onChange={handleRadioChange} className="mr-2"/>{t('publishJourney.detailsForm.yes')}</label>
                                                <label className="flex items-center"><input type="radio" name="isGatedCommunity" value="false" checked={formData.isGatedCommunity === false} onChange={handleRadioChange} className="mr-2"/>{t('publishJourney.detailsForm.no')}</label>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {formData.detailsPropertyType !== 'Terreno' && (
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
                            )}

                            {(formData.detailsPropertyType !== 'Terreno' || formData.isGatedCommunity === true) && (
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
                            )}
                        </Section>
                        
                        <Section title="Fotos e Vídeos">
                            <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-brand-gray">{t('publishJourney.photosForm.dragAndDrop')}</p>
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-brand-navy text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-dark transition-opacity inline-block mt-4">
                                    <span>{t('publishJourney.photosForm.addButton')}</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*,video/*" />
                                </label>
                                <p className="mt-2 text-xs text-brand-gray">{t('publishJourney.photosForm.limitsInfo')}</p>
                            </div>

                            {files.length > 0 && (
                                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {files.map((file, index) => {
                                        const isExisting = 'type' in file && file.type === 'existing';
                                        const url = isExisting ? (file as { url: string }).url : URL.createObjectURL(file as File);
                                        const fileType = isExisting ? (file as { tipo: string }).tipo : (file as File).type;


                                        return (
                                            <div key={index} className="relative group aspect-w-1 aspect-h-1">
                                                {fileType.startsWith('video') ? (
                                                    <video src={url} className="w-full h-full object-cover rounded-md shadow-sm" controls />
                                                ) : (
                                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md shadow-sm" />
                                                )}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                                        <button type="button" onClick={() => removeFile(file)} className="absolute top-1 right-1 bg-white/70 text-brand-red rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={t('publishJourney.photosForm.removeFile')}>
                                                        <CloseIcon className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </Section>
                        
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <button type="button" onClick={() => {
                    console.log('Botão Cancelar clicado');
                    onBack();
                }} className="flex-1 order-2 sm:order-1 text-center bg-gray-200 text-brand-dark font-bold py-3 px-4 rounded-md hover:bg-gray-300 transition-opacity">
                    Cancelar
                </button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 order-1 sm:order-2 bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-wait flex items-center justify-center shadow-md">
                                {isSubmitting && <SpinnerIcon className="w-5 h-5 animate-spin mr-2" />}
                                {isSubmitting
                                    ? (propertyToEdit ? t('publishJourney.photosForm.updatingButton') : t('publishJourney.photosForm.publishingButton'))
                                    : (propertyToEdit ? t('publishJourney.photosForm.updateButton') : t('publishJourney.photosForm.publishButton'))
                                }
                            </button>
                        </div>
                    </form>
                    
                    <div className="hidden lg:block lg:col-span-1 mt-8 lg:mt-0">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-brand-red">
                                <h3 className="font-bold text-brand-navy mb-3">Informação útil</h3>
                                <div className="text-sm text-brand-gray space-y-3">
                                    <p>Prepare as fotos. Se ainda não as tem, poderá adicioná-las mais tarde. Sem fotos, seu anúncio não terá bons resultados.</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <BoltIcon className="w-8 h-8 mx-auto text-yellow-500 mb-2"/>
                                <h3 className="font-bold text-brand-navy mb-2">Quer vender seu imóvel rapidamente?</h3>
                                <a href="#" className="text-sm text-brand-red font-medium hover:underline">Encontre a imobiliária mais adequada para você</a>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <BriefcaseIcon className="w-8 h-8 mx-auto text-brand-navy mb-2"/>
                                <h3 className="font-bold text-brand-navy mb-2">Você é um profissional do mercado imobiliário?</h3>
                                <a href="#" className="text-sm text-brand-red font-medium hover:underline">Conheça as vantagens que oferecemos para profissionais</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};