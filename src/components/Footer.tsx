import React from 'react';
import { MapPin, Clock, Phone, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { LibraryLogo } from './LibraryLogo';
import { EitaaIcon } from './EitaaIcon';
import { isLibraryOpenNow } from '../utils/persian';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  const status = isLibraryOpenNow();

  return (
    <footer className="bg-[#031d1c] border-t-2 border-[#0d9488]/40 text-[#ccfbf1] text-right pt-16 pb-12 select-none relative overflow-hidden">
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-1/3 w-80 h-80 rounded-full bg-[#0d9488]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#0d9488]/25">
          
          {/* Col 1: High Contrast Library Logo & About */}
          <div className="space-y-4">
            <div className="inline-block p-2 rounded-2xl bg-[#073834] border border-[#84cc16]/40 shadow-md">
              <LibraryLogo size="md" />
            </div>

            <p className="text-xs leading-relaxed text-[#99f6e4] text-justify font-normal">
              کتابخانه شهید احسان کربلایی‌پور، در جوار مسجد امام خمینی (ره) اهواز؛ کانون پیوند اندیشه، معنویت، آگاهی و فرهنگ ایثار و شهادت با بیش از ۷۰۰۰ جلد کتاب تخصصی.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#073834] border border-[#0d9488]/40 text-[11px] text-[#a3e635]">
              <span className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-[#a3e635] animate-ping' : 'bg-rose-500'}`} />
              <span>{status.statusText} (۱۳:۰۰ الی ۲۰:۰۰)</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-black text-white mb-4 pb-2 border-b border-[#0d9488]/30 flex items-center gap-1.5">
              <span>بخش‌های اصلی پایگاه</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-[#ccfbf1]">
              {[
                { id: 'books', label: 'همه کتاب‌ها' },
                { id: 'intro', label: 'معرفی ۴ کتاب برگزیده' },
                { id: 'competitions', label: 'مسابقات بزرگ کتابخوانی' },
                { id: 'faq', label: 'پرسش‌های متداول مراجعان' },
                { id: 'rules', label: 'آیین‌نامه و قوانین امانت' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (link.id === 'rules') {
                        onNavigate('home');
                        setTimeout(() => {
                          const el = document.getElementById('rules-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 200);
                      } else {
                        onNavigate(link.id);
                      }
                    }}
                    className="hover-hop text-right hover:text-[#a3e635] transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-[#84cc16]">‹</span>
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Exact Address and Map */}
          <div>
            <h4 className="text-sm font-black text-white mb-4 pb-2 border-b border-[#0d9488]/30 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#84cc16]" />
              <span>نشانی و موقعیت مکانی</span>
            </h4>
            
            <p className="text-xs leading-relaxed text-[#99f6e4] mb-3">
              اهواز، فاز دو پادادشهر، بلوار سعادت، مسجد امام خمینی(ره)، طبقه فوقانی، کتابخانه شهید احسان کربلایی‌پور
            </p>

            <a
              href="https://nshn.ir/8brbkMj5IBbN0X"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#073834] hover:bg-[#0d9488]/30 border border-[#0d9488]/50 text-[#99f6e4] hover:text-white text-xs font-bold transition-all shadow-sm group"
            >
              <MapPin className="w-4 h-4 text-[#84cc16] group-hover:scale-125 transition-transform" />
              <span>مسیریابی مستقیم در نشان</span>
              <ExternalLink className="w-3 h-3 text-[#5eead4]" />
            </a>

            <p className="mt-2 text-[10px] text-[#99f6e4]/70">
              💡 زنگ آیفون اختصاصی کتابخانه در سمت راست درب ورودی نصب می‌باشد.
            </p>
          </div>

          {/* Col 4: Eitaa & Communication */}
          <div>
            <h4 className="text-sm font-black text-white mb-4 pb-2 border-b border-[#0d9488]/30 flex items-center gap-1.5">
              <span>ارتباط و کانال ایتا</span>
            </h4>

            <p className="text-xs leading-relaxed text-[#99f6e4] mb-3">
              برای آگاهی از مسابقات، کتب تازه رسیده و اطلاعیه‌های ثبت‌نام در کانال رسمی ما عضو شوید:
            </p>

            <a
              href="https://eitaa.com/shahidKarbalailibrary"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#F37021] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-md hover:scale-105"
            >
              <EitaaIcon size={20} />
              <span>کانال ایتا: @shahidKarbalailibrary</span>
            </a>

            <div className="mt-4 pt-3 border-t border-[#0d9488]/20 flex items-center justify-between text-[11px]">
              <span className="text-[#99f6e4]">ورود کادر کتابخانه:</span>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-[#84cc16] font-bold hover:underline flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>پنل مدیریت</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Memorial Dedication */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#99f6e4]/80">
          <p className="text-center sm:text-right">
            تمامی حقوق مادی و معنوی متعلق به <strong className="text-white">کتابخانه شهید احسان کربلایی‌پور</strong> (صحن واژه‌ها) است.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-[#ccfbf1]">
            <span>گرامی‌باد یاد و نام شهید مدافع حرم</span>
            <strong className="text-[#84cc16]">احسان کربلایی‌پور</strong>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>

      </div>
    </footer>
  );
};
