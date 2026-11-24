import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  Compass,
  Flame,
  Play,
  Sparkles,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ASSETS, MISSION_LOCATIONS } from '../data/gameData';
import {
  LearningMode,
  MissionLocation,
  MissionStatus,
  ProgressState,
} from '../types/game';
import { countCompletedMissions } from '../utils/storage';
import { DifferentiatedSupportPanel } from './DifferentiatedSupportPanel';
import { MissionIcon } from './MissionIcon';
import { MissionPreviewModal } from './MissionPreviewModal';

interface MissionMapViewProps {
  progress: ProgressState;
  initialPreviewMissionId?: number | null;
  onClearInitialPreview?: () => void;
  onEnterMission1: () => void;
  onEnterMission2: () => void;
  onEnterMission3: () => void;
  onEnterMission4: () => void;
  onEnterMission5: () => void;
  onEnterMission6: () => void;
  canViewCertificate?: boolean;
  onOpenCertificate?: () => void;
  onSelectMission: (missionId: number) => void;
  onBackHome: () => void;
  learningMode: LearningMode;
  onChangeLearningMode: (mode: LearningMode) => void;
  onOpenAchievementSummary: () => void;
  onOpenCredits: () => void;
}

const ISLAND_THEME_MAP: Record<
  MissionLocation['colorScheme'],
  {
    cardSurface: string;
    iconBox: string;
    iconColor: string;
    border: string;
    enterBtn: string;
    pinAccent: string;
  }
> = {
  lavender: {
    cardSurface: 'bg-gradient-to-b from-[#FAF5FF] to-white',
    iconBox: 'bg-gradient-to-br from-[#DDD6FE] to-[#C4B5FD]',
    iconColor: 'text-[#4C1D95]',
    border: 'border-[#C4B5FD] hover:border-[#7C3AED]',
    enterBtn: 'btn-3d-lavender',
    pinAccent: 'from-[#A78BFA] to-[#7C3AED]',
  },
  rose: {
    cardSurface: 'bg-gradient-to-b from-[#FFF1F7] to-white',
    iconBox: 'bg-gradient-to-br from-[#FBCFE8] to-[#F9A8D4]',
    iconColor: 'text-[#831843]',
    border: 'border-[#F9A8D4] hover:border-[#DB2777]',
    enterBtn: 'btn-3d-rose',
    pinAccent: 'from-[#F472B6] to-[#DB2777]',
  },
  sky: {
    cardSurface: 'bg-gradient-to-b from-[#F0F9FF] to-white',
    iconBox: 'bg-gradient-to-br from-[#BAE6FD] to-[#7DD3FC]',
    iconColor: 'text-[#075985]',
    border: 'border-[#7DD3FC] hover:border-[#0284C7]',
    enterBtn: 'btn-3d-sky',
    pinAccent: 'from-[#38BDF8] to-[#0284C7]',
  },
  violet: {
    cardSurface: 'bg-gradient-to-b from-[#F5F3FF] to-white',
    iconBox: 'bg-gradient-to-br from-[#C4B5FD] to-[#A78BFA]',
    iconColor: 'text-[#3B0764]',
    border: 'border-[#A78BFA] hover:border-[#6D28D9]',
    enterBtn: 'btn-3d-lavender',
    pinAccent: 'from-[#8B5CF6] to-[#5B21B6]',
  },
  amber: {
    cardSurface: 'bg-gradient-to-b from-[#FFFBEB] to-white',
    iconBox: 'bg-gradient-to-br from-[#FDE68A] to-[#FCD34D]',
    iconColor: 'text-[#78350F]',
    border: 'border-[#FCD34D] hover:border-[#D97706]',
    enterBtn: 'btn-3d-primary',
    pinAccent: 'from-[#FBBF24] to-[#D97706]',
  },
  gold: {
    cardSurface: 'bg-gradient-to-b from-[#FEFCE8] to-white',
    iconBox: 'bg-gradient-to-br from-[#FEF08A] to-[#FACC15]',
    iconColor: 'text-[#713F12]',
    border: 'border-[#FACC15] hover:border-[#CA8A04]',
    enterBtn: 'btn-3d-primary',
    pinAccent: 'from-[#FACC15] to-[#B45309]',
  },
};

export function MissionMapView({
  progress,
  initialPreviewMissionId,
  onClearInitialPreview,
  onEnterMission1,
  onEnterMission2,
  onEnterMission3,
  onEnterMission4,
  onEnterMission5,
  onEnterMission6,
  canViewCertificate = false,
  onOpenCertificate,
  onSelectMission,
  onBackHome,
  learningMode,
  onChangeLearningMode,
  onOpenAchievementSummary,
  onOpenCredits,
}: MissionMapViewProps) {
  const [mapImgError, setMapImgError] = useState(false);
  const [selectedMission, setSelectedMission] = useState<MissionLocation | null>(null);

  useEffect(() => {
    if (typeof initialPreviewMissionId === 'number') {
      const target = MISSION_LOCATIONS.find((m) => m.id === initialPreviewMissionId);
      if (target) {
        setSelectedMission(target);
      }
      onClearInitialPreview?.();
    }
  }, [initialPreviewMissionId, onClearInitialPreview]);

  const completedCount = countCompletedMissions(progress);
  const allCompleted = completedCount === MISSION_LOCATIONS.length;

  const handleOpenMission = (mission: MissionLocation) => {
    if (mission.id === 1) {
      onEnterMission1();
      return;
    }
    if (mission.id === 2) {
      onEnterMission2();
      return;
    }
    if (mission.id === 3) {
      onEnterMission3();
      return;
    }
    if (mission.id === 4) {
      onEnterMission4();
      return;
    }
    if (mission.id === 5) {
      onEnterMission5();
      return;
    }
    if (mission.id === 6) {
      onEnterMission6();
      return;
    }
    onSelectMission(mission.id);
    setSelectedMission(mission);
  };

  const renderStatusBadge = (status: MissionStatus) => {
    if (status === 'Selesai') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#047857]">
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Selesai</span>
        </span>
      );
    }
    if (status === 'Sedang Berlangsung') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#B45309]">
          <Sparkles className="w-4 h-4 shrink-0 text-[#D97706]" aria-hidden="true" />
          <span>Sedang Berlangsung</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#5B3E8E]">
        <Clock className="w-4 h-4 shrink-0 text-[#7C3AED]" aria-hidden="true" />
        <span>Belum Bermula</span>
      </span>
    );
  };

  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-[#87CEFA] via-[#E0F2FE] to-[#F5EBFF] py-6 sm:py-8">
      {/* Awan hiasan bergerak perlahan */}
      <div
        className="animate-cloud-drift pointer-events-none hidden md:block absolute top-6 left-10 opacity-75"
        aria-hidden="true"
      >
        <svg width="110" height="48" viewBox="0 0 118 52" fill="none">
          <path
            d="M24 44H95C105.5 44 114 35.8 114 25.5C114 15.9 106.5 8 97 7.1C93.5 2.8 88.2 0 82.2 0C73.4 0 65.9 6.1 63.9 14.3C61.4 13.1 58.6 12.4 55.6 12.4C45.3 12.4 36.9 20.6 36.7 30.8C35.2 30.4 33.6 30.2 32 30.2C23.2 30.2 16 36.4 16 44H24Z"
            fill="white"
            fillOpacity="0.8"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        {/* Bar Tajuk Peta Dunia Fantasi */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#FFFDF8]/92 backdrop-blur-md border-2 border-[#FDE68A] rounded-3xl p-5 sm:p-6 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#9D174D]">
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>Peta Pengembaraan Dunia Fantasi</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2E1654]">
              Enam Pulau Terapung Jejak Kasih Guru
            </h1>
            <p className="text-sm sm:text-base text-[#4C1D95]">
              Jelajahi pulau-pulau terapung yang dihubungkan oleh jambatan pelangi. Pilih pulau untuk melihat misi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div
              className={`px-4 py-2.5 rounded-2xl border-2 text-left ${
                allCompleted
                  ? 'bg-gradient-to-r from-[#FEF3C7] via-[#FFFBEB] to-[#FDE68A] border-[#F59E0B] shadow-[0_0_18px_rgba(251,191,36,0.5)]'
                  : 'bg-[#FAF5FF] border-[#DDD6FE]'
              }`}
            >
              <p className="text-xs font-semibold text-[#5B3E8E]">
                {allCompleted ? 'Status Pengembaraan' : 'Kemajuan Keseluruhan'}
              </p>
              {allCompleted ? (
                <div className="space-y-0.5">
                  <p className="inline-flex items-center gap-1.5 font-display text-base sm:text-lg font-bold text-[#92400E]">
                    <Flame className="w-4 h-4 fill-[#FBBF24] text-[#D97706] shrink-0" aria-hidden="true" />
                    <span>PENGEMBARAAN SELESAI</span>
                  </p>
                  <p className="text-xs font-bold text-[#4C1D95] tabular-nums">
                    {completedCount} / {MISSION_LOCATIONS.length} Misi Selesai · 6 Pelita Menyala Terang
                  </p>
                </div>
              ) : (
                <p className="font-display text-lg font-bold text-[#2E1654] tabular-nums">
                  {completedCount} / {MISSION_LOCATIONS.length} Misi Selesai
                </p>
              )}
            </div>

            {canViewCertificate && onOpenCertificate && (
              <button
                type="button"
                onClick={onOpenCertificate}
                className="btn-3d-primary px-5 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[48px] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
              >
                <Award className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>LIHAT SIJIL</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAchievementSummary}
              className="btn-3d-lavender px-4 sm:px-5 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[48px] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
            >
              <ClipboardList className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>RINGKASAN & REKOD</span>
            </button>

            <button
              type="button"
              onClick={onBackHome}
              className="btn-3d-sky px-5 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[48px] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7]"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Kembali ke Utama</span>
            </button>
          </div>
        </div>

        {/* Kanvas Peta 6 Pulau Terapung & Jambatan Pelangi */}
        <section
          aria-label="Peta Interaktif Enam Pulau Terapung"
          className="relative rounded-[32px] overflow-hidden border-4 border-white shadow-[0_24px_50px_-12px_rgba(46,22,84,0.32)] bg-gradient-to-br from-[#BAE6FD] via-[#E0F2FE] to-[#F3E8FF]"
        >
          <div className="relative w-full aspect-[16/9] min-h-[260px]">
            {!mapImgError ? (
              <img
                src={ASSETS.fantasyIslandsMap}
                alt="Peta dunia fantasi enam pulau terapung yang dihubungkan oleh jambatan pelangi untuk pengembaraan Suara Hati"
                referrerPolicy="no-referrer"
                onError={() => setMapImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7DD3FC] via-[#E9D5FF] to-[#FDE68A]">
                <p className="font-display text-2xl font-bold text-[#2E1654]">
                  Dunia Pulau Terapung Suara Hati
                </p>
              </div>
            )}

            {/* Bintang berkelip lembut atas peta */}
            <div
              className="animate-twinkle-star pointer-events-none hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-[#FFFBEB]/90 text-[#F59E0B] shadow-md absolute top-4 left-4"
              aria-hidden="true"
            >
              <Star className="w-4 h-4 fill-[#FBBF24]" />
            </div>

            {/* Penanda interaktif 6 pulau terapung */}
            <div className="hidden md:block absolute inset-0">
              {MISSION_LOCATIONS.map((mission) => {
                const isSelected = progress.lastVisitedMissionId === mission.id;
                const isMissionDone = progress.missions[mission.id] === 'Selesai';
                const isBrightLantern = allCompleted || isMissionDone;
                const theme = ISLAND_THEME_MAP[mission.colorScheme];

                return (
                  <button
                    key={mission.id}
                    type="button"
                    onClick={() => handleOpenMission(mission)}
                    style={{
                      left: `${mission.mapX}%`,
                      top: `${mission.mapY}%`,
                    }}
                    aria-label={`${mission.code}: ${mission.title} (${progress.missions[mission.id]})`}
                    className={`group -translate-x-1/2 -translate-y-1/2 absolute flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition-all duration-150 hover:scale-105 cursor-pointer min-h-[46px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                      allCompleted
                        ? 'bg-[#FFFBEB] border-[#F59E0B] text-[#3B1A08] ring-4 ring-[#FDE047]/80 shadow-[0_0_28px_rgba(251,191,36,0.9)]'
                        : isSelected
                        ? 'bg-[#FFFBEB] border-[#F59E0B] text-[#3B1A08] ring-4 ring-[#FBBF24]/75 shadow-[0_0_24px_rgba(251,191,36,0.75)] scale-105'
                        : isBrightLantern
                        ? 'bg-white/95 border-[#FBBF24] text-[#2E1654] shadow-[0_0_18px_rgba(251,191,36,0.55)] hover:border-[#F59E0B]'
                        : 'bg-white/95 border-white text-[#2E1654] shadow-[0_10px_22px_rgba(46,22,84,0.28)] hover:border-[#FDE68A]'
                    }`}
                  >
                    <span
                      className={`relative w-9 h-9 rounded-xl bg-gradient-to-br ${theme.pinAccent} text-white flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <MissionIcon icon={mission.icon} className="w-5 h-5" />
                      {isBrightLantern && (
                        <span
                          aria-hidden="true"
                          className="animate-lantern-glow -top-1.5 -right-1.5 absolute w-4 h-4 rounded-full bg-[#FEF08A] border border-[#D97706] flex items-center justify-center shadow-sm"
                        >
                          <Flame className="w-2.5 h-2.5 fill-[#F59E0B] text-[#B45309]" />
                        </span>
                      )}
                    </span>
                    <span className="text-left leading-tight whitespace-nowrap">
                      <span className="block text-[11px] font-bold text-[#9D174D]">
                        {mission.code}
                      </span>
                      <span className="block font-display text-sm font-bold">
                        {mission.title}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Jambatan Pelangi Penghubung & Senarai 6 Pulau Misi */}
        <section aria-label="Senarai Enam Pulau Pengembaraan" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white/85 backdrop-blur-sm rounded-2xl px-5 py-3.5 border border-[#DDD6FE]">
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-16 rounded-full bg-gradient-to-r from-[#A78BFA] via-[#F472B6] via-[#FBBF24] to-[#38BDF8] shrink-0"
                aria-hidden="true"
              />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]">
                Laluan Jambatan Pelangi — 6 Pulau Misi
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#5B3E8E]">
              Pilih pulau dan tekan Masuk Misi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MISSION_LOCATIONS.map((mission) => {
              const theme = ISLAND_THEME_MAP[mission.colorScheme];
              const missionStatus = progress.missions[mission.id] ?? 'Belum Bermula';
              const isSelected = progress.lastVisitedMissionId === mission.id;
              const isBrightLantern = allCompleted || missionStatus === 'Selesai';

              return (
                <article
                  key={mission.id}
                  className={`rounded-3xl p-5 border-2 shadow-md transition-all duration-150 flex flex-col justify-between gap-4 ${
                    theme.cardSurface
                  } ${theme.border} ${
                    allCompleted
                      ? 'ring-2 ring-[#FBBF24] shadow-[0_0_24px_rgba(251,191,36,0.42)]'
                      : isSelected
                      ? 'ring-4 ring-[#FBBF24]/70 shadow-[0_0_26px_rgba(251,191,36,0.45)]'
                      : 'hover:-translate-y-0.5 hover:shadow-lg'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`relative w-14 h-14 rounded-2xl ${theme.iconBox} ${theme.iconColor} border-2 border-white shadow-sm flex items-center justify-center shrink-0`}
                      >
                        <MissionIcon icon={mission.icon} className="w-7 h-7" />
                        {isBrightLantern && (
                          <span
                            aria-hidden="true"
                            className="animate-lantern-glow -top-1.5 -right-1.5 absolute w-5 h-5 rounded-full bg-[#FEF08A] border-2 border-[#F59E0B] flex items-center justify-center shadow"
                          >
                            <Flame className="w-3 h-3 fill-[#F59E0B] text-[#B45309]" />
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="block font-display text-sm font-bold text-[#9D174D]">
                          {mission.code}
                        </span>
                        <span className="block text-xs font-semibold text-[#5B3E8E]">
                          Pulau {mission.id} daripada 6
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]">
                        {mission.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-[#6D28D9] mt-0.5">
                        {mission.islandLandmark}
                      </p>
                      <p className="mt-2 text-sm sm:text-base leading-relaxed text-[#432C6B]">
                        {mission.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E9D5FF]/70 flex items-center justify-between gap-3">
                    {renderStatusBadge(missionStatus)}

                    <button
                      type="button"
                      onClick={() => handleOpenMission(mission)}
                      className={`${theme.enterBtn} px-4 py-2 rounded-xl font-display font-bold text-sm inline-flex items-center gap-1.5 min-h-[42px] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]`}
                    >
                      <Play className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Masuk Misi</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Sokongan Pembelajaran Berbeza: Mod Bimbingan / Standard / Cabaran */}
        <DifferentiatedSupportPanel
          learningMode={learningMode}
          onChangeMode={onChangeLearningMode}
        />

        {/* Bar Maklumat Privasi Tempatan & Kredit Sumber */}
        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-white/85 backdrop-blur-sm border border-[#DDD6FE] px-5 py-3.5 text-xs sm:text-sm text-[#432C6B]">
          <p className="font-medium leading-relaxed">
            Semua kemajuan, skor kuiz, refleksi serta rakaman audio/video murid hanya disimpan secara tempatan pada peranti ini dan tidak dihantar kepada mana-mana pelayan luar.
          </p>
          <button
            type="button"
            onClick={onOpenCredits}
            className="btn-3d-lavender px-4 py-2 rounded-xl font-display font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 min-h-[40px] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Kredit & Sumber</span>
          </button>
        </footer>
      </div>

      <MissionPreviewModal
        mission={selectedMission}
        status={
          selectedMission
            ? progress.missions[selectedMission.id] ?? 'Belum Bermula'
            : 'Belum Bermula'
        }
        onClose={() => setSelectedMission(null)}
      />
    </main>
  );
}
