import { BookOpen, CheckCircle2, ArrowLeft, X } from 'lucide-react';
import { useEffect } from 'react';
import { GAME_GUIDE_STEPS } from '../data/gameData';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCredits?: () => void;
}

export function GuideModal({ isOpen, onClose, onOpenCredits }: GuideModalProps) {
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
      aria-labelledby="guide-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border-2 border-[#DDD6FE] shadow-2xl p-6 sm:p-8 text-[#2B1948]">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#F3E8FF]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#6D28D9] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="guide-modal-title"
                className="font-display text-2xl sm:text-3xl font-bold text-[#3B1E6D]"
              >
                Panduan Permainan
              </h2>
              <p className="text-sm sm:text-base text-[#5B3E8E]">
                Langkah mudah memulakan pengembaraan Suara Hati
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel panduan"
            className="w-11 h-11 rounded-xl bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#3B1E6D] flex items-center justify-center transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <ol className="mt-6 space-y-4">
          {GAME_GUIDE_STEPS.map((item) => (
            <li
              key={item.step}
              className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF7FF] border border-[#E9D5FF]"
            >
              <span className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white font-display font-bold text-lg flex items-center justify-center shrink-0 tabular-nums">
                {item.step}
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-[#2E1654]">
                  {item.title}
                </h3>
                <p className="mt-1 text-base leading-relaxed text-[#432C6B]">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3">
          <CheckCircle2
            className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-sm sm:text-base text-[#78350F] leading-relaxed">
            <strong>Tip Wira Sajak:</strong> Pastikan kamu membaca setiap rangkap sajak dengan tenang dan penuh kasih sayang terhadap guru.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-[#F3E8FF] flex flex-wrap items-center justify-between gap-3">
          <div>
            {onOpenCredits && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCredits();
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#FAF5FF] hover:bg-[#EDE9FE] border border-[#DDD6FE] text-[#4C1D95] font-display font-bold text-sm inline-flex items-center gap-2 min-h-[44px] cursor-pointer"
              >
                <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Kredit & Sumber</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-3d-lavender px-6 py-2.5 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[44px] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
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
    </div>
  );
}
