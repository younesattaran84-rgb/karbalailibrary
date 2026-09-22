import React, { useEffect, useState } from 'react';
import { LibraryLogo } from './LibraryLogo';

interface LoadingScreenProps {
  onFinish?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 400);
    }, 850);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#042f2e] text-[#f0fdfa] transition-opacity duration-400 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute w-72 h-72 rounded-full bg-[#0d9488]/20 blur-3xl animate-pulse -top-10 -right-10 pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full bg-[#84cc16]/15 blur-3xl animate-pulse -bottom-10 -left-10 pointer-events-none" />

      <div className="relative flex flex-col items-center text-center p-6 max-w-sm">
        <div className="relative animate-bounce">
          <LibraryLogo size="lg" showText={false} />
        </div>

        <h1 className="mt-6 text-2xl font-black text-white tracking-wide">
          صحن واژه‌ها
        </h1>
        <p className="mt-1 text-sm text-[#99f6e4] font-medium">
          کتابخانه شهید احسان کربلایی‌پور
        </p>

        {/* Delicate progress bar */}
        <div className="mt-8 w-48 h-1.5 bg-[#073834] rounded-full overflow-hidden border border-[#0d9488]/30">
          <div className="h-full bg-gradient-to-r from-[#0d9488] via-[#84cc16] to-[#a3e635] w-full animate-[progress_1s_ease-in-out_infinite]" />
        </div>

        <p className="mt-3 text-xs text-[#5eead4]/80">
          در حال بارگذاری گنجینه و فهرست کتاب‌ها...
        </p>
      </div>
    </div>
  );
};
