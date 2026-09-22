import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { Hero } from './components/Hero';
import { StatsSection } from './components/StatsSection';
import { RulesSection } from './components/RulesSection';
import { InteractiveShelfBook } from './components/InteractiveShelfBook';
import { FloatingLibraryElements } from './components/FloatingLibraryElements';
import { LibraryEmojiSprinkles } from './components/LibraryEmojiSprinkles';
import { ShelvesSection } from './components/ShelvesSection';
import { WhyUsSection } from './components/WhyUsSection';
import { QuotesCarousel } from './components/QuotesCarousel';
import { FAQSection } from './components/FAQSection';
import { CatalogView } from './components/CatalogView';
import { BookIntroductionView } from './components/BookIntroductionView';
import { CompetitionsView } from './components/CompetitionsView';
import { AccountModal } from './components/AccountModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import {
  INITIAL_BOOKS,
  INITIAL_FAQS,
  INITIAL_FAQ_CATEGORIES,
  INITIAL_OPERATING_HOURS
} from './data/initialData';
import { Book, UserProfile, Reservation, FAQItem, OperatingHours } from './types';

export function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'home' | 'books' | 'intro' | 'competitions' | 'faq' | 'admin'>('home');
  const [initialShelfFilter, setInitialShelfFilter] = useState<number | undefined>(undefined);
  
  // Data State
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>(INITIAL_BOOKS.slice(0, 4));
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(INITIAL_OPERATING_HOURS);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<any>(null);

  // User & Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('lib_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('lib_admin') === 'true';
    } catch {
      return false;
    }
  });

  const [accountModalOpen, setAccountModalOpen] = useState(false);

  // Fetch initial data from server
  const loadDataFromServer = async () => {
    try {
      // Books
      const booksRes = await fetch('/api/books?limit=100');
      if (booksRes.ok) {
        const data = await booksRes.json();
        if (data.books && data.books.length > 0) {
          setBooks(data.books);
        }
      }

      // Featured Books
      const featRes = await fetch('/api/featured-books');
      if (featRes.ok) {
        const featData = await featRes.json();
        if (featData.books && featData.books.length > 0) {
          setFeaturedBooks(featData.books);
        }
      }

      // FAQs
      const faqRes = await fetch('/api/faq');
      if (faqRes.ok) {
        const faqData = await faqRes.json();
        if (faqData.faqs) setFaqs(faqData.faqs);
      }

      // Stats
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) setStats(statsData.stats);
      }

      // Operating Hours
      const hoursRes = await fetch('/api/operating-hours');
      if (hoursRes.ok) {
        const hoursData = await hoursRes.json();
        if (hoursData.operating_hours) setOperatingHours(hoursData.operating_hours);
      }

      // Reservations
      const resRes = await fetch('/api/reservations');
      if (resRes.ok) {
        const resData = await resRes.json();
        if (resData.reservations) setReservations(resData.reservations);
      }
    } catch (err) {
      console.warn('Network fetch error, utilizing initial state:', err);
    }
  };

  useEffect(() => {
    loadDataFromServer();
  }, []);

  // Sync user profile reservations if logged in
  useEffect(() => {
    if (currentUser?.phone) {
      fetch(`/api/user/profile?phone=${currentUser.phone}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('lib_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {});
    }
  }, [reservations]);

  // Auth Handlers
  const handleUserLogin = async (phone: string, pass: string): Promise<boolean> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password: pass }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'خطا در ورود کاربر');
    }
    setCurrentUser(data.user);
    localStorage.setItem('lib_user', JSON.stringify(data.user));
    return true;
  };

  const handleUserRegister = async (name: string, family: string, phone: string, pass: string): Promise<boolean> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, family, phone, password: pass }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'خطا در ثبت‌نام');
    }
    setCurrentUser(data.user);
    localStorage.setItem('lib_user', JSON.stringify(data.user));
    return true;
  };

  const handleAdminLogin = async (username: string, serial: string): Promise<boolean> => {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, admin_serial: serial }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'نام کاربری یا سریال اشتباه است.');
    }
    setIsAdmin(true);
    sessionStorage.setItem('lib_admin', 'true');
    setCurrentTab('admin');
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('lib_user');
    sessionStorage.removeItem('lib_admin');
    setAccountModalOpen(false);
    if (currentTab === 'admin') setCurrentTab('home');
  };

  // Reservation Handler with celebratory Confetti!
  const handleReserveBook = async (book: Book): Promise<boolean> => {
    if (!currentUser) {
      setAccountModalOpen(true);
      return false;
    }

    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_phone: currentUser.phone,
        user_name: `${currentUser.name} ${currentUser.family}`,
        book_id: book.id,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'امکان رزرو وجود ندارد.');
    }

    // Trigger joyful confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#84cc16', '#0d9488', '#facc15', '#ffffff'],
    });

    // Refresh state
    loadDataFromServer();
    return true;
  };

  // Navigation Helper
  const handleNavigate = (tab: string) => {
    if (tab === 'home' || tab === 'books' || tab === 'intro' || tab === 'competitions' || tab === 'faq' || tab === 'admin') {
      setCurrentTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectShelfFromHome = (shelfNum: number) => {
    setInitialShelfFilter(shelfNum);
    setCurrentTab('books');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Actions
  const handleImportHtml = async (htmlContent: string) => {
    const res = await fetch('/api/books/import-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html_content: htmlContent }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'خطا در واردسازی فایل');
    }
    loadDataFromServer();
    return data;
  };

  const handleAddBook = async (book: Partial<Book>) => {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    const data = await res.json();
    loadDataFromServer();
    return data.success;
  };

  const handleUpdateBook = async (id: string, updates: Partial<Book>) => {
    const res = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    loadDataFromServer();
    return data.success;
  };

  const handleDeleteBook = async (id: string) => {
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    const data = await res.json();
    loadDataFromServer();
    return data.success;
  };

  const handleUpdateReservation = async (id: string, status: Reservation['status'], notes?: string) => {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes: notes }),
    });
    const data = await res.json();
    loadDataFromServer();
    return data.success;
  };

  const handleUpdateOperatingHours = async (hours: OperatingHours) => {
    const res = await fetch('/api/operating-hours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hours),
    });
    const data = await res.json();
    if (data.operating_hours) setOperatingHours(data.operating_hours);
    return data.success;
  };

  const handleUpdateFeaturedBooks = async (bookIds: string[]) => {
    const res = await fetch('/api/featured-books', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_ids: bookIds }),
    });
    const data = await res.json();
    loadDataFromServer();
    return data.success;
  };

  // User's own reservations
  const userReservations = currentUser
    ? reservations.filter((r) => r.user_phone === currentUser.phone)
    : [];

  return (
    <div className="min-h-screen bg-[#042f2e] text-[#f0fdfa] flex flex-col font-sans selection:bg-[#84cc16] selection:text-[#042f2e]">
      
      {/* Polished Initial Loading Screen */}
      {showLoading && <LoadingScreen onFinish={() => setShowLoading(false)} />}

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAccountModal={() => setAccountModalOpen(true)}
        activeReservationsCount={currentUser?.active_reservations_count || 0}
        isLoggedIn={!!currentUser}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <div className="relative overflow-x-hidden">
            <LibraryEmojiSprinkles />
            <FloatingLibraryElements />

            <Hero
              onSearchClick={() => handleNavigate('books')}
              onExploreShelvesClick={() => {
                const el = document.getElementById('shelves-section-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <StatsSection stats={stats} />

            <InteractiveShelfBook />

            <div id="shelves-section-anchor">
              <ShelvesSection
                books={books}
                onSelectShelf={handleSelectShelfFromHome}
                onSelectBook={(book) => {
                  setCurrentTab('books');
                }}
              />
            </div>

            <WhyUsSection />

            <RulesSection />

            <QuotesCarousel />

            <FAQSection
              faqs={faqs}
              isHomePreview={true}
              onViewAll={() => {
                setCurrentTab('faq');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {currentTab === 'books' && (
          <CatalogView
            books={books}
            currentUser={currentUser}
            onOpenAuth={() => setAccountModalOpen(true)}
            onReserveBook={handleReserveBook}
            initialShelfFilter={initialShelfFilter}
          />
        )}

        {currentTab === 'intro' && (
          <BookIntroductionView
            featuredBooks={featuredBooks}
            onSelectBook={(book) => {
              setCurrentTab('books');
            }}
            onExploreAll={() => setCurrentTab('books')}
          />
        )}

        {currentTab === 'competitions' && (
          <CompetitionsView
            currentUser={currentUser}
            onOpenAuth={() => setAccountModalOpen(true)}
          />
        )}

        {currentTab === 'faq' && (
          <div className="py-12">
            <FAQSection faqs={faqs} />
          </div>
        )}

        {currentTab === 'admin' && isAdmin && (
          <AdminDashboard
            books={books}
            reservations={reservations}
            faqs={faqs}
            operatingHours={operatingHours}
            onRefreshData={loadDataFromServer}
            onImportHtml={handleImportHtml}
            onAddBook={handleAddBook}
            onUpdateBook={handleUpdateBook}
            onDeleteBook={handleDeleteBook}
            onUpdateReservation={handleUpdateReservation}
            onUpdateOperatingHours={handleUpdateOperatingHours}
            onUpdateFeaturedBooks={handleUpdateFeaturedBooks}
            onClose={() => setCurrentTab('home')}
          />
        )}
      </main>

      {/* User and Admin Account Modal */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onUserLogin={handleUserLogin}
        onUserRegister={handleUserRegister}
        onAdminLogin={handleAdminLogin}
        onLogout={handleLogout}
        userReservations={userReservations}
      />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAdmin={() => {
          if (isAdmin) {
            setCurrentTab('admin');
          } else {
            setAccountModalOpen(true);
          }
        }}
      />
    </div>
  );
}

export default App;
