import React, { useState, useEffect } from 'react';
import LocationIcon from './icons/LocationIcon';
import SearchIcon from './icons/SearchIcon';
import { loadGoogleMapsAPI } from '../config';

interface Address {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  complement: string;
  latitude?: string;
  longitude?: string;
  fullAddress?: string;
}

interface AddressSearchByCEPProps {
  onAddressChange: (address: Address, isComplete: boolean) => void;
  isLoaded: boolean;
  initialAddress?: Partial<Address>;
}

const AddressSearchByCEP: React.FC<AddressSearchByCEPProps> = ({ 
  onAddressChange, 
  isLoaded,
  initialAddress 
}) => {
  const [address, setAddress] = useState<Address>({
    cep: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    number: '',
    complement: '',
    latitude: '',
    longitude: '',
    fullAddress: '',
    ...initialAddress
  });
  
  const [cepError, setCepError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Função para formatar CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  // Função para buscar endereço pelo CEP usando ViaCEP
  const fetchAddressByCEP = async (cep: string) => {
    setIsSearching(true);
    setCepError(null);
    
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error('CEP não encontrado');
      }
      
      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      const newAddress = {
        ...address,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      };

      setAddress(newAddress);

      // Buscar coordenadas com Google Maps se disponível
      if (window.google && window.google.maps) {
        await getCoordinatesFromGoogle(newAddress);
      }

    } catch (error) {
      setCepError('CEP inválido ou não encontrado. Verifique e tente novamente.');
      setAddress(prev => ({
        ...prev,
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        latitude: '',
        longitude: '',
        fullAddress: ''
      }));
    } finally {
      setIsSearching(false);
    }
  };

  // Função para obter coordenadas usando Google Maps Geocoding API
  const getCoordinatesFromGoogle = async (addressData: Address) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const fullAddress = `${addressData.street}, ${addressData.neighborhood}, ${addressData.city}, ${addressData.state}, Brasil`;
      
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const formattedAddress = results[0].formatted_address;
          
          setAddress(prev => ({
            ...prev,
            latitude: location.lat().toString(),
            longitude: location.lng().toString(),
            fullAddress: formattedAddress
          }));
        }
      });
    } catch (error) {
      console.warn('Erro ao obter coordenadas do Google Maps:', error);
    }
  };

  // Função para buscar sugestões de endereço usando Google Places
  const searchAddressSuggestions = async (query: string) => {
    if (!window.google || !window.google.maps || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'BR' },
        types: ['address']
      }, (predictions, status) => {
        // Comparar com string 'OK' evita conflitos de tipos em alguns ambientes
        if (status === 'OK' && predictions) {
          setSuggestions(predictions.map(p => p.description));
        } else {
          setSuggestions([]);
        }
      });
    } catch (error) {
      console.warn('Erro ao buscar sugestões:', error);
      setSuggestions([]);
    }
  };

  // Função para selecionar uma sugestão
  const selectSuggestion = async (suggestion: string) => {
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (!window.google || !window.google.maps) return;

    try {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: suggestion }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const result = results[0];
          const location = result.geometry.location;
          const components = result.address_components;
          
          // Extrair componentes do endereço
          let street = '';
          let number = '';
          let neighborhood = '';
          let city = '';
          let state = '';
          let postalCode = '';

          components.forEach(component => {
            const types = component.types;
            
            if (types.includes('street_number')) {
              number = component.long_name;
            } else if (types.includes('route')) {
              street = component.long_name;
            } else if (types.includes('sublocality') || types.includes('neighborhood')) {
              neighborhood = component.long_name;
            } else if (types.includes('administrative_area_level_2')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.short_name;
            } else if (types.includes('postal_code')) {
              postalCode = component.long_name;
            }
          });

          setAddress({
            cep: formatCEP(postalCode),
            street,
            number,
            neighborhood,
            city,
            state,
            complement: address.complement,
            latitude: location.lat().toString(),
            longitude: location.lng().toString(),
            fullAddress: result.formatted_address
          });
        }
      });
    } catch (error) {
      console.warn('Erro ao processar sugestão:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cep') {
      const formattedCEP = formatCEP(value);
      setAddress(prev => ({ ...prev, [name]: formattedCEP }));
    } else {
      setAddress(prev => ({ ...prev, [name]: value }));
    }

    // Buscar sugestões para o campo de rua
    if (name === 'street' && value.length >= 3) {
      const query = `${value}, ${address.city}, ${address.state}`;
      searchAddressSuggestions(query);
      setShowSuggestions(true);
    } else if (name === 'street') {
      setShowSuggestions(false);
    }
  };

  // Efeito para carregar Google Maps API
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        await loadGoogleMapsAPI();
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.warn('Erro ao carregar Google Maps API:', error);
      }
    };

    initGoogleMaps();
  }, []);

  // Efeito para buscar endereço quando CEP é preenchido
  useEffect(() => {
    const cleanCEP = address.cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      fetchAddressByCEP(cleanCEP);
    } else {
      setCepError(null);
    }
  }, [address.cep]);

  // Efeito para notificar mudanças no endereço
  useEffect(() => {
    const { cep, street, number, city, state } = address;
    const isComplete = !!(cep && street && number && city && state);
    onAddressChange(address, isComplete);
  }, [address.cep, address.street, address.number, address.city, address.state, address.latitude, address.longitude]);

  return (
    <div className="space-y-4">
      {/* Campo CEP */}
      <div className="form-group">
        <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
          CEP *
        </label>
        <div className="relative">
          <input
            type="text"
            id="cep"
            name="cep"
            value={address.cep}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 pl-10 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all ${
              cepError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="00000-000"
            maxLength={9}
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-red"></div>
            </div>
          )}
        </div>
        {cepError && (
          <p className="text-red-500 text-sm mt-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {cepError}
          </p>
        )}
      </div>

      {/* Campos de Endereço */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 form-group relative">
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
            Rua/Logradouro *
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={address.street}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
            placeholder="Nome da rua"
          />
          
          {/* Sugestões de endereço */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center">
                    <LocationIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
            Número *
          </label>
          <input
            type="text"
            id="number"
            name="number"
            value={address.number}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
            placeholder="123"
          />
        </div>
      </div>

      {/* Complemento */}
      <div className="form-group">
        <label htmlFor="complement" className="block text-sm font-medium text-gray-700 mb-2">
          Complemento
        </label>
        <input
          type="text"
          id="complement"
          name="complement"
          value={address.complement}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
          placeholder="Apartamento, bloco, etc."
        />
      </div>

      {/* Bairro, Cidade e Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-group">
          <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
            Bairro
          </label>
          <input
            type="text"
            id="neighborhood"
            name="neighborhood"
            value={address.neighborhood}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
            readOnly
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={address.city}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
            readOnly
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={address.state}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
            readOnly
          />
        </div>
      </div>

      {/* Informações de localização (se disponível) */}
      {address.latitude && address.longitude && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <LocationIcon className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Localização encontrada</p>
              <p className="text-xs text-green-600 mt-1">
                Coordenadas: {parseFloat(address.latitude).toFixed(6)}, {parseFloat(address.longitude).toFixed(6)}
              </p>
              {address.fullAddress && (
                <p className="text-xs text-green-600 mt-1">
                  Endereço completo: {address.fullAddress}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status do Google Maps */}
       {!googleMapsLoaded && (
         <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
           <div className="flex items-center">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
             <div>
               <p className="text-sm font-medium text-blue-800">Carregando Google Maps...</p>
               <p className="text-xs text-blue-600 mt-1">
                 Aguarde para acessar funcionalidades avançadas de endereço.
               </p>
             </div>
           </div>
         </div>
       )}
       

    </div>
  );
};

export default AddressSearchByCEP;