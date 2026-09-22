import React from 'react';
import { Sparkles, Bookmark, BookOpen, ArrowLeft, CheckCircle } from 'lucide-react';
import { Book } from '../types';
import { toPersianDigits } from '../utils/persian';

interface BookIntroductionViewProps {
  featuredBooks: Book[];
  onSelectBook: (book: Book) => void;
  onExploreAll: () => void;
}

export const BookIntroductionView: React.FC<BookIntroductionViewProps> = ({
  featuredBooks,
  onSelectBook,
  onExploreAll,
}) => {
  return (
    <div className="py-16 bg-[#042f2e] min-h-screen text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-4 py-1.5 rounded-full bg-[#073834] border border-[#84cc16]/40 text-[#a3e635] text-xs font-black inline-block mb-3">
            گزیده ویژه کتابدار
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white hover-hop">
            معرفی چهار کتاب برگزیده کتابخانه
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#99f6e4] leading-relaxed">
            منتخبی از پربارترین آثار در حوزه‌های سیر و سلوک، تاریخ مقاومت و اندیشه اسلامی که مطالعه آن‌ها افق‌های نوینی پیش روی ذهن می‌گشاید.
          </p>
        </div>

        {/* 4 Featured Books Showcase - Rich Editorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredBooks.map((book, idx) => {
            return (
              <div
                key={book.id || idx}
                className="relative rounded-3xl bg-gradient-to-br from-[#073834] to-[#042f2e] border-2 border-[#0d9488]/40 hover:border-[#84cc16]/70 p-6 sm:p-8 shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between group"
              >
                {/* Ribbon Tag */}
                <div className="absolute top-5 left-5">
                  <span className="px-3 py-1 rounded-full bg-[#84cc16] text-[#042f2e] text-xs font-black shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>کتاب شماره {toPersianDigits(idx + 1)}</span>
                  </span>
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Cover Art */}
                    <div className="w-36 h-52 sm:w-44 sm:h-64 rounded-2xl overflow-hidden bg-[#031d1c] border-2 border-[#0d9488]/50 shadow-xl shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[#064e3b] via-[#0f766e] to-[#047857] p-4 text-center flex flex-col justify-between">
                          <span className="text-[10px] text-[#a3e635]">کتابخانه شهید کربلایی‌پور</span>
                          <h4 className="text-sm font-black text-white leading-snug line-clamp-3">
                            {book.title}
                          </h4>
                          <span className="text-[11px] text-[#99f6e4]">{book.author}</span>
                        </div>
                      )}
                    </div>

                    {/* Book Text */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#84cc16] bg-[#042f2e] px-2.5 py-0.5 rounded-full border border-[#0d9488]/40">
                          {book.subject}
                        </span>
                        <span className="text-xs text-[#5eead4]">
                          قفسه {toPersianDigits(book.shelf)} - ردیف {toPersianDigits(book.row_number)}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-white leading-snug group-hover:text-[#a3e635] transition-colors">
                        {book.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-[#99f6e4] font-medium">
                        نویسنده: <strong className="text-white">{book.author}</strong>
                      </p>

                      {/* Excerpt */}
                      <div className="p-3.5 rounded-2xl bg-[#042f2e]/70 border border-[#0d9488]/30">
                        <h4 className="text-[11px] font-bold text-[#a3e635] mb-1">
                          گزیده‌ای از اثر:
                        </h4>
                        <p className="text-xs text-[#ccfbf1]/90 leading-relaxed text-justify line-clamp-4">
                          {book.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer and CTA */}
                <div className="mt-6 pt-5 border-t border-[#0d9488]/30 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#5eead4]">
                    <span>کد ثبت در کتابخانه: </span>
                    <strong className="text-[#a3e635] font-bold">{toPersianDigits(book.book_number)}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#84cc16] to-[#65a30d] hover:from-[#a3e635] hover:to-[#84cc16] text-[#042f2e] font-extrabold text-xs flex items-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>جزئیات و رزرو کتاب</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explore all books CTA */}
        <div className="mt-16 text-center">
          <button
            type="button"
            onClick={onExploreAll}
            className="px-8 py-4 rounded-2xl bg-[#073834] hover:bg-[#0d9488]/40 border-2 border-[#84cc16]/50 text-white font-extrabold text-sm sm:text-base flex items-center gap-3 mx-auto transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <span>مشاهده و جستجو در تمام فهرست ۷۰۰۰ جلدی</span>
            <ArrowLeft className="w-5 h-5 text-[#84cc16]" />
          </button>
        </div>

      </div>
    </div>
  );
};
