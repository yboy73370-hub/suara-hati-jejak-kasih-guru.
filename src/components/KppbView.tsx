import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  Compass,
  ExternalLink,
  FileText,
  Film,
  GraduationCap,
  Heart,
  Image as ImageIcon,
  Info,
  Laptop,
  Maximize2,
  Mic,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ASSETS } from '../data/gameData';
import {
  KPPB_COURSE_OVERVIEW,
  KPPB_ENGLISH_DATA,
  KPPB_EVIDENCE_IMAGES,
  KPPB_HERO,
  KPPB_INTEGRATION_DATA,
  KPPB_SEJARAH_DATA,
  KPPB_TEKNOLOGI_DATA,
  KPPB_TUGASAN2_PDF_URL,
} from '../data/kppbData';

interface KppbViewProps {
  onBackHome: () => void;
  onExploreOpd: () => void;
}

type ActiveCourseFilter = 'semua' | 'teknologi' | 'sejarah' | 'english';

interface ZoomedPhotoState {
  src: string;
  alt: string;
  caption: string;
}

const COURSE_THEME = {
  lavender: {
    card: 'bg-gradient-to-b from-[#FAF5FF] to-white border-[#C4B5FD]',
    cardActive: 'ring-4 ring-[#8B5CF6]/35 border-[#7C3AED]',
    iconWrap: 'bg-gradient-to-br from-[#DDD6FE] to-[#C4B5FD] text-[#4C1D95]',
    accentText: 'text-[#5B21B6]',
    subPanel: 'bg-[#F5F3FF] border-[#DDD6FE]',
  },
  sky: {
    card: 'bg-gradient-to-b from-[#F0F9FF] to-white border-[#7DD3FC]',
    cardActive: 'ring-4 ring-[#0EA5E9]/30 border-[#0284C7]',
    iconWrap: 'bg-gradient-to-br from-[#BAE6FD] to-[#7DD3FC] text-[#075985]',
    accentText: 'text-[#0369A1]',
    subPanel: 'bg-[#F0F9FF] border-[#BAE6FD]',
  },
  rose: {
    card: 'bg-gradient-to-b from-[#FFF1F7] to-white border-[#F9A8D4]',
    cardActive: 'ring-4 ring-[#EC4899]/30 border-[#DB2777]',
    iconWrap: 'bg-gradient-to-br from-[#FBCFE8] to-[#F9A8D4] text-[#831843]',
    accentText: 'text-[#9D174D]',
    subPanel: 'bg-[#FFF5F9] border-[#FBCFE8]',
  },
} as const;

export function KppbView({ onBackHome, onExploreOpd }: KppbViewProps) {
  const [backdropError, setBackdropError] = useState(false);
  const [activeCourse, setActiveCourse] = useState<ActiveCourseFilter>('semua');
  const [sejarahImgError, setSejarahImgError] = useState(false);
  const [englishImgError, setEnglishImgError] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<ZoomedPhotoState | null>(null);
  const [showPdfPlaceholderNotice, setShowPdfPlaceholderNotice] = useState(false);

  const hasTugasan2Pdf = KPPB_TUGASAN2_PDF_URL.trim().length > 0;

  useEffect(() => {
    if (!zoomedPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedPhoto]);

  const handleSelectCourseCard = (courseId: 'teknologi' | 'sejarah' | 'english') => {
    setActiveCourse((prev) => (prev === courseId ? 'semua' : courseId));
  };

  const showTeknologi = activeCourse === 'semua' || activeCourse === 'teknologi';
  const showSejarah = activeCourse === 'semua' || activeCourse === 'sejarah';
  const showEnglish = activeCourse === 'semua' || activeCourse === 'english';

  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-[#7DD3FC] via-[#E0E7FF] to-[#FAF5FF] pt-6 pb-14 sm:pt-8 sm:pb-16">
      {/* Latar Dunia Fantasi Sedia Ada */}
      {!backdropError && (
        <img
          src={ASSETS.fantasyBackdrop}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          onError={() => setBackdropError(true)}
          className="pointer-events-none select-none fixed inset-0 w-full h-full object-cover object-center opacity-25"
        />
      )}

      {/* Awan hiasan bergerak lembut */}
      <div
        className="animate-cloud-drift pointer-events-none hidden md:block absolute top-10 left-8 opacity-80"
        aria-hidden="true"
      >
        <svg width="112" height="48" viewBox="0 0 118 52" fill="none">
          <path
            d="M24 44H95C105.5 44 114 35.8 114 25.5C114 15.9 106.5 8 97 7.1C93.5 2.8 88.2 0 82.2 0C73.4 0 65.9 6.1 63.9 14.3C61.4 13.1 58.6 12.4 55.6 12.4C45.3 12.4 36.9 20.6 36.7 30.8C35.2 30.4 33.6 30.2 32 30.2C23.2 30.2 16 36.4 16 44H24Z"
            fill="white"
            fillOpacity="0.82"
          />
        </svg>
      </div>
      <div
        className="animate-cloud-drift-reverse pointer-events-none hidden lg:block absolute top-16 right-12 opacity-75"
        aria-hidden="true"
      >
        <svg width="96" height="44" viewBox="0 0 118 52" fill="none">
          <path
            d="M24 44H95C105.5 44 114 35.8 114 25.5C114 15.9 106.5 8 97 7.1C93.5 2.8 88.2 0 82.2 0C73.4 0 65.9 6.1 63.9 14.3C61.4 13.1 58.6 12.4 55.6 12.4C45.3 12.4 36.9 20.6 36.7 30.8C35.2 30.4 33.6 30.2 32 30.2C23.2 30.2 16 36.4 16 44H24Z"
            fill="white"
            fillOpacity="0.78"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Bar Navigasi Atas Halaman KPPB */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="btn-3d-lavender px-4 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Kembali ke Utama</span>
          </button>

          <button
            type="button"
            onClick={onExploreOpd}
            className="btn-3d-primary px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
          >
            <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Terokai OPD</span>
          </button>
        </div>

        {/* Hero Fantasi JELAJAH KPPB */}
        <section
          aria-labelledby="kppb-hero-title"
          className="relative rounded-[32px] overflow-hidden border-4 border-white bg-gradient-to-br from-[#3B176E]/90 via-[#4C1D95]/88 to-[#1E3A8A]/88 shadow-[0_24px_48px_-12px_rgba(46,22,84,0.45)] p-6 sm:p-8 lg:p-10 text-white"
        >
          <div className="relative z-10 max-w-4xl space-y-5">
            <p className="text-xs sm:text-sm font-bold tracking-wide text-[#FDE68A]">
              Integrasi Kurikulum · Pelajar Guru · Suara Hati: Jejak Kasih Guru
            </p>

            <div className="space-y-2">
              <h1
                id="kppb-hero-title"
                className="title-3d-fantasy font-display text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-wide leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                {KPPB_HERO.title}
              </h1>
              <p className="subtitle-3d-fantasy font-display text-xl sm:text-2xl lg:text-[28px] font-bold leading-snug">
                {KPPB_HERO.subtitle}
              </p>
            </div>

            {/* Big Idea Banner */}
            <div className="rounded-2xl bg-[#FFFDF7] text-[#2B1948] border-2 border-[#FBBF24] shadow-lg p-4 sm:p-5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#B45309] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#D97706] shrink-0" aria-hidden="true" />
                <span>{KPPB_HERO.bigIdeaLabel}</span>
              </div>
              <p className="font-display text-lg sm:text-xl font-bold text-[#3B1E6D] leading-snug">
                “{KPPB_HERO.bigIdea}”
              </p>
            </div>

            {/* Pengenalan */}
            <div className="rounded-2xl bg-white/95 text-[#2B1948] border border-[#E9D5FF] p-4 sm:p-5 space-y-2">
              <p className="text-sm sm:text-base leading-relaxed font-medium">
                {KPPB_HERO.intro}
              </p>
            </div>
          </div>
        </section>

        {/* Tiga Kad Kursus Interaktif */}
        <section aria-labelledby="kppb-course-cards-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                id="kppb-course-cards-heading"
                className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
              >
                Tiga Kursus Teras KPPB
              </h2>
              <p className="text-sm sm:text-base font-medium text-[#4C1D95]">
                Klik mana-mana kad kursus untuk menumpukan paparan bahagian berkenaan, atau lihat semua bahagian serentak.
              </p>
            </div>

            {activeCourse !== 'semua' && (
              <button
                type="button"
                onClick={() => setActiveCourse('semua')}
                className="btn-3d-sky px-4 py-2 rounded-xl font-display font-bold text-sm min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Papar Semua 3 Kursus
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {KPPB_COURSE_OVERVIEW.map((course) => {
              const theme = COURSE_THEME[course.colorScheme];
              const isSelected = activeCourse === course.id;
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleSelectCourseCard(course.id)}
                  aria-pressed={isSelected}
                  className={`text-left rounded-3xl border-2 p-5 shadow-md transition-transform duration-150 hover:-translate-y-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                    theme.card
                  } ${isSelected ? theme.cardActive : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${theme.iconWrap}`}
                    >
                      {course.id === 'teknologi' && (
                        <Laptop className="w-6 h-6" aria-hidden="true" />
                      )}
                      {course.id === 'sejarah' && (
                        <GraduationCap className="w-6 h-6" aria-hidden="true" />
                      )}
                      {course.id === 'english' && (
                        <Mic className="w-6 h-6" aria-hidden="true" />
                      )}
                    </div>
                    <span className={`text-xs font-bold ${theme.accentText}`}>
                      {course.bahagianLabel} · {course.courseCode}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-lg sm:text-xl font-bold text-[#2E1654] leading-snug">
                    {course.courseName}
                  </h3>
                  <p className="mt-1.5 text-sm text-[#4C1D95] leading-relaxed">
                    {course.title}
                  </p>
                  <p className={`mt-3 text-xs font-bold ${theme.accentText}`}>
                    {isSelected ? 'Sedang ditumpukan · Klik untuk papar semua' : 'Klik untuk fokus kursus ini'}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* BAHAGIAN 1 — TEKNOLOGI PENGAJARAN DAN PEMBELAJARAN (EDUP6023) */}
        {showTeknologi && (
          <section
            aria-labelledby="kppb-bhg1-title"
            className="rounded-[28px] bg-white/95 border-2 border-[#C4B5FD] shadow-lg p-6 sm:p-8 space-y-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#EDE9FE]">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DDD6FE] to-[#C4B5FD] text-[#4C1D95] flex items-center justify-center shrink-0 shadow-sm">
                  <Laptop className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#6D28D9]">
                    {KPPB_TEKNOLOGI_DATA.bahagian} · {KPPB_TEKNOLOGI_DATA.courseCode}
                  </p>
                  <h2
                    id="kppb-bhg1-title"
                    className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]"
                  >
                    {KPPB_TEKNOLOGI_DATA.courseTitle.toUpperCase()} ({KPPB_TEKNOLOGI_DATA.courseCode})
                  </h2>
                  <p className="mt-1 text-base font-bold text-[#5B21B6]">
                    {KPPB_TEKNOLOGI_DATA.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onExploreOpd}
                className="btn-3d-primary px-5 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[48px] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
              >
                <Compass className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{KPPB_TEKNOLOGI_DATA.ctaLabel}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] p-4 sm:p-5 space-y-2.5 text-sm sm:text-base text-[#2B1948]">
                <p>
                  <strong className="text-[#4C1D95]">Produk:</strong> “{KPPB_TEKNOLOGI_DATA.product}”
                </p>
                <p>
                  <strong className="text-[#4C1D95]">Sasaran:</strong> {KPPB_TEKNOLOGI_DATA.target}
                </p>
                <p>
                  <strong className="text-[#4C1D95]">Standard Kandungan:</strong> {KPPB_TEKNOLOGI_DATA.sk}
                </p>
                <p>
                  <strong className="text-[#4C1D95]">Standard Pembelajaran:</strong> {KPPB_TEKNOLOGI_DATA.sp}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 sm:p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#92400E] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D97706] shrink-0" aria-hidden="true" />
                    <span>Penerangan Pedagogi &amp; Inovasi Digital</span>
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-[#451A03]">
                    {KPPB_TEKNOLOGI_DATA.description}
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onExploreOpd}
                    className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[44px] cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Buka Peta 6 Misi Sedia Ada</span>
                    <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Kad Baharu: Bukti Perancangan Pengajaran — Tugasan 2 */}
            <div className="rounded-3xl bg-gradient-to-br from-[#F5F3FF] via-[#FFFDF9] to-[#FEF3C7]/70 border-2 border-[#C4B5FD] shadow-md p-5 sm:p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FDE68A] to-[#FBBF24] text-[#78350F] border border-white shadow-sm flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-[#3B1E6D]">
                      {KPPB_TEKNOLOGI_DATA.tugasan2Card.title}
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed text-[#2B1948]">
                      {KPPB_TEKNOLOGI_DATA.tugasan2Card.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {hasTugasan2Pdf ? (
                    <a
                      href={KPPB_TUGASAN2_PDF_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-3d-primary px-5 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 min-h-[48px] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
                    >
                      <FileText className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>{KPPB_TEKNOLOGI_DATA.tugasan2Card.buttonLabel}</span>
                      <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPdfPlaceholderNotice((prev) => !prev)}
                      className="btn-3d-sky px-5 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 min-h-[48px] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7]"
                    >
                      <FileText className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>{KPPB_TEKNOLOGI_DATA.tugasan2Card.buttonLabel}</span>
                    </button>
                  )}
                </div>
              </div>

              {!hasTugasan2Pdf && (
                <div
                  role="status"
                  className={`rounded-2xl border p-3.5 sm:p-4 flex items-start gap-3 text-xs sm:text-sm transition-colors ${
                    showPdfPlaceholderNotice
                      ? 'bg-[#FFFBEB] border-[#F59E0B] text-[#78350F]'
                      : 'bg-white/90 border-[#DDD6FE] text-[#4C1D95]'
                  }`}
                >
                  <Info
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      showPdfPlaceholderNotice ? 'text-[#D97706]' : 'text-[#7C3AED]'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="space-y-0.5">
                    <p className="font-bold">
                      {KPPB_TEKNOLOGI_DATA.tugasan2Card.placeholderTitle}
                    </p>
                    <p className="leading-relaxed">
                      {KPPB_TEKNOLOGI_DATA.tugasan2Card.placeholderText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* BAHAGIAN 2 — SEJARAH PENDIDIKAN DI MALAYSIA (EDUP6013) */}
        {showSejarah && (
          <section
            aria-labelledby="kppb-bhg2-title"
            className="rounded-[28px] bg-white/95 border-2 border-[#7DD3FC] shadow-lg p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-start gap-3.5 pb-4 border-b border-[#E0F2FE]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BAE6FD] to-[#7DD3FC] text-[#075985] flex items-center justify-center shrink-0 shadow-sm">
                <GraduationCap className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#0284C7]">
                  {KPPB_SEJARAH_DATA.bahagian} · {KPPB_SEJARAH_DATA.courseCode} · Bukti Tugasan Pelajar Guru
                </p>
                <h2
                  id="kppb-bhg2-title"
                  className="font-display text-xl sm:text-2xl font-bold text-[#0C4A6E]"
                >
                  {KPPB_SEJARAH_DATA.courseTitle.toUpperCase()} ({KPPB_SEJARAH_DATA.courseCode})
                </h2>
                <p className="mt-1 text-base font-bold text-[#0369A1]">
                  {KPPB_SEJARAH_DATA.title}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Penerangan & Hubungan OPD */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] p-4 sm:p-5 space-y-2">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#075985]">
                    Penerangan Aktiviti
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-[#0C4A6E]">
                    {KPPB_SEJARAH_DATA.description}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF5FF] border border-[#DDD6FE] p-4 sm:p-5 space-y-2">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#4C1D95] flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#DB2777] shrink-0" aria-hidden="true" />
                    <span>Hubungan dengan OPD</span>
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-[#2B1948]">
                    {KPPB_SEJARAH_DATA.opdConnection}
                  </p>
                </div>
              </div>

              {/* Ruang Gambar Besar Foto Sebenar Google Meet */}
              <div className="lg:col-span-7">
                <figure className="rounded-3xl bg-[#F8FAFC] border-2 border-[#BAE6FD] p-3 sm:p-4 shadow-sm space-y-3">
                  <div className="rounded-2xl bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#EDE9FE] border border-[#CBD5E1] p-2 sm:p-3 flex items-center justify-center">
                    {!sejarahImgError ? (
                      <div className="relative inline-block max-w-full">
                        <img
                          src={KPPB_EVIDENCE_IMAGES.sejarahMeet}
                          alt={KPPB_SEJARAH_DATA.evidenceCaption}
                          referrerPolicy="no-referrer"
                          onError={() => setSejarahImgError(true)}
                          onClick={() =>
                            setZoomedPhoto({
                              src: KPPB_EVIDENCE_IMAGES.sejarahMeet,
                              alt: KPPB_SEJARAH_DATA.evidenceCaption,
                              caption: KPPB_SEJARAH_DATA.evidenceCaption,
                            })
                          }
                          className="block max-h-[540px] w-auto max-w-full h-auto rounded-xl border border-[#CBD5E1]/80 shadow-sm cursor-zoom-in"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setZoomedPhoto({
                              src: KPPB_EVIDENCE_IMAGES.sejarahMeet,
                              alt: KPPB_SEJARAH_DATA.evidenceCaption,
                              caption: KPPB_SEJARAH_DATA.evidenceCaption,
                            })
                          }
                          aria-label="Besarkan foto sesi Google Meet"
                          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0C4A6E]/85 text-white text-xs font-bold shadow-md hover:bg-[#075985] cursor-pointer min-h-[40px]"
                        >
                          <Maximize2 className="w-4 h-4" aria-hidden="true" />
                          <span>Klik untuk Besarkan</span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full min-h-[260px] flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#7DD3FC] shadow-sm flex items-center justify-center text-[#0284C7] mb-3">
                          <Camera className="w-8 h-8" aria-hidden="true" />
                        </div>
                        <p className="font-display text-lg sm:text-xl font-bold text-[#0C4A6E]">
                          {KPPB_SEJARAH_DATA.placeholderTitle}
                        </p>
                        <p className="mt-1.5 text-sm text-[#0369A1] max-w-md leading-relaxed">
                          {KPPB_SEJARAH_DATA.placeholderHint}
                        </p>
                      </div>
                    )}
                  </div>

                  <figcaption className="flex items-center justify-between gap-2 px-1 text-xs sm:text-sm font-bold text-[#0C4A6E]">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#0284C7] shrink-0" aria-hidden="true" />
                      <span>{KPPB_SEJARAH_DATA.evidenceCaption}</span>
                    </span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>
        )}

        {/* BAHAGIAN 3 — ENGLISH LANGUAGE PROFICIENCY (MPU6122) */}
        {showEnglish && (
          <section
            aria-labelledby="kppb-bhg3-title"
            className="rounded-[28px] bg-white/95 border-2 border-[#F9A8D4] shadow-lg p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-start gap-3.5 pb-4 border-b border-[#FCE7F3]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FBCFE8] to-[#F9A8D4] text-[#831843] flex items-center justify-center shrink-0 shadow-sm">
                <Mic className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#BE185D]">
                  {KPPB_ENGLISH_DATA.bahagian} · {KPPB_ENGLISH_DATA.courseCode} · Bukti Tugasan Pelajar Guru
                </p>
                <h2
                  id="kppb-bhg3-title"
                  className="font-display text-xl sm:text-2xl font-bold text-[#6B1340]"
                >
                  {KPPB_ENGLISH_DATA.courseTitle.toUpperCase()} ({KPPB_ENGLISH_DATA.courseCode})
                </h2>
                <p className="mt-1 text-base font-bold text-[#9D174D]">
                  {KPPB_ENGLISH_DATA.title}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Maklumat Podcast, Penerangan, Hubungan & Butang Video */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl bg-[#FFF5F9] border border-[#FBCFE8] p-4 sm:p-5 space-y-2.5 text-sm sm:text-base text-[#4A1D38]">
                  <p className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-[#DB2777] shrink-0 mt-1" aria-hidden="true" />
                    <span>
                      <strong className="text-[#831843]">Ahli:</strong> {KPPB_ENGLISH_DATA.members}
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Film className="w-4 h-4 text-[#DB2777] shrink-0 mt-1" aria-hidden="true" />
                    <span>
                      <strong className="text-[#831843]">Filem:</strong> {KPPB_ENGLISH_DATA.films}
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#D97706] shrink-0 mt-1" aria-hidden="true" />
                    <span>
                      <strong className="text-[#831843]">Keputusan akhir kumpulan:</strong>{' '}
                      <span className="font-bold text-[#6B1340]">
                        {KPPB_ENGLISH_DATA.finalDecision}
                      </span>
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-[#FBCFE8] p-4 sm:p-5 space-y-2">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#831843]">
                    Penerangan Aktiviti
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-[#4A1D38]">
                    {KPPB_ENGLISH_DATA.description}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF5FF] border border-[#DDD6FE] p-4 sm:p-5 space-y-2">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#4C1D95] flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#DB2777] shrink-0" aria-hidden="true" />
                    <span>Hubungan dengan OPD</span>
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-[#2B1948]">
                    {KPPB_ENGLISH_DATA.opdConnection}
                  </p>
                </div>
              </div>

              {/* Ruang Gambar Besar Foto Sebenar Kumpulan Podcast */}
              <div className="lg:col-span-7">
                <figure className="rounded-3xl bg-[#FFFDF9] border-2 border-[#F9A8D4] p-3 sm:p-4 shadow-sm space-y-3">
                  <div className="rounded-2xl bg-gradient-to-br from-[#FCE7F3] via-[#FFF1F7] to-[#FEF3C7] border border-[#FBCFE8] p-2 sm:p-3 flex items-center justify-center">
                    {!englishImgError ? (
                      <div className="relative inline-block max-w-full">
                        <img
                          src={KPPB_EVIDENCE_IMAGES.englishPodcast}
                          alt={KPPB_ENGLISH_DATA.evidenceCaption}
                          referrerPolicy="no-referrer"
                          onError={() => setEnglishImgError(true)}
                          onClick={() =>
                            setZoomedPhoto({
                              src: KPPB_EVIDENCE_IMAGES.englishPodcast,
                              alt: KPPB_ENGLISH_DATA.evidenceCaption,
                              caption: KPPB_ENGLISH_DATA.evidenceCaption,
                            })
                          }
                          className="block max-h-[540px] w-auto max-w-full h-auto rounded-xl border border-[#FBCFE8] shadow-sm cursor-zoom-in"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setZoomedPhoto({
                              src: KPPB_EVIDENCE_IMAGES.englishPodcast,
                              alt: KPPB_ENGLISH_DATA.evidenceCaption,
                              caption: KPPB_ENGLISH_DATA.evidenceCaption,
                            })
                          }
                          aria-label="Besarkan foto kumpulan podcast"
                          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#6B1340]/85 text-white text-xs font-bold shadow-md hover:bg-[#831843] cursor-pointer min-h-[40px]"
                        >
                          <Maximize2 className="w-4 h-4" aria-hidden="true" />
                          <span>Klik untuk Besarkan</span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full min-h-[260px] flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#F9A8D4] shadow-sm flex items-center justify-center text-[#DB2777] mb-3">
                          <Camera className="w-8 h-8" aria-hidden="true" />
                        </div>
                        <p className="font-display text-lg sm:text-xl font-bold text-[#6B1340]">
                          {KPPB_ENGLISH_DATA.placeholderTitle}
                        </p>
                        <p className="mt-1.5 text-sm text-[#831843] max-w-md leading-relaxed">
                          {KPPB_ENGLISH_DATA.placeholderHint}
                        </p>
                      </div>
                    )}
                  </div>

                  <figcaption className="flex items-center justify-between gap-2 px-1 text-xs sm:text-sm font-bold text-[#6B1340]">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#DB2777] shrink-0" aria-hidden="true" />
                      <span>{KPPB_ENGLISH_DATA.evidenceCaption}</span>
                    </span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>
        )}

        {/* BAHAGIAN 4 — JALINAN PEMBELAJARAN BERMAKNA (INFOGRAFIK) */}
        <section
          aria-labelledby="kppb-bhg4-title"
          className="rounded-[32px] bg-gradient-to-b from-[#FFFDF9] to-[#FAF5FF] border-2 border-[#FBBF24] shadow-xl p-6 sm:p-8 space-y-6"
        >
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <p className="text-xs sm:text-sm font-bold text-[#B45309]">
              Bahagian 4 · Infografik Hubungan KPPB
            </p>
            <h2
              id="kppb-bhg4-title"
              className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
            >
              {KPPB_INTEGRATION_DATA.heading}
            </h2>
            <p className="text-sm sm:text-base text-[#4C1D95]">
              {KPPB_INTEGRATION_DATA.subheading}
            </p>
          </div>

          {/* 3 Nod Kursus Saling Berhubung */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            {KPPB_INTEGRATION_DATA.nodes.map((node, index) => {
              const theme = COURSE_THEME[node.colorScheme];
              return (
                <div key={node.id} className="relative flex flex-col">
                  <div
                    className={`flex-1 rounded-3xl border-2 p-5 shadow-md flex flex-col justify-between gap-3 ${theme.card}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold ${theme.iconWrap}`}
                      >
                        {node.label}
                      </span>
                      <span className={`text-xs font-bold ${theme.accentText}`}>
                        {node.courseCode}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-[#2B1948] leading-relaxed">
                      {node.role}
                    </p>
                  </div>

                  {index < KPPB_INTEGRATION_DATA.nodes.length - 1 && (
                    <div
                      className="hidden md:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#FEF3C7] border border-[#F59E0B] text-[#B45309] shadow-sm"
                      aria-hidden="true"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Jambatan Penghubung ke Hasil Integrasi */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-[#F59E0B] to-[#8B5CF6]" aria-hidden="true" />
            <div className="w-full rounded-3xl bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] text-white p-5 sm:p-6 shadow-lg border-2 border-[#DDD6FE] text-center space-y-3">
              <p className="font-display text-lg sm:text-xl font-bold text-[#FEF08A]">
                {KPPB_INTEGRATION_DATA.outcomesLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 text-sm sm:text-base font-bold">
                {KPPB_INTEGRATION_DATA.outcomes.map((item, idx) => (
                  <span key={item} className="inline-flex items-center gap-2.5">
                    <span className="px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/25">
                      {item}
                    </span>
                    {idx < KPPB_INTEGRATION_DATA.outcomes.length - 1 && (
                      <span className="text-[#FDE68A]" aria-hidden="true">
                        ·
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RUMUSAN */}
          <div className="rounded-3xl bg-[#FFFBEB] border-2 border-[#FDE68A] p-5 sm:p-6 space-y-2 text-center max-w-4xl mx-auto">
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#92400E]">
              {KPPB_INTEGRATION_DATA.summaryTitle}
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-[#451A03] font-medium">
              “{KPPB_INTEGRATION_DATA.summaryText}”
            </p>
          </div>
        </section>

        {/* Butang Navigasi Bawah */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onBackHome}
            className="btn-3d-lavender px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[48px] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Kembali ke Utama</span>
          </button>

          <button
            type="button"
            onClick={onExploreOpd}
            className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[48px] cursor-pointer"
          >
            <Compass className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Terokai OPD</span>
          </button>
        </div>
      </div>

      {/* Modal Pembesar Gambar Bukti (Apabila Gambar Diklik) */}
      {zoomedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="kppb-zoom-caption"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomedPhoto(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E0B3B]/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-5xl rounded-3xl bg-white border-2 border-[#DDD6FE] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="px-5 py-3.5 bg-[#FAF5FF] border-b border-[#EDE9FE] flex items-center justify-between gap-4">
              <p
                id="kppb-zoom-caption"
                className="font-display text-base sm:text-lg font-bold text-[#2E1654]"
              >
                {zoomedPhoto.caption}
              </p>
              <button
                type="button"
                onClick={() => setZoomedPhoto(null)}
                aria-label="Tutup paparan gambar besar"
                className="w-10 h-10 rounded-xl bg-white hover:bg-[#EDE9FE] border border-[#DDD6FE] text-[#3B1E6D] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-4 bg-[#0F172A] flex items-center justify-center overflow-auto">
              <img
                src={zoomedPhoto.src}
                alt={zoomedPhoto.alt}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75dvh] w-auto h-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
