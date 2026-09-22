import React, { useState } from 'react';
import { Trophy, Calendar, Gift, Award, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { Competition, UserProfile } from '../types';
import { toPersianDigits } from '../utils/persian';

interface CompetitionsViewProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const CompetitionsView: React.FC<CompetitionsViewProps> = ({ currentUser, onOpenAuth }) => {
  const [registeredCompId, setRegisteredCompId] = useState<string | null>(null);

  const sampleCompetitions: Competition[] = [
    {
      id: 'comp-1',
      title: 'مسابقه بزرگ کتابخوانی «سلام بر ابراهیم»',
      book_title: 'سلام بر ابراهیم (زندگینامه و خاطرات شهید ابراهیم هادی)',
      description: 'مسابقه جامع کتابخوانی با محوریت سبک زندگی، جوانمردی و ایثار شهید والامقام ابراهیم هادی همراه با آزمون آنلاین و تشریحی.',
      start_date: '۱۴۰۳/۰۱/۱۵',
      end_date: '۱۴۰۳/۰۲/۱۵',
      prizes: [
        'کمک‌هزینه سفر زیارتی مشهد مقدس برای ۳ نفر برگزیده',
        '۵ کارت هدیه ۵۰۰ هزار تومانی برای نفرات ممتاز',
        '۱۰ بسته کتاب فرهنگی نفیس برای شرکت‌کنندگان برتر',
      ],
      status: 'در حال برگزاری',
      questions_count: 20,
    },
    {
      id: 'comp-2',
      title: 'مسابقه اندیشه مطهر (طرح کلی اندیشه اسلامی در قرآن)',
      book_title: 'طرح کلی اندیشه اسلامی در قرآن کریم',
      description: 'سلسله مسابقات معرفت‌افزایی ویژه جوانان و نوجوانان با هدف آشنایی عمیق با مبانی توحید، نبوت، ولایت و ایمان در قرآن کریم.',
      start_date: '۱۴۰۳/۰۲/۲۰',
      end_date: '۱۴۰۳/۰۳/۲۰',
      prizes: [
        'تندیس افتخار و جوایز نقدی ارزنده',
        'لوح تقدیر و بن خرید کتاب',
      ],
      status: 'به زودی',
      questions_count: 25,
    },
  ];

  const handleRegister = (id: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setRegisteredCompId(id);
  };

  return (
    <div className="py-16 bg-[#042f2e] min-h-screen text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-4 py-1.5 rounded-full bg-[#073834] border border-[#84cc16]/40 text-[#a3e635] text-xs font-black inline-block mb-3">
            پویایی فرهنگی و جوایز
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white hover-hop">
            مسابقات بزرگ کتابخوانی
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#99f6e4] leading-relaxed">
            با هدف ترویج فرهنگ مطالعه هدفمند، کتابخانه شهید احسان کربلایی‌پور در مناسبت‌های گوناگون مسابقات همراه با جوایز ارزنده برگزار می‌کند.
          </p>
        </div>

        {/* Competitions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sampleCompetitions.map((comp) => {
            const isOngoing = comp.status === 'در حال برگزاری';
            const isRegistered = registeredCompId === comp.id;

            return (
              <div
                key={comp.id}
                className="relative rounded-3xl bg-[#073834]/80 border-2 border-[#0d9488]/40 hover:border-[#84cc16]/60 p-6 sm:p-8 shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Status badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black shadow-md ${
                        isOngoing
                          ? 'bg-[#84cc16] text-[#042f2e]'
                          : 'bg-amber-500 text-stone-900'
                      }`}
                    >
                      {comp.status}
                    </span>
                    <div className="p-3 rounded-2xl bg-[#042f2e] text-[#84cc16] border border-[#0d9488]/40">
                      <Trophy className="w-6 h-6" />
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                    {comp.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#84cc16] font-bold mb-4">
                    کتاب منبع: {comp.book_title}
                  </p>

                  <p className="text-xs sm:text-sm text-[#ccfbf1]/90 leading-relaxed text-justify mb-6">
                    {comp.description}
                  </p>

                  {/* Dates */}
                  <div className="flex items-center gap-4 text-xs text-[#99f6e4] bg-[#042f2e] p-3 rounded-xl border border-[#0d9488]/30 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#84cc16]" />
                      <span>مهلت شرکت: {toPersianDigits(comp.end_date)}</span>
                    </div>
                    {comp.questions_count && (
                      <span className="border-r border-[#0d9488]/40 pr-3">
                        {toPersianDigits(comp.questions_count)} سؤال تستی
                      </span>
                    )}
                  </div>

                  {/* Prizes */}
                  <div className="space-y-2 mb-6">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-[#84cc16]" />
                      جوایز برگزیدگان:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#ccfbf1]/90">
                      {(Array.isArray(comp.prizes) ? comp.prizes : [comp.prizes]).map((prz, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#84cc16] shrink-0" />
                          <span>{prz}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#0d9488]/30">
                  {isRegistered ? (
                    <div className="p-3 rounded-xl bg-emerald-950 border border-[#84cc16] text-[#a3e635] text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>نام‌نویسی شما با موفقیت ثبت شد. سؤالات از طریق پیام‌رسان ایتا ارسال خواهد شد.</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRegister(comp.id)}
                      className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#84cc16] to-[#65a30d] hover:from-[#a3e635] hover:to-[#84cc16] text-[#042f2e] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#84cc16]/20 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {!currentUser ? 'ورود به حساب جهت شرکت در مسابقه' : 'ثبت‌نام رایگان در مسابقه'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
