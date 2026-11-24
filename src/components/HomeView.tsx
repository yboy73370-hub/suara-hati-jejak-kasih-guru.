import { BookOpen, Compass, Heart, Mic, Sparkles, Star, Target } from 'lucide-react';
import { useState } from 'react';
import { APP_INFO, ASSETS, INTRO_STORY_PARAGRAPHS } from '../data/gameData';

interface HomeViewProps {
  onStartAdventure: () => void;
  onOpenPanduan: () => void;
  onOpenObjektif: () => void;
}

export function HomeView({
  onStartAdventure,
  onOpenPanduan,
  onOpenObjektif,
}: HomeViewProps) {
  const [backdropError, setBackdropError] = useState(false);
  const [charactersError, setCharactersError] = useState(false);
  const [emblemError, setEmblemError] = useState(false);

  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-[#6EC6FF] via-[#BAE6FD] to-[#F3E8FF] pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-14 flex items-center">
      {/* Latar Dunia Fantasi Penuh (Istana Awan, Pelangi & Taman) */}
      {!backdropError && (
        <img
          src={ASSETS.fantasyBackdrop}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          onError={() => setBackdropError(true)}
          className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover object-center opacity-85"
        />
      )}

      {/* Lapisan scrim lembut supaya tajuk, slogan & kotak cerita sentiasa jelas terbaca */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#220D47]/55 via-[#3B176E]/28 to-[#1E3A8A]/18"
        aria-hidden="true"
      />

      {/* Awan hiasan bergerak perlahan */}
      <div
        className="animate-cloud-drift pointer-events-none hidden md:block absolute top-8 left-6 opacity-80"
        aria-hidden="true"
      >
        <svg width="118" height="52" viewBox="0 0 118 52" fill="none">
          <path
            d="M24 44H95C105.5 44 114 35.8 114 25.5C114 15.9 106.5 8 97 7.1C93.5 2.8 88.2 0 82.2 0C73.4 0 65.9 6.1 63.9 14.3C61.4 13.1 58.6 12.4 55.6 12.4C45.3 12.4 36.9 20.6 36.7 30.8C35.2 30.4 33.6 30.2 32 30.2C23.2 30.2 16 36.4 16 44H24Z"
            fill="white"
            fillOpacity="0.72"
          />
        </svg>
      </div>
      <div
        className="animate-cloud-drift-reverse pointer-events-none hidden lg:block absolute top-14 right-12 opacity-75"
        aria-hidden="true"
      >
        <svg width="96" height="44" viewBox="0 0 118 52" fill="none">
          <path
            d="M24 44H95C105.5 44 114 35.8 114 25.5C114 15.9 106.5 8 97 7.1C93.5 2.8 88.2 0 82.2 0C73.4 0 65.9 6.1 63.9 14.3C61.4 13.1 58.6 12.4 55.6 12.4C45.3 12.4 36.9 20.6 36.7 30.8C35.2 30.4 33.6 30.2 32 30.2C23.2 30.2 16 36.4 16 44H24Z"
            fill="white"
            fillOpacity="0.68"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Bahagian Kiri: Skrin Permulaan Permainan Fantasi */}
          <div className="lg:col-span-6 space-y-5">
            {/* Maklumat Mata Pelajaran dalam panel separa legap */}
            <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 px-4 py-1.5 rounded-2xl bg-[#FFFDF8]/95 backdrop-blur-md border border-[#FDE68A] shadow-sm text-xs sm:text-sm font-bold text-[#4C1D95]">
              <span>{APP_INFO.subject}</span>
              <span aria-hidden="true">·</span>
              <span>{APP_INFO.aspect}</span>
              <span aria-hidden="true">·</span>
              <span>Sajak {APP_INFO.mainText}</span>
            </div>

            {/* Tajuk Permainan 3D Besar, Bulat & Ceria dengan kontras dipertingkat */}
            <div className="rounded-3xl bg-[#241046]/42 backdrop-blur-[3px] border border-white/25 px-5 py-4 sm:px-6 sm:py-5 shadow-[0_14px_30px_-10px_rgba(28,10,62,0.45)] space-y-2">
              <h1
                className="title-3d-fantasy font-display text-4xl sm:text-5xl xl:text-[60px] font-bold tracking-wide leading-[1.06]"
                style={{ textWrap: 'balance' }}
              >
                {APP_INFO.fullTitle}
              </h1>
              <p className="subtitle-3d-fantasy font-display text-xl sm:text-2xl xl:text-[30px] font-bold tracking-wider leading-snug">
                {APP_INFO.subtitle}
              </p>

              {/* Slogan di atas panel separa legap supaya kontras tinggi */}
              <div className="pt-1">
                <p className="inline-block px-4 py-1.5 rounded-2xl bg-[#1E0B3B]/85 border border-[#FDE68A]/80 text-sm sm:text-base font-bold text-[#FEF08A] shadow-md">
                  “{APP_INFO.slogan}”
                </p>
              </div>
            </div>

            {/* Kotak Pengenalan Cerita (Panel Skrol Permainan Separa Legap) */}
            <section
              aria-label="Pengenalan Cerita"
              className="rounded-3xl bg-[#FFFDF7]/94 backdrop-blur-md border-2 border-[#FDE68A] shadow-[0_18px_38px_-10px_rgba(46,22,84,0.36)] p-5 sm:p-6 space-y-2.5"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[#9D174D]">
                <Heart className="w-4 h-4 fill-[#EC4899] text-[#EC4899]" aria-hidden="true" />
                <span>Misi Menghidupkan Pelita Kasih</span>
              </div>
              <div className="space-y-2 text-[15px] sm:text-base leading-relaxed text-[#2B1948]">
                <p className="font-bold text-[#4C1D95]">{INTRO_STORY_PARAGRAPHS[0]}</p>
                <p>{INTRO_STORY_PARAGRAPHS[1]}</p>
                <p>{INTRO_STORY_PARAGRAPHS[2]}</p>
              </div>
            </section>

            {/* Tiga Butang Permainan Video 3D Tersusun Kemas (Desktop & Telefon) */}
            <div className="pt-1 pb-2 space-y-3.5">
              <button
                type="button"
                onClick={onStartAdventure}
                className="btn-3d-primary w-full px-6 py-3.5 rounded-2xl font-display font-bold text-base sm:text-lg inline-flex items-center justify-center gap-2.5 min-h-[54px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFBEB]"
              >
                <Compass className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>MULA PENGEMBARAAN</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={onOpenPanduan}
                  className="btn-3d-lavender w-full px-4 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 min-h-[50px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF]"
                >
                  <BookOpen className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>PANDUAN</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenObjektif}
                  className="btn-3d-rose w-full px-4 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 min-h-[50px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF]"
                >
                  <Target className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>OBJEKTIF PEMBELAJARAN</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bahagian Kanan: Dua Murid (Buku Sajak & Mikrofon Ajaib) + Guru & Pelita Hati */}
          <div className="lg:col-span-6 pt-3 sm:pt-4 lg:pt-0">
            <div className="relative mx-auto max-w-[600px] lg:max-w-none">
              {/* Bintang berkelip di sudut luar */}
              <div
                className="animate-twinkle-star hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFFBEB]/95 border-2 border-[#FDE68A] shadow-lg text-[#F59E0B] absolute -top-4 -right-3 z-20"
                aria-hidden="true"
              >
                <Star className="w-6 h-6 fill-[#FBBF24]" />
              </div>

              {/* Buku terapung & mikrofon ajaib tag di luar bingkai */}
              <div
                className="animate-float-gentle hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 border-2 border-[#DDD6FE] shadow-lg text-[#5B21B6] text-xs font-bold absolute -top-4 left-5 z-20"
                aria-hidden="true"
              >
                <BookOpen className="w-4 h-4 text-[#7C3AED]" />
                <span>Buku Sajak</span>
                <span aria-hidden="true">·</span>
                <Mic className="w-4 h-4 text-[#DB2777]" />
                <span>Mikrofon Ajaib</span>
              </div>

              {/* Bingkai Watak Utama dengan gerakan idle lembut */}
              <div className="animate-idle-character relative rounded-[32px] overflow-hidden border-4 border-white shadow-[0_26px_52px_-12px_rgba(46,22,84,0.45)] bg-gradient-to-br from-[#EDE9FE] via-[#FCE7F3] to-[#DBEAFE] aspect-[4/3]">
                {!charactersError ? (
                  <img
                    src={ASSETS.fantasyCharacters}
                    alt="Dua murid sekolah rendah Malaysia memegang buku sajak bercahaya dan mikrofon ajaib bersama guru penyayang di sisi pelita emas berbentuk hati"
                    referrerPolicy="no-referrer"
                    onError={() => setCharactersError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#EDE9FE] via-[#FCE7F3] to-[#FEF3C7]">
                    <div className="w-20 h-20 rounded-3xl bg-white/95 border-2 border-[#FDE68A] flex items-center justify-center shadow-md mb-4">
                      <Sparkles className="w-10 h-10 text-[#D97706]" aria-hidden="true" />
                    </div>
                    <p className="font-display text-2xl font-bold text-[#3B1E6D]">
                      Wira Suara Hati & Guru Pembimbing
                    </p>
                    <p className="mt-1 text-sm text-[#5B3E8E] max-w-xs">
                      Murid memegang buku sajak dan mikrofon ajaib bersama guru di taman pelita kasih.
                    </p>
                  </div>
                )}
              </div>

              {/* Pelita Emas Bercahaya Berbentuk Hati */}
              <div className="mt-3 sm:mt-0 sm:absolute sm:-bottom-5 sm:right-4 z-20 flex items-center gap-3 rounded-2xl bg-[#FFFDF7]/95 backdrop-blur-md border-2 border-[#FBBF24] shadow-xl px-4 py-2.5">
                <div className="animate-lantern-glow relative w-12 h-12 rounded-xl overflow-hidden bg-[#FEF3C7] border border-[#F59E0B]/50 shrink-0 flex items-center justify-center">
                  {!emblemError ? (
                    <img
                      src={ASSETS.pelitaEmblem}
                      alt="Pelita emas bercahaya berbentuk hati simbol kasih guru"
                      referrerPolicy="no-referrer"
                      onError={() => setEmblemError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Heart className="w-6 h-6 fill-[#EC4899] text-[#EC4899]" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p className="font-display text-sm sm:text-base font-bold text-[#92400E] leading-tight">
                    Pelita Kasih Guru
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[#5B3E8E]">
                    6 Pulau Terapung · Tahun 5
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
