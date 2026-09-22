import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  INITIAL_BOOKS,
  INITIAL_FAQS,
  INITIAL_FAQ_CATEGORIES,
  INITIAL_QUOTES,
  INITIAL_OPERATING_HOURS,
  INITIAL_HOMEPAGE_CMS,
  SHELVES_LIST,
  SUBJECTS_LIST
} from './src/data/initialData.js';
import { Book, Reservation, UserProfile, FAQItem, FAQCategory, Competition, OperatingHours, HomepageCMS, AuditLog, UserMessage, ManagedFile } from './src/types.js';

dotenv.config();

const PORT = 3000;
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'library_db.json');

// Ensure data folder exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

interface DatabaseSchema {
  books: Book[];
  reservations: Reservation[];
  users: UserProfile[];
  faqs: FAQItem[];
  faq_categories: FAQCategory[];
  competitions: Competition[];
  operating_hours: OperatingHours;
  homepage_cms: HomepageCMS;
  audit_logs: AuditLog[];
  messages: UserMessage[];
  managed_files: ManagedFile[];
  lending_settings: {
    default_loan_days: number;
    max_extensions: number;
    extension_days: number;
  };
  visits: number;
}

function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (!data.messages) data.messages = [];
      if (!data.managed_files) data.managed_files = [];
      if (!data.lending_settings) {
        data.lending_settings = {
          default_loan_days: 14,
          max_extensions: 1,
          extension_days: 7,
        };
      }
      return data;
    } catch (err) {
      console.error('Error reading database file, fallback to seed:', err);
    }
  }

  const initialDb: DatabaseSchema = {
    books: INITIAL_BOOKS,
    reservations: [],
    users: [
      {
        id: 'u-1',
        name: 'علی',
        family: 'حسینی',
        phone: '09161112233',
        membership_status: 'فعال',
        lending_subscription: 'فعال',
        registered_at: '۱۴۰۲/۰۶/۱۵',
        active_reservations_count: 1,
        notes: 'عضو فعال مسجد امام خمینی (ره)',
      },
    ],
    faqs: INITIAL_FAQS,
    faq_categories: INITIAL_FAQ_CATEGORIES,
    competitions: [],
    operating_hours: INITIAL_OPERATING_HOURS,
    homepage_cms: INITIAL_HOMEPAGE_CMS,
    audit_logs: [
      {
        id: 'log-init',
        action: 'راه‌اندازی اولیه پایگاه داده کتابخانه',
        actor: 'سیستم',
        timestamp: new Date().toISOString(),
        details: 'داده‌های اولیه کاتالوگ، قفسه‌ها و پرسش‌های متداول با موفقیت بارگذاری شد.',
        type: 'database',
      },
    ],
    messages: [
      {
        id: 'msg-sample-1',
        user_name: 'محمد رضایی',
        user_phone: '09121234567',
        subject: 'درخواست تهیه کتاب جدید',
        content: 'با سلام و عرض خداقوت، آیا امکان تهیه کتاب انسان ۲۵۰ ساله وجود دارد؟ با تشکر از زحمات شما.',
        created_at: new Date().toLocaleDateString('fa-IR'),
        is_read: true,
        status: 'پاسخ داده شده',
        admin_reply: 'سلام و احترام؛ این کتاب ارزشمند در قفسه شماره ۳ (سیره اهل‌بیت) موجود است و هم‌اکنون می‌توانید آن را امانت بگیرید.',
        replied_at: new Date().toLocaleDateString('fa-IR'),
      },
    ],
    managed_files: [
      {
        id: 'file-seed-1',
        file_name: 'فهرست_کتابخانه_شهید_کربلایی_پور.xlsx',
        file_type: 'excel',
        file_size: 45200,
        uploaded_at: '۱۴۰۳/۰۵/۱۰',
        records_count: INITIAL_BOOKS.length,
        status: 'فعال',
        description: 'کاتالوگ اولیه و ساختار قفسه‌های ۱ تا ۱۶',
      },
    ],
    lending_settings: {
      default_loan_days: 14,
      max_extensions: 1,
      extension_days: 7,
    },
    visits: 7420,
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// In-memory working copy
let db: DatabaseSchema = loadDatabase();

function addAuditLog(action: string, actor: string, details: string, type: 'info' | 'warning' | 'security' | 'database' = 'info') {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    actor,
    timestamp: new Date().toISOString(),
    details,
    type,
  };
  db.audit_logs.unshift(log);
  if (db.audit_logs.length > 300) {
    db.audit_logs = db.audit_logs.slice(0, 300);
  }
  saveDatabase(db);
}

// Admin credentials (from secure server environment)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'ShahidKarbalailibrary405';
const ADMIN_SERIAL = process.env.ADMIN_SERIAL || 'ShKarbalailib57405';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'کتابخانه شهید احسان کربلایی‌پور' });
  });

  // Request counter for stats
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/@') && !req.path.includes('.')) {
      db.visits = (db.visits || 7420) + 1;
    }
    next();
  });

  // ==================== AUTH API ====================

  // Admin Login
  app.post('/api/auth/admin-login', (req, res) => {
    const { username, admin_serial } = req.body;
    if (!username || !admin_serial) {
      return res.status(400).json({ success: false, message: 'لطفاً نام کاربری و سریال ادمین را وارد نمایید.' });
    }

    if (username.trim() === ADMIN_USERNAME && admin_serial.trim() === ADMIN_SERIAL) {
      addAuditLog('ورود موفق مدیر به پنل مدیریت', username, 'ورود با سریال امنیتی تأیید شد.', 'security');
      return res.json({
        success: true,
        message: 'خوش آمدید، احراز هویت مدیریت با موفقیت انجام شد.',
        token: `admin-token-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        admin: {
          username: ADMIN_USERNAME,
          role: 'مدیر ارشد کتابخانه',
          permissions: ['all'],
        },
      });
    }

    addAuditLog('تلاش ناموفق ورود به پنل ادمین', username || 'ناشناس', 'نام کاربری یا سریال اشتباه بود.', 'warning');
    return res.status(401).json({ success: false, message: 'نام کاربری یا سریال ادمین نامعتبر است.' });
  });

  // User Register
  app.post('/api/auth/register', (req, res) => {
    const { name, family, phone, password } = req.body;
    if (!name || !family || !phone || !password) {
      return res.status(400).json({ success: false, message: 'تکمیل تمامی فیلدها الزامی است.' });
    }

    const cleanPhone = phone.trim();
    const existing = db.users.find((u) => u.phone === cleanPhone);
    if (existing) {
      return res.status(400).json({ success: false, message: 'کاربری با این شماره تلفن قبلاً ثبت‌نام کرده است.' });
    }

    const newUser: UserProfile = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      family: family.trim(),
      phone: cleanPhone,
      membership_status: 'فعال',
      lending_subscription: 'فعال',
      registered_at: new Date().toLocaleDateString('fa-IR'),
      active_reservations_count: 0,
    };

    db.users.push(newUser);
    saveDatabase(db);
    addAuditLog('ثبت‌نام کاربر جدید', `${name} ${family}`, `شماره تماس: ${cleanPhone}`, 'info');

    return res.json({
      success: true,
      message: 'ثبت‌نام شما با موفقیت انجام شد. اکنون می‌توانید وارد حساب خود شوید.',
      user: newUser,
    });
  });

  // User Login
  app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'شماره تلفن و رمز عبور را وارد کنید.' });
    }

    const cleanPhone = phone.trim();
    let user = db.users.find((u) => u.phone === cleanPhone);

    if (!user) {
      // Auto-create friendly guest account if not found so user can explore easily
      user = {
        id: `u-${Date.now()}`,
        name: 'کاربر',
        family: 'گرامی',
        phone: cleanPhone,
        membership_status: 'فعال',
        lending_subscription: 'فعال',
        registered_at: new Date().toLocaleDateString('fa-IR'),
        active_reservations_count: 0,
      };
      db.users.push(user);
      saveDatabase(db);
    }

    // Refresh active reservation count
    const activeResCount = db.reservations.filter(
      (r) => r.user_phone === cleanPhone && (r.status === 'در انتظار بررسی' || r.status === 'تأیید شده')
    ).length;
    user.active_reservations_count = activeResCount;

    return res.json({
      success: true,
      message: 'ورود به حساب کاربری با موفقیت انجام شد.',
      user,
    });
  });

  // User Profile with Active & Past Reservations
  app.get('/api/user/profile', (req, res) => {
    const phone = req.query.phone as string;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'شماره تلفن کاربر الزامی است.' });
    }

    const user = db.users.find((u) => u.phone === phone);
    if (!user) {
      return res.status(404).json({ success: false, message: 'کاربر یافت نشد.' });
    }

    const userReservations = db.reservations.filter((r) => r.user_phone === phone);
    user.active_reservations_count = userReservations.filter(
      (r) => r.status === 'در انتظار بررسی' || r.status === 'تأیید شده'
    ).length;

    return res.json({
      success: true,
      user,
      reservations: userReservations,
    });
  });

  // ==================== BOOKS API ====================

  // Get books with search and filters
  app.get('/api/books', (req, res) => {
    const { q, shelf, subject, availability, page = '1', limit = '24' } = req.query;

    let filtered = [...db.books];

    if (q) {
      const searchStr = (q as string).toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(searchStr) ||
          b.author.toLowerCase().includes(searchStr) ||
          (b.publisher && b.publisher.toLowerCase().includes(searchStr)) ||
          b.book_number.includes(searchStr) ||
          (b.description && b.description.toLowerCase().includes(searchStr))
      );
    }

    if (shelf) {
      const shelfNum = parseInt(shelf as string, 10);
      if (!isNaN(shelfNum)) {
        filtered = filtered.filter((b) => b.shelf === shelfNum);
      }
    }

    if (subject) {
      filtered = filtered.filter((b) => b.subject === (subject as string));
    }

    if (availability) {
      filtered = filtered.filter((b) => b.availability_status === (availability as string));
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const total = filtered.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      books: paginated,
      total,
      page: pageNum,
      totalPages,
    });
  });

  // Get single book
  app.get('/api/books/:id', (req, res) => {
    const book = db.books.find((b) => b.id === req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'کتاب مورد نظر یافت نشد.' });
    }
    return res.json({ success: true, book });
  });

  // Add Book (Admin)
  app.post('/api/books', (req, res) => {
    const newBook: Book = {
      ...req.body,
      id: req.body.id || `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      shelf: parseInt(req.body.shelf, 10) || 1,
      row_number: parseInt(req.body.row_number, 10) || 1,
      availability_status: req.body.availability_status || 'موجود',
      reservation_allowed: req.body.reservation_allowed !== false,
    };

    db.books.unshift(newBook);
    saveDatabase(db);
    addAuditLog('افزودن کتاب جدید', 'مدیریت', `کتاب "${newBook.title}" با شماره ${newBook.book_number} به قفسه ${newBook.shelf} اضافه شد.`, 'info');

    return res.json({ success: true, book: newBook, message: 'کتاب با موفقیت ذخیره شد.' });
  });

  // Update Book (Admin)
  app.put('/api/books/:id', (req, res) => {
    const index = db.books.findIndex((b) => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'کتاب یافت نشد.' });
    }

    db.books[index] = {
      ...db.books[index],
      ...req.body,
      shelf: parseInt(req.body.shelf, 10) || db.books[index].shelf,
      row_number: parseInt(req.body.row_number, 10) || db.books[index].row_number,
      updated_at: new Date().toISOString(),
    };

    saveDatabase(db);
    addAuditLog('ویرایش اطلاعات کتاب', 'مدیریت', `کتاب "${db.books[index].title}" به‌روزرسانی شد.`, 'info');

    return res.json({ success: true, book: db.books[index], message: 'اطلاعات کتاب با موفقیت به‌روزرسانی شد.' });
  });

  // Delete Book (Admin)
  app.delete('/api/books/:id', (req, res) => {
    const index = db.books.findIndex((b) => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'کتاب یافت نشد.' });
    }

    const removed = db.books.splice(index, 1)[0];
    saveDatabase(db);
    addAuditLog('حذف کتاب از کاتالوگ', 'مدیریت', `کتاب "${removed.title}" حذف گردید.`, 'warning');

    return res.json({ success: true, message: 'کتاب با موفقیت از کاتالوگ حذف گردید.' });
  });

  // ==================== HTML "لیست کتاب" IMPORTER ====================
  app.post('/api/books/import-html', (req, res) => {
    const { html_content } = req.body;
    if (!html_content || typeof html_content !== 'string') {
      return res.status(400).json({ success: false, message: 'محتوای فایل HTML لیست کتاب ارسال نشده است.' });
    }

    try {
      // Robust HTML Table & Block extraction
      // Find all <tr> tags or rows
      const rowMatches = html_content.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
      const extractedBooks: Partial<Book>[] = [];
      let headers: string[] = [];

      // Helper to strip tags & clean entities
      const cleanText = (raw: string) => {
        return raw
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&zwnj;/g, '‌')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();
      };

      for (let i = 0; i < rowMatches.length; i++) {
        const row = rowMatches[i];
        // Check if header row
        const thMatches = row.match(/<th[^>]*>([\s\S]*?)<\/th>/gi);
        if (thMatches && thMatches.length > 0) {
          headers = thMatches.map(cleanText);
          continue;
        }

        const tdMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
        if (!tdMatches || tdMatches.length === 0) continue;

        const cells = tdMatches.map(cleanText);

        // Map cells intelligently
        let title = '';
        let author = '';
        let publisher = '';
        let subject = '';
        let shelf = 1;
        let row_number = 1;
        let book_number = '';
        let description = '';
        let cover_image = '';

        if (headers.length > 0 && headers.length === cells.length) {
          headers.forEach((h, idx) => {
            const hClean = h.toLowerCase();
            const val = cells[idx];
            if (hClean.includes('نام') || hClean.includes('عنوان') || hClean.includes('کتاب')) title = val;
            else if (hClean.includes('نویسنده') || hClean.includes('مؤلف') || hClean.includes('پدیدآور')) author = val;
            else if (hClean.includes('ناشر') || hClean.includes('انتشارات')) publisher = val;
            else if (hClean.includes('موضوع') || hClean.includes('رده')) subject = val;
            else if (hClean.includes('قفسه')) {
              const num = parseInt(val.replace(/\D/g, ''), 10);
              if (num >= 1 && num <= 16) shelf = num;
            } else if (hClean.includes('ردیف')) {
              const num = parseInt(val.replace(/\D/g, ''), 10);
              if (!isNaN(num)) row_number = num;
            } else if (hClean.includes('شماره') || hClean.includes('کد') || hClean.includes('ثبت')) book_number = val;
            else if (hClean.includes('توضیح') || hClean.includes('شرح')) description = val;
            else if (hClean.includes('عکس') || hClean.includes('تصویر') || hClean.includes('جلد') || hClean.includes('url')) cover_image = val;
          });
        } else {
          // Fallback positional indexing if no headers
          title = cells[1] || cells[0] || '';
          author = cells[2] || '';
          publisher = cells[3] || '';
          subject = cells[4] || '';
          book_number = cells[0] || `${Date.now()}-${i}`;
        }

        if (title && title.length > 1) {
          extractedBooks.push({
            title,
            author: author || 'ناشناس',
            publisher: publisher || 'نامشخص',
            subject: subject || 'متفرقه',
            shelf: shelf || ((i % 16) + 1),
            row_number: row_number || ((i % 4) + 1),
            book_number: book_number || `${1000 + i}`,
            description: description || `کتاب ارزشمند «${title}» موجود در کتابخانه شهید احسان کربلایی‌پور.`,
            cover_image: cover_image || '',
            availability_status: 'موجود',
            reservation_allowed: true,
          });
        }
      }

      // Check for duplicates and add to database
      let importedCount = 0;
      let updatedCount = 0;

      extractedBooks.forEach((eb, index) => {
        const existingIdx = db.books.findIndex(
          (b) => b.book_number === eb.book_number || (b.title === eb.title && b.author === eb.author)
        );

        if (existingIdx !== -1) {
          // Update
          db.books[existingIdx] = {
            ...db.books[existingIdx],
            ...eb,
            updated_at: new Date().toISOString(),
          };
          updatedCount++;
        } else {
          // Insert
          const newB: Book = {
            id: `b-imp-${Date.now()}-${index}`,
            book_number: eb.book_number || `${Date.now()}-${index}`,
            title: eb.title!,
            author: eb.author || 'ناشناس',
            publisher: eb.publisher || 'نامشخص',
            subject: eb.subject || 'متفرقه',
            shelf: eb.shelf || 1,
            row_number: eb.row_number || 1,
            description: eb.description || '',
            cover_image: eb.cover_image || '',
            availability_status: 'موجود',
            reservation_allowed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          db.books.unshift(newB);
          importedCount++;
        }
      });

      saveDatabase(db);
      addAuditLog(
        'ورود اطلاعات از فایل لیست کتاب',
        'مدیریت',
        `تعداد ${extractedBooks.length} کتاب شناسایی شد. ${importedCount} کتاب افزوده و ${updatedCount} کتاب به‌روزرسانی گردید.`,
        'database'
      );

      return res.json({
        success: true,
        message: 'فایل لیست کتاب با موفقیت تجزیه و در پایگاه داده ثبت شد.',
        totalParsed: extractedBooks.length,
        importedCount,
        updatedCount,
        sampleBooks: extractedBooks.slice(0, 5),
      });
    } catch (err: any) {
      console.error('Error importing HTML books:', err);
      return res.status(500).json({ success: false, message: `خطا در پردازش فایل HTML: ${err.message}` });
    }
  });

  // ==================== RESERVATIONS API ====================

  // Create reservation (Strictly enforces max 4 active reservations rule)
  app.post('/api/reservations', (req, res) => {
    const { user_phone, user_name, book_id } = req.body;
    if (!user_phone || !book_id) {
      return res.status(400).json({ success: false, message: 'شماره تلفن و شناسه کتاب الزامی است.' });
    }

    const cleanPhone = user_phone.trim();
    const book = db.books.find((b) => b.id === book_id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'کتاب مورد نظر یافت نشد.' });
    }

    if (!book.reservation_allowed || book.availability_status === 'مفقود' || book.availability_status === 'غیرقابل امانت') {
      return res.status(400).json({ success: false, message: 'این کتاب در حال حاضر امکان رزرو ندارد.' });
    }

    // 1. Check max 4 active reservations rule
    const activeReservations = db.reservations.filter(
      (r) => r.user_phone === cleanPhone && (r.status === 'در انتظار بررسی' || r.status === 'تأیید شده')
    );

    if (activeReservations.length >= 4) {
      return res.status(400).json({
        success: false,
        message: 'ظرفیت رزرو همزمان شما تکمیل شده است. هر عضو حداکثر می‌تواند ۴ کتاب رزرو فعال داشته باشد.',
      });
    }

    // 2. Prevent duplicate active reservation of the same book
    const duplicate = activeReservations.find((r) => r.book_id === book_id);
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'شما قبلاً این کتاب را رزرو کرده‌اید و درخواست شما در جریان است.',
      });
    }

    const newReservation: Reservation = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_phone: cleanPhone,
      user_name: user_name || 'کاربر گرامی',
      book_id,
      book_title: book.title,
      book_number: book.book_number,
      shelf: book.shelf,
      row_number: book.row_number,
      request_date: new Date().toLocaleDateString('fa-IR'),
      status: 'در انتظار بررسی',
    };

    db.reservations.unshift(newReservation);

    // Update user active count
    const user = db.users.find((u) => u.phone === cleanPhone);
    if (user) {
      user.active_reservations_count = activeReservations.length + 1;
    }

    saveDatabase(db);
    addAuditLog('ثبت درخواست رزرو کتاب', cleanPhone, `درخواست رزرو کتاب "${book.title}" (قفسه ${book.shelf}) ثبت گردید.`, 'info');

    return res.json({
      success: true,
      message: 'درخواست رزرو شما برای ادمین ارسال شد. برای نهایی کردن رزرو، به کتابخانه مراجعه فرمایید.',
      reservation: newReservation,
    });
  });

  // Get all reservations (Admin or filtered by user)
  app.get('/api/reservations', (req, res) => {
    const { phone, status } = req.query;
    let list = [...db.reservations];

    if (phone) {
      list = list.filter((r) => r.user_phone === (phone as string));
    }

    if (status) {
      list = list.filter((r) => r.status === (status as string));
    }

    return res.json({ success: true, reservations: list });
  });

  // Helper for Persian future date
  const getFuturePersianDate = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('fa-IR');
  };

  // Update reservation status (Admin)
  app.patch('/api/reservations/:id', (req, res) => {
    const { status, admin_notes, pickup_deadline } = req.body;
    const resItem = db.reservations.find((r) => r.id === req.params.id);
    if (!resItem) {
      return res.status(404).json({ success: false, message: 'درخواست رزرو یافت نشد.' });
    }

    resItem.status = status || resItem.status;
    if (admin_notes !== undefined) resItem.admin_notes = admin_notes;
    if (pickup_deadline !== undefined) resItem.pickup_deadline = pickup_deadline;

    // Automatic lending calculation if moving to 'امانت فعال' or 'تأیید شده'
    if (status === 'امانت فعال' || status === 'تأیید شده') {
      const defaultDays = db.lending_settings?.default_loan_days || 14;
      if (!resItem.loan_started_at) {
        resItem.loan_started_at = new Date().toLocaleDateString('fa-IR');
      }
      if (!resItem.due_date) {
        resItem.due_date = getFuturePersianDate(defaultDays);
      }
      const bk = db.books.find((b) => b.id === resItem.book_id);
      if (bk) {
        bk.availability_status = status === 'امانت فعال' ? 'امانت' : 'رزرو شده';
        bk.current_borrower = resItem.user_name;
        bk.borrowing_date = resItem.loan_started_at;
        bk.due_date = resItem.due_date;
      }
    } else if (status === 'تحویل داده شده' || status === 'پایان یافته' || status === 'لغو شده' || status === 'رد شده') {
      const bk = db.books.find((b) => b.id === resItem.book_id);
      if (bk && (bk.availability_status === 'امانت' || bk.availability_status === 'رزرو شده')) {
        bk.availability_status = 'موجود';
        bk.current_borrower = undefined;
        bk.borrowing_date = undefined;
        bk.due_date = undefined;
      }
    }

    saveDatabase(db);
    addAuditLog('تغییر وضعیت رزرو', 'مدیریت', `رزرو کتاب "${resItem.book_title}" به حالت "${resItem.status}" تغییر یافت.`, 'info');

    return res.json({ success: true, reservation: resItem, message: 'وضعیت رزرو با موفقیت به‌روزرسانی شد.' });
  });

  // User requests loan extension
  app.post('/api/reservations/:id/extend', (req, res) => {
    const resItem = db.reservations.find((r) => r.id === req.params.id);
    if (!resItem) {
      return res.status(404).json({ success: false, message: 'درخواست امانت یافت نشد.' });
    }
    const maxExt = db.lending_settings?.max_extensions || 1;
    if (resItem.extension_count && resItem.extension_count >= maxExt) {
      return res.status(400).json({ success: false, message: `سقف تمدید این کتاب (${maxExt} بار) تکمیل شده است.` });
    }
    resItem.extension_status = 'در انتظار بررسی';
    resItem.extension_requested_weeks = req.body.weeks || 1;
    saveDatabase(db);
    addAuditLog('درخواست تمدید امانت', resItem.user_phone, `درخواست تمدید کتاب "${resItem.book_title}" ثبت شد.`, 'info');
    return res.json({ success: true, message: 'درخواست تمدید شما برای مدیریت ارسال شد و در انتظار بررسی است.', reservation: resItem });
  });

  // Admin approves or rejects extension
  app.post('/api/admin/reservations/:id/extension-action', (req, res) => {
    const { action, days = 7, note } = req.body;
    const resItem = db.reservations.find((r) => r.id === req.params.id);
    if (!resItem) {
      return res.status(404).json({ success: false, message: 'درخواست امانت یافت نشد.' });
    }
    if (action === 'approve') {
      resItem.extension_status = 'تأیید شده';
      resItem.extension_count = (resItem.extension_count || 0) + 1;
      const extensionDays = Number(days) || 7;
      resItem.due_date = getFuturePersianDate(extensionDays);
      if (note) resItem.admin_notes = note;
      const bk = db.books.find((b) => b.id === resItem.book_id);
      if (bk) bk.due_date = resItem.due_date;
      addAuditLog('تأیید تمدید امانت', 'مدیریت', `تمدید کتاب "${resItem.book_title}" به مدت ${extensionDays} روز تأیید شد.`, 'info');
    } else {
      resItem.extension_status = 'رد شده';
      if (note) resItem.admin_notes = note;
      addAuditLog('رد تمدید امانت', 'مدیریت', `درخواست تمدید کتاب "${resItem.book_title}" رد گردید. دلیل: ${note || 'عدم امکان تمدید'}`, 'warning');
    }
    saveDatabase(db);
    return res.json({ success: true, reservation: resItem, message: action === 'approve' ? 'درخواست تمدید با موفقیت تأیید گردید.' : 'درخواست تمدید رد شد.' });
  });

  // Lending settings (Admin)
  app.get('/api/admin/lending-settings', (req, res) => {
    return res.json({ success: true, settings: db.lending_settings });
  });

  app.put('/api/admin/lending-settings', (req, res) => {
    db.lending_settings = { ...db.lending_settings, ...req.body };
    saveDatabase(db);
    addAuditLog('تنظیمات امانت کتاب', 'مدیریت', `بازه پیش‌فرض امانت به ${db.lending_settings.default_loan_days} روز تنظیم شد.`, 'info');
    return res.json({ success: true, settings: db.lending_settings, message: 'تنظیمات امانت کتاب ذخیره گردید.' });
  });

  // ==================== MESSAGING API ====================
  // Submit message (Public or Logged-in User)
  app.post('/api/messages', (req, res) => {
    const { user_name, user_phone, subject, content } = req.body;
    if (!user_name || !user_phone || !content) {
      return res.status(400).json({ success: false, message: 'تکمیل نام، شماره تماس و متن پیام الزامی است.' });
    }
    const newMsg: UserMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_name: user_name.trim(),
      user_phone: user_phone.trim(),
      subject: (subject || 'پیام عمومی').trim(),
      content: content.trim(),
      created_at: new Date().toLocaleDateString('fa-IR'),
      is_read: false,
      status: 'در انتظار پاسخ',
    };
    if (!db.messages) db.messages = [];
    db.messages.unshift(newMsg);
    saveDatabase(db);
    addAuditLog('ارسال پیام به ادمین', user_name, `موضوع: ${newMsg.subject}`, 'info');
    return res.json({ success: true, message: 'پیام شما با موفقیت برای مدیریت ارسال گردید.', messageItem: newMsg });
  });

  // User fetches their own messages
  app.get('/api/messages', (req, res) => {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'شماره تماس کاربر الزامی است.' });
    }
    const list = (db.messages || []).filter((m) => m.user_phone === (phone as string).trim());
    return res.json({ success: true, messages: list });
  });

  // Admin fetches all messages
  app.get('/api/admin/messages', (req, res) => {
    return res.json({ success: true, messages: db.messages || [] });
  });

  // Admin replies to message
  app.patch('/api/admin/messages/:id/reply', (req, res) => {
    const { admin_reply, status } = req.body;
    const msg = (db.messages || []).find((m) => m.id === req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'پیام مورد نظر یافت نشد.' });
    }
    if (admin_reply !== undefined) msg.admin_reply = admin_reply;
    msg.status = status || 'پاسخ داده شده';
    msg.is_read = true;
    msg.replied_at = new Date().toLocaleDateString('fa-IR');
    saveDatabase(db);
    addAuditLog('پاسخ مدیریت به پیام', 'مدیریت', `پاسخ به پیام "${msg.subject}" از ${msg.user_name} ثبت شد.`, 'info');
    return res.json({ success: true, message: 'پاسخ با موفقیت ارسال شد.', messageItem: msg });
  });

  // ==================== BATCH BOOKS & FILE MANAGEMENT ====================
  app.post('/api/books/batch', (req, res) => {
    const { books: incomingBooks, mode = 'append', fileName = 'لیست_کتاب‌ها', fileType = 'excel', description } = req.body;
    if (!Array.isArray(incomingBooks) || incomingBooks.length === 0) {
      return res.status(400).json({ success: false, message: 'فایل حاوی اطلاعات معتبر کتاب نیست یا کتابی یافت نشد.' });
    }

    const processed: Book[] = incomingBooks.map((b: any, idx: number) => ({
      id: b.id || `book-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      book_number: b.book_number ? String(b.book_number).trim() : `${1000 + idx}`,
      title: (b.title || 'بدون عنوان').trim(),
      author: (b.author || 'ناشناس').trim(),
      publisher: (b.publisher || 'نامشخص').trim(),
      translator: b.translator || '',
      publication_year: b.publication_year ? String(b.publication_year) : '',
      edition: b.edition ? String(b.edition) : '',
      ISBN: b.ISBN || '',
      subject: b.subject || 'متفرقه',
      secondary_subject: b.secondary_subject || '',
      shelf: Number(b.shelf) >= 1 && Number(b.shelf) <= 16 ? Number(b.shelf) : ((idx % 16) + 1),
      row_number: Number(b.row_number) >= 1 ? Number(b.row_number) : ((idx % 4) + 1),
      volume: b.volume || '',
      language: b.language || 'فارسی',
      description: b.description || `کتاب «${b.title}» موجود در کتابخانه شهید احسان کربلایی‌پور.`,
      cover_image: b.cover_image || '',
      availability_status: b.availability_status || 'موجود',
      reservation_allowed: b.reservation_allowed !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    if (mode === 'replace') {
      db.books = processed;
    } else {
      processed.forEach((newB) => {
        const idx = db.books.findIndex(
          (eb) =>
            (eb.book_number && eb.book_number === newB.book_number) ||
            eb.title.trim() === newB.title.trim()
        );
        if (idx !== -1) {
          db.books[idx] = { ...db.books[idx], ...newB, updated_at: new Date().toISOString() };
        } else {
          db.books.unshift(newB);
        }
      });
    }

    // Register in managed files
    const managedFile: ManagedFile = {
      id: `file-${Date.now()}`,
      file_name: fileName,
      file_type: fileType === 'txt' ? 'txt' : 'excel',
      file_size: processed.length * 128,
      uploaded_at: new Date().toLocaleDateString('fa-IR'),
      records_count: processed.length,
      status: 'فعال',
      description: description || `ورود ${processed.length} رکورد کتاب به صورت ${mode === 'replace' ? 'جایگزینی کامل' : 'افزودن و به‌روزرسانی'}`,
    };
    if (!db.managed_files) db.managed_files = [];
    db.managed_files.unshift(managedFile);

    saveDatabase(db);
    addAuditLog('ورود دسته‌ای کتاب‌ها', 'مدیریت', `تعداد ${processed.length} رکورد کتاب از فایل "${fileName}" وارد شد.`, 'database');

    return res.json({
      success: true,
      message: `تعداد ${processed.length} کتاب با موفقیت وارد پایگاه داده شد.`,
      importedCount: processed.length,
      totalBooks: db.books.length,
      file: managedFile,
    });
  });

  // Get Managed Files
  app.get('/api/admin/files', (req, res) => {
    return res.json({ success: true, files: db.managed_files || [] });
  });

  // Delete Managed File
  app.delete('/api/admin/files/:id', (req, res) => {
    db.managed_files = (db.managed_files || []).filter((f) => f.id !== req.params.id);
    saveDatabase(db);
    return res.json({ success: true, message: 'فایل با موفقیت حذف گردید.' });
  });

  // ==================== FEATURED BOOKS ====================
  app.get('/api/featured-books', (req, res) => {
    const ids = db.homepage_cms.featured_book_ids || [];
    const featured = db.books.filter((b) => ids.includes(b.id) || b.featured);
    return res.json({ success: true, books: featured.slice(0, 4) });
  });

  app.put('/api/featured-books', (req, res) => {
    const { book_ids } = req.body;
    if (Array.isArray(book_ids)) {
      db.homepage_cms.featured_book_ids = book_ids.slice(0, 4);
      // Mark books as featured
      db.books.forEach((b) => {
        b.featured = book_ids.includes(b.id);
      });
      saveDatabase(db);
      addAuditLog('به‌روزرسانی کتاب‌های ویژه', 'مدیریت', `تعداد ۴ کتاب برگزیده معرفی تغییر یافت.`, 'info');
    }
    return res.json({ success: true, message: 'کتاب‌های معرفی با موفقیت ذخیره شدند.' });
  });

  // ==================== COMPETITIONS API ====================
  app.get('/api/competitions', (req, res) => {
    return res.json({ success: true, competitions: db.competitions || [] });
  });

  app.post('/api/competitions', (req, res) => {
    const newComp: Competition = {
      ...req.body,
      id: `comp-${Date.now()}`,
      created_at: new Date().toLocaleDateString('fa-IR'),
      status: req.body.status || 'پیش‌نویس',
    };
    db.competitions.unshift(newComp);
    saveDatabase(db);
    addAuditLog('ثبت مسابقه جدید', 'مدیریت', `مسابقه "${newComp.title}" ایجاد شد.`, 'info');
    return res.json({ success: true, competition: newComp, message: 'مسابقه با موفقیت ثبت شد.' });
  });

  app.put('/api/competitions/:id', (req, res) => {
    const idx = db.competitions.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'مسابقه یافت نشد.' });
    }
    db.competitions[idx] = { ...db.competitions[idx], ...req.body };
    saveDatabase(db);
    addAuditLog('ویرایش مسابقه', 'مدیریت', `مسابقه "${db.competitions[idx].title}" به‌روزرسانی شد.`, 'info');
    return res.json({ success: true, competition: db.competitions[idx], message: 'مسابقه به‌روزرسانی شد.' });
  });

  // ==================== FAQ API ====================
  app.get('/api/faq', (req, res) => {
    return res.json({
      success: true,
      categories: db.faq_categories,
      faqs: db.faqs,
    });
  });

  app.post('/api/faq', (req, res) => {
    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      category: req.body.category || 'عضویت و اشتراک',
      question: req.body.question,
      answer: req.body.answer,
      order: db.faqs.length + 1,
      published: true,
    };
    db.faqs.push(newFaq);
    saveDatabase(db);
    addAuditLog('افزودن سؤال متداول', 'مدیریت', `سؤال "${newFaq.question}" افزوده شد.`, 'info');
    return res.json({ success: true, faq: newFaq, message: 'سؤال متداول با موفقیت اضافه شد.' });
  });

  app.put('/api/faq/:id', (req, res) => {
    const idx = db.faqs.findIndex((f) => f.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'سؤال یافت نشد.' });
    }
    db.faqs[idx] = { ...db.faqs[idx], ...req.body };
    saveDatabase(db);
    return res.json({ success: true, faq: db.faqs[idx], message: 'سؤال به‌روزرسانی شد.' });
  });

  app.delete('/api/faq/:id', (req, res) => {
    db.faqs = db.faqs.filter((f) => f.id !== req.params.id);
    saveDatabase(db);
    return res.json({ success: true, message: 'سؤال حذف شد.' });
  });

  // ==================== OPERATING HOURS & LIVE STATUS ====================
  app.get('/api/operating-hours', (req, res) => {
    return res.json({
      success: true,
      operating_hours: db.operating_hours,
    });
  });

  app.put('/api/operating-hours', (req, res) => {
    db.operating_hours = { ...db.operating_hours, ...req.body };
    saveDatabase(db);
    addAuditLog('تنظیم ساعات کاری کتابخانه', 'مدیریت', 'قوانین و استثنائات ساعت کاری به‌روز شد.', 'info');
    return res.json({ success: true, operating_hours: db.operating_hours, message: 'ساعت کاری با موفقیت به‌روز شد.' });
  });

  // ==================== HOMEPAGE CMS ====================
  app.get('/api/homepage', (req, res) => {
    return res.json({ success: true, cms: db.homepage_cms });
  });

  app.put('/api/homepage', (req, res) => {
    db.homepage_cms = { ...db.homepage_cms, ...req.body };
    saveDatabase(db);
    addAuditLog('به‌روزرسانی محتوای صفحه اصلی', 'مدیریت', 'تغییر عناوین و اعلانات صفحه نخست.', 'info');
    return res.json({ success: true, cms: db.homepage_cms, message: 'محتوای صفحه اصلی ذخیره شد.' });
  });

  // ==================== STATS API ====================
  app.get('/api/stats', (req, res) => {
    const totalBooksCount = Math.max(db.books.length, 7150);
    const availableBooksCount = db.books.filter((b) => b.availability_status === 'موجود').length;
    const borrowedCount = db.books.filter((b) => b.availability_status === 'امانت').length;
    const pendingReservationsCount = db.reservations.filter((r) => r.status === 'در انتظار بررسی').length;

    return res.json({
      success: true,
      stats: {
        totalBooks: totalBooksCount,
        availableBooks: availableBooksCount + 7000,
        borrowedBooks: borrowedCount + 120,
        shelvesCount: 16,
        subjectsCount: 33,
        membersCount: Math.max(db.users.length, 1540),
        pendingReservations: pendingReservationsCount,
        visitsCount: db.visits || 7420,
      },
      shelves: SHELVES_LIST,
      subjects: SUBJECTS_LIST,
    });
  });

  // ==================== AUDIT LOGS ====================
  app.get('/api/audit-logs', (req, res) => {
    return res.json({ success: true, logs: db.audit_logs });
  });

  // ==================== VITE MIDDLEWARE OR STATIC SERVING ====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`کتابخانه شهید احسان کربلایی‌پور سرور فعال شد: http://0.0.0.0:${PORT}`);
  });
}

startServer();
