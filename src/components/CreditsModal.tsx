import { BookOpen, Info, ShieldCheck, X } from 'lucide-react';
import { useEffect } from 'react';
import { APP_CREDITS_AND_SOURCES } from '../data/gameData';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="credits-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#22103D]/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-3xl max-h-[90dvh] flex flex-col rounded-3xl bg-white border-2 border-[#DDD6FE] shadow-2xl overflow-hidden text-[#2B1948]">
        <div className="px-5 py-4 sm:px-7 sm:py-5 border-b border-[#EDE9FE] bg-[#FAF5FF] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="credits-modal-title"
                className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]"
              >
                Kredit & Sumber Bahan Aplikasi
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#5B3E8E]">
                Maklumat bahan video, audio, imej, kurikulum dan teknologi yang digunakan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel kredit dan sumber"
            className="w-10 h-10 rounded-xl bg-white hover:bg-[#F3E8FF] border border-[#DDD6FE] text-[#3B1E6D] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
          {APP_CREDITS_AND_SOURCES.map((group) => (
            <section
              key={group.category}
              className="rounded-2xl bg-[#FAF8FF] border border-[#E9D5FF] p-4 sm:p-5 space-y-2"
            >
              <h3 className="font-display text-base sm:text-lg font-bold text-[#4C1D95] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#7C3AED] shrink-0" aria-hidden="true" />
                <span>{group.category}</span>
              </h3>
              <ul className="space-y-1.5 text-sm text-[#2B1948] list-disc list-inside leading-relaxed">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}

          <div className="rounded-2xl bg-[#ECFDF5] border border-[#6EE7B7] p-4 flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#065F46]">
            <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Semua data latihan, rakaman suara/video, skor kuiz, rubrik dan refleksi hanya disimpan secara setempat di dalam pelayar pengguna dan tidak dihantar kepada guru atau mana-mana pelayan luar.
            </span>
          </div>
        </div>

        <div className="px-5 py-3.5 sm:px-7 border-t border-[#EDE9FE] bg-[#FAF8FF] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-3d-lavender px-6 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base min-h-[44px] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
