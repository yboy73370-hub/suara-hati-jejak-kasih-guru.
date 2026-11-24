import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  Flame,
  HelpCircle,
  Heart,
  Lightbulb,
  RefreshCw,
  Save,
  Sparkles,
  Star,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import {
  ASSETS,
  GURUKU_PELITA_HIDUP_STANZAS,
  MISSION3_INFO,
  MISSION3_MAGIC_BOOKS,
  MISSION3_MEANING_MATCHES,
  MISSION3_QUIZ_QUESTIONS,
} from '../data/gameData';
import {
  MagicBookItem,
  MeaningMatchItem,
  Mission3SavedData,
  MissionStatus,
} from '../types/game';
import { musicEngine } from '../utils/audioEngine';
import { loadMission3Data, saveMission3Data } from '../utils/storage';

type Mission3Stage = 'babak1' | 'babak2' | 'babak3' | 'babak4' | 'kritis' | 'penamat';

interface Mission3ViewProps {
  missionStatus: MissionStatus;
  onCompleteMission: () => void;
  onBackToMap: () => void;
  onContinueToMission4: () => void;
}

const STAGE_LIST: Array<{ id: Mission3Stage; label: string; short: string }> = [
  { id: 'babak1', label: 'Babak 1: Selamat Datang', short: 'Babak 1' },
  { id: 'babak2', label: 'Babak 2: 4 Buku Ajaib', short: 'Babak 2' },
  { id: 'babak3', label: 'Babak 3: Padankan Makna', short: 'Babak 3' },
  { id: 'babak4', label: 'Babak 4: Kuiz Pelita', short: 'Babak 4' },
  { id: 'kritis', label: 'Cabaran Pemikiran Kritis', short: 'Kritis' },
  { id: 'penamat', label: 'Penamat Misi', short: 'Cahaya 3' },
];

const BOOK_STYLE_MAP: Record<
  MagicBookItem['colorScheme'],
  { card: string; badge: string; accent: string }
> = {
  lavender: {
    card: 'bg-gradient-to-br from-[#F5F3FF] to-white border-[#C4B5FD]',
    badge: 'bg-[#EDE9FE] text-[#5B21B6]',
    accent: 'text-[#6D28D9]',
  },
  sky: {
    card: 'bg-gradient-to-br from-[#F0F9FF] to-white border-[#7DD3FC]',
    badge: 'bg-[#E0F2FE] text-[#0369A1]',
    accent: 'text-[#0284C7]',
  },
  rose: {
    card: 'bg-gradient-to-br from-[#FFF1F7] to-white border-[#F9A8D4]',
    badge: 'bg-[#FCE7F3] text-[#9D174D]',
    accent: 'text-[#DB2777]',
  },
  mint: {
    card: 'bg-gradient-to-br from-[#ECFDF5] to-white border-[#6EE7B7]',
    badge: 'bg-[#D1FAE5] text-[#047857]',
    accent: 'text-[#059669]',
  },
};

function shuffleMeanings(items: MeaningMatchItem[]): MeaningMatchItem[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  // Elakkan susunan 1-2-3-4 tepat sama apabila hanya 4 item
  if (copy.every((item, idx) => item.stanzaNumber === idx + 1)) {
    [copy[0], copy[1]] = [copy[1], copy[0]];
  }
  return copy;
}

function isMeaningfulSentence(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 15) return false;
  const words = trimmed.split(/\s+/).filter((w) => w.length >= 2);
  return words.length >= 4;
}

export function Mission3View({
  missionStatus,
  onCompleteMission,
  onBackToMap,
  onContinueToMission4,
}: Mission3ViewProps) {
  const [savedData, setSavedData] = useState<Mission3SavedData>(() => loadMission3Data());
  const [stage, setStage] = useState<Mission3Stage>('babak1');
  const [libraryImgError, setLibraryImgError] = useState(false);
  const [emblemImgError, setEmblemImgError] = useState(false);

  // Babak 2: 4 Buku Ajaib
  const [activeBookId, setActiveBookId] = useState<number | null>(null);
  const [showMeaning, setShowMeaning] = useState<boolean>(false);

  // Babak 3: Padankan Cahaya Makna
  const [shuffledMeanings, setShuffledMeanings] = useState<MeaningMatchItem[]>(() =>
    shuffleMeanings(MISSION3_MEANING_MATCHES)
  );
  const [selectedStanzaNum, setSelectedStanzaNum] = useState<number | null>(null);
  const [selectedMeaningId, setSelectedMeaningId] = useState<string | null>(null);
  const [matchFeedback, setMatchFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Babak 4: Kuiz Pelita Bijaksana (5 soalan)
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<'A' | 'B' | 'C' | null>(null);
  const [quizAnswerCorrect, setQuizAnswerCorrect] = useState<boolean | null>(null);
  const [firstTryMap, setFirstTryMap] = useState<Record<number, boolean>>({});
  const [quizFinishedView, setQuizFinishedView] = useState<boolean>(
    savedData.quizLastScore !== null && savedData.quizBestScore >= 4
  );

  // Cabaran Pemikiran Kritis
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [criticalConfirmation, setCriticalConfirmation] = useState<string | null>(null);

  const persistMission3 = useCallback(
    (updater: (prev: Mission3SavedData) => Mission3SavedData) => {
      setSavedData((prev) => {
        const next = updater(prev);
        saveMission3Data(next);
        return next;
      });
    },
    []
  );

  const booksDone = savedData.openedBooks.length === 4;
  const matchingDone = savedData.matchedStanzas.length === 4;
  const quizPassed = savedData.quizBestScore >= 4;
  const criticalDone = savedData.criticalSaved;
  const allRequirementsMet = booksDone && matchingDone && quizPassed && criticalDone;

  const unlockedStageIndex = (() => {
    if (missionStatus === 'Selesai' || allRequirementsMet) return 5;
    if (quizPassed) return 4;
    if (matchingDone) return 3;
    if (booksDone) return 2;
    return 1; // Babak 1 & Babak 2 dibuka apabila memulakan misi
  })();

  const goToStage = (nextStage: Mission3Stage) => {
    setStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler Babak 2: Buka Buku Ajaib
  const handleOpenBook = (bookId: number) => {
    setActiveBookId(bookId);
    setShowMeaning(false);
    if (!savedData.openedBooks.includes(bookId)) {
      persistMission3((prev) => ({
        ...prev,
        openedBooks: Array.from(new Set([...prev.openedBooks, bookId])),
      }));
    }
  };

  const activeBook =
    MISSION3_MAGIC_BOOKS.find((b) => b.id === activeBookId) ?? null;

  // Handler Babak 3: Padankan Cahaya Makna
  const evaluateMeaningMatch = (stanzaNum: number, meaningId: string) => {
    if (savedData.matchedStanzas.includes(stanzaNum)) return;
    const targetMeaning = MISSION3_MEANING_MATCHES.find((m) => m.id === meaningId);
    if (!targetMeaning) return;

    if (targetMeaning.stanzaNumber === stanzaNum) {
      musicEngine.playSuccessChime();
      setMatchFeedback({
        type: 'success',
        message: `Tepat! Rangkap ${stanzaNum} berjaya dipadankan dengan maksudnya.`,
      });
      setSelectedStanzaNum(null);
      setSelectedMeaningId(null);
      persistMission3((prev) => ({
        ...prev,
        matchedStanzas: Array.from(new Set([...prev.matchedStanzas, stanzaNum])),
      }));
    } else {
      setMatchFeedback({
        type: 'error',
        message: `Belum tepat untuk Rangkap ${stanzaNum}. ${targetMeaning.hint}`,
      });
    }
  };

  const handleSelectStanzaForMatch = (stanzaNum: number) => {
    if (savedData.matchedStanzas.includes(stanzaNum)) return;
    setMatchFeedback(null);
    if (selectedMeaningId) {
      evaluateMeaningMatch(stanzaNum, selectedMeaningId);
    } else {
      setSelectedStanzaNum((prev) => (prev === stanzaNum ? null : stanzaNum));
    }
  };

  const handleSelectMeaningCard = (item: MeaningMatchItem) => {
    if (savedData.matchedStanzas.includes(item.stanzaNumber)) return;
    setMatchFeedback(null);
    if (selectedStanzaNum !== null) {
      evaluateMeaningMatch(selectedStanzaNum, item.id);
    } else {
      setSelectedMeaningId((prev) => (prev === item.id ? null : item.id));
    }
  };

  const handleRestartMatching = () => {
    setShuffledMeanings(shuffleMeanings(MISSION3_MEANING_MATCHES));
    setSelectedStanzaNum(null);
    setSelectedMeaningId(null);
    setMatchFeedback(null);
    persistMission3((prev) => ({
      ...prev,
      matchedStanzas: [],
    }));
  };

  // Handler Babak 4: Kuiz Pelita Bijaksana
  const currentQuizQuestion = MISSION3_QUIZ_QUESTIONS[quizIdx];

  const handleSelectQuizOption = (optId: 'A' | 'B' | 'C') => {
    if (quizAnswerCorrect === true) return;
    setSelectedQuizOption(optId);
    const isCorrect = optId === currentQuizQuestion.correctAnswer;
    setQuizAnswerCorrect(isCorrect);

    setFirstTryMap((prev) => {
      if (prev[currentQuizQuestion.id] !== undefined) return prev;
      return {
        ...prev,
        [currentQuizQuestion.id]: isCorrect,
      };
    });

    if (isCorrect) {
      musicEngine.playSuccessChime();
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIdx < MISSION3_QUIZ_QUESTIONS.length - 1) {
      setQuizIdx((prev) => prev + 1);
      setSelectedQuizOption(null);
      setQuizAnswerCorrect(null);
    } else {
      const calculatedScore = MISSION3_QUIZ_QUESTIONS.reduce((acc, q) => {
        return acc + (firstTryMap[q.id] ? 1 : 0);
      }, 0);

      persistMission3((prev) => ({
        ...prev,
        quizLastScore: calculatedScore,
        quizBestScore: Math.max(prev.quizBestScore, calculatedScore),
      }));
      setQuizFinishedView(true);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizIdx(0);
    setSelectedQuizOption(null);
    setQuizAnswerCorrect(null);
    setFirstTryMap({});
    setQuizFinishedView(false);
  };

  // Handler Cabaran Pemikiran Kritis
  const handleCriticalChange = (value: string) => {
    setCriticalError(null);
    setCriticalConfirmation(null);
    persistMission3((prev) => ({
      ...prev,
      criticalAnswer: value,
      criticalSaved: false,
    }));
  };

  const handleSaveCriticalAnswer = () => {
    if (!isMeaningfulSentence(savedData.criticalAnswer)) {
      setCriticalError(
        'Sila tulis sekurang-kurangnya satu ayat lengkap yang bermakna (contohnya menyatakan satu tindakan dan sebabnya).'
      );
      setCriticalConfirmation(null);
      return;
    }

    const nowIso = new Date().toISOString();
    persistMission3((prev) => ({
      ...prev,
      criticalSaved: true,
      savedAt: nowIso,
    }));

    setCriticalError(null);
    setCriticalConfirmation(
      'Jawapan kamu berjaya disimpan secara setempat dalam pelayar ini! Kamu boleh mengubahnya semula pada bila-bila masa.'
    );

    if (booksDone && matchingDone && quizPassed) {
      onCompleteMission();
      musicEngine.playSuccessChime();
    }
  };

  const handleOpenPenamat = () => {
    if (allRequirementsMet) {
      onCompleteMission();
      musicEngine.playSuccessChime();
      goToStage('penamat');
    }
  };

  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-[#7DD3FC] via-[#E0F2FE] to-[#F3E8FF] py-6 sm:py-8">
      {/* Awan hiasan lembut */}
      <div
        className="animate-cloud-drift pointer-events-none hidden md:block absolute top-6 left-8 opacity-75"
        aria-hidden="true"
      >
        <svg width="110" height="46" viewBox="0 0 118 52" fill="none">
          <path
            d="M24 44H95C105.5 44 114 35.8 114 25.5C114 15.9 106.5 8 97 7.1C93.5 2.8 88.2 0 82.2 0C73.4 0 65.9 6.1 63.9 14.3C61.4 13.1 58.6 12.4 55.6 12.4C45.3 12.4 36.9 20.6 36.7 30.8C35.2 30.4 33.6 30.2 32 30.2C23.2 30.2 16 36.4 16 44H24Z"
            fill="white"
            fillOpacity="0.82"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Bar Atas Misi 3 (Tiada istilah teknikal kepada murid) */}
        <section
          aria-label="Maklumat Misi 3"
          className="rounded-3xl bg-[#FFFDF8]/95 backdrop-blur-md border-2 border-[#7DD3FC] shadow-lg p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-bold text-[#0369A1]">
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                  <span>{MISSION3_INFO.code}: {MISSION3_INFO.title}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#5B21B6]">{MISSION3_INFO.location}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#9D174D]">Bahasa Melayu Tahun 5</span>
              </div>
              <p className="text-sm sm:text-base text-[#432C6B] font-medium">
                {MISSION3_INFO.purpose}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD]">
                <span className="block text-[11px] font-semibold text-[#0369A1]">
                  Status Misi
                </span>
                <span className="inline-flex items-center gap-1.5 font-display text-sm font-bold">
                  {missionStatus === 'Selesai' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
                      <span className="text-[#047857]">Selesai</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                      <span className="text-[#B45309]">{missionStatus}</span>
                    </>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={onBackToMap}
                className="btn-3d-sky px-4 py-2.5 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 min-h-[44px] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7]"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>KEMBALI KE PETA MISI</span>
              </button>
            </div>
          </div>

          {/* Navigasi Babak Misi 3 */}
          <nav aria-label="Kemajuan Babak Misi 3" className="pt-2 border-t border-[#E0F2FE]">
            <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {STAGE_LIST.map((item, idx) => {
                const isActive = item.id === stage;
                const isUnlocked = idx <= unlockedStageIndex;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => {
                        if (isUnlocked) goToStage(item.id);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-center transition-colors min-h-[40px] ${
                        isActive
                          ? 'bg-[#0284C7] text-white shadow-sm'
                          : isUnlocked
                          ? 'bg-[#E0F2FE] text-[#075985] hover:bg-[#BAE6FD] cursor-pointer'
                          : 'bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed'
                      }`}
                    >
                      <span className="hidden xl:inline">{item.label}</span>
                      <span className="xl:hidden">{item.short}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </section>

        {/* BABAK 1 – SELAMAT DATANG KE PERPUSTAKAAN AJAIB */}
        {stage === 'babak1' && (
          <section
            aria-labelledby="m3-babak1-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#BAE6FD] shadow-xl p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-[#EDE9FE] via-[#E0F2FE] to-[#D1FAE5] aspect-[4/3]">
                  {!libraryImgError ? (
                    <img
                      src={ASSETS.mission3Library}
                      alt="Perpustakaan Ajaib di atas pulau terapung dengan tangga kristal, jambatan pelangi, empat buku bercahaya, pelita emas dan guru pembimbing"
                      referrerPolicy="no-referrer"
                      onError={() => setLibraryImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <BookOpen className="w-12 h-12 text-[#0284C7] mb-2" aria-hidden="true" />
                      <p className="font-display text-xl font-bold text-[#075985]">
                        Perpustakaan Ajaib — Rahsia Pelita
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-[#0369A1]">
                    Babak 1 · Perpustakaan Ajaib dengan Buku Terapung
                  </p>
                  <h1
                    id="m3-babak1-heading"
                    className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
                  >
                    Selamat Datang ke Perpustakaan Ajaib!
                  </h1>
                </div>

                <div className="rounded-3xl bg-[#F0F9FF] border-2 border-[#7DD3FC] p-5 sm:p-6 space-y-2.5 shadow-inner">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0369A1]">
                    <Flame className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                    <span>Pesanan Guru Pembimbing</span>
                  </div>
                  <div className="space-y-2 text-base sm:text-[17px] leading-relaxed text-[#2B1948]">
                    <p className="font-bold text-[#4C1D95]">
                      “{MISSION3_INFO.welcomeDialog[0]}
                    </p>
                    <p>{MISSION3_INFO.welcomeDialog[1]}</p>
                    <p>{MISSION3_INFO.welcomeDialog[2]}</p>
                    <p>{MISSION3_INFO.welcomeDialog[3]}</p>
                    <p className="font-bold text-[#0369A1]">
                      {MISSION3_INFO.welcomeDialog[4]}”
                    </p>
                  </div>
                </div>

                {/* Objektif Khusus Misi 3 */}
                <div className="rounded-2xl bg-[#FAF7FF] border border-[#DDD6FE] p-4 space-y-1.5">
                  <p className="font-display text-sm font-bold text-[#5B21B6]">
                    Fokus Pembelajaran Misi Ini:
                  </p>
                  <ul className="space-y-1 text-sm text-[#432C6B] list-disc list-inside">
                    {MISSION3_INFO.objectives.map((obj) => (
                      <li key={obj}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
                  <button
                    type="button"
                    onClick={() => goToStage('babak2')}
                    className="btn-3d-primary px-6 py-3.5 rounded-2xl font-display font-bold text-base sm:text-lg inline-flex items-center justify-center gap-2 min-h-[52px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
                  >
                    <span>SAYA BERSEDIA!</span>
                    <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={onBackToMap}
                    className="btn-3d-sky px-5 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 min-h-[50px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7]"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>KEMBALI KE PETA MISI</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BABAK 2 – BUKA RAHSIA EMPAT RANGKAP */}
        {stage === 'babak2' && (
          <section
            aria-labelledby="m3-babak2-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#DDD6FE] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#F3E8FF] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#6D28D9]">
                  Babak 2 · Buka Rahsia Empat Rangkap
                </p>
                <h1
                  id="m3-babak2-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Terokai Empat Buku Ajaib Sajak
                </h1>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#ECFDF5] border-2 border-[#6EE7B7] font-display font-bold text-sm sm:text-base text-[#047857] shrink-0 tabular-nums">
                <BookOpen className="w-5 h-5" aria-hidden="true" />
                <span>{savedData.openedBooks.length}/4 Buku Diterokai</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#432C6B]">
              Tekan setiap buku ajaib di bawah untuk membaca rangkap sajak serta membongkar maksud dan nilainya. Buka keempat-empat buku untuk meneruskan perjalanan.
            </p>

            {/* 4 Buku Ajaib */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MISSION3_MAGIC_BOOKS.map((book) => {
                const isOpened = savedData.openedBooks.includes(book.id);
                const isActive = activeBookId === book.id;
                const style = BOOK_STYLE_MAP[book.colorScheme];

                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleOpenBook(book.id)}
                    aria-pressed={isActive}
                    className={`text-left rounded-3xl p-4 border-2 transition-all flex flex-col justify-between gap-3 min-h-[144px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                      isActive
                        ? 'bg-[#FFFBEB] border-[#F59E0B] ring-4 ring-[#FDE68A] shadow-lg'
                        : `${style.card} hover:-translate-y-1 shadow-sm hover:shadow-md`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold ${style.badge}`}
                      >
                        {book.stanzaLabel}
                      </span>
                      {isOpened ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#047857]">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          <span>Diterokai</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#64748B]">
                          Belum Dibuka
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 ${style.accent}`}>
                        <BookOpen className="w-5 h-5 shrink-0" aria-hidden="true" />
                        <span className="font-display text-base font-bold text-[#2E1654]">
                          {book.bookTitle}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#5B3E8E]">
                        {isActive ? 'Sedang dibuka di bawah' : 'Klik untuk buka buku'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Paparan Buku Terbuka */}
            {activeBook ? (
              <div className="rounded-3xl bg-gradient-to-br from-[#FFFDF7] via-[#FAF5FF] to-[#F0F9FF] border-2 border-[#C4B5FD] p-5 sm:p-7 shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E9D5FF] pb-3">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                      {activeBook.stanzaLabel} · Buku Terbuka
                    </p>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]">
                      {activeBook.bookTitle}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMeaning((prev) => !prev)}
                    className={`px-4 py-2.5 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 min-h-[44px] cursor-pointer shrink-0 ${
                      showMeaning ? 'btn-3d-rose' : 'btn-3d-primary'
                    }`}
                  >
                    {showMeaning ? (
                      <>
                        <EyeOff className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>SEMBUNYIKAN MAKSUD</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>TUNJUK MAKSUD</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-6 rounded-2xl bg-white border border-[#DDD6FE] p-5 space-y-2">
                    <h3 className="font-display text-sm font-bold text-[#6D28D9]">
                      Teks {activeBook.stanzaLabel}
                    </h3>
                    <div className="space-y-1.5 text-lg leading-relaxed font-semibold text-[#2E1654]">
                      {activeBook.lines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    {showMeaning ? (
                      <div className="rounded-2xl bg-[#FFFBEB] border-2 border-[#FCD34D] p-5 space-y-3">
                        <div>
                          <h3 className="font-display text-sm font-bold text-[#B45309]">
                            Maksud Rangkap
                          </h3>
                          <p className="mt-1 text-base leading-relaxed text-[#451A03] font-medium">
                            {activeBook.meaning}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-[#FDE68A]">
                          <h3 className="font-display text-sm font-bold text-[#9D174D]">
                            Nilai Murni
                          </h3>
                          <p className="mt-0.5 text-base font-bold text-[#6B1340]">
                            {activeBook.value}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-[#FDE68A]">
                          <h3 className="font-display text-sm font-bold text-[#0369A1]">
                            Penerangan Ringkas
                          </h3>
                          <p className="mt-0.5 text-sm sm:text-base text-[#1E3A8A]">
                            {activeBook.briefNote}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] p-6 text-center space-y-2">
                        <Lightbulb
                          className="w-8 h-8 text-[#D97706] mx-auto"
                          aria-hidden="true"
                        />
                        <p className="font-display text-base font-bold text-[#334155]">
                          Cuba fikirkan maksud rangkap ini dahulu!
                        </p>
                        <p className="text-sm text-[#475569]">
                          Kemudian tekan butang <strong>TUNJUK MAKSUD</strong> untuk menyemak maksud dan nilainya.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-[#FAF7FF] border-2 border-dashed border-[#C4B5FD] p-6 text-center text-[#5B3E8E] font-semibold">
                Pilih mana-mana daripada empat buku di atas untuk membukanya.
              </div>
            )}

            <div className="pt-4 border-t border-[#F3E8FF] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak1')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali</span>
              </button>

              {booksDone ? (
                <button
                  type="button"
                  onClick={() => goToStage('babak3')}
                  className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                >
                  <span>SETERUSNYA</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-sm font-bold text-[#9D174D]">
                  Buka kesemua 4 buku ajaib untuk meneruskan ke Babak 3.
                </p>
              )}
            </div>
          </section>
        )}

        {/* BABAK 3 – PADANKAN CAHAYA MAKNA */}
        {stage === 'babak3' && (
          <section
            aria-labelledby="m3-babak3-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#6EE7B7] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#D1FAE5] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#047857]">
                  Babak 3 · Padankan Cahaya Makna
                </p>
                <h1
                  id="m3-babak3-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Padankan Rangkap Sajak dengan Maksudnya
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#ECFDF5] border-2 border-[#6EE7B7] text-[#047857] font-display font-bold text-sm sm:text-base tabular-nums">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>{savedData.matchedStanzas.length} / 4 Padanan Berjaya</span>
                </div>

                <button
                  type="button"
                  onClick={handleRestartMatching}
                  className="btn-3d-lavender px-3.5 py-2 rounded-2xl font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[42px] cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  <span>Mula Semula</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] text-sm sm:text-base text-[#075985]">
              <strong>Cara Bermain:</strong> Pilih satu <strong>Kad Rangkap</strong> dan satu <strong>Kad Maksud</strong> yang sepadan. Kad yang betul akan bercahaya hijau dan dikunci!
            </div>

            {matchFeedback && (
              <div
                role="status"
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
                  matchFeedback.type === 'success'
                    ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                    : 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
                }`}
              >
                {matchFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-[#059669]" />
                ) : (
                  <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-[#DC2626]" />
                )}
                <p className="text-sm sm:text-base font-semibold">{matchFeedback.message}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Kad Rangkap */}
              <div className="lg:col-span-6 space-y-3">
                <h2 className="font-display text-lg font-bold text-[#3B1E6D]">
                  1. Pilih Kad Rangkap
                </h2>
                <div className="space-y-3">
                  {GURUKU_PELITA_HIDUP_STANZAS.map((stanza) => {
                    const isMatched = savedData.matchedStanzas.includes(stanza.number);
                    const isSelected = selectedStanzaNum === stanza.number;
                    const matchedMeaning = MISSION3_MEANING_MATCHES.find(
                      (m) => m.stanzaNumber === stanza.number
                    );

                    return (
                      <button
                        key={stanza.number}
                        type="button"
                        onClick={() => handleSelectStanzaForMatch(stanza.number)}
                        disabled={isMatched}
                        aria-pressed={isSelected}
                        className={`w-full text-left rounded-2xl p-4 border-2 transition-all space-y-1.5 ${
                          isMatched
                            ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] shadow-[0_0_16px_rgba(16,185,129,0.2)]'
                            : isSelected
                            ? 'bg-[#FFFBEB] border-[#F59E0B] ring-4 ring-[#FDE68A] text-[#2E1654] cursor-pointer'
                            : 'bg-white border-[#DDD6FE] hover:border-[#7C3AED] text-[#2B1948] cursor-pointer shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-sm font-bold text-[#6D28D9]">
                            {stanza.label}
                          </span>
                          {isMatched && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#047857]">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Padanan Selesai</span>
                            </span>
                          )}
                        </div>
                        <div className="text-sm sm:text-[15px] leading-snug font-medium">
                          {stanza.lines.map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                        {isMatched && matchedMeaning && (
                          <p className="pt-1.5 border-t border-[#A7F3D0] text-xs font-bold text-[#047857]">
                            Maksud: {matchedMeaning.meaningText}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kad Maksud (Susunan Rawak) */}
              <div className="lg:col-span-6 space-y-3">
                <h2 className="font-display text-lg font-bold text-[#075985]">
                  2. Pilih Kad Maksud yang Padan
                </h2>
                <div className="space-y-3">
                  {shuffledMeanings.map((item) => {
                    const isMatched = savedData.matchedStanzas.includes(item.stanzaNumber);
                    const isSelected = selectedMeaningId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectMeaningCard(item)}
                        disabled={isMatched}
                        aria-pressed={isSelected}
                        className={`w-full text-left rounded-2xl p-4 sm:p-5 border-2 transition-all flex items-start justify-between gap-3 min-h-[88px] ${
                          isMatched
                            ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] opacity-90'
                            : isSelected
                            ? 'bg-[#FFFBEB] border-[#F59E0B] ring-4 ring-[#FDE68A] text-[#2E1654] cursor-pointer shadow-md'
                            : 'bg-[#F0F9FF] border-[#7DD3FC] hover:border-[#0284C7] text-[#1E293B] cursor-pointer shadow-sm'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-base font-bold leading-relaxed">
                            {item.meaningText}
                          </p>
                          <p className="text-xs font-semibold opacity-80">
                            {isMatched
                              ? `Dipadankan dengan Rangkap ${item.stanzaNumber}`
                              : isSelected
                              ? 'Dipilih — klik Kad Rangkap yang padan'
                              : 'Klik untuk memilih maksud ini'}
                          </p>
                        </div>

                        {isMatched && (
                          <CheckCircle2
                            className="w-6 h-6 text-[#059669] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D1FAE5] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak2')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Babak 2</span>
              </button>

              {matchingDone ? (
                <button
                  type="button"
                  onClick={() => goToStage('babak4')}
                  className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                >
                  <span>SETERUSNYA KE KUIZ</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-sm font-bold text-[#047857]">
                  Selesaikan kesemua 4 padanan untuk meneruskan ke Kuiz Pelita Bijaksana.
                </p>
              )}
            </div>
          </section>
        )}

        {/* BABAK 4 – KUIZ PELITA BIJAKSANA */}
        {stage === 'babak4' && (
          <section
            aria-labelledby="m3-babak4-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#FDE68A] shadow-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#F3E8FF] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                  Babak 4 · Kuiz Pelita Bijaksana
                </p>
                <h1
                  id="m3-babak4-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Uji Kefahaman Rahsia Sajak
                </h1>
              </div>

              {!quizFinishedView && (
                <div className="px-4 py-2 rounded-2xl bg-[#FAF5FF] border border-[#DDD6FE] font-display font-bold text-sm sm:text-base text-[#4C1D95] tabular-nums shrink-0">
                  Soalan {quizIdx + 1} / {MISSION3_QUIZ_QUESTIONS.length}
                </div>
              )}
            </div>

            {!quizFinishedView ? (
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-[#FAF5FF] border-2 border-[#DDD6FE]">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]">
                    Soalan {currentQuizQuestion.id}: {currentQuizQuestion.question}
                  </h2>
                </div>

                <div className="space-y-3" role="group" aria-label="Pilihan Jawapan Kuiz">
                  {currentQuizQuestion.options.map((opt) => {
                    const isSelected = selectedQuizOption === opt.id;
                    const showGreen = isSelected && quizAnswerCorrect === true;
                    const showRed = isSelected && quizAnswerCorrect === false;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectQuizOption(opt.id)}
                        disabled={quizAnswerCorrect === true}
                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-base sm:text-lg flex items-center justify-between gap-4 transition-all min-h-[58px] ${
                          showGreen
                            ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] shadow-md'
                            : showRed
                            ? 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
                            : quizAnswerCorrect === true
                            ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] cursor-not-allowed'
                            : 'bg-white border-[#DDD6FE] hover:border-[#7C3AED] hover:bg-[#FAF5FF] text-[#2B1948] cursor-pointer shadow-sm'
                        }`}
                      >
                        <span className="flex items-center gap-3.5">
                          <span
                            className={`w-9 h-9 rounded-xl font-display font-bold flex items-center justify-center shrink-0 ${
                              showGreen
                                ? 'bg-[#10B981] text-white'
                                : showRed
                                ? 'bg-[#EF4444] text-white'
                                : 'bg-[#F3E8FF] text-[#5B21B6]'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </span>

                        {showGreen && (
                          <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0" />
                        )}
                        {showRed && (
                          <AlertCircle className="w-6 h-6 text-[#DC2626] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizAnswerCorrect === true && (
                  <div
                    role="status"
                    className="p-5 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] text-[#065F46] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-display font-bold text-lg">Jawapan Betul!</p>
                        <p className="text-sm sm:text-base mt-0.5">
                          {currentQuizQuestion.successFeedback}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextQuizQuestion}
                      className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center justify-center gap-2 min-h-[48px] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>
                        {quizIdx < MISSION3_QUIZ_QUESTIONS.length - 1
                          ? 'SOALAN SETERUSNYA'
                          : 'LIHAT SKOR AKHIR'}
                      </span>
                      <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                )}

                {quizAnswerCorrect === false && (
                  <div
                    role="status"
                    className="p-5 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-[#991B1B] flex items-start gap-3"
                  >
                    <AlertCircle className="w-6 h-6 text-[#DC2626] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-display font-bold text-lg">
                        Kurang tepat! Cuba lagi ya.
                      </p>
                      <p className="text-sm sm:text-base mt-1">
                        {currentQuizQuestion.hint}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Paparan Skor Akhir Kuiz (daripada 5 soalan) */
              <div className="rounded-3xl bg-gradient-to-b from-[#FAF5FF] to-white border-2 border-[#DDD6FE] p-6 text-center space-y-5">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FEF3C7] border-2 border-[#FCD34D] text-[#B45309] mx-auto">
                  <Award className="w-9 h-9" aria-hidden="true" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold text-[#6D28D9]">
                    Keputusan Kuiz Pelita Bijaksana
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654] tabular-nums">
                    Skor Akhir: {savedData.quizLastScore ?? savedData.quizBestScore} / 5
                  </h2>
                  <p className="text-sm font-semibold text-[#5B3E8E] tabular-nums">
                    Skor Terbaik Tersimpan: {savedData.quizBestScore} / 5 (Syarat Lulus: Sekurang-kurangnya 4 / 5)
                  </p>
                </div>

                {quizPassed ? (
                  <div className="p-4 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] text-[#065F46] font-semibold">
                    Tahniah! Kamu berjaya mencapai sekurang-kurangnya 4 daripada 5 soalan dengan tepat pada percubaan pertama dan lulus Kuiz Pelita Bijaksana!
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#F59E0B] text-[#78350F] font-semibold">
                    Skor kamu masih di bawah 4 / 5. Jangan risau, ulang semula kuiz ini dan pilih jawapan tepat pada percubaan pertama! Kemajuan Misi 1 dan Misi 2 kamu tetap selamat.
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRetakeQuiz}
                    className="btn-3d-lavender px-5 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[48px] cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    <span>Ulang Kuiz</span>
                  </button>

                  {quizPassed && (
                    <button
                      type="button"
                      onClick={() => goToStage('kritis')}
                      className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                    >
                      <span>SETERUSNYA: CABARAN KRITIS</span>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#F3E8FF] flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToStage('babak3')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Babak 3</span>
              </button>
            </div>
          </section>
        )}

        {/* CABARAN PEMIKIRAN KRITIS */}
        {stage === 'kritis' && (
          <section
            aria-labelledby="m3-kritis-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#C4B5FD] shadow-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6"
          >
            <div className="space-y-1 border-b border-[#F3E8FF] pb-4">
              <p className="text-xs sm:text-sm font-bold text-[#6D28D9]">
                Cabaran Pemikiran Kritis · Penghayatan Nilai
              </p>
              <h1
                id="m3-kritis-heading"
                className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
              >
                Tindakan Menghargai Jasa Guru
              </h1>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#F5F3FF] to-[#FFF1F7] border-2 border-[#DDD6FE] p-5 flex items-start gap-3.5">
              <HelpCircle
                className="w-6 h-6 text-[#DB2777] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="font-display text-lg sm:text-xl font-bold text-[#2E1654] leading-snug">
                “{MISSION3_INFO.criticalQuestion}”
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="critical-answer-input"
                className="block text-sm sm:text-base font-bold text-[#3B1E6D]"
              >
                Tulis jawapan kamu (sekurang-kurangnya satu ayat yang lengkap dan bermakna):
              </label>
              <textarea
                id="critical-answer-input"
                rows={4}
                value={savedData.criticalAnswer}
                onChange={(e) => handleCriticalChange(e.target.value)}
                placeholder="Contoh: Saya akan belajar bersungguh-sungguh dan sentiasa menghormati guru kerana ilmu yang diberi membantu saya berjaya pada masa hadapan."
                className="w-full rounded-2xl border-2 border-[#DDD6FE] bg-white px-4 py-3 text-base text-[#2B1948] placeholder:text-[#8E7AB5] focus:border-[#7C3AED] focus:outline-none"
              />
            </div>

            {criticalError && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-sm sm:text-base font-semibold text-[#991B1B] flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{criticalError}</span>
              </div>
            )}

            {(criticalConfirmation || savedData.criticalSaved) && (
              <div
                role="status"
                className="p-4 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] text-sm sm:text-base font-semibold text-[#065F46] flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#059669]" />
                <span>
                  {criticalConfirmation ??
                    'Jawapan kamu telah disimpan secara setempat dalam pelayar ini dan boleh diubah pada bila-bila masa.'}
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-[#F3E8FF] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak4')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Kuiz</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveCriticalAnswer}
                  className="btn-3d-sky px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                >
                  <Save className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>SIMPAN JAWAPAN</span>
                </button>

                {allRequirementsMet && (
                  <button
                    type="button"
                    onClick={handleOpenPenamat}
                    className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                  >
                    <span>PEROLEH CAHAYA KETIGA!</span>
                    <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* PENAMAT MISI 3 */}
        {stage === 'penamat' && (
          <section
            aria-labelledby="m3-penamat-heading"
            className="rounded-[32px] bg-gradient-to-b from-[#FFFBEB] via-[#FFFDF9] to-[#E0F2FE] border-4 border-[#FBBF24] shadow-2xl p-6 sm:p-10 max-w-3xl mx-auto text-center space-y-6"
          >
            {/* Animasi Pelita Bercahaya (Cahaya Ketiga) */}
            <div className="relative inline-flex items-center justify-center">
              <div
                className="animate-lantern-glow absolute -inset-8 rounded-full bg-[#FDE047]/85 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="animate-lantern-glow absolute -inset-4 rounded-full bg-[#38BDF8]/40 blur-lg"
                aria-hidden="true"
              />
              <div className="animate-lantern-glow relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-[0_0_40px_rgba(251,191,36,0.85)] bg-[#FEF3C7] flex items-center justify-center">
                {!emblemImgError ? (
                  <img
                    src={ASSETS.pelitaEmblem}
                    alt="Pelita Kasih menyala terang dengan Cahaya Ketiga"
                    referrerPolicy="no-referrer"
                    onError={() => setEmblemImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Heart className="w-16 h-16 fill-[#EC4899] text-[#EC4899]" aria-hidden="true" />
                )}
              </div>
              <div
                className="animate-twinkle-star absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white border-2 border-[#FBBF24] shadow-md flex items-center justify-center text-[#F59E0B]"
                aria-hidden="true"
              >
                <Star className="w-5 h-5 fill-[#FBBF24]" />
              </div>
              <div
                className="animate-twinkle-star absolute -bottom-2 -left-3 w-9 h-9 rounded-full bg-white border-2 border-[#38BDF8] shadow-md flex items-center justify-center text-[#0284C7]"
                aria-hidden="true"
              >
                <Star className="w-4 h-4 fill-[#38BDF8]" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/40 text-sm font-bold text-[#92400E]">
                <Award className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                <span>Misi 3 Selesai · Cahaya Ketiga Diperoleh</span>
              </div>

              <h1
                id="m3-penamat-heading"
                className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
              >
                {MISSION3_INFO.completionLines[0]}
              </h1>

              <p className="text-lg sm:text-xl font-bold text-[#9D174D] max-w-xl mx-auto">
                {MISSION3_INFO.completionLines[1]}
              </p>

              <p className="text-lg font-extrabold text-[#B45309]">
                {MISSION3_INFO.completionLines[2]}
              </p>

              <p className="text-base sm:text-lg font-semibold text-[#4C1D95]">
                {MISSION3_INFO.completionLines[3]}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
              <button
                type="button"
                onClick={onBackToMap}
                className="btn-3d-sky px-6 py-3.5 rounded-2xl font-display font-bold text-base inline-flex items-center justify-center gap-2 min-h-[52px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7]"
              >
                <Compass className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>KEMBALI KE PETA MISI</span>
              </button>

              <button
                type="button"
                onClick={onContinueToMission4}
                className="btn-3d-primary px-6 py-3.5 rounded-2xl font-display font-bold text-base inline-flex items-center justify-center gap-2 min-h-[52px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
              >
                <span>TERUSKAN KE MISI 4</span>
                <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
