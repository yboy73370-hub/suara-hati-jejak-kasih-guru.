import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Compass,
  Download,
  Flame,
  Info,
  Printer,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ASSETS, MISSION6_CERTIFICATE_TEXT } from '../data/gameData';
import {
  attemptDirectPrint,
  downloadCertificatePdf,
  PrintAttemptResult,
} from '../utils/certificatePdf';

interface CertificateModalProps {
  isOpen: boolean;
  studentName: string;
  issuedDate: string;
  initialPdfNotice?: boolean;
  initialPrintResult?: PrintAttemptResult | null;
  onClose: () => void;
  onBackToMap?: () => void;
}

interface FeedbackBanner {
  type: 'info' | 'warning' | 'success' | 'error';
  text: string;
}

export function CertificateModal({
  isOpen,
  studentName,
  issuedDate,
  initialPdfNotice = false,
  initialPrintResult = null,
  onClose,
  onBackToMap,
}: CertificateModalProps) {
  const [emblemError, setEmblemError] = useState(false);
  const [pdfNotice, setPdfNotice] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackBanner | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPdfNotice(false);
      setFeedback(null);
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Tetapkan kedudukan skrol ke bahagian paling atas & fokus tetingkap untuk skrol papan kekunci
    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.scrollTop = 0;
      scrollEl.focus({ preventScroll: true });
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setPdfNotice(initialPdfNotice);
    if (initialPrintResult) {
      if (initialPrintResult.status === 'blocked') {
        setFeedback({
          type: 'warning',
          text:
            initialPrintResult.message ??
            'Dialog cetakan pelayar disekat oleh persekitaran pratonton. Gunakan butang MUAT TURUN SIJIL SEBAGAI PDF.',
        });
      } else if (initialPrintResult.status === 'error') {
        setFeedback({
          type: 'error',
          text:
            initialPrintResult.message ??
            'Dialog cetakan gagal dibuka. Gunakan butang MUAT TURUN SIJIL SEBAGAI PDF.',
        });
      } else if (initialPdfNotice) {
        setFeedback({
          type: 'info',
          text: 'Dialog cetakan pelayar telah dipanggil. Pilih "Save as PDF" (Simpan sebagai PDF) pada ruangan Destination / Pencetak.',
        });
      } else {
        setFeedback({
          type: 'info',
          text: 'Dialog cetakan pelayar telah dipanggil.',
        });
      }
    } else {
      setFeedback(null);
    }
  }, [isOpen, initialPdfNotice, initialPrintResult]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Dipanggil secara LANGSUNG daripada tindakan klik pengguna (tanpa setTimeout/useEffect)
  const handleDirectPrintClick = (isPdfIntent: boolean) => {
    setPdfNotice(isPdfIntent);
    const result = attemptDirectPrint();
    if (result.status === 'blocked') {
      setFeedback({
        type: 'warning',
        text:
          result.message ??
          'Dialog cetakan disekat oleh persekitaran pratonton. Sila klik MUAT TURUN SIJIL SEBAGAI PDF.',
      });
      return;
    }
    if (result.status === 'error') {
      setFeedback({
        type: 'error',
        text:
          result.message ??
          'Cetakan terus tidak dapat dibuka. Sila klik MUAT TURUN SIJIL SEBAGAI PDF.',
      });
      return;
    }

    setFeedback({
      type: 'info',
      text: isPdfIntent
        ? 'Dialog cetakan dibuka. Pilih "Save as PDF" dan susun atur Landscape untuk menyimpan fail PDF.'
        : 'Dialog cetakan pelayar telah dibuka.',
    });
  };

  const handleDownloadRealPdf = () => {
    setPdfNotice(false);
    const result = downloadCertificatePdf({ studentName, issuedDate });
    if (result.ok) {
      setFeedback({
        type: 'success',
        text: `Fail PDF sijil (${result.filename}) telah berjaya dijana dan dimuat turun ke peranti anda.`,
      });
    } else {
      setFeedback({
        type: 'error',
        text:
          result.errorMessage ??
          'Gagal menjana fail PDF sijil. Sila cuba lagi.',
      });
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-main-heading"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="print-only-sheet fixed inset-0 z-50 bg-[#1E1033]/75 backdrop-blur-sm p-2 sm:p-5 flex items-center justify-center"
    >
      <div
        ref={scrollContainerRef}
        tabIndex={-1}
        aria-label="Tetingkap pratonton sijil digital boleh skrol"
        className="print-modal-window w-full max-w-[960px] max-h-[92dvh] overflow-y-auto overscroll-contain rounded-3xl bg-[#2E1654]/45 backdrop-blur-md border border-white/25 shadow-2xl px-3 pb-4 pt-0 sm:px-5 sm:pb-6 space-y-4 focus:outline-none"
      >
        {/* Bar Tindakan Kekal Kelihatan di Atas (Disembunyikan semasa CETAK / PDF) */}
        <div className="print:hidden sticky top-0 z-20 pt-3 sm:pt-4 pb-1 bg-gradient-to-b from-[#231042] via-[#231042]/95 to-transparent">
          <div className="rounded-2xl bg-white border-2 border-[#FCD34D] shadow-lg px-3.5 py-3 sm:px-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2 text-[#2E1654]">
                <Award className="w-5 h-5 text-[#D97706] shrink-0" aria-hidden="true" />
                <span className="font-display text-sm sm:text-base font-bold">
                  Sijil Digital A4 Landskap — Wira Suara Hati
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectPrintClick(false)}
                  className="btn-3d-primary px-3.5 sm:px-4 py-2 rounded-xl font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[42px] cursor-pointer"
                >
                  <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>CETAK SIJIL</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectPrintClick(true)}
                  className="btn-3d-sky px-3.5 sm:px-4 py-2 rounded-xl font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[42px] cursor-pointer"
                >
                  <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>SIMPAN SEBAGAI PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadRealPdf}
                  className="btn-3d-rose px-3.5 sm:px-4 py-2 rounded-xl font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[42px] cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>MUAT TURUN SIJIL SEBAGAI PDF</span>
                </button>

                {onBackToMap && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBackToMap();
                    }}
                    className="btn-3d-lavender px-3.5 sm:px-4 py-2 rounded-xl font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[42px] cursor-pointer"
                  >
                    <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>KEMBALI KE PETA MISI</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup paparan sijil"
                  className="px-3.5 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[42px] cursor-pointer"
                >
                  <X className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>TUTUP</span>
                </button>
              </div>
            </div>

            {feedback && (
              <div
                role={feedback.type === 'error' || feedback.type === 'warning' ? 'alert' : 'status'}
                className={`rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-start gap-2 ${
                  feedback.type === 'warning'
                    ? 'bg-[#FFFBEB] border-[#F59E0B] text-[#92400E]'
                    : feedback.type === 'error'
                    ? 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
                    : feedback.type === 'success'
                    ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                    : 'bg-[#F0F9FF] border-[#38BDF8] text-[#075985]'
                }`}
              >
                {feedback.type === 'warning' || feedback.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                ) : feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#059669]" aria-hidden="true" />
                ) : (
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#0284C7]" aria-hidden="true" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {pdfNotice && !feedback && (
              <div
                role="status"
                className="rounded-xl bg-[#F0F9FF] border border-[#38BDF8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#075985] flex items-start gap-2"
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#0284C7]" aria-hidden="true" />
                <span>
                  Pada ruangan <strong>Destination / Pencetak</strong>, pilih <strong>&ldquo;Save as PDF&rdquo;</strong> (Simpan sebagai PDF) dan tetapkan susun atur kepada <strong>Landscape</strong>. Anda juga boleh menekan <strong>MUAT TURUN SIJIL SEBAGAI PDF</strong>.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Lembaran Sijil Rasmi A4 Landskap (Responsif pada skrin, saiz A4 landskap semasa mencetak) */}
        <article className="print-a4-card relative w-full max-w-full overflow-hidden rounded-[28px] bg-[#FFFDF8] border-[8px] border-[#D97706] shadow-2xl p-3 sm:p-6 text-[#1E1033]">
          {/* Bingkai Emas & Ungu Dalaman (Kekal Jelas Walaupun Tanpa Grafik Latar Cetakan) */}
          <div className="print-a4-card-inner relative rounded-[20px] border-[3px] border-[#5B21B6] bg-gradient-to-br from-[#FFFBEB] via-[#FFFFFF] to-[#F5F3FF] px-4 py-5 sm:px-8 sm:py-7 flex flex-col justify-between gap-4 sm:gap-5 min-h-[420px] sm:min-h-[480px]">
            {/* Bintang Penjuru Hiasan */}
            <Star
              className="hidden sm:block absolute top-4 left-4 w-5 h-5 fill-[#FBBF24] text-[#D97706]"
              aria-hidden="true"
            />
            <Star
              className="hidden sm:block absolute top-4 right-4 w-5 h-5 fill-[#FBBF24] text-[#D97706]"
              aria-hidden="true"
            />
            <Star
              className="hidden sm:block absolute bottom-4 left-4 w-5 h-5 fill-[#FBBF24] text-[#D97706]"
              aria-hidden="true"
            />
            <Star
              className="hidden sm:block absolute bottom-4 right-4 w-5 h-5 fill-[#FBBF24] text-[#D97706]"
              aria-hidden="true"
            />

            {/* Bahagian Atas: Lencana Wira Suara Hati & Tajuk Sijil */}
            <header className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-[3px] border-[#D97706] bg-[#FEF3C7] flex items-center justify-center shrink-0">
                  {!emblemError ? (
                    <img
                      src={ASSETS.pelitaEmblem}
                      alt="Lencana Wira Suara Hati"
                      referrerPolicy="no-referrer"
                      onError={() => setEmblemError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Award className="w-10 h-10 text-[#B45309]" aria-hidden="true" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-bold tracking-wider text-[#9D174D] uppercase">
                    Lencana Wira Suara Hati
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[#5B21B6]">
                    Bahasa Melayu Tahun 5 · Seni Bahasa (4.2.2)
                  </p>
                </div>
              </div>

              <div className="pt-2 space-y-1">
                <h1
                  id="certificate-main-heading"
                  className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-wide text-[#4C1D95]"
                >
                  {MISSION6_CERTIFICATE_TEXT.heading}
                </h1>
                <p className="font-display text-xl sm:text-2xl font-bold tracking-wider text-[#B45309]">
                  {MISSION6_CERTIFICATE_TEXT.subheading}
                </p>
              </div>
            </header>

            {/* Bahagian Tengah: Teks Pengiktirafan & Nama Murid */}
            <div className="text-center space-y-3 max-w-3xl mx-auto px-2">
              <p className="text-base sm:text-lg font-semibold text-[#3B1E6D]">
                {MISSION6_CERTIFICATE_TEXT.line1}
              </p>

              <div className="py-2 px-4 border-b-[3px] border-[#D97706] inline-block min-w-[min(260px,100%)] sm:min-w-[min(420px,100%)] max-w-full">
                <p className="font-display text-2xl sm:text-4xl font-bold text-[#1E1033] break-words">
                  {studentName}
                </p>
              </div>

              <p className="text-base sm:text-lg font-medium text-[#2E1654] leading-relaxed">
                {MISSION6_CERTIFICATE_TEXT.line2}
              </p>

              <p className="font-display text-xl sm:text-2xl font-bold text-[#9D174D]">
                {MISSION6_CERTIFICATE_TEXT.programName}
              </p>

              <p className="text-sm sm:text-base font-medium text-[#3B1E6D] leading-relaxed max-w-2xl mx-auto">
                {MISSION6_CERTIFICATE_TEXT.line3}
              </p>
            </div>

            {/* Bahagian Bawah: Enam Simbol Pelita + Tarikh Sijil */}
            <footer className="pt-3 border-t-2 border-[#E9D5FF] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-[#5B3E8E] uppercase">Tarikh Sijil</p>
                <p className="font-display text-base sm:text-lg font-bold text-[#2E1654]">
                  {issuedDate}
                </p>
              </div>

              {/* Enam Simbol Pelita Bercahaya */}
              <div
                aria-label="Enam simbol pelita bercahaya menandakan enam misi selesai"
                className="flex items-center gap-2 sm:gap-2.5"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div
                    key={num}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FEF3C7] border-2 border-[#D97706] flex items-center justify-center text-[#B45309]"
                    title={`Pelita Cahaya ${num}`}
                  >
                    <Flame className="w-5 h-5 fill-[#FBBF24]" aria-hidden="true" />
                  </div>
                ))}
              </div>

              <div className="text-center sm:text-right">
                <p className="inline-flex items-center gap-1 text-xs font-bold text-[#9D174D] uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
                  <span>Istana Pelita Emas</span>
                </p>
                <p className="font-display text-sm sm:text-base font-bold text-[#4C1D95]">
                  6 / 6 Misi Selesai
                </p>
              </div>
            </footer>
          </div>
        </article>
      </div>
    </div>,
    document.body
  );
}
