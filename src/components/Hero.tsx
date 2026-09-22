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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Typography & Storytelling (7 columns) */}
          <div className="lg:col-span-7 text-right">
            
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

            {/* Official Logo Display with Luminous Floating Frame (Phase 12: Text next to emblem removed) */}
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
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#0d9488] via-[#0f766e] to-[#042f2e] p-2 border-2 border-[#84cc16] shadow-xl shadow-[#84cc16]/20 relative group overflow-hidden"
              >
                <img
                  src="/assets/sahne_vajeha_logo.png"
                  alt="لوگو صحن واژه‌ها"
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
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

          {/* 3D Floating Book Elements (5 columns) with Interactive Parallax */}
          <div className="lg:col-span-5 relative flex items-center justify-center perspective-1000 min-h-[380px] sm:min-h-[460px]">
            {/* Ambient halo glow */}
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#0d9488]/30 blur-3xl -z-10" />
            <div className="absolute w-48 h-48 rounded-full bg-[#84cc16]/20 blur-2xl -z-10 top-10" />

            {/* Floating 3D Book 1 (Amber / Crimson - Deep Leather Cover) */}
            <div
              className="absolute w-44 sm:w-52 h-64 sm:h-72 rounded-r-lg rounded-l-md shadow-2xl transition-transform duration-700 ease-out transform-style-preserve-3d cursor-pointer hover:scale-105"
              style={{
                transform: `translate3d(${-20 + mousePos.x}px, ${-30 + mousePos.y}px, 40px) rotateY(-25deg) rotateX(15deg) rotateZ(5deg)`,
                backgroundColor: '#9a3412',
                borderLeft: '12px solid #7c2d12',
                boxShadow: '15px 25px 35px rgba(0, 0, 0, 0.6), -5px 0 10px rgba(124, 45, 18, 0.4)',
              }}
            >
              <div className="p-4 h-full flex flex-col justify-between border border-amber-500/30 rounded-r-lg bg-gradient-to-tr from-[#7c2d12] via-[#9a3412] to-[#c2410c]">
                <div className="flex justify-between items-center text-[10px] text-amber-200">
                  <span>قفسه ۱</span>
                  <span>معرفت و اندیشه</span>
                </div>
                <div className="my-auto text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full border border-amber-300/40 flex items-center justify-center text-amber-200 text-xs">
                    ✦
                  </div>
                  <h3 className="text-sm font-extrabold text-amber-100 leading-snug">
                    جاذبه و دافعه علی (ع)
                  </h3>
                  <p className="text-[10px] text-amber-300/80 mt-1">استاد شهید مرتضی مطهری</p>
                </div>
                <div className="text-[9px] text-amber-300/60 text-center border-t border-amber-400/20 pt-2">
                  کتابخانه شهید کربلایی‌پور
                </div>
              </div>
            </div>

            {/* Floating 3D Book 2 (Emerald / Gold - Foreground) */}
            <div
              className="absolute w-46 sm:w-56 h-68 sm:h-80 rounded-r-lg rounded-l-md shadow-2xl transition-transform duration-500 ease-out transform-style-preserve-3d z-20 cursor-pointer hover:scale-105"
              style={{
                transform: `translate3d(${30 - mousePos.x * 1.2}px, ${20 - mousePos.y * 1.2}px, 90px) rotateY(-18deg) rotateX(10deg) rotateZ(-3deg)`,
                backgroundColor: '#064e3b',
                borderLeft: '14px solid #022c22',
                boxShadow: '20px 30px 45px rgba(0, 0, 0, 0.7), -6px 0 12px rgba(6, 78, 59, 0.5)',
              }}
            >
              <div className="p-5 h-full flex flex-col justify-between border-2 border-emerald-400/40 rounded-r-lg bg-gradient-to-tr from-[#022c22] via-[#064e3b] to-[#047857]">
                <div className="flex justify-between items-center text-[10px] text-emerald-200 font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-600/40">قفسه ۲</span>
                  <span>شهدای مقاومت</span>
                </div>
                <div className="my-auto text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-800/40 border border-emerald-300/40 flex items-center justify-center text-emerald-200 text-sm">
                    📖
                  </div>
                  <h3 className="text-base font-black text-white leading-snug">
                    سلام بر ابراهیم
                  </h3>
                  <p className="text-xs text-emerald-300 mt-1">زندگینامه شهید ابراهیم هادی</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-emerald-300/80 border-t border-emerald-400/20 pt-2 font-medium">
                  <span>وضعیت: موجود</span>
                  <span className="text-[#a3e635]">● امانت آزاد</span>
                </div>
              </div>
            </div>

            {/* Floating 3D Book 3 (Deep Indigo / Violet - Background Floating) */}
            <div
              className="absolute w-40 sm:w-48 h-56 sm:h-64 rounded-r-lg rounded-l-md shadow-2xl transition-transform duration-800 ease-out transform-style-preserve-3d cursor-pointer hover:scale-105"
              style={{
                transform: `translate3d(${70 + mousePos.x * 0.8}px, ${-60 + mousePos.y * 0.8}px, 0px) rotateY(-35deg) rotateX(20deg) rotateZ(12deg)`,
                backgroundColor: '#312e81',
                borderLeft: '10px solid #1e1b4b',
                boxShadow: '10px 20px 30px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="p-4 h-full flex flex-col justify-between border border-indigo-400/30 rounded-r-lg bg-gradient-to-tr from-[#1e1b4b] via-[#312e81] to-[#4338ca]">
                <div className="text-[10px] text-indigo-200">قفسه ۳</div>
                <div className="my-auto text-center">
                  <h4 className="text-xs font-bold text-indigo-100">طرح کلی اندیشه اسلامی</h4>
                  <p className="text-[9px] text-indigo-300/70 mt-1">در قرآن کریم</p>
                </div>
                <div className="text-[8px] text-indigo-300/50 text-center">انتشارات صهبا</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
