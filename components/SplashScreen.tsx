import React from 'react';

interface SplashScreenProps {
  isFadingOut: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut }) => {
  return (
    <div 
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-white transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
      aria-hidden={isFadingOut}
    >
      <img 
        src="https://i.imgur.com/FuxDdyF.png" 
        alt="Quallity Home Logo" 
        className="h-32 sm:h-40 animate-slow-pulse"
      />
    </div>
  );
};

export default SplashScreen;
