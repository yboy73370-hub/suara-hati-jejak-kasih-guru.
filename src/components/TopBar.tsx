import { Menu, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { useState } from 'react';
import { APP_INFO } from '../data/gameData';
import { ActiveModal, ViewMode } from '../types/game';

interface TopBarProps {
  currentView: ViewMode;
  activeModal: ActiveModal;
  isMusicPlaying: boolean;
  reducedMotion: boolean;
  onNavigateUtama: () => void;
  onNavigateMisi: () => void;
  onOpenPanduan: () => void;
  onOpenObjektif: () => void;
  onToggleMusic: () => void;
  onToggleReducedMotion: () => void;
}

export function TopBar({
  currentView,
  activeModal,
  isMusicPlaying,
  reducedMotion,
  onNavigateUtama,
  onNavigateMisi,
  onOpenPanduan,
  onOpenObjektif,
  onToggleMusic,
  onToggleReducedMotion,
}: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileAction = (action: () => void) => {
    setMobileMenuOpen(false);
    action();
  };

  const navButtonClass = (isActive: boolean) =>
    `px-3 py-2 text-sm sm:text-base font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[40px] inline-flex items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
      isActive
        ? 'text-[#5B21B6] bg-[#EDE9FE] underline decoration-2 underline-offset-4'
        : 'text-[#3B2667] hover:text-[#5B21B6] hover:bg-[#F5F0FF]'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b-2 border-[#E9D5FF] shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4 sm:gap-6">
        {/* Zon 1: Logo pelita bercahaya + Nama aplikasi */}
        <button
          type="button"
          onClick={() => handleMobileAction(onNavigateUtama)}
          className="flex items-center gap-2.5 text-left rounded-xl py-1 pr-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
          aria-label="Kembali ke Halaman Utama Suara Hati"
        >
          <span className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A] border-2 border-[#F59E0B]/60 shadow-sm shrink-0">
            <svg
              viewBox="0 0 32 32"
              className="w-6 h-6 text-[#B45309]"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M16 4C14.2 4 12.8 5.2 12.8 6.8H19.2C19.2 5.2 17.8 4 16 4Z"
                fill="#D97706"
              />
              <path
                d="M10 10.5C10 8.8 11.4 7.5 13.1 7.5H18.9C20.6 7.5 22 8.8 22 10.5L23.2 21.5C23.3 22.8 22.3 24 21 24H11C9.7 24 8.7 22.8 8.8 21.5L10 10.5Z"
                fill="#FFFBEB"
                stroke="#B45309"
                strokeWidth="1.8"
              />
              <path
                d="M16 12.5C14.7 12.5 13.7 13.5 13.7 14.7C13.7 16.5 16 18.7 16 18.7C16 18.7 18.3 16.5 18.3 14.7C18.3 13.5 17.3 12.5 16 12.5Z"
                fill="#EC4899"
              />
              <path
                d="M11.5 26.5H20.5"
                stroke="#B45309"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#3B1E6D] whitespace-nowrap shrink-0">
            {APP_INFO.shortTitle}
          </span>
        </button>

        {/* Zon 2: Menu navigasi desktop */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-1.5 lg:gap-3"
        >
          <button
            type="button"
            onClick={onNavigateUtama}
            aria-current={currentView === 'utama' && activeModal === null ? 'page' : undefined}
            className={navButtonClass(currentView === 'utama' && activeModal === null)}
          >
            Utama
          </button>
          <button
            type="button"
            onClick={onOpenPanduan}
            aria-current={activeModal === 'panduan' ? 'true' : undefined}
            className={navButtonClass(activeModal === 'panduan')}
          >
            Panduan
          </button>
          <button
            type="button"
            onClick={onOpenObjektif}
            aria-current={activeModal === 'objektif' ? 'true' : undefined}
            className={navButtonClass(activeModal === 'objektif')}
          >
            Objektif
          </button>
          <button
            type="button"
            onClick={onNavigateMisi}
            aria-current={
              (currentView === 'misi' ||
                currentView === 'misi1' ||
                currentView === 'misi2' ||
                currentView === 'misi3' ||
                currentView === 'misi4' ||
                currentView === 'misi5' ||
                currentView === 'misi6') &&
              activeModal === null
                ? 'page'
                : undefined
            }
            className={navButtonClass(
              (currentView === 'misi' ||
                currentView === 'misi1' ||
                currentView === 'misi2' ||
                currentView === 'misi3' ||
                currentView === 'misi4' ||
                currentView === 'misi5' ||
                currentView === 'misi6') &&
                activeModal === null
            )}
          >
            Misi
          </button>
        </nav>

        {/* Zon 3: Kawalan Animasi & Muzik latar + butang menu mudah alih */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleReducedMotion}
            aria-pressed={reducedMotion}
            aria-label={
              reducedMotion
                ? 'Aktifkan semula animasi penuh'
                : 'Kurangkan animasi untuk keselesaan paparan'
            }
            title={reducedMotion ? 'Animasi Dikurangkan' : 'Animasi Penuh Aktif'}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 min-h-[42px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
              reducedMotion
                ? 'bg-[#E0F2FE] text-[#075985] border-2 border-[#38BDF8]'
                : 'bg-[#FAF5FF] text-[#4C1D95] border-2 border-[#DDD6FE] hover:border-[#A78BFA]'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">
              {reducedMotion ? 'Animasi: Kurang' : 'Animasi: Penuh'}
            </span>
            <span className="lg:hidden">{reducedMotion ? 'Tenang' : 'Animasi'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMusic}
            aria-pressed={isMusicPlaying}
            aria-label={
              isMusicPlaying ? 'Hentikan muzik latar' : 'Mainkan muzik latar lembut'
            }
            className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 min-h-[42px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
              isMusicPlaying
                ? 'bg-[#FDF2F8] text-[#9D174D] border-2 border-[#F472B6] shadow-sm'
                : 'bg-[#F5F3FF] text-[#3B1E6D] border-2 border-[#DDD6FE] hover:border-[#A78BFA]'
            }`}
          >
            {isMusicPlaying ? (
              <Volume2 className="w-4 h-4 shrink-0 text-[#DB2777]" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4 shrink-0 text-[#6D28D9]" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {isMusicPlaying ? 'Muzik: Aktif' : 'Muzik: Mati'}
            </span>
            <span className="sm:hidden">{isMusicPlaying ? 'Aktif' : 'Muzik'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#F5F3FF] text-[#3B1E6D] border-2 border-[#DDD6FE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Menu navigasi mudah alih */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigasi Mudah Alih"
          className="md:hidden border-t border-[#E9D5FF] bg-white px-4 py-3 grid grid-cols-2 gap-2 shadow-md"
        >
          <button
            type="button"
            onClick={() => handleMobileAction(onNavigateUtama)}
            className={navButtonClass(currentView === 'utama' && activeModal === null)}
          >
            Utama
          </button>
          <button
            type="button"
            onClick={() => handleMobileAction(onOpenPanduan)}
            className={navButtonClass(activeModal === 'panduan')}
          >
            Panduan
          </button>
          <button
            type="button"
            onClick={() => handleMobileAction(onOpenObjektif)}
            className={navButtonClass(activeModal === 'objektif')}
          >
            Objektif
          </button>
          <button
            type="button"
            onClick={() => handleMobileAction(onNavigateMisi)}
            className={navButtonClass(
              (currentView === 'misi' ||
                currentView === 'misi1' ||
                currentView === 'misi2' ||
                currentView === 'misi3' ||
                currentView === 'misi4' ||
                currentView === 'misi5' ||
                currentView === 'misi6') &&
                activeModal === null
            )}
          >
            Misi
          </button>
        </nav>
      )}
    </header>
  );
}
