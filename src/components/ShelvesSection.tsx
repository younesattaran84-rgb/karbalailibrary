import React, { useState, useMemo } from 'react';
import { Layers, ArrowLeft, BookOpen, Bookmark, CheckCircle, Clock } from 'lucide-react';
import { Book } from '../types';
import { toPersianDigits } from '../utils/persian';

interface ShelvesSectionProps {
  books: Book[];
  onSelectShelf: (shelfNumber: number) => void;
  onSelectBook: (book: Book) => void;
}

export const ShelvesSection: React.FC<ShelvesSectionProps> = ({
  books,
  onSelectShelf,
  onSelectBook,
}) => {
  const [activeShelf, setActiveShelf] = useState<number>(1);

  // 16 Shelves definition
  const shelves = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => i + 1);
  }, []);

  // Filter 4 books for the active shelf with dynamic sampling
  const shelfBooks = useMemo(() => {
    const fromShelf = books.filter((b) => b.shelf === activeShelf);
    if (fromShelf.length === 0) {
      // Return fallback samples with designated shelf
      return [
        {
          id: `sample-${activeShelf}-1`,
          title: `مجموعه پژوهشی قفسه ${activeShelf}`,
          author: 'پدیدآورندگان منتخب',
          subject: 'علوم اسلامی و معارف',
          book_number: `${activeShelf}01`,
          shelf: activeShelf,
          row_number: 1,
          description: `کتاب‌های تخصصی و مرجع ثبت‌شده در قفسه شماره ${activeShelf} کتابخانه شهید کربلایی‌پور.`,
          availability_status: 'موجود' as const,
          reservation_allowed: true,
          created_at: '',
          updated_at: '',
        },
      ];
    }
    // Return up to 4 books
    return fromShelf.slice(0, 4);
  }, [books, activeShelf]);

  return (
    <section className="py-20 bg-[#042f2e] relative overflow-hidden border-b border-[#0d9488]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-4 py-1.5 rounded-full bg-[#073834] border border-[#84cc16]/40 text-[#a3e635] text-xs font-black inline-block mb-3">
            سازمان‌دهی قفسه‌های ۱ تا ۱۶
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white hover-hop">
            <span className="shimmer-text">کاوش در ۱۶ قفسه</span> کتابخانه
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#99f6e4] leading-relaxed">
            روی هر قفسه کلیک کرده یا نشانگر را نگه دارید تا ۴ کتاب نمونه از آن قفسه نمایش داده شود؛ با دکمه «ادامه» می‌توانید تمام عناوین آن قفسه را بررسی فرمایید.
          </p>
        </div>

        {/* 16 Shelves Interactive Tabs (Horizontal scroll on mobile, Grid on desktop) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none no-scrollbar">
          {shelves.map((s) => {
            const isSelected = activeShelf === s;
            const countInShelf = books.filter((b) => b.shelf === s).length;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setActiveShelf(s)}
                className={`shrink-0 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex flex-col items-center gap-1 select-none hover-hop ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#84cc16] to-[#65a30d] text-[#042f2e] shadow-lg shadow-[#84cc16]/30 border-2 border-white/40 scale-105'
                    : 'bg-[#073834] text-[#ccfbf1] hover:bg-[#0d9488]/30 hover:text-white border border-[#0d9488]/30'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>قفسه {toPersianDigits(s)}</span>
                </div>
                <span className={`text-[10px] ${isSelected ? 'text-[#042f2e]/80 font-extrabold' : 'text-[#5eead4]/70'}`}>
                  {countInShelf > 0 ? `${toPersianDigits(countInShelf)} عنوان` : 'موجود'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shelf Showcase Header & "ادامه" Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#073834]/80 border border-[#0d9488]/30 mb-8 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0d9488] to-[#042f2e] border border-[#84cc16]/40 flex items-center justify-center text-white font-black text-lg">
              {toPersianDigits(activeShelf)}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                نمایش نمونه کتاب‌های قفسه شماره {toPersianDigits(activeShelf)}
              </h3>
              <p className="text-xs text-[#99f6e4] mt-0.5">
                چینش منظم بر اساس شماره ثبت و ردیف‌های قفسه
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectShelf(activeShelf)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#0f766e] hover:from-[#14b8a6] hover:to-[#0d9488] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>مشاهده همه کتاب‌های قفسه {toPersianDigits(activeShelf)}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shelfBooks.map((book) => {
            const isAvailable = book.availability_status === 'موجود';
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="cursor-pointer group relative rounded-3xl bg-[#073834]/90 hover:bg-[#073834] border border-[#0d9488]/40 hover:border-[#84cc16]/60 p-5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between"
              >
                {/* Book Cover Visual with 3D Spine and Badge */}
                <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-[#042f2e] to-[#0f766e] border border-[#0d9488]/30 flex items-center justify-center shadow-inner group-hover:scale-[1.02] transition-transform">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-32 h-44 rounded-r-lg rounded-l-sm bg-gradient-to-tr from-[#064e3b] to-[#0f766e] p-3 text-center border-l-4 border-[#042f2e] flex flex-col justify-between shadow-lg">
                      <span className="text-[10px] text-[#a3e635]">قفسه {toPersianDigits(book.shelf)}</span>
                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-3">
                        {book.title}
                      </h4>
                      <span className="text-[9px] text-[#99f6e4] line-clamp-1">{book.author}</span>
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md flex items-center gap-1 ${
                        isAvailable
                          ? 'bg-[#84cc16] text-[#042f2e]'
                          : 'bg-amber-500 text-stone-900'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                      <span>{book.availability_status}</span>
                    </span>
                  </div>

                  {/* Book Number Badge */}
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/60 text-[#a3e635] text-[10px] font-bold backdrop-blur-sm">
                    کد: {toPersianDigits(book.book_number)}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#84cc16] flex items-center gap-1 mb-1">
                      <Bookmark className="w-3 h-3" />
                      <span>{book.subject}</span>
                    </span>

                    <h4 className="text-base font-extrabold text-white leading-snug group-hover:text-[#a3e635] transition-colors line-clamp-2">
                      {book.title}
                    </h4>

                    <p className="text-xs text-[#99f6e4] mt-1 font-medium line-clamp-1">
                      نویسنده: {book.author}
                    </p>

                    {book.description && (
                      <p className="mt-2 text-xs text-[#ccfbf1]/80 line-clamp-2 leading-relaxed font-normal">
                        {book.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Row */}
                  <div className="mt-4 pt-3 border-t border-[#0d9488]/30 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#5eead4]">
                      ردیف {toPersianDigits(book.row_number)}
                    </span>
                    <span className="text-[#a3e635] font-bold group-hover:underline flex items-center gap-1">
                      <span>مشاهده جزئیات</span>
                      <ArrowLeft className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
