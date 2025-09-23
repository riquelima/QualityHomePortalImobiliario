import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1500); // Start fading out after 1.5 seconds

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 2000); // Component unmounts after 2 seconds total

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 bg-white z-[9999] flex items-center justify-center transition-opacity duration-500 ease-in-out ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <img
        src="https://i.imgur.com/FuxDdyF.png"
        alt="Quality Home Logo"
        className="w-48 animate-logo-splash"
      />
    </div>
  );
};

export default SplashScreen;
