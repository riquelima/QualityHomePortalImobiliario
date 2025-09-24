import React from 'react';

interface FeatureIconProps {
  feature: string;
  className?: string;
}

// FIX: Replaced JSX.Element with React.ReactElement to resolve missing JSX namespace error.
const icons: Record<string, React.ReactElement> = {
  // Home Features
  builtInWardrobes: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4" />,
  airConditioning: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L12 6l-1.5-1.5m3 0l-1.5 1.5-1.5-1.5M12 21v-6.75a2.25 2.25 0 00-2.25-2.25H8.25a2.25 2.25 0 00-2.25 2.25V21" />,
  terrace: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6" />,
  balcony: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6" />,
  garage: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5v11.5H3.75zM3.75 18.25h16.5M6 11.25h2.25m4.5 0h2.25" />,
  mobiliado: <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 11.25H5.25a2.25 2.25 0 00-2.25 2.25v4.5A2.25 2.25 0 005.25 20.25h13.5a2.25 2.25 0 002.25-2.25v-4.5a2.25 2.25 0 00-2.25-2.25zM3.75 9.75h16.5" />,
  cozinhaEquipada: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 15.75V12M8.25 15.75V12M12 2.25v2.25m-3-1.5v1.5m6-1.5v1.5M4.5 9h15" />,
  suite: <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75v10.5a2.25 2.25 0 01-2.25 2.25H9a2.25 2.25 0 01-2.25-2.25V6.75m10.5 0v-2.25a2.25 2.25 0 00-2.25-2.25h-6a2.25 2.25 0 00-2.25 2.25v2.25" />,
  escritorio: <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.5m3-1.5v1.5m3-1.5v1.5M3 13.5h18M5.25 7.5h13.5a2.25 2.25 0 012.25 2.25v.75a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25v-.75a2.25 2.25 0 012.25-2.25z" />,
  // Building Features
  pool: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3m-6.75 3h9.75m-1.5 3h-6.75m-1.5 3h9.75M12 21a9 9 0 110-18 9 9 0 010 18z" />,
  greenArea: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c2.422 0 4.68-.92 6.364-2.464M12 21.75c-2.422 0-4.68-.92-6.364-2.464M12 21.75v-19.5M4.836 6.364A9 9 0 0119.164 6.364" />,
  portaria24h: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
  academia: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h1.5m12 0h1.5M12 4.5v1.5m0 12v1.5M6 6l1.5 1.5m9 9l1.5 1.5M6 18l1.5-1.5m9-9l1.5-1.5" />,
  salaoDeFestas: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5m1.5 0v-1.875a3.375 3.375 0 013.375-3.375h13.5a3.375 3.375 0 013.375 3.375v1.875" />,
  churrasqueira: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5M4.5 12.75v4.5m15-4.5v4.5m-7.5-12v12" />,
  parqueInfantil: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75l-3.75-3.75m3.75 3.75L15.75 18m-3.75-3.75V3" />,
  quadraEsportiva: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />,
  sauna: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 3.75v16.5m3-16.5v16.5m3-16.5v16.5" />,
  espacoGourmet: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c-3.142 0-6.14-1.24-8.364-3.464M12 21.75v-19.5M12 2.25c3.142 0 6.14 1.24 8.364 3.464M12 2.25v19.5M12 2.25v-1.5m0 21v-1.5M12 9.75v3.75m0-3.75h.008v3.75H12z" />,
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