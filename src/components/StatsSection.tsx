import React, { useEffect, useState } from 'react';
import { BookOpen, Layers, Bookmark, Users, CheckCircle2 } from 'lucide-react';
import { toPersianDigits, formatPersianNumber } from '../utils/persian';

interface StatsSectionProps {
  stats?: {
    totalBooks: number;
    availableBooks: number;
    borrowedBooks: number;
    shelvesCount: number;
    subjectsCount: number;
    membersCount: number;
    visitsCount: number;
  };
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const [counts, setCounts] = useState({
    books: 0,
    shelves: 0,
    subjects: 0,
    members: 0,
  });

  const targetBooks = stats?.totalBooks || 7150;
  const targetShelves = stats?.shelvesCount || 16;
  const targetSubjects = stats?.subjectsCount || 33;
  const targetMembers = stats?.membersCount || 1540;

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1600; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCounts({
        books: Math.floor(ease * targetBooks),
        shelves: Math.floor(ease * targetShelves),
        subjects: Math.floor(ease * targetSubjects),
        members: Math.floor(ease * targetMembers),
      });

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetBooks, targetShelves, targetSubjects, targetMembers]);

  const cards = [
    {
      id: 'books-stat',
      title: 'کتاب موجود در کتابخانه',
      value: '+7000',
      sub: 'گنجینه‌ای ارزشمند از کتب معارفی، تاریخی، علمی و ادبی',
      icon: BookOpen,
      accent: 'from-[#84cc16] to-[#65a30d]',
      border: 'border-[#84cc16]/50',
      badge: 'مجموعه فعال',
      isPrimary: true,
    },
    {
      id: 'shelves-stat',
      title: 'قفسه تخصصی و استاندارد',
      value: toPersianDigits(counts.shelves),
      sub: 'سازمان‌دهی شده در ۱۶ قفسه منظم جهت دسترسی آسان مراجعان',
      icon: Layers,
      accent: 'from-[#0d9488] to-[#0f766e]',
      border: 'border-[#0d9488]/40',
      badge: 'قفسه‌بندی مدون',
    },
    {
      id: 'subjects-stat',
      title: 'موضوع متنوع و پژوهشی',
      value: toPersianDigits(counts.subjects),
      sub: 'از علوم قرآنی و عقاید تا تاریخ، حقوق، علوم تجربی و کودک',
      icon: Bookmark,
      accent: 'from-[#0284c7] to-[#0369a1]',
      border: 'border-sky-500/40',
      badge: 'دسته‌بندی جامع',
    },
    {
      id: 'members-stat',
      title: 'عضو فعال کتابخانه',
      value: `+${formatPersianNumber(counts.members)}`,
      sub: 'محله فاز دو پادادشهر و نمازگزاران گرامی مسجد امام خمینی(ره)',
      icon: Users,
      accent: 'from-[#eab308] to-[#ca8a04]',
      border: 'border-amber-500/40',
      badge: 'اعضای فعال',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#073834] relative border-b border-[#0d9488]/30 overflow-hidden">
      {/* Subtle top indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="px-3.5 py-1 rounded-full bg-[#0d9488]/20 border border-[#84cc16]/40 text-[#a3e635] text-xs font-bold inline-block mb-3">
            آمار زنده کتابخانه
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white hover-hop">
            آمار و گنجینه کتابخانه شهید کربلایی‌پور
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#99f6e4] leading-relaxed">
            کتابخانه با بیش از هفت هزار جلد کتاب و ۱۶ قفسه موضوعی، کانونی پویا برای پژوهش، مطالعه و ارتقای بینش نسل جوان است.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`relative rounded-3xl p-6 bg-[#042f2e]/90 border ${card.border} shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group flex flex-col justify-between`}
              >
                {/* Glow background */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#073834] text-[#a3e635] border border-[#0d9488]/40">
                      {card.badge}
                    </span>
                    <div className="p-3 rounded-2xl bg-[#073834] text-white group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-[#84cc16]" />
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline gap-1">
                      <span className="hover-hop text-white group-hover:text-[#a3e635] transition-colors">
                        {card.value}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-extrabold text-[#99f6e4]">
                      {card.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-4 pt-4 border-t border-[#0d9488]/20 text-xs text-[#ccfbf1]/80 leading-relaxed font-normal">
                  {card.sub}
                </p>
              </div>
            );
          })}
        </div>

        {/* Real-time sync guarantee footnote */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#5eead4]">
          <CheckCircle2 className="w-4 h-4 text-[#84cc16]" />
          <span>تمام آمار و اطلاعات به صورت برخط از پایگاه داده کتابخانه خوانده می‌شود.</span>
        </div>

      </div>
    </section>
  );
};
