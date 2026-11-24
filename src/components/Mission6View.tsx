import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  Compass,
  Download,
  Flame,
  Heart,
  HelpCircle,
  PenLine,
  Printer,
  RefreshCw,
  Save,
  Sparkles,
  Square,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  ASSETS,
  MISSION6_INFO,
  MISSION6_QUIZ_QUESTIONS,
  MISSION6_REFLECTION_CHECKLIST,
  MISSION6_REFLECTION_QUESTIONS,
} from '../data/gameData';
import { Mission6SavedData, MissionStatus, Quiz4OptionId } from '../types/game';
import { musicEngine } from '../utils/audioEngine';
import { downloadCertificatePdf } from '../utils/certificatePdf';
import { loadMission6Data, saveMission6Data } from '../utils/storage';
import { AppreciationCardModal } from './AppreciationCardModal';

type Mission6Stage = 'babak1' | 'babak2' | 'babak3' | 'babak4' | 'babak5';

interface Mission6ViewProps {
  missionStatus: MissionStatus;
  onCompleteMission: () => void;
  onBackToMap: () => void;
  onOpenCertificate: (
    confirmedName: string,
    issuedDate: string,
    mode: 'view' | 'print' | 'pdf'
  ) => void;
  onCardModalOpenChange: (isOpen: boolean) => void;
  onOpenAchievementSummary?: () => void;
}

const STAGE_LIST: Array<{ id: Mission6Stage; label: string; short: string }> = [
  { id: 'babak1', label: 'Babak 1: Gerbang Cahaya', short: 'Babak 1' },
  { id: 'babak2', label: 'Babak 2: Kuiz Permata Ilmu', short: 'Kuiz' },
  { id: 'babak3', label: 'Babak 3: Surat Kasih Guru', short: 'Surat Kasih' },
  { id: 'babak4', label: 'Babak 4: Cermin Kenangan', short: 'Refleksi' },
  { id: 'babak5', label: 'Babak 5: Istiadat Pelita Emas', short: 'Pelita Emas' },
];

function countWords(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function isMeaningfulText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 8) return false;
  const words = trimmed.split(/\s+/).filter((w) => w.length >= 2);
  return words.length >= 2;
}

function formatMalayDate(isoString: string | null): string {
  const date = isoString ? new Date(isoString) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  try {
    return new Intl.DateTimeFormat('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(safeDate);
  } catch {
    return safeDate.toLocaleDateString();
  }
}

export function Mission6View({
  missionStatus,
  onCompleteMission,
  onBackToMap,
  onOpenCertificate,
  onCardModalOpenChange,
  onOpenAchievementSummary,
}: Mission6ViewProps) {
  const [savedData, setSavedData] = useState<Mission6SavedData>(() => loadMission6Data());
  const [stage, setStage] = useState<Mission6Stage>('babak1');
  const [palaceImgError, setPalaceImgError] = useState(false);
  const [emblemImgError, setEmblemImgError] = useState(false);

  // Babak 2: Kuiz Permata Ilmu (6 soalan, 4 pilihan)
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<Quiz4OptionId | null>(null);
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
  const [firstTryMap, setFirstTryMap] = useState<Record<number, boolean>>({});
  const [showQuizSummary, setShowQuizSummary] = useState<boolean>(
    savedData.quizCompleted
  );

  // Babak 3: Surat Kasih Untuk Guru & Kad Digital
  const [letterError, setLetterError] = useState<string | null>(null);
  const [letterNotice, setLetterNotice] = useState<string | null>(null);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);

  // Babak 4: Cermin Kenangan
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [reflectionNotice, setReflectionNotice] = useState<string | null>(null);

  // Babak 5: Istiadat Pelita Emas & Pengesahan Nama Sijil
  const [nameInput, setNameInput] = useState<string>(
    () => savedData.certificateConfirmedName || savedData.studentName
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [applauseMuted, setApplauseMuted] = useState<boolean>(false);
  const [certDownloadFeedback, setCertDownloadFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const persistMission6 = useCallback(
    (updater: (prev: Mission6SavedData) => Mission6SavedData) => {
      setSavedData((prev) => {
        const next = updater(prev);
        saveMission6Data(next);
        return next;
      });
    },
    []
  );

  useEffect(() => {
    onCardModalOpenChange(showCardModal);
    return () => onCardModalOpenChange(false);
  }, [showCardModal, onCardModalOpenChange]);

  useEffect(() => {
    return () => {
      musicEngine.stopApplause();
    };
  }, []);

  // Syarat lengkap 5 kriteria Misi 6 (Bahagian J)
  const quizDone = savedData.quizCompleted;
  const letterDone =
    savedData.letterSaved &&
    savedData.studentName.trim().length >= 2 &&
    savedData.teacherName.trim().length >= 2 &&
    countWords(savedData.appreciationMessage) >= 15;
  const checklistDone = MISSION6_REFLECTION_CHECKLIST.every((item) =>
    savedData.checkedReflectionIds.includes(item.id)
  );
  const reflectionDone =
    savedData.reflectionSaved &&
    checklistDone &&
    isMeaningfulText(savedData.reflectionQ1) &&
    isMeaningfulText(savedData.reflectionQ2) &&
    isMeaningfulText(savedData.reflectionQ3) &&
    isMeaningfulText(savedData.reflectionQ4);
  const nameConfirmedDone =
    savedData.certificateNameConfirmed &&
    savedData.certificateConfirmedName.trim().length >= 2;

  const allRequirementsMet =
    quizDone && letterDone && reflectionDone && nameConfirmedDone;

  // Pembukaan tahap berperingkat
  const unlockedStageIndex = (() => {
    if (quizDone && letterDone && reflectionDone) return 4;
    if (quizDone && letterDone) return 3;
    if (quizDone) return 2;
    return 1; // Babak 1 & Babak 2 dibuka apabila memulakan misi
  })();

  const goToStage = (nextStage: Mission6Stage) => {
    setStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler Babak 2: Kuiz Permata Ilmu
  const currentQuestion = MISSION6_QUIZ_QUESTIONS[quizIdx];

  const handleSelectQuizOption = (optId: Quiz4OptionId) => {
    if (answerCorrect === true) return;
    setSelectedOption(optId);
    const isCorrect = optId === currentQuestion.correctAnswer;
    setAnswerCorrect(isCorrect);

    setFirstTryMap((prev) => {
      if (prev[currentQuestion.id] !== undefined) return prev;
      return {
        ...prev,
        [currentQuestion.id]: isCorrect,
      };
    });

    if (isCorrect) {
      musicEngine.playSuccessChime();
    }
  };

  const handleNextQuestion = () => {
    if (quizIdx < MISSION6_QUIZ_QUESTIONS.length - 1) {
      setQuizIdx((prev) => prev + 1);
      setSelectedOption(null);
      setAnswerCorrect(null);
    } else {
      const score = MISSION6_QUIZ_QUESTIONS.reduce(
        (acc, q) => acc + (firstTryMap[q.id] ? 1 : 0),
        0
      );
      persistMission6((prev) => ({
        ...prev,
        quizCompleted: true,
        quizLastScore: score,
        quizBestScore: Math.max(prev.quizBestScore, score),
        savedAt: new Date().toISOString(),
      }));
      setShowQuizSummary(true);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizIdx(0);
    setSelectedOption(null);
    setAnswerCorrect(null);
    setFirstTryMap({});
    setShowQuizSummary(false);
  };

  // Handler Babak 3: Surat Kasih Untuk Guru
  const messageWordCount = countWords(savedData.appreciationMessage);

  const validateAndSaveLetter = (): boolean => {
    if (savedData.studentName.trim().length < 2) {
      setLetterError('Sila masukkan nama kamu pada ruangan Nama murid.');
      setLetterNotice(null);
      return false;
    }
    if (savedData.teacherName.trim().length < 2) {
      setLetterError('Sila masukkan nama guru yang ingin kamu hargai.');
      setLetterNotice(null);
      return false;
    }
    if (messageWordCount < 15) {
      setLetterError(
        'Ucapan penghargaan masih terlalu pendek. Tuliskan ucapan ikhlas sekurang-kurangnya 15 patah perkataan (disarankan 40 hingga 100 patah perkataan mengikut tiga panduan di sebelah).'
      );
      setLetterNotice(null);
      return false;
    }

    const trimmedStudent = savedData.studentName.trim();
    persistMission6((prev) => ({
      ...prev,
      letterSaved: true,
      certificateConfirmedName:
        prev.certificateConfirmedName || trimmedStudent,
      savedAt: new Date().toISOString(),
    }));
    if (!nameInput.trim()) {
      setNameInput(trimmedStudent);
    }
    setLetterError(null);
    setLetterNotice(
      'Ucapan penghargaan kamu berjaya disimpan secara setempat! Kamu boleh melihat atau mencetak kad penghargaan sekarang.'
    );
    musicEngine.playSuccessChime();
    return true;
  };

  const handleOpenAppreciationCard = () => {
    if (!letterDone) {
      const ok = validateAndSaveLetter();
      if (!ok) return;
    }
    setShowCardModal(true);
  };

  const handlePrintAppreciationCard = () => {
    if (!letterDone) {
      const ok = validateAndSaveLetter();
      if (!ok) return;
    }
    setShowCardModal(true);
    window.setTimeout(() => {
      window.print();
    }, 100);
  };

  // Handler Babak 4: Cermin Kenangan
  const handleToggleReflectionCheck = (checkId: string) => {
    setReflectionError(null);
    setReflectionNotice(null);
    persistMission6((prev) => {
      const exists = prev.checkedReflectionIds.includes(checkId);
      return {
        ...prev,
        checkedReflectionIds: exists
          ? prev.checkedReflectionIds.filter((id) => id !== checkId)
          : Array.from(new Set([...prev.checkedReflectionIds, checkId])),
        reflectionSaved: false,
      };
    });
  };

  const handleSaveReflection = () => {
    if (
      !isMeaningfulText(savedData.reflectionQ1) ||
      !isMeaningfulText(savedData.reflectionQ2) ||
      !isMeaningfulText(savedData.reflectionQ3) ||
      !isMeaningfulText(savedData.reflectionQ4)
    ) {
      setReflectionError(
        'Sila tulis jawapan yang lengkap dan bermakna bagi kesemua 4 soalan refleksi.'
      );
      setReflectionNotice(null);
      return;
    }

    if (!checklistDone) {
      setReflectionError(
        'Sila lengkapkan kesemua 5 perkara dalam senarai semak refleksi pembelajaran.'
      );
      setReflectionNotice(null);
      return;
    }

    persistMission6((prev) => ({
      ...prev,
      reflectionSaved: true,
      savedAt: new Date().toISOString(),
    }));
    setReflectionError(null);
    setReflectionNotice(
      'Refleksi dan senarai semak Cermin Kenangan berjaya disimpan secara setempat!'
    );
    musicEngine.playSuccessChime();
  };

  // Handler Babak 5: Pengesahan Nama & Penamat Misi 6
  const handleConfirmCertificateName = () => {
    const cleanName = nameInput.trim();
    if (cleanName.length < 2) {
      setNameError('Sila masukkan nama penuh kamu untuk dipaparkan pada sijil.');
      return;
    }
    setNameError(null);
    const issuedIso = savedData.certificateIssuedAt ?? new Date().toISOString();
    persistMission6((prev) => ({
      ...prev,
      certificateConfirmedName: cleanName,
      certificateNameConfirmed: true,
      certificateIssuedAt: issuedIso,
      savedAt: new Date().toISOString(),
    }));

    if (quizDone && letterDone && reflectionDone) {
      onCompleteMission();
      if (!applauseMuted) {
        musicEngine.playApplauseCelebration();
      }
    }
  };

  const handleToggleApplauseSound = () => {
    setApplauseMuted((prev) => {
      const nextMuted = !prev;
      if (nextMuted) {
        musicEngine.stopApplause();
      } else {
        musicEngine.playApplauseCelebration();
      }
      return nextMuted;
    });
  };

  const formattedCertDate = formatMalayDate(savedData.certificateIssuedAt);

  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-[#FEF3C7]/75 via-[#FCE7F3]/55 to-[#EDE9FE] py-6 sm:py-8">
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

      <div className="relative z-10 max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Bar Atas Misi 6 */}
        <section
          aria-label="Maklumat Misi 6"
          className="rounded-3xl bg-[#FFFDF8]/95 backdrop-blur-md border-2 border-[#FACC15] shadow-lg p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-bold text-[#B45309]">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-[#FBBF24] text-[#D97706]" aria-hidden="true" />
                  <span>
                    {MISSION6_INFO.code}: {MISSION6_INFO.title}
                  </span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#5B21B6]">{MISSION6_INFO.location}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#9D174D]">Bahasa Melayu Tahun 5</span>
              </div>
              <p className="text-sm sm:text-base text-[#432C6B] font-medium">
                {MISSION6_INFO.purpose}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-2xl bg-[#FEFCE8] border border-[#FACC15]">
                <span className="block text-[11px] font-semibold text-[#92400E]">
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

          {/* Navigasi Babak Misi 6 */}
          <nav aria-label="Kemajuan Babak Misi 6" className="pt-2 border-t border-[#FEF3C7]">
            <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
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
                          ? 'bg-[#B45309] text-white shadow-sm'
                          : isUnlocked
                          ? 'bg-[#FEF3C7] text-[#78350F] hover:bg-[#FDE68A] cursor-pointer'
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

        {/* BABAK 1 – GERBANG CAHAYA TERAKHIR */}
        {stage === 'babak1' && (
          <section
            aria-labelledby="m6-babak1-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#FACC15] shadow-xl p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-[#FEF3C7] via-[#FCE7F3] to-[#EDE9FE] aspect-[4/3]">
                  {!palaceImgError ? (
                    <img
                      src={ASSETS.mission6Palace}
                      alt="Istana Pelita Emas terapung di atas awan dengan enam pelita bercahaya, jambatan pelangi, air terjun kristal, buku sajak ajaib, guru pembimbing dan konfeti keemasan"
                      referrerPolicy="no-referrer"
                      onError={() => setPalaceImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <Award className="w-12 h-12 text-[#D97706] mb-2" aria-hidden="true" />
                      <p className="font-display text-xl font-bold text-[#78350F]">
                        Istana Pelita Emas — Cahaya Penghargaan
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-[#B45309]">
                    Babak 1 · Gerbang Cahaya Terakhir
                  </p>
                  <h1
                    id="m6-babak1-heading"
                    className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
                  >
                    Istana Pelita Emas Menantimu!
                  </h1>
                </div>

                {/* Dialog Guru Pembimbing */}
                <div className="rounded-3xl bg-[#FFFBEB] border-2 border-[#FCD34D] p-5 space-y-2 shadow-inner">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#B45309]">
                    <Flame className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                    <span>Ucapan Guru Pembimbing</span>
                  </div>
                  <div className="space-y-1.5 text-sm sm:text-base leading-relaxed text-[#2B1948]">
                    <p className="font-bold text-[#4C1D95]">
                      “{MISSION6_INFO.welcomeDialog[0]}
                    </p>
                    <p>{MISSION6_INFO.welcomeDialog[1]}</p>
                    <p className="font-semibold text-[#B45309]">
                      {MISSION6_INFO.welcomeDialog[2]}
                    </p>
                    <p>{MISSION6_INFO.welcomeDialog[3]}</p>
                    <p className="font-bold text-[#9D174D]">
                      {MISSION6_INFO.welcomeDialog[4]}”
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#FAF5FF] border-2 border-[#DDD6FE] p-4 space-y-2">
                  <h2 className="font-display text-base font-bold text-[#5B21B6]">
                    Matlamat Misi Terakhir:
                  </h2>
                  <ul className="space-y-1 text-sm text-[#432C6B] list-disc list-inside">
                    {MISSION6_INFO.objectives.map((obj) => (
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

        {/* BABAK 2 – KUIZ PERMATA ILMU */}
        {stage === 'babak2' && (
          <section
            aria-labelledby="m6-babak2-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#C4B5FD] shadow-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#F3E8FF] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#6D28D9]">
                  Babak 2 · Kuiz Permata Ilmu
                </p>
                <h1
                  id="m6-babak2-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Uji Kefahaman Maksud & Teknik Sajak
                </h1>
              </div>

              {!showQuizSummary && (
                <div className="px-4 py-2 rounded-2xl bg-[#FAF5FF] border border-[#DDD6FE] font-display font-bold text-sm sm:text-base text-[#4C1D95] tabular-nums shrink-0">
                  Soalan {quizIdx + 1} / {MISSION6_QUIZ_QUESTIONS.length}
                </div>
              )}
            </div>

            {!showQuizSummary ? (
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-[#FAF5FF] border-2 border-[#DDD6FE]">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]">
                    Soalan {currentQuestion.id}: {currentQuestion.question}
                  </h2>
                </div>

                <div className="space-y-3" role="group" aria-label="Pilihan Jawapan Kuiz">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const showGreen = isSelected && answerCorrect === true;
                    const showRed = isSelected && answerCorrect === false;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectQuizOption(opt.id)}
                        disabled={answerCorrect === true}
                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-base sm:text-lg flex items-center justify-between gap-4 transition-all min-h-[58px] ${
                          showGreen
                            ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] shadow-md'
                            : showRed
                            ? 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
                            : answerCorrect === true
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

                {answerCorrect === true && (
                  <div
                    role="status"
                    className="p-5 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] text-[#065F46] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-display font-bold text-lg">Jawapan Betul!</p>
                        <p className="text-sm sm:text-base mt-0.5">
                          {currentQuestion.successFeedback}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center justify-center gap-2 min-h-[48px] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>
                        {quizIdx < MISSION6_QUIZ_QUESTIONS.length - 1
                          ? 'SOALAN SETERUSNYA'
                          : 'LIHAT KEPUTUSAN KUIZ'}
                      </span>
                      <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                )}

                {answerCorrect === false && (
                  <div
                    role="status"
                    className="p-5 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-[#991B1B] flex items-start gap-3"
                  >
                    <AlertCircle className="w-6 h-6 text-[#DC2626] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-display font-bold text-lg">
                        Jawapan kurang tepat! Cuba lagi ya.
                      </p>
                      <p className="text-sm sm:text-base mt-1">{currentQuestion.hint}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Keputusan Kuiz (6 Markah) */
              <div className="rounded-3xl bg-gradient-to-b from-[#FAF5FF] to-white border-2 border-[#DDD6FE] p-6 text-center space-y-5">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FEF3C7] border-2 border-[#FCD34D] text-[#B45309] mx-auto">
                  <Award className="w-9 h-9" aria-hidden="true" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold text-[#6D28D9]">
                    Keputusan Kuiz Permata Ilmu
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654] tabular-nums">
                    Skor Kamu: {savedData.quizLastScore ?? savedData.quizBestScore} / 6
                  </h2>
                  <p className="text-sm font-semibold text-[#5B3E8E] tabular-nums">
                    Skor Terbaik Tersimpan: {savedData.quizBestScore} / 6
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border-2 font-semibold text-sm sm:text-base ${
                    (savedData.quizLastScore ?? savedData.quizBestScore) >= 5
                      ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                      : 'bg-[#F0F9FF] border-[#38BDF8] text-[#075985]'
                  }`}
                >
                  {(savedData.quizLastScore ?? savedData.quizBestScore) >= 5
                    ? 'Cemerlang! Kamu benar-benar menguasai maksud, nilai dan teknik deklamasi sajak Guruku Pelita Hidup.'
                    : 'Tahniah kerana menjawab kesemua enam soalan dengan tekun! Kamu boleh mengulang kuiz untuk mengukuhkan kefahaman atau teruskan ke Surat Kasih Untuk Guru.'}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRetakeQuiz}
                    className="btn-3d-lavender px-5 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[48px] cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    <span>Ulang Kuiz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStage('babak3')}
                    className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                  >
                    <span>SETERUSNYA: SURAT KASIH GURU</span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#F3E8FF] flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToStage('babak1')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Babak 1</span>
              </button>
            </div>
          </section>
        )}

        {/* BABAK 3 – SURAT KASIH UNTUK GURU */}
        {stage === 'babak3' && (
          <section
            aria-labelledby="m6-babak3-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#F9A8D4] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#FCE7F3] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                  Babak 3 · Surat Kasih Untuk Guru
                </p>
                <h1
                  id="m6-babak3-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Tulis Kad Penghargaan Untuk Guru
                </h1>
              </div>

              <div
                className={`px-4 py-2 rounded-2xl border-2 font-display font-bold text-sm tabular-nums shrink-0 ${
                  messageWordCount >= 40 && messageWordCount <= 100
                    ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#047857]'
                    : 'bg-[#FFF1F7] border-[#F9A8D4] text-[#9D174D]'
                }`}
              >
                {messageWordCount} Patah Perkataan
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Borang Ucapan */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-2xl bg-[#FFF1F7] border border-[#F9A8D4] p-4 space-y-1 text-sm sm:text-base text-[#6B1340] font-medium">
                  {MISSION6_INFO.letterIntro.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="m6-student-name"
                      className="block text-sm font-bold text-[#3B1E6D]"
                    >
                      Nama murid:
                    </label>
                    <input
                      id="m6-student-name"
                      type="text"
                      value={savedData.studentName}
                      onChange={(e) => {
                        setLetterError(null);
                        setLetterNotice(null);
                        persistMission6((prev) => ({
                          ...prev,
                          studentName: e.target.value,
                          letterSaved: false,
                        }));
                      }}
                      placeholder="Contoh: Muhammad Adam bin Razak"
                      className="w-full rounded-xl border-2 border-[#DDD6FE] bg-white px-4 py-2.5 text-base text-[#2B1948] placeholder:text-[#8E7AB5] focus:border-[#7C3AED] focus:outline-none min-h-[46px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="m6-teacher-name"
                      className="block text-sm font-bold text-[#3B1E6D]"
                    >
                      Nama guru yang ingin dihargai:
                    </label>
                    <input
                      id="m6-teacher-name"
                      type="text"
                      value={savedData.teacherName}
                      onChange={(e) => {
                        setLetterError(null);
                        setLetterNotice(null);
                        persistMission6((prev) => ({
                          ...prev,
                          teacherName: e.target.value,
                          letterSaved: false,
                        }));
                      }}
                      placeholder="Contoh: Cikgu Nurul Huda"
                      className="w-full rounded-xl border-2 border-[#DDD6FE] bg-white px-4 py-2.5 text-base text-[#2B1948] placeholder:text-[#8E7AB5] focus:border-[#7C3AED] focus:outline-none min-h-[46px]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="m6-appreciation-msg"
                      className="block text-sm font-bold text-[#3B1E6D]"
                    >
                      Ucapan penghargaan:
                    </label>
                    <span className="text-xs font-semibold text-[#5B3E8E]">
                      Cadangan panjang: 40 hingga 100 patah perkataan
                    </span>
                  </div>
                  <textarea
                    id="m6-appreciation-msg"
                    rows={6}
                    value={savedData.appreciationMessage}
                    onChange={(e) => {
                      setLetterError(null);
                      setLetterNotice(null);
                      persistMission6((prev) => ({
                        ...prev,
                        appreciationMessage: e.target.value,
                        letterSaved: false,
                      }));
                    }}
                    placeholder="Terima kasih Cikgu kerana sentiasa sabar mengajar saya Bahasa Melayu dengan penuh kasih sayang. Nasihat cikgu agar tidak mudah berputus asa sentiasa saya ingat apabila menghadapi cabaran dalam pelajaran. Saya berjanji akan belajar bersungguh-sungguh dan menjadi murid yang berakhlak mulia. Selamat Hari Guru dan terima kasih atas segala pengorbanan cikgu!"
                    className="w-full rounded-2xl border-2 border-[#DDD6FE] bg-white px-4 py-3 text-base text-[#2B1948] placeholder:text-[#8E7AB5] focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tiga Panduan Menulis */}
              <aside className="lg:col-span-5 space-y-4">
                <div className="rounded-3xl bg-[#FAF5FF] border-2 border-[#C4B5FD] p-5 space-y-3">
                  <div className="flex items-center gap-2 font-display text-lg font-bold text-[#4C1D95]">
                    <PenLine className="w-5 h-5 text-[#DB2777]" aria-hidden="true" />
                    <span>Tiga Panduan Menulis Ucapan</span>
                  </div>
                  <ol className="space-y-2.5 text-sm sm:text-base text-[#2B1948]">
                    {MISSION6_INFO.letterGuides.map((guide, idx) => (
                      <li
                        key={guide}
                        className="rounded-2xl bg-white border border-[#E9D5FF] p-3.5 flex items-start gap-3"
                      >
                        <span className="w-7 h-7 rounded-lg bg-[#EDE9FE] text-[#5B21B6] font-display font-bold text-sm flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{guide}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Butang Tindakan Kad */}
                <div className="rounded-3xl bg-[#FFFBEB] border-2 border-[#FCD34D] p-5 space-y-3">
                  <p className="font-display text-base font-bold text-[#78350F]">
                    Tindakan Kad Penghargaan:
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={validateAndSaveLetter}
                      className="btn-3d-sky w-full px-4 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                    >
                      <Save className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>SIMPAN UCAPAN</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenAppreciationCard}
                      className="btn-3d-rose w-full px-4 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                    >
                      <Heart className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>LIHAT KAD PENGHARGAAN</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintAppreciationCard}
                      className="btn-3d-primary w-full px-4 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                    >
                      <Printer className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>CETAK KAD</span>
                    </button>
                  </div>
                </div>
              </aside>
            </div>

            {letterError && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-sm sm:text-base font-semibold text-[#991B1B] flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{letterError}</span>
              </div>
            )}

            {(letterNotice || letterDone) && !letterError && (
              <div
                role="status"
                className="p-4 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] text-sm sm:text-base font-semibold text-[#065F46] flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#059669]" />
                <span>
                  {letterNotice ??
                    'Ucapan penghargaan kamu telah disimpan secara setempat. Tekan LIHAT KAD PENGHARGAAN untuk melihat hasilnya.'}
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-[#FCE7F3] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak2')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Kuiz</span>
              </button>

              {letterDone ? (
                <button
                  type="button"
                  onClick={() => goToStage('babak4')}
                  className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                >
                  <span>SETERUSNYA: CERMIN KENANGAN</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-sm font-bold text-[#9D174D]">
                  Isi dan tekan SIMPAN UCAPAN untuk meneruskan ke Cermin Kenangan.
                </p>
              )}
            </div>
          </section>
        )}

        {/* BABAK 4 – CERMIN KENANGAN */}
        {stage === 'babak4' && (
          <section
            aria-labelledby="m6-babak4-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#7DD3FC] shadow-xl p-6 sm:p-8 max-w-4xl mx-auto space-y-6"
          >
            <div className="space-y-1 border-b border-[#E0F2FE] pb-4">
              <p className="text-xs sm:text-sm font-bold text-[#0369A1]">
                Babak 4 · Cermin Kenangan
              </p>
              <h1
                id="m6-babak4-heading"
                className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
              >
                Refleksi Pengembaraan Pembelajaran
              </h1>
              <p className="text-sm sm:text-base text-[#432C6B]">
                Renungkan segala ilmu yang telah kamu kuasai sepanjang enam misi di dunia Suara Hati.
              </p>
            </div>

            {/* 4 Soalan Refleksi */}
            <div className="space-y-4">
              {MISSION6_REFLECTION_QUESTIONS.map((q) => {
                const value =
                  q.id === 'q1'
                    ? savedData.reflectionQ1
                    : q.id === 'q2'
                    ? savedData.reflectionQ2
                    : q.id === 'q3'
                    ? savedData.reflectionQ3
                    : savedData.reflectionQ4;

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl bg-[#F0F9FF] border-2 border-[#BAE6FD] p-4 sm:p-5 space-y-2"
                  >
                    <label
                      htmlFor={`m6-ref-${q.id}`}
                      className="flex items-start gap-2 font-display text-base sm:text-lg font-bold text-[#0C4A6E]"
                    >
                      <HelpCircle className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" />
                      <span>
                        {q.number}. {q.question}
                      </span>
                    </label>
                    <textarea
                      id={`m6-ref-${q.id}`}
                      rows={2}
                      value={value}
                      onChange={(e) => {
                        const nextVal = e.target.value;
                        setReflectionError(null);
                        setReflectionNotice(null);
                        persistMission6((prev) => ({
                          ...prev,
                          reflectionQ1: q.id === 'q1' ? nextVal : prev.reflectionQ1,
                          reflectionQ2: q.id === 'q2' ? nextVal : prev.reflectionQ2,
                          reflectionQ3: q.id === 'q3' ? nextVal : prev.reflectionQ3,
                          reflectionQ4: q.id === 'q4' ? nextVal : prev.reflectionQ4,
                          reflectionSaved: false,
                        }));
                      }}
                      placeholder={q.placeholder}
                      className="w-full rounded-xl border-2 border-[#7DD3FC] bg-white px-4 py-2.5 text-sm sm:text-base text-[#1E293B] placeholder:text-[#64748B] focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>

            {/* Senarai Semak 5 Perkara */}
            <div className="space-y-3 pt-2 border-t border-[#E0F2FE]">
              <h2 className="font-display text-xl font-bold text-[#2E1654]">
                Senarai Semak Pencapaian Diri
              </h2>
              <div className="space-y-2.5">
                {MISSION6_REFLECTION_CHECKLIST.map((item) => {
                  const isChecked = savedData.checkedReflectionIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => handleToggleReflectionCheck(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-2xl border-2 flex items-center gap-3 transition-all min-h-[48px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                        isChecked
                          ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-bold'
                          : 'bg-white border-[#DDD6FE] hover:border-[#7C3AED] text-[#2B1948] font-semibold'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-[#059669] shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-[#7C3AED] shrink-0" />
                      )}
                      <span>{item.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {reflectionError && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-sm sm:text-base font-semibold text-[#991B1B] flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{reflectionError}</span>
              </div>
            )}

            {(reflectionNotice || reflectionDone) && !reflectionError && (
              <div
                role="status"
                className="p-4 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] text-sm sm:text-base font-semibold text-[#065F46] flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#059669]" />
                <span>
                  {reflectionNotice ??
                    'Refleksi dan senarai semak Cermin Kenangan kamu telah disimpan secara setempat.'}
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-[#E0F2FE] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak3')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Surat Kasih</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  className="btn-3d-sky px-5 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                >
                  <Save className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>SIMPAN REFLEKSI</span>
                </button>

                {reflectionDone && (
                  <button
                    type="button"
                    onClick={() => goToStage('babak5')}
                    className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                  >
                    <span>SETERUSNYA: ISTIADAT PELITA EMAS</span>
                    <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* BABAK 5 – ISTIADAT PELITA EMAS & PENJANAAN SIJIL DIGITAL */}
        {stage === 'babak5' && (
          <section
            aria-labelledby="m6-babak5-heading"
            className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#FFFBEB] via-[#FFFDF9] to-[#F5F3FF] border-4 border-[#FBBF24] shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto space-y-7"
          >
            {/* Konfeti Istana (hanya apabila semua syarat lengkap & sijil disahkan) */}
            {allRequirementsMet && (
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-44 overflow-hidden"
                aria-hidden="true"
              >
                {[
                  { left: '6%', delay: '0s', color: 'bg-[#F59E0B]' },
                  { left: '18%', delay: '0.4s', color: 'bg-[#EC4899]' },
                  { left: '31%', delay: '0.8s', color: 'bg-[#8B5CF6]' },
                  { left: '46%', delay: '0.2s', color: 'bg-[#38BDF8]' },
                  { left: '60%', delay: '0.6s', color: 'bg-[#FBBF24]' },
                  { left: '75%', delay: '0.3s', color: 'bg-[#EC4899]' },
                  { left: '90%', delay: '1.0s', color: 'bg-[#10B981]' },
                ].map((dot, idx) => (
                  <span
                    key={idx}
                    style={{ left: dot.left, animationDelay: dot.delay }}
                    className={`animate-stage-confetti absolute top-2 w-3 h-3 rounded-sm ${dot.color} opacity-80`}
                  />
                ))}
              </div>
            )}

            {/* Pengesahan Nama Untuk Sijil (Syarat Wajib 5) */}
            <div className="relative z-10 rounded-3xl bg-white border-2 border-[#DDD6FE] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-[#2E1654]">
                    Pengesahan Nama Penerima Sijil Wira Suara Hati
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5B3E8E]">
                    Pastikan ejaan nama penuh kamu tepat sebelum menjana dan mencetak Sijil Digital.
                  </p>
                </div>

                {nameConfirmedDone && (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#047857] shrink-0">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>Nama Disahkan</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="m6-cert-name-input" className="sr-only">
                  Nama murid untuk sijil penghargaan
                </label>
                <input
                  id="m6-cert-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameError(null);
                    setNameInput(e.target.value);
                  }}
                  placeholder="Masukkan nama penuh kamu di sini..."
                  className="flex-1 rounded-2xl border-2 border-[#C4B5FD] bg-[#FAF7FF] px-4 py-3 text-base font-bold text-[#2E1654] placeholder:text-[#8E7AB5] focus:border-[#7C3AED] focus:bg-white focus:outline-none min-h-[48px]"
                />
                <button
                  type="button"
                  onClick={handleConfirmCertificateName}
                  className="btn-3d-primary px-5 py-3 rounded-2xl font-display font-bold text-sm sm:text-base whitespace-nowrap min-h-[48px] cursor-pointer"
                >
                  {nameConfirmedDone
                    ? 'KEMASKINI NAMA SIJIL'
                    : 'SAHKAN NAMA & NYALAKAN CAHAYA!'}
                </button>
              </div>

              {nameError && (
                <p role="alert" className="text-sm font-bold text-[#DC2626]">
                  {nameError}
                </p>
              )}
            </div>

            {/* Istiadat Enam Pelita Bercahaya & Ucapan Tahniah */}
            {allRequirementsMet ? (
              <div className="relative z-10 text-center space-y-6">
                {/* Enam Pelita mengelilingi Pelita Emas Utama */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                    {[1, 2, 3].map((num) => (
                      <div
                        key={num}
                        className="animate-float-gentle w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FEF3C7] border-2 border-[#F59E0B] shadow-md flex items-center justify-center text-[#D97706]"
                        title={`Cahaya Misi ${num}`}
                      >
                        <Flame className="w-6 h-6 fill-[#FBBF24]" aria-hidden="true" />
                      </div>
                    ))}

                    {/* Pelita Emas Utama di Tengah */}
                    <div className="relative mx-2">
                      <div
                        className="animate-lantern-glow absolute -inset-6 rounded-full bg-[#FDE047]/90 blur-xl"
                        aria-hidden="true"
                      />
                      <div className="animate-lantern-glow relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-[0_0_40px_rgba(251,191,36,0.9)] bg-[#FEF3C7] flex items-center justify-center">
                        {!emblemImgError ? (
                          <img
                            src={ASSETS.pelitaEmblem}
                            alt="Enam cahaya bergabung membentuk Pelita Emas besar di tengah Istana Pelita Emas"
                            referrerPolicy="no-referrer"
                            onError={() => setEmblemImgError(true)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Award className="w-16 h-16 text-[#D97706]" aria-hidden="true" />
                        )}
                      </div>
                    </div>

                    {[4, 5, 6].map((num) => (
                      <div
                        key={num}
                        className="animate-float-delayed w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FEF3C7] border-2 border-[#F59E0B] shadow-md flex items-center justify-center text-[#D97706]"
                        title={`Cahaya Misi ${num}`}
                      >
                        <Flame className="w-6 h-6 fill-[#FBBF24]" aria-hidden="true" />
                      </div>
                    ))}
                  </div>

                  {/* Kawalan Bunyi Tepukan Ringkas */}
                  <button
                    type="button"
                    onClick={handleToggleApplauseSound}
                    aria-pressed={!applauseMuted}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-[#DDD6FE] hover:border-[#7C3AED] text-xs sm:text-sm font-bold text-[#4C1D95] min-h-[40px] cursor-pointer"
                  >
                    {applauseMuted ? (
                      <>
                        <VolumeX className="w-4 h-4 text-[#64748B]" aria-hidden="true" />
                        <span>Bunyi Tepukan: Dimatikan (Klik untuk Mainkan)</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-[#DB2777]" aria-hidden="true" />
                        <span>Bunyi Tepukan: Aktif (Klik untuk Matikan)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2.5 max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/50 text-sm font-bold text-[#92400E]">
                    <Star className="w-4 h-4 fill-[#FBBF24]" aria-hidden="true" />
                    <span>Misi 6 Selesai · Istiadat Pelita Emas</span>
                  </div>

                  <h1
                    id="m6-babak5-heading"
                    className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
                  >
                    {MISSION6_INFO.ceremonyLines[0]}
                  </h1>

                  <p className="text-lg sm:text-xl font-bold text-[#9D174D]">
                    {MISSION6_INFO.ceremonyLines[1]}
                  </p>

                  <p className="text-base sm:text-lg font-medium text-[#2B1948]">
                    {MISSION6_INFO.ceremonyLines[2]}
                  </p>

                  <p className="text-base sm:text-lg font-semibold text-[#4C1D95]">
                    {MISSION6_INFO.ceremonyLines[3]}
                  </p>

                  <p className="font-display text-xl sm:text-2xl font-bold text-[#B45309] pt-1">
                    {MISSION6_INFO.ceremonyLines[4]}
                  </p>
                </div>

                {/* Butang Sijil Digital Wira Suara Hati */}
                <div className="rounded-3xl bg-white/90 border-2 border-[#FCD34D] p-5 sm:p-6 space-y-4">
                  <p className="font-display text-lg font-bold text-[#2E1654]">
                    Sijil Digital Wira Suara Hati ({savedData.certificateConfirmedName})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenCertificate(
                          savedData.certificateConfirmedName,
                          formattedCertDate,
                          'view'
                        )
                      }
                      className="btn-3d-primary px-4 py-3 rounded-2xl font-display font-bold text-sm inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                    >
                      <Award className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>LIHAT SIJIL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenCertificate(
                          savedData.certificateConfirmedName,
                          formattedCertDate,
                          'print'
                        )
                      }
                      className="btn-3d-rose px-4 py-3 rounded-2xl font-display font-bold text-sm inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                    >
                      <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>CETAK SIJIL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenCertificate(
                          savedData.certificateConfirmedName,
                          formattedCertDate,
                          'pdf'
                        )
                      }
                      className="btn-3d-lavender px-4 py-3 rounded-2xl font-display font-bold text-sm inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                    >
                      <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>SIMPAN SEBAGAI PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const res = downloadCertificatePdf({
                          studentName: savedData.certificateConfirmedName,
                          issuedDate: formattedCertDate,
                        });
                        if (res.ok) {
                          setCertDownloadFeedback({
                            ok: true,
                            text: `Fail PDF (${res.filename}) berjaya dijana dan dimuat turun ke peranti anda.`,
                          });
                        } else {
                          setCertDownloadFeedback({
                            ok: false,
                            text:
                              res.errorMessage ??
                              'Gagal menjana fail PDF sijil. Sila cuba lagi.',
                          });
                        }
                      }}
                      className="btn-3d-primary sm:col-span-2 lg:col-span-2 px-4 py-3 rounded-2xl font-display font-bold text-sm inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                    >
                      <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>MUAT TURUN SIJIL SEBAGAI PDF</span>
                    </button>

                    {onOpenAchievementSummary && (
                      <button
                        type="button"
                        onClick={onOpenAchievementSummary}
                        className="btn-3d-lavender px-4 py-3 rounded-2xl font-display font-bold text-sm inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                      >
                        <ClipboardList className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>RINGKASAN PENCAPAIAN</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onBackToMap}
                      className="btn-3d-sky px-4 py-3 rounded-2xl font-display font-bold text-sm inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                    >
                      <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>KEMBALI KE PETA MISI</span>
                    </button>
                  </div>

                  {certDownloadFeedback && (
                    <div
                      role={certDownloadFeedback.ok ? 'status' : 'alert'}
                      className={`rounded-2xl border-2 px-4 py-3 text-xs sm:text-sm font-semibold flex items-start gap-2 text-left ${
                        certDownloadFeedback.ok
                          ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                          : 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
                      }`}
                    >
                      {certDownloadFeedback.ok ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#059669]" aria-hidden="true" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" aria-hidden="true" />
                      )}
                      <span>{certDownloadFeedback.text}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative z-10 rounded-3xl bg-[#FFFBEB] border-2 border-[#F59E0B] p-6 text-center space-y-3">
                <h1
                  id="m6-babak5-heading"
                  className="font-display text-2xl font-bold text-[#78350F]"
                >
                  Sahkan Nama Kamu untuk Menyalakan Pelita Emas!
                </h1>
                <p className="text-sm sm:text-base text-[#451A03] max-w-xl mx-auto">
                  Kuiz, Surat Kasih Guru dan Refleksi Cermin Kenangan telah lengkap. Sahkan nama kamu di atas untuk membuka Istiadat Pelita Emas serta menjana Sijil Digital A4 Landskap.
                </p>
              </div>
            )}

            <div className="relative z-10 pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => goToStage('babak4')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 min-h-[44px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Cermin Kenangan</span>
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Modal Kad Penghargaan Digital Boleh Cetak */}
      <AppreciationCardModal
        isOpen={showCardModal}
        studentName={savedData.studentName.trim() || 'Wira Suara Hati'}
        teacherName={savedData.teacherName.trim() || 'Guru Tersayang'}
        message={savedData.appreciationMessage.trim()}
        onClose={() => setShowCardModal(false)}
        onPrintCard={() => {
          window.setTimeout(() => window.print(), 80);
        }}
      />
    </main>
  );
}
