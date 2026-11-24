import { ArrowLeft, Award, BookMarked, Target, X } from 'lucide-react';
import { useEffect } from 'react';
import { APP_INFO, LEARNING_OBJECTIVES } from '../data/gameData';

interface ObjectivesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ObjectivesModal({ isOpen, onClose }: ObjectivesModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22103D]/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="objectives-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border-2 border-[#FBCFE8] shadow-2xl p-6 sm:p-8 text-[#2B1948]">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#FCE7F3]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] text-[#BE185D] flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="objectives-modal-title"
                className="font-display text-2xl sm:text-3xl font-bold text-[#6B1340]"
              >
                Objektif Pembelajaran
              </h2>
              <p className="text-sm sm:text-base text-[#831843]">
                {APP_INFO.subject} · {APP_INFO.aspect}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel objektif"
            className="w-11 h-11 rounded-xl bg-[#FDF2F8] hover:bg-[#FCE7F3] text-[#831843] flex items-center justify-center transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DB2777]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Maklumat Standard Kurikulum */}
        <div className="mt-5 p-4 rounded-2xl bg-[#F8F5FF] border border-[#E9D5FF] space-y-2 text-sm sm:text-base">
          <div className="flex items-start gap-2.5">
            <BookMarked
              className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-[#2E1654]">
                <strong>Standard Kandungan:</strong> {APP_INFO.standardKandungan}
              </p>
              <p className="mt-1 text-[#2E1654]">
                <strong>Standard Pembelajaran:</strong> {APP_INFO.standardPembelajaran}
              </p>
              <p className="mt-1 text-[#4C1D95]">
                <strong>Teks Utama:</strong> Sajak <em>{APP_INFO.mainText}</em>
              </p>
            </div>
          </div>
        </div>

        {/* 3 Objektif Pembelajaran */}
        <div className="mt-6">
          <h3 className="font-display text-lg font-bold text-[#3B1E6D] mb-3">
            Pada akhir pengembaraan ini, murid dapat:
          </h3>
          <ol className="space-y-3.5">
            {LEARNING_OBJECTIVES.map((obj) => (
              <li
                key={obj.number}
                className="flex items-start gap-4 p-4 rounded-2xl bg-[#FFF9FB] border border-[#FBCFE8]"
              >
                <span className="w-9 h-9 rounded-xl bg-[#DB2777] text-white font-display font-bold text-lg flex items-center justify-center shrink-0 tabular-nums">
                  {obj.number}
                </span>
                <div>
                  <h4 className="font-display text-base sm:text-lg font-bold text-[#6B1340]">
                    {obj.title}
                  </h4>
                  <p className="mt-1 text-base leading-relaxed text-[#4A1D38]">
                    {obj.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center gap-3">
          <Award className="w-5 h-5 text-[#1D4ED8] shrink-0" aria-hidden="true" />
          <p className="text-sm sm:text-base text-[#1E3A8A]">
            Selesaikan keenam-enam misi dengan penuh penghayatan untuk menghidupkan kembali Pelita Kasih!
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-[#FCE7F3] flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-3d-rose px-6 py-2.5 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[44px] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DB2777]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali</span>
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
