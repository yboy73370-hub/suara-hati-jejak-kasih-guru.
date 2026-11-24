import { BookOpen, Flame, Flower2, Printer, Sparkles, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ASSETS } from '../data/gameData';

interface AppreciationCardModalProps {
  isOpen: boolean;
  studentName: string;
  teacherName: string;
  message: string;
  onClose: () => void;
  onPrintCard: () => void;
}

export function AppreciationCardModal({
  isOpen,
  studentName,
  teacherName,
  message,
  onClose,
  onPrintCard,
}: AppreciationCardModalProps) {
  const [emblemError, setEmblemError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appreciation-card-title"
      className="print-only-sheet fixed inset-0 z-50 overflow-y-auto bg-[#2E1654]/65 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center"
    >
      <div className="w-full max-w-3xl space-y-4">
        {/* Bar Kawalan Skrin Sahaja (Disembunyikan semasa mencetak) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl px-5 py-3.5 shadow-lg border-2 border-[#FCD34D]">
          <p className="font-display text-sm sm:text-base font-bold text-[#2E1654]">
            Pratonton Kad Penghargaan Digital
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onPrintCard}
              className="btn-3d-primary px-4 py-2 rounded-xl font-display font-bold text-sm inline-flex items-center gap-2 min-h-[42px] cursor-pointer"
            >
              <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>CETAK KAD</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-3d-lavender px-4 py-2 rounded-xl font-display font-bold text-sm inline-flex items-center gap-1.5 min-h-[42px] cursor-pointer"
            >
              <X className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Tutup</span>
            </button>
          </div>
        </div>

        {/* Kad Penghargaan Digital Boleh Cetak */}
        <article className="print-greeting-card relative overflow-hidden rounded-[32px] bg-[#FFFDF9] border-[6px] border-[#F59E0B] shadow-2xl p-6 sm:p-10 text-[#2E1654]">
          {/* Bingkai Dalaman */}
          <div className="rounded-[24px] border-2 border-dashed border-[#DB2777]/55 bg-gradient-to-br from-[#FFFBEB] via-[#FFFFFF] to-[#FFF1F7] p-6 sm:p-8 space-y-6">
            {/* Bar Hiasan Atas: Bunga, Pelita, Buku & Bintang */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[#DB2777]" aria-hidden="true">
                <Flower2 className="w-7 h-7" />
                <Star className="w-5 h-5 fill-[#FBBF24] text-[#F59E0B]" />
              </div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#F59E0B] bg-[#FEF3C7] flex items-center justify-center shrink-0">
                {!emblemError ? (
                  <img
                    src={ASSETS.pelitaEmblem}
                    alt="Pelita Kasih Guru"
                    referrerPolicy="no-referrer"
                    onError={() => setEmblemError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Flame className="w-9 h-9 text-[#D97706]" aria-hidden="true" />
                )}
              </div>

              <div className="flex items-center gap-2 text-[#6D28D9]" aria-hidden="true">
                <Star className="w-5 h-5 fill-[#FBBF24] text-[#F59E0B]" />
                <BookOpen className="w-7 h-7" />
              </div>
            </div>

            <header className="text-center space-y-1.5 border-b-2 border-[#FDE68A] pb-4">
              <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#9D174D]">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                <span>SURAT KASIH DARIPADA WIRA SUARA HATI</span>
                <Sparkles className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
              </p>
              <h2
                id="appreciation-card-title"
                className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
              >
                Kad Penghargaan Untuk Guru Tersayang
              </h2>
            </header>

            <div className="space-y-4 text-base sm:text-lg leading-relaxed">
              <p className="font-display font-bold text-lg sm:text-xl text-[#9D174D]">
                Kepada: <span className="text-[#2E1654] underline decoration-[#F59E0B]/60 underline-offset-4">{teacherName}</span>
              </p>

              <div className="rounded-2xl bg-white border-2 border-[#DDD6FE] p-5 sm:p-6 min-h-[150px] whitespace-pre-wrap text-[#1E1033] font-medium leading-relaxed">
                {message}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pt-2">
                <p className="text-xs sm:text-sm font-semibold text-[#5B3E8E]">
                  Diilhamkan daripada Sajak <em>Guruku Pelita Hidup</em>
                </p>
                <p className="font-display text-lg font-bold text-[#4C1D95]">
                  Daripada: <span className="text-[#2E1654]">{studentName}</span>
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>,
    document.body
  );
}
