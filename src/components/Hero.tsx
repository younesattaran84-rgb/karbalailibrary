import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, BookOpen, Sparkles, MapPin } from 'lucide-react';
import { EitaaIcon } from './EitaaIcon';
import { isLibraryOpenNow } from '../utils/persian';

interface HeroProps {
  onSearchClick: () => void;
  onExploreShelvesClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearchClick, onExploreShelvesClick }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [status] = useState(() => isLibraryOpenNow());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 20,
        y: (e.clientY / innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-14 lg:pb-28 bg-gradient-to-b from-[#042f2e] via-[#073834] to-[#042f2e] border-b border-[#0d9488]/30">
      
      {/* Background Decorative Ambient Shapes & Subtle Islamic Geometry Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="#14b8a6" strokeWidth="1" />
              <circle cx="40" cy="40" r="16" fill="none" stroke="#84cc16" strokeWidth="0.8" />
              <path d="M40 10 L70 40 L40 70 L10 40 Z" fill="none" stroke="#5eead4" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-grid)" />
        </svg>
      </div>

      {/* Floating Light Orbs */}
      <div className="absolute top-1/4 right-5 w-80 h-80 rounded-full bg-[#0d9488]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-5 w-72 h-72 rounded-full bg-[#84cc16]/15 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-right">
        {/* Live Library Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d9488]/20 border border-[#84cc16]/40 text-[#a3e635] text-xs font-bold mb-6 shadow-sm"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${status.isOpen ? 'bg-[#a3e635] animate-ping' : 'bg-rose-500'}`} />
          <span>{status.statusText}</span>
          <span className="text-[#99f6e4] font-normal border-r border-[#0d9488]/40 pr-2 mr-1">
            ساعت کاری: ۱۳:۰۰ الی ۲۰:۰۰
          </span>
        </motion.div>

        {/* Official Logo Display with Luminous Floating Frame */}
        <div className="mb-6 flex items-center">
          <motion.div
            animate={{
              y: [0, -6, 0],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: 'easeInOut',
            }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#0d9488]/80 via-[#0f766e]/80 to-[#042f2e] p-2 border border-[#0d9488]/40 shadow-lg shadow-[#0d9488]/20 relative group overflow-hidden"
          >
            <img
              src="/assets/sahne_vajeha_logo.png"
              alt="لوگو صحن واژه‌ها"
              className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.div>
        </div>

        {/* Main Headline with Shimmer Light Wave Effect */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.1rem] font-black text-white leading-[1.35] tracking-tight">
          <span className="hover-hop cursor-pointer transition-colors hover:text-[#a3e635]">
            «کتاب‌ها
          </span>{' '}
          <span className="hover-hop cursor-pointer text-[#5eead4] hover:text-[#a3e635]">
            کشتی‌هایی
          </span>{' '}
          <span className="hover-hop cursor-pointer transition-colors hover:text-[#a3e635]">
            هستند
          </span>{' '}
          <span className="hover-hop cursor-pointer transition-colors hover:text-[#a3e635]">
            که ما را به
          </span>{' '}
          <span className="hover-hop cursor-pointer text-[#84cc16] hover:text-[#a3e635] glow-text">
            سرزمین‌های دور
          </span>{' '}
          <span className="hover-hop cursor-pointer transition-colors hover:text-[#a3e635]">
            می‌برند»
          </span>
        </h1>

        {/* Subtitle */}
        <h2 className="mt-5 text-xl sm:text-2xl font-extrabold text-[#99f6e4] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#84cc16] animate-spin" style={{ animationDuration: '6s' }} />
          <span className="shimmer-text">به کتابخانه شهید احسان کربلایی‌پور خوش آمدید</span>
        </h2>

        {/* Welcoming Paragraph */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-[#073834]/80 border border-[#0d9488]/30 shadow-inner backdrop-blur-sm text-justify">
          <p className="text-sm sm:text-base text-[#e6fffa] leading-relaxed font-normal hover:text-white transition-colors">
            اینجا خانه‌ای برای اندیشه‌هاست. کتابخانه‌ای که به یاد شهید مدافع حرم، احسان کربلایی‌پور، بنا شده است تا چراغ دانش و آگاهی را در میان نسل امروز روشن نگه دارد. ما باور داریم که هر کتاب، پنجره‌ای به سوی جهانی تازه است و هر خواننده، ادامه‌دهنده راهی است که شهیدان برای سربلندی این سرزمین پیموده‌اند. در این کتابخانه، شما فقط کتاب امانت نمی‌گیرید؛ شما بخشی از یک خانواده فرهنگی می‌شوید که هدفش رشد، آگاهی و نزدیکی به آرمان‌های والای انسانی است.
          </p>
        </div>

        {/* Call To Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onSearchClick}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#84cc16] to-[#65a30d] hover:from-[#a3e635] hover:to-[#84cc16] text-[#042f2e] font-black text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-[#84cc16]/25 hover:shadow-xl hover:shadow-[#84cc16]/40 transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <Search className="w-5 h-5" />
            <span>جستجو میان +۷۰۰۰ کتاب</span>
          </button>

          <button
            type="button"
            onClick={onExploreShelvesClick}
            className="px-5 py-3.5 rounded-2xl bg-[#073834] hover:bg-[#0d9488]/30 text-white font-bold text-sm sm:text-base border border-[#0d9488]/40 hover:border-[#84cc16]/60 flex items-center gap-2.5 transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-[#5eead4]" />
            <span>مشاهده ۱۶ قفسه کتابخانه</span>
          </button>

          <a
            href="https://eitaa.com/shahidKarbalailibrary"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#EA580C] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white font-bold text-sm flex items-center gap-2.5 shadow-md transition-all transform hover:-translate-y-1 cursor-pointer"
            title="کانال ایتا"
          >
            <EitaaIcon size={22} />
            <span className="hidden sm:inline">کانال ایتا</span>
          </a>
        </div>

        {/* Address quick note */}
        <div className="mt-6 flex items-center gap-2 text-xs text-[#99f6e4]/80">
          <MapPin className="w-4 h-4 text-[#84cc16] shrink-0" />
          <span>اهواز، فاز دو پادادشهر، بلوار سعادت، مسجد امام خمینی(ره)، کتابخانه شهید احسان کربلایی‌پور</span>
        </div>
      </div>
    </section>
  );
};
