
import React from 'react';

interface FeatureIconProps {
  feature: string;
  className?: string;
}

const icons: Record<string, JSX.Element> = {
  // Home Features
  builtInWardrobes: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3.75h19.5v16.5H2.25V3.75zM12 3.75v16.5M8.25 11.25h.01M15.75 11.25h.01" />,
  airConditioning: <><path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5h18v6H3v-6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5h3m3 0h6" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.75a2.25 2.25 0 01-2.012-1.254l-.488-1.22c-.22-.55-.78-.876-1.378-.876H3" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.75a2.25 2.25 0 002.012-1.254l.488-1.22c.22-.55.78-.876 1.378-.876H21" /></>,
  terrace: <><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25h18v10.5H3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25L9 3h6l6 5.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 18.75V8.25m9 10.5V8.25" /></>,
  balcony: <><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 21v-5.25a2.25 2.25 0 012.25-2.25h6a2.25 2.25 0 012.25 2.25V21" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M6.75 13.5V6" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 13.5V6" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" /></>,
  garage: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375c-.621 0-1.125-.504-1.125-1.125V14.25c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125v3.375m0 0a1.5 1.5 0 003 0m-3 0a1.5 1.5 0 013 0m0 0h6.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H15M9 13.125l.75-4.5m0 0l1.5 4.5M9.75 8.625h4.5M15 9.375l-.75-4.5M15 9.375a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0" />,
  mobiliado: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 8.25v8.25h19.5V8.25M2.25 8.25L3 6h18l.75 2.25M3.75 16.5h16.5M6 16.5v2.25m12-2.25v2.25" />,
  cozinhaEquipada: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M15.75 3v1.5M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6zM3 13.5h18" />,
  suite: <><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h12v9H3zM4.5 16.5v3m9-3v3" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-1.5a1.5 1.5 0 01-1.5-1.5v-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 3.75h-3m3 0v3.75a1.5 1.5 0 01-1.5 1.5h-1.5a1.5 1.5 0 01-1.5-1.5V3.75m3 0v1.5m-3-1.5v1.5m4.5 9.75v1.5m-1.5-1.5v1.5m-1.5-1.5v1.5" /></>,
  escritorio: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5v-2.25A3.375 3.375 0 017.125 7.5h9.75A3.375 3.375 0 0120.25 11.25v2.25m-16.5 0s1.625-1.625 4.125-1.625 4.125 1.625 4.125 1.625 1.625-1.625 4.125-1.625 4.125 1.625 4.125 1.625m-16.5 0h16.5M3.75 13.5v4.5A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18v-4.5" />,
  // Building Features
  pool: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 5.25a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM14.25 11.25L12 9l-2.25 2.25L6 7.5l-1.5 1.5L7.5 12l-1.5 1.5L9 15l2.25-2.25L13.5 15l1.5-1.5L12 10.5l2.25 1.875" />,
  greenArea: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75c3.125-3.125 8.188-3.125 11.313 0s3.125 8.188 0 11.313c-3.125 3.125-8.188 3.125-11.313 0s-3.125-8.188 0-11.313zM3 3l5.25 5.25" />,
  portaria24h: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M12 21.75l-8.25-6V5.25l8.25-3 8.25 3v10.5l-8.25 6z" />,
  academia: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12h-9m9 0a2.25 2.25 0 012.25 2.25v0a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v0a2.25 2.25 0 012.25-2.25m9 0a2.25 2.25 0 002.25-2.25v0a2.25 2.25 0 00-2.25-2.25h-9a2.25 2.25 0 00-2.25 2.25v0A2.25 2.25 0 007.5 12h0z" />,
  salaoDeFestas: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.25l-2.637 4.395A1.5 1.5 0 008.25 15h7.5a1.5 1.5 0 001.137-2.355L14.25 8.25M9.75 8.25h4.5m-4.5 0l1.5-2.625m3 2.625l-1.5-2.625" />,
  churrasqueira: <><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5v6.75H3.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5L6 18.75h12l2.25-5.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6.75V3.75m12 3V3.75M9 9.75h6" /></>,
  parqueInfantil: <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v13.5m0 0a2.25 2.25 0 104.5 0m-4.5 0a2.25 2.25 0 114.5 0m-4.5 0H3m3 0h4.5m4.5-13.5v13.5m0 0a2.25 2.25 0 104.5 0m-4.5 0a2.25 2.25 0 114.5 0m-4.5 0h-3m3 0h-4.5" />,
  quadraEsportiva: <><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 007.8-14.7" /></>,
  sauna: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.75c.5-1.5 2-1.5 2.5 0 .5-1.5 2-1.5 2.5 0m-7.5 3c.5-1.5 2-1.5 2.5 0 .5-1.5 2-1.5 2.5 0m-7.5 3c.5-1.5 2-1.5 2.5 0 .5-1.5 2-1.5 2.5 0" />,
  espacoGourmet: <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 15.75v-1.5a2.25 2.25 0 012.25-2.25h9a2.25 2.25 0 012.25 2.25v1.5m-13.5 0h13.5m-13.5 0a2.25 2.25 0 01-2.25-2.25v-1.5c0-1.242 1.008-2.25 2.25-2.25h13.5c1.242 0 2.25 1.008 2.25 2.25v1.5a2.25 2.25 0 01-2.25 2.25m-13.5 0v-1.5a2.25 2.25 0 012.25-2.25h9a2.25 2.25 0 012.25 2.25v1.5" />,
  default: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
};

const FeatureIcon: React.FC<FeatureIconProps> = ({ feature, className = 'w-6 h-6' }) => {
  const iconSvg = icons[feature] || icons['default'];

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
      className={className}
    >
      {iconSvg}
    </svg>
  );
};

export default FeatureIcon;
