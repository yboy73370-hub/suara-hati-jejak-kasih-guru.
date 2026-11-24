import { ArrowLeft, Clock, Lock, Sparkles, X } from 'lucide-react';
import { useEffect } from 'react';
import { MissionLocation, MissionStatus } from '../types/game';
import { MissionIcon } from './MissionIcon';

interface MissionPreviewModalProps {
  mission: MissionLocation | null;
  status: MissionStatus;
  onClose: () => void;
}

export function MissionPreviewModal({
  mission,
  status,
  onClose,
}: MissionPreviewModalProps) {
  useEffect(() => {
    if (!mission) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mission, onClose]);

  if (!mission) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22103D]/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-preview-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-3xl bg-white border-2 border-[#DDD6FE] shadow-2xl p-6 sm:p-8 text-[#2B1948]">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#F3E8FF]">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#F3E8FF] to-[#FCE7F3] border border-[#DDD6FE] text-[#6D28D9] flex items-center justify-center shrink-0">
              <MissionIcon icon={mission.icon} className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                {mission.code} · {mission.islandLandmark}
              </p>
              <h2
                id="mission-preview-title"
                className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
              >
                {mission.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup paparan misi"
            className="w-11 h-11 rounded-xl bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#3B1E6D] flex items-center justify-center transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Status Kemajuan Sebenar */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF7FF] border border-[#E9D5FF]">
            <span className="text-sm font-semibold text-[#5B3E8E]">
              Status Kemajuan Semasa
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3B1E6D]">
              <Clock className="w-4 h-4 text-[#7C3AED]" aria-hidden="true" />
              <span>{status}</span>
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-[#3B1E6D]">
              Tentang Lokasi Ini
            </h3>
            <p className="text-base leading-relaxed text-[#2B1948]">
              {mission.shortDesc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#92400E]">
              <Sparkles className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
              <span>Aktiviti yang Bakal Diterokai</span>
            </div>
            <p className="text-sm sm:text-base text-[#78350F] leading-relaxed">
              {mission.upcomingFocus}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-[#1E3A8A] leading-relaxed">
              Aktiviti interaktif lengkap bagi <strong>{mission.code}: {mission.title}</strong> akan dibuka pada peringkat pembangunan seterusnya. Kemajuan hanya akan ditandakan selesai selepas kamu menyiapkan tugasan sebenar.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#F3E8FF] flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-3d-sky px-6 py-2.5 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[44px] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Peta Misi</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-3d-primary px-6 py-2.5 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[44px] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
          >
            <span>Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
