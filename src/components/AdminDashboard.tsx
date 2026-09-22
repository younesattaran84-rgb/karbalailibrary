import React, { useState, useEffect } from 'react';
import {
  Shield, Upload, BookOpen, Clock, Users, CheckCircle2,
  AlertCircle, Trash2, Edit3, Plus, ArrowLeft, RefreshCw,
  Sparkles, FileText, Search, Filter, MessageSquare, Send,
  Check, XCircle, RotateCcw, Calendar, CheckSquare, ChevronRight,
  ChevronLeft, Download, FileSpreadsheet, Eye, Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Book, Reservation, FAQItem, OperatingHours, LendingSettings, UserMessage, ManagedFile } from '../types';
import { toPersianDigits } from '../utils/persian';
import { SUBJECTS_LIST } from '../data/initialData';

interface AdminDashboardProps {
  books: Book[];
  reservations: Reservation[];
  faqs: FAQItem[];
  operatingHours: OperatingHours;
  onRefreshData: () => void;
  onImportHtml: (htmlContent: string) => Promise<any>;
  onBatchImportBooks?: (books: Partial<Book>[], mode: 'append' | 'replace', fileName: string, fileType: 'excel' | 'txt', description?: string) => Promise<any>;
  onAddBook: (book: Partial<Book>) => Promise<boolean>;
  onUpdateBook: (id: string, updates: Partial<Book>) => Promise<boolean>;
  onDeleteBook: (id: string) => Promise<boolean>;
  onUpdateReservation: (id: string, status: Reservation['status'], notes?: string) => Promise<boolean>;
  onUpdateOperatingHours: (hours: OperatingHours) => Promise<boolean>;
  onUpdateFeaturedBooks: (bookIds: string[]) => Promise<boolean>;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  books,
  reservations,
  faqs,
  operatingHours,
  onRefreshData,
  onImportHtml,
  onBatchImportBooks,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onUpdateReservation,
  onUpdateOperatingHours,
  onUpdateFeaturedBooks,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'import' | 'books' | 'messages' | 'featured' | 'hours'>('reservations');
  
  // Feedback banners
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };
  const showError = (msg: string) => {
    setErrorBanner(msg);
    setTimeout(() => setErrorBanner(null), 5000);
  };

  // -------------------------------------------------------------
  // 1. FILE UPLOAD & MANAGEMENT (Excel, TXT, HTML)
  // -------------------------------------------------------------
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [stagedBooks, setStagedBooks] = useState<Partial<Book>[]>([]);
  const [stagedFileName, setStagedFileName] = useState<string>('');
  const [stagedFileType, setStagedFileType] = useState<'excel' | 'txt' | 'html'>('excel');
  const [importLoading, setImportLoading] = useState(false);
  const [importSummary, setImportSummary] = useState<any | null>(null);

  // Raw text input for TXT / HTML
  const [rawTextInput, setRawTextInput] = useState('');
  const [managedFiles, setManagedFiles] = useState<ManagedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Fetch managed files
  const fetchManagedFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch('/api/admin/files');
      const data = await res.json();
      if (data.success && data.files) {
        setManagedFiles(data.files);
      }
    } catch {
      // ignore
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'import') {
      fetchManagedFiles();
    }
  }, [activeTab]);

  // Parse Excel (.xlsx, .xls)
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setStagedFileName(file.name);
    setStagedFileType('excel');
    setErrorBanner(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rows || rows.length === 0) {
          throw new Error('فایل اکسل خالی است یا ستون‌های آن خوانده نشدند.');
        }

        const parsedBooks: Partial<Book>[] = rows.map((r, idx) => {
          // Dynamic key resolution with fuzzy Persian & English matching
          const title = r['عنوان'] || r['نام کتاب'] || r['کتاب'] || r['Title'] || r['title'] || r['نام'] || `کتاب ${idx + 1}`;
          const author = r['نویسنده'] || r['پدیدآور'] || r['مولف'] || r['Author'] || r['author'] || 'نامشخص';
          const publisher = r['ناشر'] || r['انتشارات'] || r['Publisher'] || r['publisher'] || '';
          const subject = r['موضوع'] || r['گروه'] || r['Subject'] || r['subject'] || 'عمومی و متفرقه';
          const shelf = parseInt(r['قفسه'] || r['شماره قفسه'] || r['Shelf'] || r['shelf'] || '1', 10) || 1;
          const row_number = parseInt(r['ردیف'] || r['شماره ردیف'] || r['Row'] || r['row'] || '1', 10) || 1;
          const book_number = String(r['کد'] || r['شماره ثبت'] || r['کد کتاب'] || r['شماره'] || r['Id'] || r['Code'] || `${shelf}-${idx + 1}`);
          const publication_year = r['سال'] || r['سال چاپ'] || r['سال نشر'] || r['Year'] || '';
          const translator = r['مترجم'] || r['Translator'] || '';
          const isbn = r['شابک'] || r['ISBN'] || r['isbn'] || '';
          const description = r['توضیحات'] || r['خلاصه'] || r['Description'] || '';
          const availability_status = (r['وضعیت'] === 'در حال امانت' || r['وضعیت'] === 'رزرو شده') ? r['وضعیت'] : 'موجود';

          return {
            title: String(title).trim(),
            author: String(author).trim(),
            publisher: String(publisher).trim(),
            subject: String(subject).trim(),
            shelf: Math.min(16, Math.max(1, shelf)),
            row_number: Math.min(10, Math.max(1, row_number)),
            book_number: String(book_number).trim(),
            publication_year: String(publication_year).trim(),
            translator: String(translator).trim(),
            isbn: String(isbn).trim(),
            description: String(description).trim(),
            availability_status,
            reservation_allowed: true,
          };
        });

        setStagedBooks(parsedBooks);
        showSuccess(`${toPersianDigits(parsedBooks.length)} عنوان کتاب از فایل اکسل شناسایی شد. لطفاً پیش‌نمایش را بررسی و ذخیره کنید.`);
      } catch (err: any) {
        showError(err.message || 'خطا در خواندن فایل اکسل');
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Parse TXT / CSV file
  const handleTxtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setStagedFileName(file.name);
    setStagedFileType('txt');
    setErrorBanner(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) throw new Error('فایل متنی خالی است.');
        parseAndStageTextContent(text, file.name);
      } catch (err: any) {
        showError(err.message || 'خطا در پردازش فایل متنی');
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const parseAndStageTextContent = (text: string, fileName = 'متن ورودی') => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) throw new Error('متنی برای پردازش یافت نشد.');

    const parsed: Partial<Book>[] = [];
    
    // Check if first line contains header keywords
    let startIndex = 0;
    const firstLine = lines[0];
    if (firstLine.includes('عنوان') || firstLine.includes('کتاب') || firstLine.includes('title')) {
      startIndex = 1;
    }

    // Delimiter detection (tab, semicolon, pipe, comma)
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes('|')) delimiter = '|';
    else if (firstLine.includes(';')) delimiter = ';';

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Key-value pattern support: عنوان: ... | نویسنده: ...
      if (line.includes(':') && line.includes('|')) {
        const parts = line.split('|');
        const item: any = {};
        for (const p of parts) {
          const [k, ...v] = p.split(':');
          if (k && v) item[k.trim()] = v.join(':').trim();
        }
        parsed.push({
          title: item['عنوان'] || item['نام کتاب'] || item['title'] || `کتاب ${i + 1}`,
          author: item['نویسنده'] || item['مولف'] || item['author'] || 'نامشخص',
          publisher: item['ناشر'] || item['publisher'] || '',
          subject: item['موضوع'] || item['subject'] || 'عمومی و متفرقه',
          shelf: parseInt(item['قفسه'] || '1', 10) || 1,
          row_number: parseInt(item['ردیف'] || '1', 10) || 1,
          book_number: item['کد'] || item['شماره'] || `${i + 1}`,
          description: item['توضیحات'] || '',
          availability_status: 'موجود',
          reservation_allowed: true,
        });
      } else {
        // Standard delimited columns
        const cols = line.split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length >= 2) {
          parsed.push({
            title: cols[0],
            author: cols[1] || 'نامشخص',
            publisher: cols[2] || '',
            subject: cols[3] || 'عمومی و متفرقه',
            shelf: parseInt(cols[4] || '1', 10) || 1,
            row_number: parseInt(cols[5] || '1', 10) || 1,
            book_number: cols[6] || `${i + 1}`,
            description: cols[7] || '',
            availability_status: 'موجود',
            reservation_allowed: true,
          });
        }
      }
    }

    if (parsed.length === 0) {
      throw new Error('قالب فایل متنی قابل شناسایی نبود. لطفاً ستون‌ها را با کاما، تب یا خط عمودی (|) جدا نمایید.');
    }

    setStagedBooks(parsed);
    setStagedFileName(fileName);
    setStagedFileType('txt');
    showSuccess(`${toPersianDigits(parsed.length)} ردیف از فایل متنی استخراج شد.`);
  };

  // Submit Staged Books to Backend
  const handleCommitStagedImport = async () => {
    if (stagedBooks.length === 0) return;
    setImportLoading(true);
    try {
      if (onBatchImportBooks) {
        const res = await onBatchImportBooks(
          stagedBooks,
          importMode,
          stagedFileName || 'فایل بارگذاری شده',
          stagedFileType === 'excel' ? 'excel' : 'txt',
          `بارگذاری شده از پنل مدیریت - حالت ${importMode === 'append' ? 'افزودن و بروزرسانی' : 'جایگزینی'}`
        );
        setImportSummary(res);
      } else {
        // Direct fetch fallback
        const res = await fetch('/api/books/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            books: stagedBooks,
            mode: importMode,
            file_name: stagedFileName || 'فایل بارگذاری شده',
            file_type: stagedFileType === 'excel' ? 'excel' : 'txt',
          }),
        });
        const data = await res.json();
        setImportSummary(data);
      }
      showSuccess(`پردازش فایل با موفقیت انجام شد. کاتالوگ کتابخانه به‌روزرسانی شد.`);
      setStagedBooks([]);
      onRefreshData();
      fetchManagedFiles();
    } catch (err: any) {
      showError(err.message || 'خطا در ثبت نهایی کاتالوگ');
    } finally {
      setImportLoading(false);
    }
  };

  const handleDeleteManagedFile = async (fileId: string) => {
    if (!confirm('آیا از حذف تاریخچه این فایل مطمئن هستید؟ (اطلاعات کتاب‌ها در کاتالوگ باقی خواهند ماند)')) return;
    try {
      await fetch(`/api/admin/files?id=${fileId}`, { method: 'DELETE' });
      fetchManagedFiles();
      showSuccess('رکورد فایل حذف گردید.');
    } catch {
      showError('خطا در حذف رکورد فایل');
    }
  };

  // -------------------------------------------------------------
  // 2. FULL BOOK MANAGEMENT (CRUD)
  // -------------------------------------------------------------
  const [bookSearch, setBookSearch] = useState('');
  const [bookShelfFilter, setBookShelfFilter] = useState<number | 'all'>('all');
  const [bookSubjectFilter, setBookSubjectFilter] = useState<string>('all');
  const [bookStatusFilter, setBookStatusFilter] = useState<string>('all');
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  const initialBookForm: Partial<Book> = {
    title: '',
    author: '',
    publisher: '',
    translator: '',
    publication_year: '',
    edition: '',
    isbn: '',
    subject: 'علوم قرآنی و تفسیر',
    secondary_subject: '',
    shelf: 1,
    row_number: 1,
    book_number: '',
    availability_status: 'موجود',
    reservation_allowed: true,
    description: '',
    cover_image: '',
    featured: false,
  };
  const [bookForm, setBookForm] = useState<Partial<Book>>(initialBookForm);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBookId) {
        await onUpdateBook(editingBookId, bookForm);
        showSuccess(`مشخصات کتاب «${bookForm.title}» با موفقیت به‌روزرسانی شد.`);
        setEditingBookId(null);
      } else {
        await onAddBook(bookForm);
        showSuccess(`کتاب «${bookForm.title}» به کاتالوگ کتابخانه افزوده شد.`);
        setIsAddingBook(false);
      }
      setBookForm(initialBookForm);
      onRefreshData();
    } catch (err: any) {
      showError(err.message || 'خطا در ثبت اطلاعات کتاب');
    }
  };

  const filteredBooks = books.filter((b) => {
    const q = bookSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.publisher && b.publisher.toLowerCase().includes(q)) ||
      (b.book_number && String(b.book_number).toLowerCase().includes(q));
    
    const matchesShelf = bookShelfFilter === 'all' || b.shelf === bookShelfFilter;
    const matchesSubject = bookSubjectFilter === 'all' || b.subject === bookSubjectFilter;
    const matchesStatus = bookStatusFilter === 'all' || b.availability_status === bookStatusFilter;

    return matchesSearch && matchesShelf && matchesSubject && matchesStatus;
  });

  // -------------------------------------------------------------
  // 3. LENDING & RESERVATIONS SYSTEM
  // -------------------------------------------------------------
  const [resFilter, setResFilter] = useState<'all' | 'pending' | 'loaned' | 'dueSoon' | 'overdue' | 'extensions'>('all');
  const [lendingSettings, setLendingSettings] = useState<LendingSettings>({
    default_loan_days: 14,
    max_active_reservations: 4,
    extension_days: 7,
    max_extensions: 2,
    allow_extensions: true,
  });
  const [showSettingsCard, setShowSettingsCard] = useState(false);

  // Fetch lending settings
  useEffect(() => {
    fetch('/api/admin/lending-settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) setLendingSettings(d.settings);
      })
      .catch(() => {});
  }, []);

  const handleSaveLendingSettings = async () => {
    try {
      const res = await fetch('/api/admin/lending-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lendingSettings),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('تنظیمات امانت با موفقیت ذخیره گردید.');
        setShowSettingsCard(false);
      }
    } catch {
      showError('خطا در ذخیره تنظیمات امانت');
    }
  };

  const handleExtensionAction = async (reservationId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/extension-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, days: lendingSettings.extension_days || 7 }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(action === 'approve' ? 'درخواست تمدید با موفقیت تأیید شد.' : 'درخواست تمدید رد شد.');
        onRefreshData();
      } else {
        showError(data.message || 'خطا در ثبت تصمیم');
      }
    } catch {
      showError('خطا در ارتباط با سرور');
    }
  };

  const calculateLoanDaysInfo = (res: Reservation) => {
    if (!res.due_date || (res.status !== 'امانت فعال' && res.status !== 'تأیید شده')) return null;
    const now = new Date();
    const due = new Date(res.due_date);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      due_date_str: res.due_date,
      diffDays,
      isOverdue: diffDays < 0,
      isDueSoon: diffDays >= 0 && diffDays <= 3,
    };
  };

  const filteredReservations = reservations.filter((r) => {
    if (resFilter === 'pending') return r.status === 'در انتظار بررسی';
    if (resFilter === 'loaned') return r.status === 'امانت فعال';
    if (resFilter === 'extensions') return r.extension_status === 'در انتظار بررسی';
    if (resFilter === 'overdue') {
      const info = calculateLoanDaysInfo(r);
      return info && info.isOverdue;
    }
    if (resFilter === 'dueSoon') {
      const info = calculateLoanDaysInfo(r);
      return info && info.isDueSoon;
    }
    return true;
  });

  // -------------------------------------------------------------
  // 4. MESSAGES SYSTEM
  // -------------------------------------------------------------
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
    }
  }, [activeTab]);

  const handleSendReply = async (messageId: string) => {
    const text = replyTextMap[messageId];
    if (!text || !text.trim()) return;
    setSendingReplyId(messageId);
    try {
      const res = await fetch(`/api/admin/messages/${messageId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: text.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('پاسخ برای کاربر ثبت گردید.');
        fetchMessages();
        setReplyTextMap({ ...replyTextMap, [messageId]: '' });
      } else {
        showError(data.message || 'خطا در ثبت پاسخ');
      }
    } catch {
      showError('خطا در برقراری ارتباط');
    } finally {
      setSendingReplyId(null);
    }
  };

  // -------------------------------------------------------------
  // 5. FEATURED & OPERATING HOURS
  // -------------------------------------------------------------
  const [hoursForm, setHoursForm] = useState<OperatingHours>(operatingHours);
  const [selectedFeatured, setSelectedFeatured] = useState<string[]>(
    books.filter((b) => b.featured).map((b) => b.id).slice(0, 4)
  );

  return (
    <div className="py-10 bg-[#042f2e] min-h-screen text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0d9488]/30">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#84cc16] to-[#0d9488] text-[#042f2e] shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#073834] text-[#a3e635] border border-[#84cc16]/40">
                  سامانه مدیریت یکپارچه
                </span>
                <span className="text-[10px] text-[#99f6e4] bg-[#0d9488]/20 px-2 py-0.5 rounded-md">
                  نگارش ۳.۲
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                پنل مدیریت کتابخانه شهید احسان کربلایی‌پور
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onRefreshData();
                fetchManagedFiles();
                fetchMessages();
                showSuccess('اطلاعات کتابخانه به‌روزرسانی شد.');
              }}
              className="p-2.5 rounded-xl bg-[#073834] text-[#99f6e4] hover:text-white border border-[#0d9488]/40 transition-colors"
              title="تازه‌سازی تمام داده‌ها"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#84cc16] text-[#042f2e] font-black text-xs hover:bg-[#a3e635] shadow-lg transition-all"
            >
              بازگشت به سایت
            </button>
          </div>
        </div>

        {/* Global Alerts */}
        {successBanner && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-[#84cc16] text-[#a3e635] text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#84cc16]" />
            <span>{successBanner}</span>
          </div>
        )}
        {errorBanner && (
          <div className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-600 text-rose-300 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none no-scrollbar">
          {[
            {
              id: 'reservations',
              label: 'امانت و رزروها',
              icon: Users,
              badge: reservations.filter((r) => r.status === 'در انتظار بررسی' || r.extension_status === 'در انتظار بررسی').length,
            },
            {
              id: 'import',
              label: 'ورود فایل (Excel / TXT / HTML)',
              icon: Upload,
              badge: stagedBooks.length > 0 ? stagedBooks.length : undefined,
            },
            {
              id: 'books',
              label: 'مدیریت کتاب‌ها',
              icon: BookOpen,
              count: books.length,
            },
            {
              id: 'messages',
              label: 'پیام‌های کاربران',
              icon: MessageSquare,
              badge: messages.filter((m) => m.status === 'در انتظار پاسخ').length,
            },
            {
              id: 'featured',
              label: '۴ کتاب معرفی',
              icon: Sparkles,
            },
            {
              id: 'hours',
              label: 'ساعات کاری و اطلاعیه',
              icon: Clock,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`shrink-0 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0d9488] to-[#0f766e] text-white border border-[#84cc16]/50 shadow-lg'
                    : 'bg-[#073834] text-[#ccfbf1] hover:bg-[#0d9488]/30 hover:text-white border border-[#0d9488]/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#a3e635]' : 'text-[#5eead4]'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[11px] text-[#99f6e4]/80">({toPersianDigits(tab.count)})</span>
                )}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#84cc16] text-[#042f2e]">
                    {toPersianDigits(tab.badge)} جدید
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: RESERVATIONS & LENDING MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            {/* Header and Quick Stats */}
            <div className="p-6 rounded-3xl bg-[#073834]/80 border border-[#0d9488]/40 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">سامانه هوشمند امانت، رزرو و تمدید</h3>
                  <p className="text-xs text-[#99f6e4] mt-1">
                    محاسبه خودکار تاریخ تحویل ({toPersianDigits(lendingSettings.default_loan_days)} روز)، نظارت بر تاخیرها، و تایید تمدیدهای اعضا
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSettingsCard(!showSettingsCard)}
                    className="px-3.5 py-2 rounded-xl bg-[#042f2e] border border-[#0d9488]/50 text-xs font-bold text-[#84cc16] hover:bg-[#0d9488]/30 flex items-center gap-1.5"
                  >
                    <span>⚙ تنظیمات مدت امانت</span>
                  </button>
                </div>
              </div>

              {/* Lending Settings Drawer */}
              {showSettingsCard && (
                <div className="p-4 rounded-2xl bg-[#042f2e] border border-[#84cc16]/40 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-black text-white">تنظیمات سیاست امانت کتابخانه:</strong>
                    <button
                      type="button"
                      onClick={() => setShowSettingsCard(false)}
                      className="text-[11px] text-rose-400 hover:text-rose-300"
                    >
                      بستن
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">مدت زمان امانت (روز):</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={lendingSettings.default_loan_days}
                        onChange={(e) => setLendingSettings({ ...lendingSettings, default_loan_days: parseInt(e.target.value, 10) || 14 })}
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">مدت هر بار تمدید (روز):</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={lendingSettings.extension_days}
                        onChange={(e) => setLendingSettings({ ...lendingSettings, extension_days: parseInt(e.target.value, 10) || 7 })}
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">حداکثر امانت همزمان هر عضو:</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={lendingSettings.max_active_reservations}
                        onChange={(e) => setLendingSettings({ ...lendingSettings, max_active_reservations: parseInt(e.target.value, 10) || 4 })}
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white font-bold"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveLendingSettings}
                    className="px-5 py-2 rounded-xl bg-[#84cc16] text-[#042f2e] font-black text-xs hover:bg-[#a3e635]"
                  >
                    ذخیره تنظیمات امانت
                  </button>
                </div>
              )}

              {/* Filter tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#0d9488]/20">
                {[
                  { id: 'all', label: 'همه موارد', count: reservations.length },
                  { id: 'pending', label: 'در انتظار بررسی', count: reservations.filter((r) => r.status === 'در انتظار بررسی').length },
                  { id: 'extensions', label: 'درخواست‌های تمدید', count: reservations.filter((r) => r.extension_status === 'در انتظار بررسی').length },
                  { id: 'loaned', label: 'امانت‌های فعال', count: reservations.filter((r) => r.status === 'امانت فعال').length },
                  { id: 'dueSoon', label: 'موعد نزدیک (تا ۳ روز)' },
                  { id: 'overdue', label: 'دارای تاخیر (منقضی شده)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setResFilter(f.id as any)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      resFilter === f.id
                        ? 'bg-[#84cc16] text-[#042f2e] shadow-sm'
                        : 'bg-[#042f2e] text-[#99f6e4] hover:bg-[#0d9488]/20'
                    }`}
                  >
                    <span>{f.label}</span>
                    {f.count !== undefined && (
                      <span className="mr-1 text-[10px] opacity-80">({toPersianDigits(f.count)})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reservations Table */}
            <div className="p-6 rounded-3xl bg-[#073834]/80 border border-[#0d9488]/40 shadow-xl">
              {filteredReservations.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#99f6e4]">
                  هیچ موردی با فیلتر انتخابی یافت نشد.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#0d9488]/40 text-[#a3e635]">
                        <th className="py-3 px-3">نام عضو</th>
                        <th className="py-3 px-3">شماره تماس</th>
                        <th className="py-3 px-3">عنوان کتاب</th>
                        <th className="py-3 px-3">قفسه / کد</th>
                        <th className="py-3 px-3">وضعیت امانت</th>
                        <th className="py-3 px-3">موعد تحویل</th>
                        <th className="py-3 px-3">وضعیت تمدید</th>
                        <th className="py-3 px-3">عملیات مدیریت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0d9488]/20">
                      {filteredReservations.map((res) => {
                        const loanInfo = calculateLoanDaysInfo(res);
                        return (
                          <tr key={res.id} className="hover:bg-[#042f2e]/60 transition-colors">
                            <td className="py-3 px-3 font-bold text-white">{res.user_name}</td>
                            <td className="py-3 px-3 text-[#99f6e4]">{toPersianDigits(res.user_phone)}</td>
                            <td className="py-3 px-3 font-semibold text-white max-w-xs truncate">{res.book_title}</td>
                            <td className="py-3 px-3 text-[#5eead4]">
                              قفسه {toPersianDigits(res.shelf)} (کد {toPersianDigits(res.book_number)})
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                res.status === 'امانت فعال'
                                  ? 'bg-emerald-950 text-[#a3e635] border-[#84cc16]/40'
                                  : res.status === 'در انتظار بررسی'
                                  ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                  : res.status === 'تحویل داده شده'
                                  ? 'bg-[#042f2e] text-[#99f6e4] border-[#0d9488]/30'
                                  : 'bg-rose-950 text-rose-300 border-rose-700/40'
                              }`}>
                                {res.status}
                              </span>
                            </td>

                            {/* Due date with countdown */}
                            <td className="py-3 px-3">
                              {loanInfo ? (
                                <div className="space-y-0.5">
                                  <span className="block font-bold text-white text-[11px]">
                                    {toPersianDigits(loanInfo.due_date_str)}
                                  </span>
                                  {loanInfo.isOverdue ? (
                                    <span className="text-[10px] text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded">
                                      ⚠️ {toPersianDigits(Math.abs(loanInfo.diffDays))} روز تاخیر
                                    </span>
                                  ) : loanInfo.isDueSoon ? (
                                    <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded">
                                      ⏳ {toPersianDigits(loanInfo.diffDays)} روز باقیمانده
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[#a3e635]">
                                      {toPersianDigits(loanInfo.diffDays)} روز باقیمانده
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-[#99f6e4]/60">-</span>
                              )}
                            </td>

                            {/* Extension request decision */}
                            <td className="py-3 px-3">
                              {res.extension_status === 'در انتظار بررسی' ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleExtensionAction(res.id, 'approve')}
                                    className="px-2 py-1 rounded bg-[#84cc16] text-[#042f2e] text-[10px] font-black hover:bg-[#a3e635]"
                                    title="تأیید تمدید ۷ روزه"
                                  >
                                    تأیید تمدید
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleExtensionAction(res.id, 'reject')}
                                    className="px-2 py-1 rounded bg-rose-900 text-white text-[10px] font-bold hover:bg-rose-800"
                                    title="رد تمدید"
                                  >
                                    رد
                                  </button>
                                </div>
                              ) : res.extension_status === 'تأیید شده' ? (
                                <span className="text-[10px] text-[#a3e635]">تمدید شده</span>
                              ) : res.extension_status === 'رد شده' ? (
                                <span className="text-[10px] text-rose-400">تمدید رد شد</span>
                              ) : (
                                <span className="text-[10px] text-[#99f6e4]/60">ندارد</span>
                              )}
                            </td>

                            {/* Action buttons */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                {res.status === 'در انتظار بررسی' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateReservation(res.id, 'تأیید شده', 'تأیید شد. آماده تحویل به عضو.')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-800 text-white hover:bg-emerald-700 text-[11px] font-bold"
                                    >
                                      تأیید
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateReservation(res.id, 'رد شده', 'رد گردید.')}
                                      className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 text-[11px]"
                                    >
                                      رد
                                    </button>
                                  </>
                                )}

                                {(res.status === 'تأیید شده' || res.status === 'در انتظار بررسی') && (
                                  <button
                                    type="button"
                                    onClick={() => onUpdateReservation(res.id, 'امانت فعال', 'کتاب به عضو تحویل داده شد و دوره امانت آغاز شد.')}
                                    className="px-2.5 py-1 rounded-lg bg-[#0d9488] text-white hover:bg-[#14b8a6] text-[11px] font-bold"
                                  >
                                    شروع امانت
                                  </button>
                                )}

                                {res.status === 'امانت فعال' && (
                                  <button
                                    type="button"
                                    onClick={() => onUpdateReservation(res.id, 'تحویل داده شده', 'کتاب با موفقیت به کتابخانه عودت داده شد.')}
                                    className="px-2.5 py-1 rounded-lg bg-[#84cc16] text-[#042f2e] hover:bg-[#a3e635] text-[11px] font-black"
                                  >
                                    ثبت بازگشت کتاب
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FILE UPLOAD & MANAGEMENT (Excel, TXT, HTML) */}
        {/* ========================================================= */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#073834]/80 border border-[#0d9488]/40 shadow-xl space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#042f2e] text-[#84cc16] text-xs font-bold border border-[#0d9488]/30 inline-block mb-2">
                  مرحله ۱.۱ — ماژول جامع بارگذاری فایل‌ها
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  افزودن و مدیریت فایل‌های کاتالوگ کتابخانه (Excel / TXT / HTML)
                </h2>
                <p className="text-xs sm:text-sm text-[#99f6e4] leading-relaxed mt-1">
                  ادمین محترم، شما می‌توانید فایل‌های Excel (.xlsx, .xls) یا متنی (.txt, .csv) یا فایل HTML جدول کتاب‌ها را مستقیماً بارگذاری نمایید. سیستم به‌صورت هوشمند ستون‌ها را استخراج و در پایگاه داده کتابخانه ذخیره می‌کند.
                </p>
              </div>

              {/* Upload Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Excel Uploader */}
                <div className="p-6 rounded-3xl bg-[#042f2e]/70 border-2 border-dashed border-[#0d9488] hover:border-[#84cc16] transition-colors text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 flex items-center justify-center text-[#84cc16] mx-auto">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">بارگذاری فایل Excel (.xlsx / .xls)</h4>
                  <p className="text-[11px] text-[#99f6e4] leading-relaxed">
                    فایل اکسل حاوی ستون‌های عنوان، نویسنده، ناشر، موضوع، شماره قفسه، ردیف و کد کتاب
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#84cc16] hover:bg-[#a3e635] text-[#042f2e] font-black text-xs shadow-md transition-all">
                    <Upload className="w-4 h-4" />
                    <span>انتخاب فایل اکسل</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 2. TXT / CSV Uploader */}
                <div className="p-6 rounded-3xl bg-[#042f2e]/70 border-2 border-dashed border-[#0d9488] hover:border-[#84cc16] transition-colors text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-950 flex items-center justify-center text-[#5eead4] mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">بارگذاری فایل متنی TXT یا CSV</h4>
                  <p className="text-[11px] text-[#99f6e4] leading-relaxed">
                    فایل‌های متنی با جداکننده‌های کاما، خط عمودی (|) یا تب بین مشخصات کتاب
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0d9488] hover:bg-[#14b8a6] text-white font-bold text-xs shadow-md transition-all">
                    <Upload className="w-4 h-4" />
                    <span>انتخاب فایل TXT / CSV</span>
                    <input
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleTxtUpload}
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

              {/* Staged Books Preview & Commit Card */}
              {stagedBooks.length > 0 && (
                <div className="p-5 rounded-3xl bg-[#042f2e] border-2 border-[#84cc16] space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#84cc16] bg-[#073834] px-2.5 py-0.5 rounded-full border border-[#84cc16]/40">
                        پیش‌نمایش قبل از ذخیره
                      </span>
                      <h4 className="text-base font-black text-white mt-1">
                        تعداد {toPersianDigits(stagedBooks.length)} عنوان از «{stagedFileName}» شناسایی گردید
                      </h4>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex items-center gap-2 bg-[#073834] p-1.5 rounded-2xl border border-[#0d9488]/40">
                      <button
                        type="button"
                        onClick={() => setImportMode('append')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          importMode === 'append' ? 'bg-[#84cc16] text-[#042f2e]' : 'text-[#99f6e4]'
                        }`}
                      >
                        افزودن و بروزرسانی
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportMode('replace')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          importMode === 'replace' ? 'bg-rose-900 text-white' : 'text-[#99f6e4]'
                        }`}
                      >
                        جایگزینی کامل کاتالوگ
                      </button>
                    </div>
                  </div>

                  {/* Sample rows preview table */}
                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-[#0d9488]/30 text-[#a3e635]">
                          <th className="py-2 px-2">نام کتاب</th>
                          <th className="py-2 px-2">نویسنده</th>
                          <th className="py-2 px-2">ناشر</th>
                          <th className="py-2 px-2">قفسه</th>
                          <th className="py-2 px-2">ردیف</th>
                          <th className="py-2 px-2">کد ثبت</th>
                          <th className="py-2 px-2">موضوع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0d9488]/20">
                        {stagedBooks.slice(0, 5).map((b, idx) => (
                          <tr key={idx} className="hover:bg-[#073834]/50">
                            <td className="py-2 px-2 font-bold text-white max-w-xs truncate">{b.title}</td>
                            <td className="py-2 px-2 text-[#99f6e4]">{b.author}</td>
                            <td className="py-2 px-2 text-[#ccfbf1]">{b.publisher || '-'}</td>
                            <td className="py-2 px-2 text-[#5eead4]">قفسه {toPersianDigits(b.shelf)}</td>
                            <td className="py-2 px-2 text-[#99f6e4]">{toPersianDigits(b.row_number)}</td>
                            <td className="py-2 px-2 text-[#a3e635]">{toPersianDigits(b.book_number)}</td>
                            <td className="py-2 px-2 text-[#99f6e4]">{b.subject}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={importLoading}
                      onClick={handleCommitStagedImport}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#84cc16] to-[#65a30d] hover:from-[#a3e635] hover:to-[#84cc16] text-[#042f2e] font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{importLoading ? 'در حال ثبت در پایگاه داده...' : 'تأیید نهایی و ذخیره در کاتالوگ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStagedBooks([])}
                      className="px-4 py-2.5 rounded-2xl bg-[#073834] text-rose-300 text-xs hover:bg-rose-950 transition-colors"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Text Input Drawer */}
              <div className="pt-4 border-t border-[#0d9488]/20 space-y-2">
                <label className="block text-xs font-bold text-[#99f6e4]">
                  ورود مستقیم متن جدول (Paste):
                </label>
                <textarea
                  rows={3}
                  value={rawTextInput}
                  onChange={(e) => setRawTextInput(e.target.value)}
                  placeholder="عنوان کتاب | نویسنده | ناشر | قفسه | ردیف | کد..."
                  className="w-full p-3 rounded-2xl bg-[#042f2e] border border-[#0d9488]/40 text-xs text-white placeholder-[#99f6e4]/40 font-mono focus:ring-2 focus:ring-[#84cc16]"
                />
                <button
                  type="button"
                  disabled={!rawTextInput.trim()}
                  onClick={() => parseAndStageTextContent(rawTextInput, 'متن الصاق شده')}
                  className="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#14b8a6] text-white font-bold text-xs disabled:opacity-50"
                >
                  استخراج اطلاعات از متن
                </button>
              </div>
            </div>

            {/* Managed Files History Section */}
            <div className="p-6 rounded-3xl bg-[#073834]/80 border border-[#0d9488]/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">فایل‌های مدیریت‌شده در سیستم</h3>
                  <p className="text-xs text-[#99f6e4] mt-0.5">
                    لیست پرونده‌های بارگذاری‌شده اکسل و تکست جهت پیگیری و آرشیو
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchManagedFiles}
                  className="p-2 rounded-xl bg-[#042f2e] text-[#99f6e4] hover:text-white"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {managedFiles.length === 0 ? (
                <p className="text-xs text-[#99f6e4] py-4 text-center">هیچ فایلی تا کنون ثبت نشده است.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {managedFiles.map((f) => (
                    <div
                      key={f.id}
                      className="p-3.5 rounded-2xl bg-[#042f2e] border border-[#0d9488]/40 text-xs space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          f.file_type === 'excel' ? 'bg-emerald-950 text-[#a3e635]' : 'bg-teal-950 text-[#5eead4]'
                        }`}>
                          {f.file_type.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteManagedFile(f.id)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                          title="حذف رکورد"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <strong className="block font-bold text-white truncate" title={f.name}>{f.name}</strong>
                      <div className="flex items-center justify-between text-[11px] text-[#99f6e4]">
                        <span>تعداد ردیف: {toPersianDigits(f.rows_count || 0)}</span>
                        <span>{toPersianDigits(f.upload_date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BOOKS MANAGEMENT (Full CRUD) */}
        {/* ========================================================= */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#073834]/80 border border-[#0d9488]/40 shadow-xl space-y-6">
              
              {/* Header and Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-[#84cc16]">مرحله ۱.۲ — ویرایش و مدیریت اطلاعات کتاب‌ها</span>
                  <h3 className="text-xl font-black text-white mt-0.5">کاتالوگ و مشخصات کامل کتاب‌ها</h3>
                  <p className="text-xs text-[#99f6e4]">
                    امکان مشاهده، ویرایش عمیق، حذف و افزودن کتاب با تمام ویژگی‌های استاندارد کتابداری
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddingBook(true);
                    setEditingBookId(null);
                    setBookForm(initialBookForm);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#84cc16] to-[#65a30d] text-[#042f2e] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن کتاب جدید</span>
                </button>
              </div>

              {/* Add / Edit Form Modal / Card */}
              {(isAddingBook || editingBookId) && (
                <form onSubmit={handleBookSubmit} className="p-6 rounded-3xl bg-[#042f2e] border-2 border-[#84cc16] space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#0d9488]/30 pb-3">
                    <h4 className="text-base font-black text-[#a3e635] flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      <span>{editingBookId ? 'ویرایش جامع مشخصات کتاب' : 'افزودن کتاب جدید به پایگاه داده'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBook(false);
                        setEditingBookId(null);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      انصراف و بستن
                    </button>
                  </div>

                  {/* Primary Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">عنوان کتاب: *</label>
                      <input
                        type="text"
                        required
                        value={bookForm.title || ''}
                        onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                        placeholder="نام کامل کتاب"
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">نویسنده / پدیدآور: *</label>
                      <input
                        type="text"
                        required
                        value={bookForm.author || ''}
                        onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                        placeholder="نام نویسنده"
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">ناشر / انتشارات:</label>
                      <input
                        type="text"
                        value={bookForm.publisher || ''}
                        onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                        placeholder="انتشارات"
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Secondary Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">مترجم:</label>
                      <input
                        type="text"
                        value={bookForm.translator || ''}
                        onChange={(e) => setBookForm({ ...bookForm, translator: e.target.value })}
                        placeholder="در صورت ترجمه"
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">سال انتشار:</label>
                      <input
                        type="text"
                        value={bookForm.publication_year || ''}
                        onChange={(e) => setBookForm({ ...bookForm, publication_year: e.target.value })}
                        placeholder="مثلاً ۱۴۰۱"
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">نوبت چاپ:</label>
                      <input
                        type="text"
                        value={bookForm.edition || ''}
                        onChange={(e) => setBookForm({ ...bookForm, edition: e.target.value })}
                        placeholder="مثلاً چاپ دوم"
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">شابک (ISBN):</label>
                      <input
                        type="text"
                        value={bookForm.isbn || ''}
                        onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                        placeholder="۹۷۸-..."
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Location & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">موضوع اصلی:</label>
                      <select
                        value={bookForm.subject || 'علوم قرآنی و تفسیر'}
                        onChange={(e) => setBookForm({ ...bookForm, subject: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                      >
                        {SUBJECTS_LIST.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">قفسه (۱ تا ۱۶): *</label>
                      <select
                        value={bookForm.shelf || 1}
                        onChange={(e) => setBookForm({ ...bookForm, shelf: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                      >
                        {Array.from({ length: 16 }, (_, i) => i + 1).map((s) => (
                          <option key={s} value={s}>قفسه {toPersianDigits(s)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">ردیف قفسه (۱ تا ۱۰):</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={bookForm.row_number || 1}
                        onChange={(e) => setBookForm({ ...bookForm, row_number: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">شماره ثبت کتاب: *</label>
                      <input
                        type="text"
                        required
                        value={bookForm.book_number || ''}
                        onChange={(e) => setBookForm({ ...bookForm, book_number: e.target.value })}
                        placeholder="کد ثبت کتابداری"
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Availability & Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">وضعیت موجودی:</label>
                      <select
                        value={bookForm.availability_status || 'موجود'}
                        onChange={(e) => setBookForm({ ...bookForm, availability_status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                      >
                        <option value="موجود">موجود در کتابخانه</option>
                        <option value="در حال امانت">در حال امانت</option>
                        <option value="رزرو شده">رزرو شده</option>
                        <option value="غیرقابل امانت">غیرقابل امانت (مرجع)</option>
                        <option value="مفقود">مفقود یا خارج از دسترسی</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#99f6e4] mb-1 font-bold">آدرس تصویر جلد (اختیاری):</label>
                      <input
                        type="url"
                        value={bookForm.cover_image || ''}
                        onChange={(e) => setBookForm({ ...bookForm, cover_image: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-[#99f6e4]">
                        <input
                          type="checkbox"
                          checked={bookForm.reservation_allowed !== false}
                          onChange={(e) => setBookForm({ ...bookForm, reservation_allowed: e.target.checked })}
                          className="rounded text-[#84cc16]"
                        />
                        <span>امکان رزرو آنلاین</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-[#99f6e4]">
                        <input
                          type="checkbox"
                          checked={!!bookForm.featured}
                          onChange={(e) => setBookForm({ ...bookForm, featured: e.target.checked })}
                          className="rounded text-[#84cc16]"
                        />
                        <span>کتاب ویژه (معرفی)</span>
                      </label>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block text-xs font-bold text-[#99f6e4] mb-1">خلاصه، گزیده یا معرفی کتاب:</label>
                    <textarea
                      rows={2}
                      value={bookForm.description || ''}
                      onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                      placeholder="چکیده‌ای از محتوای کتاب..."
                      className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-2xl bg-[#84cc16] text-[#042f2e] font-black text-xs sm:text-sm hover:bg-[#a3e635] shadow-lg"
                    >
                      {editingBookId ? 'ذخیره تغییرات کتاب' : 'ثبت قطعی کتاب'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBook(false);
                        setEditingBookId(null);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-[#073834] text-white text-xs"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              )}

              {/* Live Search and Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#042f2e] p-4 rounded-2xl border border-[#0d9488]/30">
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 text-[#84cc16] absolute right-3 top-3" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    placeholder="جستجو در عنوان، نویسنده، ناشر، کد ثبت..."
                    className="w-full pr-9 pl-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs placeholder-[#99f6e4]/40"
                  />
                </div>

                <div>
                  <select
                    value={bookShelfFilter}
                    onChange={(e) => setBookShelfFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                  >
                    <option value="all">همه قفسه‌ها (۱ تا ۱۶)</option>
                    {Array.from({ length: 16 }, (_, i) => i + 1).map((s) => (
                      <option key={s} value={s}>قفسه {toPersianDigits(s)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={bookStatusFilter}
                    onChange={(e) => setBookStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs"
                  >
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="موجود">موجود</option>
                    <option value="در حال امانت">در حال امانت</option>
                    <option value="رزرو شده">رزرو شده</option>
                    <option value="غیرقابل امانت">غیرقابل امانت</option>
                  </select>
                </div>
              </div>

              {/* Books Table */}
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-[#0d9488]/40 text-[#a3e635]">
                      <th className="py-2.5 px-3">کد</th>
                      <th className="py-2.5 px-3">عنوان کتاب</th>
                      <th className="py-2.5 px-3">نویسنده</th>
                      <th className="py-2.5 px-3">ناشر</th>
                      <th className="py-2.5 px-3">قفسه</th>
                      <th className="py-2.5 px-3">موضوع</th>
                      <th className="py-2.5 px-3">وضعیت</th>
                      <th className="py-2.5 px-3">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0d9488]/20">
                    {filteredBooks.slice(0, 100).map((b) => (
                      <tr key={b.id} className="hover:bg-[#042f2e]/60 transition-colors">
                        <td className="py-2.5 px-3 text-[#99f6e4] font-mono">{toPersianDigits(b.book_number)}</td>
                        <td className="py-2.5 px-3 font-bold text-white max-w-xs truncate">{b.title}</td>
                        <td className="py-2.5 px-3 text-[#ccfbf1]">{b.author}</td>
                        <td className="py-2.5 px-3 text-[#99f6e4]">{b.publisher || '-'}</td>
                        <td className="py-2.5 px-3 text-[#5eead4]">قفسه {toPersianDigits(b.shelf)}</td>
                        <td className="py-2.5 px-3 text-[#99f6e4]">{b.subject}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.availability_status === 'موجود'
                              ? 'bg-emerald-950 text-[#a3e635] border border-[#84cc16]/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-600/30'
                          }`}>
                            {b.availability_status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBookId(b.id);
                              setIsAddingBook(false);
                              setBookForm(b);
                            }}
                            className="p-1.5 rounded-lg bg-[#073834] text-[#a3e635] hover:bg-[#0d9488]/40"
                            title="ویرایش کامل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`آیا از حذف قطعی کتاب «${b.title}» مطمئن هستید؟`)) {
                                await onDeleteBook(b.id);
                                showSuccess(`کتاب «${b.title}» حذف گردید.`);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-[#99f6e4]">
                نمایش {toPersianDigits(Math.min(100, filteredBooks.length))} از مجموع {toPersianDigits(filteredBooks.length)} عنوان فیلترشده
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MESSAGES SYSTEM (Stage 11) */}
        {/* ========================================================= */}
        {activeTab === 'messages' && (
          <div className="p-6 rounded-3xl bg-[#073834]/80 border border-[#0d9488]/40 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#84cc16]">مرحله ۱۱ — سیستم ارتباط و پیام‌رسانی</span>
                <h3 className="text-xl font-black text-white mt-0.5">صندوق پیام‌ها و درخواست‌های اعضا</h3>
                <p className="text-xs text-[#99f6e4]">
                  پاسخ‌گویی مستقیم مدیریت به سوالات، درخواست‌های تهیه کتاب و نظرات کاربران
                </p>
              </div>
              <button
                type="button"
                onClick={fetchMessages}
                className="p-2.5 rounded-xl bg-[#042f2e] text-[#99f6e4] hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingMessages ? (
              <p className="text-xs text-[#99f6e4] py-8 text-center">در حال بارگذاری پیام‌ها...</p>
            ) : messages.length === 0 ? (
              <p className="text-xs text-[#99f6e4] py-8 text-center">هیچ پیامی در صندوق دریافت نشده است.</p>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-[#042f2e] border border-[#0d9488]/40 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-bold text-sm">{m.user_name}</strong>
                        <span className="text-[11px] text-[#99f6e4]">({toPersianDigits(m.user_phone)})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#99f6e4]">{toPersianDigits(m.created_at)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'پاسخ داده شده'
                            ? 'bg-emerald-950 text-[#a3e635] border border-[#84cc16]/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-600/30'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#073834] text-[#ccfbf1] leading-relaxed">
                      <strong className="block text-[#a3e635] mb-1 font-bold">{m.subject}</strong>
                      <p>{m.content}</p>
                    </div>

                    {/* Existing Admin Reply */}
                    {m.admin_reply && (
                      <div className="p-3 rounded-xl bg-[#073834]/60 border border-[#84cc16]/40 text-[#a3e635] text-xs">
                        <strong className="block text-[11px] font-bold text-white mb-0.5">پاسخ ثبت‌شده مدیریت:</strong>
                        <p>{m.admin_reply}</p>
                      </div>
                    )}

                    {/* Inline Reply Form */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={replyTextMap[m.id] || ''}
                        onChange={(e) => setReplyTextMap({ ...replyTextMap, [m.id]: e.target.value })}
                        placeholder="متن پاسخ خود به این پیام را بنویسید..."
                        className="flex-1 px-3 py-2 rounded-xl bg-[#073834] border border-[#0d9488]/40 text-white text-xs placeholder-[#99f6e4]/40"
                      />
                      <button
                        type="button"
                        disabled={sendingReplyId === m.id || !replyTextMap[m.id]?.trim()}
                        onClick={() => handleSendReply(m.id)}
                        className="px-4 py-2 rounded-xl bg-[#84cc16] hover:bg-[#a3e635] text-[#042f2e] font-black text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sendingReplyId === m.id ? 'در حال ارسال...' : 'ثبت پاسخ'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: FEATURED 4 BOOKS SELECTOR */}
        {/* ========================================================= */}
        {activeTab === 'featured' && (
          <div className="p-6 rounded-3xl bg-[#073834]/80 border border-[#0d9488]/40 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white">انتخاب ۴ کتاب ویژه جهت معرفی در صفحه «معرفی کتاب»</h3>
              <p className="text-xs text-[#99f6e4] mt-1">
                دقیقاً ۴ عنوان را از میان کاتالوگ انتخاب نمایید تا در بخش معرفی برجسته شوند.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {books.slice(0, 24).map((b) => {
                const isSelected = selectedFeatured.includes(b.id);
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFeatured(selectedFeatured.filter((id) => id !== b.id));
                      } else {
                        if (selectedFeatured.length < 4) {
                          setSelectedFeatured([...selectedFeatured, b.id]);
                        } else {
                          showError('حداکثر ۴ کتاب برای بخش معرفی قابل انتخاب است.');
                        }
                      }
                    }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0d9488] border-[#84cc16] text-white shadow-lg'
                        : 'bg-[#042f2e] border-[#0d9488]/30 text-[#ccfbf1]'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-[#a3e635] block mb-1">قفسه {toPersianDigits(b.shelf)}</span>
                      <strong className="block font-bold line-clamp-2">{b.title}</strong>
                      <span className="text-[11px] text-[#99f6e4]">{b.author}</span>
                    </div>
                    <span className="mt-3 font-bold text-[11px] text-[#a3e635]">
                      {isSelected ? '✓ انتخاب شده' : '+ انتخاب'}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={async () => {
                await onUpdateFeaturedBooks(selectedFeatured);
                showSuccess('۴ کتاب برگزیده بخش معرفی ذخیره گردید.');
              }}
              className="px-6 py-3 rounded-2xl bg-[#84cc16] text-[#042f2e] font-black text-xs shadow-lg hover:bg-[#a3e635]"
            >
              ذخیره ۴ کتاب برگزیده معرفی
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: HOURS AND NOTICE */}
        {/* ========================================================= */}
        {activeTab === 'hours' && (
          <div className="p-6 rounded-3xl bg-[#073834]/80 border border-[#0d9488]/40 shadow-xl space-y-4 max-w-xl">
            <h3 className="text-xl font-black text-white">تنظیمات ساعات کاری و اطلاعیه‌ها</h3>
            
            <div>
              <label className="block text-xs font-bold text-[#99f6e4] mb-1">ساعت کاری معمول:</label>
              <input
                type="text"
                value={hoursForm.regular_hours || '۱۳:۰۰ تا ۲۰:۰۰'}
                onChange={(e) => setHoursForm({ ...hoursForm, regular_hours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#042f2e] border border-[#0d9488]/40 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#99f6e4] mb-1">اعلام تعطیلی موقت یا مناسبتی (اختیاری):</label>
              <input
                type="text"
                value={hoursForm.temporary_closure_reason || ''}
                onChange={(e) => setHoursForm({ ...hoursForm, temporary_closure_reason: e.target.value })}
                placeholder="مثال: به مناسبت ایام سوگواری، کتابخانه امروز تعطیل است"
                className="w-full px-3 py-2 rounded-xl bg-[#042f2e] border border-[#0d9488]/40 text-white text-xs"
              />
            </div>

            <button
              type="button"
              onClick={async () => {
                await onUpdateOperatingHours(hoursForm);
                showSuccess('ساعت کاری با موفقیت به‌روزرسانی شد.');
              }}
              className="px-6 py-3 rounded-2xl bg-[#84cc16] text-[#042f2e] font-black text-xs shadow-lg hover:bg-[#a3e635]"
            >
              ذخیره تغییرات ساعت کاری
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
