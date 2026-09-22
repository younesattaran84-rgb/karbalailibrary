import React, { useState } from 'react';
import { Quote, ArrowRight, ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { INITIAL_QUOTES } from '../data/initialData';

export const QuotesCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((c) => (c === 0 ? INITIAL_QUOTES.length - 1 : c - 1));
  };

  const next = () => {
    setCurrentIndex((c) => (c === INITIAL_QUOTES.length - 1 ? 0 : c + 1));
  };

  const quote = INITIAL_QUOTES[currentIndex];

  return (
    <section className="py-20 bg-[#042f2e] relative overflow-hidden border-b border-[#0d9488]/30">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-[#0d9488]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-[#84cc16]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header - Stage 17 & 18.2: No "یادمان", clean and exact text */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white hover-hop tracking-tight">
            کلام بزرگان درباره کتاب و کتابخوانی
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#99f6e4] font-medium">
            احادیث و سخنان بزرگان درباره کتابخوانی
          </p>
        </div>

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto relative rounded-3xl bg-gradient-to-br from-[#073834] via-[#042f2e] to-[#073834] border-2 border-[#0d9488]/40 p-8 sm:p-12 shadow-2xl backdrop-blur-md">
          
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-2xl bg-[#0d9488]/20 text-[#84cc16] border border-[#84cc16]/30 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#84cc16]" />
              <span className="text-xs font-bold text-[#a3e635]">گوهر حکمت</span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                className="p-2.5 rounded-xl bg-[#042f2e] hover:bg-[#0d9488]/40 text-[#ccfbf1] hover:text-white border border-[#0d9488]/40 transition-all hover:scale-105 active:scale-95"
                aria-label="قبلی"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="p-2.5 rounded-xl bg-[#042f2e] hover:bg-[#0d9488]/40 text-[#ccfbf1] hover:text-white border border-[#0d9488]/40 transition-all hover:scale-105 active:scale-95"
                aria-label="بعدی"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quote Body */}
          <div className="min-h-[150px] flex flex-col justify-center">
            {quote.arabic && (
              <p className="text-base sm:text-lg font-bold text-[#84cc16] mb-3 font-serif text-center sm:text-right">
                «{quote.arabic}»
              </p>
            )}
            <blockquote className="text-lg sm:text-2xl font-bold text-white leading-relaxed text-justify sm:text-right">
              «{quote.text || quote.persian}»
            </blockquote>
          </div>

          {/* Author info */}
          <div className="mt-8 pt-6 border-t border-[#0d9488]/25 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0d9488] to-[#84cc16] flex items-center justify-center text-white font-black text-base shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#a3e635]">
                  {quote.author || quote.source}
                </h4>
                {quote.role && <p className="text-xs text-[#99f6e4]">{quote.role}</p>}
              </div>
            </div>

            {/* Indicators */}
            <div className="flex items-center gap-1.5">
              {INITIAL_QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'w-8 bg-[#84cc16]' : 'w-2.5 bg-[#0d9488]/40 hover:bg-[#0d9488]'
                  }`}
                  aria-label={`اسلاید ${i + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

