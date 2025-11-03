export const QUALLITY_HOME_USER_ID = '5d7ac623-1953-4d5d-b578-d4bb6ca0ad64';
export const PRODUCTION_URL = 'https://www.portalimobiliarioquallityhome.com';

// Google Maps API Configuration
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDukeY7JJI9UkHIFbsCZOrjPDRukqvUOfA';

// Função para carregar Google Maps API dinamicamente
export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Se já estiver carregado, resolver imediatamente
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Se já existe um script carregando, aguardar o evento
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      window.addEventListener('google-maps-loaded', () => resolve());
      return;
    }

    // Criar e carregar o script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Função de callback global
    (window as any).initGoogleMaps = () => {
      console.log('Google Maps API carregado dinamicamente');
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Falha ao carregar Google Maps API'));
    };

    document.head.appendChild(script);
  });
};
