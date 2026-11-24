import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  CheckSquare,
  Compass,
  Flame,
  Heart,
  Lightbulb,
  MessageSquareHeart,
  Mic,
  RotateCcw,
  Save,
  Sparkles,
  Square,
  Star,
  Theater,
  UserCheck,
  Video,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ASSETS,
  GURUKU_PELITA_HIDUP_STANZAS,
  GURUKU_PELITA_HIDUP_TITLE,
  MISSION4_RATING_SCALE,
  MISSION5_CHECKLIST,
  MISSION5_INFO,
  MISSION5_REFLECTION_QUESTIONS,
  MISSION5_RUBRIC_ASPECTS,
  MISSION5_STANZA_EXPRESSION_GUIDES,
  MISSION5_STYLES,
} from '../data/gameData';
import {
  Mission5SavedData,
  MissionStatus,
  PerformanceStyleId,
  PerformanceStyleOption,
} from '../types/game';
import { musicEngine } from '../utils/audioEngine';
import {
  deletePerformanceMedia,
  loadPerformanceMedia,
  savePerformanceMedia,
  StoredPerformanceRecord,
} from '../utils/performanceDb';
import { loadMission5Data, saveMission5Data } from '../utils/storage';
import {
  ActivePerformanceEntry,
  formatPerformanceDuration,
  PerformanceRecorderCard,
} from './PerformanceRecorderCard';

type Mission5Stage =
  | 'babak1'
  | 'babak2'
  | 'babak3'
  | 'babak4'
  | 'babak5'
  | 'penamat';

interface Mission5ViewProps {
  missionStatus: MissionStatus;
  onCompleteMission: () => void;
  onBackToMap: () => void;
  onContinueToMission6: () => void;
  onPauseBackgroundMusic: () => void;
}

const STAGE_LIST: Array<{ id: Mission5Stage; label: string; short: string }> = [
  { id: 'babak1', label: 'Babak 1: Gerbang Pentas', short: 'Babak 1' },
  { id: 'babak2', label: 'Babak 2: Persiapan Bintang', short: 'Babak 2' },
  { id: 'babak3', label: 'Babak 3: Persembahan', short: 'Babak 3' },
  { id: 'babak4', label: 'Babak 4: Juri Pelita Emas', short: 'Babak 4' },
  { id: 'babak5', label: 'Babak 5: Refleksi Bintang', short: 'Babak 5' },
  { id: 'penamat', label: 'Penamat Misi', short: 'Cahaya 5' },
];

const STYLE_CARD_THEME: Record<
  PerformanceStyleOption['colorScheme'],
  { card: string; badge: string; iconBox: string }
> = {
  lavender: {
    card: 'bg-gradient-to-br from-[#F5F3FF] to-white border-[#C4B5FD]',
    badge: 'bg-[#EDE9FE] text-[#5B21B6]',
    iconBox: 'bg-[#DDD6FE] text-[#5B21B6]',
  },
  rose: {
    card: 'bg-gradient-to-br from-[#FFF1F7] to-white border-[#F9A8D4]',
    badge: 'bg-[#FCE7F3] text-[#9D174D]',
    iconBox: 'bg-[#FBCFE8] text-[#9D174D]',
  },
  sky: {
    card: 'bg-gradient-to-br from-[#F0F9FF] to-white border-[#7DD3FC]',
    badge: 'bg-[#E0F2FE] text-[#0369A1]',
    iconBox: 'bg-[#BAE6FD] text-[#0369A1]',
  },
};

function isMeaningfulAnswer(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 8) return false;
  const words = trimmed.split(/\s+/).filter((w) => w.length >= 2);
  return words.length >= 2;
}

function getConstructiveScoreMessage(totalScore: number): {
  title: string;
  body: string;
  toneClass: string;
} {
  if (totalScore >= 17) {
    return {
      title: 'Persembahan Bintang Pentas yang Menyerlah!',
      body: 'Syabas! Kamu berjaya menggabungkan sebutan jelas, nada sesuai, intonasi bertenaga dan penghayatan hati yang menyentuh perasaan.',
      toneClass: 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]',
    };
  }
  if (totalScore >= 13) {
    return {
      title: 'Persembahan Baik dan Penuh Usaha!',
      body: 'Tahniah atas keberanian kamu membuat persembahan! Teruskan mengasah variasi intonasi dan jeda supaya penyampaianmu lebih bertenaga.',
      toneClass: 'bg-[#F0F9FF] border-[#38BDF8] text-[#075985]',
    };
  }
  if (totalScore >= 9) {
    return {
      title: 'Langkah Berani yang Membanggakan!',
      body: 'Kamu berani berdiri dan berkongsi suara hati. Jika mahu, kamu boleh tekan Semak Semula Persembahan nanti untuk mencuba lagi dengan jeda dan nada lebih jelas.',
      toneClass: 'bg-[#FFFBEB] border-[#F59E0B] text-[#78350F]',
    };
  }
  return {
    title: 'Permulaan Hebat — Teruskan Berlatih!',
    body: 'Setiap pendeklamasi hebat bermula dengan langkah pertama. Jangan putus asa—dengarkan semula panduan rangkap dan kamu bebas membuat rakaman baharu bila-bila masa.',
    toneClass: 'bg-[#FFF1F7] border-[#F472B6] text-[#831843]',
  };
}

export function Mission5View({
  missionStatus,
  onCompleteMission,
  onBackToMap,
  onContinueToMission6,
  onPauseBackgroundMusic,
}: Mission5ViewProps) {
  const [savedData, setSavedData] = useState<Mission5SavedData>(() => loadMission5Data());
  const [stage, setStage] = useState<Mission5Stage>('babak1');
  const [stageImgError, setStageImgError] = useState(false);
  const [emblemImgError, setEmblemImgError] = useState(false);

  // Babak 3: Storan Media Sebenar (IndexedDB + ObjectURL)
  const [performanceMedia, setPerformanceMedia] = useState<ActivePerformanceEntry | null>(
    null
  );
  const [checkingMedia, setCheckingMedia] = useState<boolean>(true);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [isRecordingNow, setIsRecordingNow] = useState<boolean>(false);
  const [largeTeleprompter, setLargeTeleprompter] = useState<boolean>(false);
  const [highlightedStanza, setHighlightedStanza] = useState<number | null>(null);
  const mediaUrlRef = useRef<string | null>(null);

  // Babak 4: Rubrik & Maklum Balas Manual
  const [rubricError, setRubricError] = useState<string | null>(null);
  const [rubricNotice, setRubricNotice] = useState<string | null>(null);
  const [peerError, setPeerError] = useState<string | null>(null);
  const [peerNotice, setPeerNotice] = useState<string | null>(null);

  // Babak 5: Refleksi Bintang Suara
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [reflectionNotice, setReflectionNotice] = useState<string | null>(null);

  const persistMission5 = useCallback(
    (updater: (prev: Mission5SavedData) => Mission5SavedData) => {
      setSavedData((prev) => {
        const next = updater(prev);
        saveMission5Data(next);
        return next;
      });
    },
    []
  );

  // Semak kewujudan fail audio/video sebenar dalam IndexedDB apabila halaman dimuatkan
  useEffect(() => {
    let active = true;

    async function hydrateMedia() {
      const stored = await loadPerformanceMedia();
      if (!active) return;
      if (stored && stored.blob.size > 0) {
        const url = URL.createObjectURL(stored.blob);
        mediaUrlRef.current = url;
        setPerformanceMedia({ url, record: stored });
      }
      setCheckingMedia(false);
    }

    void hydrateMedia();

    return () => {
      active = false;
      if (mediaUrlRef.current) {
        URL.revokeObjectURL(mediaUrlRef.current);
        mediaUrlRef.current = null;
      }
    };
  }, []);

  const handleSavePerformance = useCallback(
    async (record: StoredPerformanceRecord) => {
      const persisted = await savePerformanceMedia(record);
      if (!persisted) {
        setStorageWarning(
          'Pelayar mengehadkan storan media setempat. Persembahan kamu masih boleh dimainkan sekarang—sila tekan MUAT TURUN PERSEMBAHAN untuk menyimpan salinan.'
        );
      } else {
        setStorageWarning(null);
      }

      const nextUrl = URL.createObjectURL(record.blob);
      if (mediaUrlRef.current) {
        URL.revokeObjectURL(mediaUrlRef.current);
      }
      mediaUrlRef.current = nextUrl;
      setPerformanceMedia({ url: nextUrl, record });

      // Reset pengesahan main semula sehingga fail baharu dimainkan semula
      persistMission5((prev) => ({
        ...prev,
        hasPlayedBackPerformance: false,
      }));
    },
    [persistMission5]
  );

  const handleClearForRerecord = useCallback(async () => {
    await deletePerformanceMedia();
    if (mediaUrlRef.current) {
      URL.revokeObjectURL(mediaUrlRef.current);
      mediaUrlRef.current = null;
    }
    setPerformanceMedia(null);
    setStorageWarning(null);
    persistMission5((prev) => ({
      ...prev,
      hasPlayedBackPerformance: false,
    }));
  }, [persistMission5]);

  const handlePlaybackVerified = useCallback(() => {
    persistMission5((prev) => {
      if (prev.hasPlayedBackPerformance) return prev;
      return {
        ...prev,
        hasPlayedBackPerformance: true,
        savedAt: new Date().toISOString(),
      };
    });
  }, [persistMission5]);

  // Kira status 6 syarat wajib Penamat Misi 5
  const styleDone = savedData.selectedStyle !== null;
  const checklistDone =
    MISSION5_CHECKLIST.every((item) => savedData.checkedChecklistIds.includes(item.id));
  const prepDone = styleDone && checklistDone;
  const hasValidMedia = Boolean(
    performanceMedia && performanceMedia.record.blob.size > 0
  );
  const playbackVerified = hasValidMedia && savedData.hasPlayedBackPerformance;
  const allRubricAspectsRated = MISSION5_RUBRIC_ASPECTS.every((aspect) => {
    const val = savedData.selfScores[aspect.id];
    return typeof val === 'number' && val >= 1 && val <= 4;
  });
  const rubricDone = savedData.rubricSaved && allRubricAspectsRated;
  const reflectionDone =
    savedData.reflectionSaved &&
    isMeaningfulAnswer(savedData.reflectionQ1) &&
    isMeaningfulAnswer(savedData.reflectionQ2) &&
    isMeaningfulAnswer(savedData.reflectionQ3);

  const allRequirementsMet =
    styleDone &&
    checklistDone &&
    hasValidMedia &&
    playbackVerified &&
    rubricDone &&
    reflectionDone;

  // Pembukaan tahap berperingkat berdasarkan syarat sebenar
  const unlockedStageIndex = (() => {
    if (allRequirementsMet) return 5;
    if (prepDone && playbackVerified && rubricDone) return 4;
    if (prepDone && playbackVerified) return 3;
    if (prepDone) return 2;
    return 1; // Babak 1 & Babak 2 dibuka sebaik memulakan misi
  })();

  const goToStage = (nextStage: Mission5Stage) => {
    if (isRecordingNow) return;
    setStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler Babak 2
  const handleSelectStyle = (styleId: PerformanceStyleId) => {
    persistMission5((prev) => ({
      ...prev,
      selectedStyle: styleId,
    }));
  };

  const handleToggleChecklist = (itemId: string) => {
    persistMission5((prev) => {
      const exists = prev.checkedChecklistIds.includes(itemId);
      return {
        ...prev,
        checkedChecklistIds: exists
          ? prev.checkedChecklistIds.filter((id) => id !== itemId)
          : Array.from(new Set([...prev.checkedChecklistIds, itemId])),
      };
    });
  };

  const selectedStyleOption =
    MISSION5_STYLES.find((s) => s.id === savedData.selectedStyle) ?? null;

  // Handler Babak 4: Rubrik Kendiri & Maklum Balas Manual
  const totalRubricScore = MISSION5_RUBRIC_ASPECTS.reduce(
    (sum, aspect) => sum + (savedData.selfScores[aspect.id] ?? 0),
    0
  );

  const handleSelectRubricScore = (aspectId: string, val: number) => {
    setRubricError(null);
    setRubricNotice(null);
    persistMission5((prev) => ({
      ...prev,
      selfScores: {
        ...prev.selfScores,
        [aspectId]: val,
      },
      rubricSaved: false,
    }));
  };

  const handleSaveRubric = () => {
    if (!allRubricAspectsRated) {
      setRubricError(
        'Sila pilih skor (1 hingga 4) bagi kesemua 5 aspek rubrik sebelum menyimpan penilaian kendiri.'
      );
      setRubricNotice(null);
      return;
    }
    const nowIso = new Date().toISOString();
    persistMission5((prev) => ({
      ...prev,
      rubricSaved: true,
      savedAt: nowIso,
    }));
    setRubricError(null);
    setRubricNotice(
      'Penilaian kendiri dan pecahan markah berjaya disimpan secara setempat!'
    );
    musicEngine.playSuccessChime();
  };

  const handleSavePeerFeedback = () => {
    if (!isMeaningfulAnswer(savedData.peerTeacherFeedback)) {
      setPeerError(
        'Sila tulis catatan maklum balas rakan atau guru sekurang-kurangnya satu frasa atau ayat yang jelas sebelum menyimpan.'
      );
      setPeerNotice(null);
      return;
    }
    const nowIso = new Date().toISOString();
    persistMission5((prev) => ({
      ...prev,
      peerTeacherSaved: true,
      savedAt: nowIso,
    }));
    setPeerError(null);
    setPeerNotice(
      'Maklum balas manual daripada rakan atau guru berjaya disimpan secara setempat.'
    );
  };

  // Handler Babak 5: Refleksi Bintang Suara
  const handleSaveReflection = () => {
    if (
      !isMeaningfulAnswer(savedData.reflectionQ1) ||
      !isMeaningfulAnswer(savedData.reflectionQ2) ||
      !isMeaningfulAnswer(savedData.reflectionQ3)
    ) {
      setReflectionError(
        'Sila lengkapkan jawapan yang bermakna bagi kesemua 3 soalan refleksi sebelum menyimpan.'
      );
      setReflectionNotice(null);
      return;
    }
    const nowIso = new Date().toISOString();
    persistMission5((prev) => ({
      ...prev,
      reflectionSaved: true,
      savedAt: nowIso,
    }));
    setReflectionError(null);
    setReflectionNotice(
      'Refleksi Bintang Suara berjaya disimpan secara setempat dalam pelayar ini! (Tidak dihantar ke pelayan luar).'
    );
    musicEngine.playSuccessChime();
  };

  const handleOpenPenamat = () => {
    if (!allRequirementsMet) return;
    onCompleteMission();
    musicEngine.playSuccessChime();
    goToStage('penamat');
  };

  const scoreFeedback = getConstructiveScoreMessage(totalRubricScore);

  // Panel Sajak Penuh + Panduan Penghayatan untuk Babak 3
  const renderStagePoemPanel = () => (
    <aside
      aria-label="Teks Penuh Sajak dan Panduan Penghayatan"
      className="rounded-3xl bg-[#FFFDF9] border-2 border-[#DDD6FE] p-5 sm:p-6 shadow-md space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F3E8FF] pb-3">
        <div>
          <p className="text-xs font-bold text-[#9D174D]">Teks Rasmi Persembahan</p>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#2E1654]">
            {GURUKU_PELITA_HIDUP_TITLE}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setLargeTeleprompter((prev) => !prev)}
          className="px-3 py-1.5 rounded-xl bg-[#F5F3FF] border border-[#C4B5FD] text-xs font-bold text-[#5B21B6] hover:bg-[#EDE9FE] min-h-[36px] cursor-pointer"
        >
          {largeTeleprompter ? 'Saiz Teks: Besar' : 'Saiz Teks: Sederhana'}
        </button>
      </div>

      {/* Ringkasan Panduan Penghayatan 4 Rangkap */}
      <div className="rounded-2xl bg-[#FFF1F7] border border-[#F9A8D4] p-3.5 space-y-1.5">
        <p className="font-display text-xs sm:text-sm font-bold text-[#9D174D]">
          Panduan Penghayatan:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs sm:text-sm font-semibold text-[#6B1340]">
          {MISSION5_STANZA_EXPRESSION_GUIDES.map((g) => (
            <li key={g.stanzaNumber}>
              <strong>{g.label}:</strong> {g.cue}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        {GURUKU_PELITA_HIDUP_STANZAS.map((stanza) => {
          const isHighlighted = highlightedStanza === stanza.number;
          const cue = MISSION5_STANZA_EXPRESSION_GUIDES.find(
            (g) => g.stanzaNumber === stanza.number
          );

          return (
            <button
              key={stanza.number}
              type="button"
              onClick={() =>
                setHighlightedStanza((prev) =>
                  prev === stanza.number ? null : stanza.number
                )
              }
              className={`w-full text-left rounded-2xl p-4 border-2 transition-all cursor-pointer ${
                isHighlighted
                  ? 'bg-[#FFFBEB] border-[#F59E0B] ring-2 ring-[#FDE68A]'
                  : 'bg-[#FAF7FF] border-[#E9D5FF] hover:border-[#A78BFA]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="font-display text-xs sm:text-sm font-bold text-[#6D28D9]">
                  {stanza.label}:
                </span>
                {cue && (
                  <span className="text-[11px] font-bold text-[#9D174D]">
                    {cue.cue}
                  </span>
                )}
              </div>
              <div
                className={`space-y-1 font-semibold text-[#2E1654] leading-relaxed ${
                  largeTeleprompter ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
                }`}
              >
                {stanza.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );

  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-[#DDD6FE]/60 via-[#FCE7F3]/55 to-[#FEF3C7]/45 py-6 sm:py-8">
      {/* Awan hiasan pentas terapung */}
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
        {/* Bar Atas Misi 5 */}
        <section
          aria-label="Maklumat Misi 5"
          className="rounded-3xl bg-[#FFFDF8]/95 backdrop-blur-md border-2 border-[#FCD34D] shadow-lg p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-bold text-[#9D174D]">
                <span className="inline-flex items-center gap-1.5">
                  <Theater className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                  <span>
                    {MISSION5_INFO.code}: {MISSION5_INFO.title}
                  </span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#5B21B6]">{MISSION5_INFO.location}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#0369A1]">Bahasa Melayu Tahun 5</span>
              </div>
              <p className="text-sm sm:text-base text-[#432C6B] font-medium">
                {MISSION5_INFO.purpose}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-2xl bg-[#FFFBEB] border border-[#FCD34D]">
                <span className="block text-[11px] font-semibold text-[#B45309]">
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
                disabled={isRecordingNow}
                onClick={onBackToMap}
                className="btn-3d-sky px-4 py-2.5 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 min-h-[44px] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>KEMBALI KE PETA MISI</span>
              </button>
            </div>
          </div>

          {/* Navigasi Babak Misi 5 */}
          <nav aria-label="Kemajuan Babak Misi 5" className="pt-2 border-t border-[#FEF3C7]">
            <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {STAGE_LIST.map((item, idx) => {
                const isActive = item.id === stage;
                const isUnlocked = idx <= unlockedStageIndex;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={!isUnlocked || isRecordingNow}
                      onClick={() => {
                        if (isUnlocked && !isRecordingNow) goToStage(item.id);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-center transition-colors min-h-[40px] ${
                        isActive
                          ? 'bg-[#B45309] text-white shadow-sm'
                          : isUnlocked && !isRecordingNow
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

        {/* Peringatan sekiranya fail audio/video persembahan tidak lagi tersedia selepas muat semula */}
        {!checkingMedia &&
          !hasValidMedia &&
          (savedData.hasPlayedBackPerformance ||
            savedData.rubricSaved ||
            savedData.reflectionSaved) && (
            <div
              role="status"
              className="rounded-2xl bg-[#FFFBEB] border-2 border-[#F59E0B] p-4 text-sm font-semibold text-[#78350F] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  className="w-5 h-5 shrink-0 mt-0.5 text-[#D97706]"
                  aria-hidden="true"
                />
                <span>
                  Fail audio/video persembahan tidak lagi tersedia dalam storan pelayar selepas halaman dimuat semula. Pilihan gaya, skor dan refleksi kamu masih tersimpan—sila rakam semula atau muat naik semula fail persembahan di Babak 3 untuk melengkapkan Misi 5.
                </span>
              </div>
              {prepDone && stage !== 'babak3' && (
                <button
                  type="button"
                  onClick={() => goToStage('babak3')}
                  className="btn-3d-primary px-4 py-2 rounded-xl font-display font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Ke Babak 3 Sekarang
                </button>
              )}
            </div>
          )}

        {/* BABAK 1 – GERBANG PENTAS GEMILANG */}
        {stage === 'babak1' && (
          <section
            aria-labelledby="m5-babak1-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#FCD34D] shadow-xl p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-[#EDE9FE] via-[#FCE7F3] to-[#FEF3C7] aspect-[4/3]">
                  {!stageImgError ? (
                    <img
                      src={ASSETS.mission5Stage}
                      alt="Pentas Kasih Guru di atas awan dengan tirai emas dan merah jambu, lampu sorot berwarna-warni, mikrofon kristal, pelita emas terapung, guru pembimbing dan penonton murid yang menyokong"
                      referrerPolicy="no-referrer"
                      onError={() => setStageImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <Theater className="w-12 h-12 text-[#D97706] mb-2" aria-hidden="true" />
                      <p className="font-display text-xl font-bold text-[#78350F]">
                        Pentas Kasih Guru — Pentas Persembahan Fantasi
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                    Babak 1 · Gerbang Pentas Gemilang
                  </p>
                  <h1
                    id="m5-babak1-heading"
                    className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
                  >
                    Pentas Kasih Guru Menantimu!
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
                      “{MISSION5_INFO.welcomeDialog[0]}
                    </p>
                    <p>{MISSION5_INFO.welcomeDialog[1]}</p>
                    <p>{MISSION5_INFO.welcomeDialog[2]}</p>
                    <p>{MISSION5_INFO.welcomeDialog[3]}</p>
                    <p className="font-semibold text-[#9D174D]">
                      {MISSION5_INFO.welcomeDialog[4]}”
                    </p>
                  </div>
                </div>

                {/* Kriteria Kejayaan */}
                <div className="rounded-2xl bg-[#FAF5FF] border-2 border-[#DDD6FE] p-4 space-y-2">
                  <h2 className="font-display text-base font-bold text-[#5B21B6]">
                    Kriteria Kejayaan Persembahan:
                  </h2>
                  <ol className="space-y-1 text-sm sm:text-base font-medium text-[#2E1654] list-decimal list-inside">
                    {MISSION5_INFO.successCriteria.map((criterion) => (
                      <li key={criterion}>{criterion}</li>
                    ))}
                  </ol>
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

        {/* BABAK 2 – PERSIAPAN BINTANG PENTAS */}
        {stage === 'babak2' && (
          <section
            aria-labelledby="m5-babak2-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#F9A8D4] shadow-xl p-6 sm:p-8 space-y-7"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#FCE7F3] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                  Babak 2 · Persiapan Bintang Pentas
                </p>
                <h1
                  id="m5-babak2-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Pilih Gaya & Lengkapkan Senarai Semak
                </h1>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#ECFDF5] border-2 border-[#6EE7B7] font-display font-bold text-sm text-[#047857] shrink-0 tabular-nums">
                <CheckSquare className="w-5 h-5" aria-hidden="true" />
                <span>
                  {savedData.checkedChecklistIds.length} / {MISSION5_CHECKLIST.length} Persediaan
                </span>
              </div>
            </div>

            {/* Langkah 1: Pilihan Gaya Persembahan */}
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#2E1654]">
                  1. Pilih Satu Gaya Persembahan Kamu
                </h2>
                <p className="text-sm text-[#432C6B]">
                  Ketiga-tiga gaya diterima! Pilih gaya yang paling selesa dan sesuai dengan persiapanmu.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MISSION5_STYLES.map((style) => {
                  const isChosen = savedData.selectedStyle === style.id;
                  const theme = STYLE_CARD_THEME[style.colorScheme];

                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => handleSelectStyle(style.id)}
                      aria-pressed={isChosen}
                      className={`text-left rounded-3xl p-5 border-2 transition-all flex flex-col justify-between gap-3 min-h-[146px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                        isChosen
                          ? 'bg-[#FFFBEB] border-[#F59E0B] ring-4 ring-[#FDE68A] shadow-lg'
                          : `${theme.card} hover:-translate-y-0.5 shadow-sm hover:shadow-md`
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-3 py-1 rounded-xl font-display text-xs font-bold ${theme.badge}`}
                        >
                          Pilihan {style.code}
                        </span>
                        {isChosen && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#047857]">
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            <span>Dipilih</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBox}`}
                          >
                            {style.id === 'klasik' ? (
                              <Mic className="w-5 h-5" aria-hidden="true" />
                            ) : style.id === 'kreatif' ? (
                              <Sparkles className="w-5 h-5" aria-hidden="true" />
                            ) : (
                              <Video className="w-5 h-5" aria-hidden="true" />
                            )}
                          </span>
                          <h3 className="font-display text-lg font-bold text-[#2E1654]">
                            {style.title}
                          </h3>
                        </div>
                        <p className="text-sm text-[#432C6B] font-medium leading-relaxed">
                          {style.summary}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Panduan mengikut pilihan murid */}
              {selectedStyleOption && (
                <div className="rounded-3xl bg-[#F5F3FF] border-2 border-[#C4B5FD] p-5 space-y-2.5">
                  <div className="flex items-center gap-2 font-display text-base sm:text-lg font-bold text-[#4C1D95]">
                    <Lightbulb className="w-5 h-5 text-[#D97706] shrink-0" aria-hidden="true" />
                    <span>
                      Panduan Gaya {selectedStyleOption.code}: {selectedStyleOption.title}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-sm sm:text-base text-[#2B1948] list-disc list-inside">
                    {selectedStyleOption.guideTips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Langkah 2: Senarai Semak Persediaan */}
            <div className="space-y-3 pt-2 border-t border-[#FCE7F3]">
              <div>
                <h2 className="font-display text-xl font-bold text-[#2E1654]">
                  2. Senarai Semak Persediaan Bintang Pentas
                </h2>
                <p className="text-sm text-[#432C6B]">
                  Tandakan kesemua lima perkara berikut apabila kamu sudah benar-benar bersedia.
                </p>
              </div>

              <div className="space-y-2.5">
                {MISSION5_CHECKLIST.map((item) => {
                  const isChecked = savedData.checkedChecklistIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 flex items-center gap-3.5 transition-all min-h-[52px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                        isChecked
                          ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-bold shadow-sm'
                          : 'bg-white border-[#DDD6FE] hover:border-[#7C3AED] text-[#2B1948] font-semibold'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare
                          className="w-6 h-6 text-[#059669] shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Square
                          className="w-6 h-6 text-[#7C3AED] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="text-sm sm:text-base">{item.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#FCE7F3] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak1')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Babak 1</span>
              </button>

              {prepDone ? (
                <button
                  type="button"
                  onClick={() => goToStage('babak3')}
                  className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                >
                  <span>SETERUSNYA: PENTAS PERSEMBAHAN</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-sm font-bold text-[#9D174D]">
                  Pilih 1 gaya persembahan dan lengkapkan kesemua 5 senarai semak untuk naik ke pentas.
                </p>
              )}
            </div>
          </section>
        )}

        {/* BABAK 3 – PERSEMBAHAN KASIH GURU */}
        {stage === 'babak3' && (
          <section
            aria-labelledby="m5-babak3-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#C4B5FD] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#F3E8FF] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#6D28D9]">
                  Babak 3 · Persembahan Kasih Guru
                </p>
                <h1
                  id="m5-babak3-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Persembahan Akhir Sajak Guruku Pelita Hidup
                </h1>
              </div>

              {selectedStyleOption && (
                <div className="px-4 py-2 rounded-2xl bg-[#F5F3FF] border-2 border-[#C4B5FD] text-xs sm:text-sm font-bold text-[#5B21B6] shrink-0">
                  Gaya Pilihan: {selectedStyleOption.code}. {selectedStyleOption.title}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 space-y-4">
                <PerformanceRecorderCard
                  performance={performanceMedia}
                  hasPlayedBack={savedData.hasPlayedBackPerformance}
                  storageWarning={storageWarning}
                  onSavePerformance={handleSavePerformance}
                  onClearForRerecord={handleClearForRerecord}
                  onPlaybackVerified={handlePlaybackVerified}
                  onPauseBackgroundMusic={onPauseBackgroundMusic}
                  onRecordingActiveChange={setIsRecordingNow}
                />
              </div>

              <div className="lg:col-span-6">{renderStagePoemPanel()}</div>
            </div>

            <div className="pt-4 border-t border-[#F3E8FF] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={isRecordingNow}
                onClick={() => goToStage('babak2')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer disabled:opacity-60"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Babak 2</span>
              </button>

              {playbackVerified ? (
                <button
                  type="button"
                  disabled={isRecordingNow}
                  onClick={() => goToStage('babak4')}
                  className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer disabled:opacity-60"
                >
                  <span>SETERUSNYA: JURI PELITA EMAS</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-sm font-bold text-[#9D174D]">
                  {hasValidMedia
                    ? 'Tekan butang MAIN SEMULA pada persembahan kamu untuk menyemak hasilnya sebelum ke Juri Pelita Emas.'
                    : 'Hasilkan rakaman audio/video atau muat naik fail persembahan yang sah terlebih dahulu.'}
                </p>
              )}
            </div>
          </section>
        )}

        {/* BABAK 4 – JURI PELITA EMAS */}
        {stage === 'babak4' && (
          <section
            aria-labelledby="m5-babak4-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#FCD34D] shadow-xl p-6 sm:p-8 space-y-7"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#FEF3C7] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#B45309]">
                  Babak 4 · Juri Pelita Emas
                </p>
                <h1
                  id="m5-babak4-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Rubrik Penilaian Persembahan
                </h1>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-[#FFFBEB] border-2 border-[#F59E0B] font-display font-bold text-base sm:text-lg text-[#78350F] tabular-nums shrink-0">
                Jumlah Markah: {totalRubricScore} / 20
              </div>
            </div>

            {/* Pemain Semula Persembahan Akhir untuk rujukan semasa menilai */}
            {performanceMedia ? (
              <div className="rounded-2xl bg-[#F5F3FF] border-2 border-[#C4B5FD] p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-base font-bold text-[#4C1D95]">
                    Tonton / Dengar Semula Persembahan Kamu Semasa Menilai
                  </p>
                  {performanceMedia.record.durationSeconds > 0 && (
                    <span className="text-xs font-bold text-[#6D28D9] tabular-nums">
                      Tempoh:{' '}
                      {formatPerformanceDuration(performanceMedia.record.durationSeconds)}
                    </span>
                  )}
                </div>

                {performanceMedia.record.mediaKind === 'video' ? (
                  <video
                    controls
                    playsInline
                    src={performanceMedia.url}
                    onPlay={onPauseBackgroundMusic}
                    className="w-full max-h-[280px] rounded-xl bg-black"
                    aria-label="Pemain video persembahan akhir untuk rujukan penilaian"
                  />
                ) : (
                  <audio
                    controls
                    src={performanceMedia.url}
                    onPlay={onPauseBackgroundMusic}
                    className="w-full"
                    aria-label="Pemain audio persembahan akhir untuk rujukan penilaian"
                  />
                )}
              </div>
            ) : (
              <div
                role="alert"
                className="rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] p-4 text-sm font-semibold text-[#991B1B] flex items-center justify-between gap-3"
              >
                <span>
                  Fail persembahan tidak dijumpai. Sila kembali ke Babak 3 untuk merakam atau memuat naik semula.
                </span>
                <button
                  type="button"
                  onClick={() => goToStage('babak3')}
                  className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                >
                  Ke Babak 3
                </button>
              </div>
            )}

            {/* RUANG 1: PENILAIAN KENDIRI MURID */}
            <div className="rounded-3xl bg-white border-2 border-[#DDD6FE] p-5 sm:p-6 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#F3E8FF] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6D28D9] flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-bold text-[#2E1654]">
                      Ruang 1: Penilaian Kendiri Murid
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5B3E8E]">
                      Pilih tahap 1 hingga 4 bagi setiap aspek di bawah berdasarkan persembahan kamu sendiri.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {MISSION5_RUBRIC_ASPECTS.map((aspect) => {
                  const chosen = savedData.selfScores[aspect.id];
                  return (
                    <div
                      key={aspect.id}
                      className="rounded-2xl bg-[#FAF7FF] border-2 border-[#E9D5FF] p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-display text-base sm:text-lg font-bold text-[#2E1654]">
                          {aspect.number}. {aspect.label}
                        </h3>
                        <span className="text-xs sm:text-sm font-bold text-[#6D28D9] tabular-nums">
                          Skor Aspek: {chosen ?? 0} / 4
                        </span>
                      </div>

                      <div
                        role="radiogroup"
                        aria-label={`Skor rubrik untuk ${aspect.label}`}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5"
                      >
                        {MISSION4_RATING_SCALE.map((scale) => {
                          const isSelected = chosen === scale.value;
                          const desc = aspect.levelDescriptions[scale.value];

                          return (
                            <button
                              key={scale.value}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => handleSelectRubricScore(aspect.id, scale.value)}
                              className={`text-left rounded-xl p-3 border-2 transition-all flex flex-col justify-between gap-1.5 min-h-[86px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                                isSelected
                                  ? 'bg-[#FFFBEB] border-[#F59E0B] ring-2 ring-[#FDE68A] shadow-sm'
                                  : 'bg-white border-[#DDD6FE] hover:border-[#7C3AED]'
                              }`}
                            >
                              <span className="font-display text-xs sm:text-sm font-bold text-[#2E1654]">
                                {scale.label}
                              </span>
                              <span className="text-[11px] sm:text-xs text-[#432C6B] leading-snug">
                                {desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pecahan Skor Mengikut Aspek & Mesej Membina */}
              <div className="rounded-2xl bg-[#FAF5FF] border border-[#DDD6FE] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-base font-bold text-[#3B1E6D]">
                    Pecahan Skor Mengikut Aspek
                  </p>
                  <p className="font-display text-lg font-bold text-[#6D28D9] tabular-nums">
                    Jumlah: {totalRubricScore} / 20
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {MISSION5_RUBRIC_ASPECTS.map((aspect) => (
                    <div
                      key={aspect.id}
                      className="rounded-xl bg-white border border-[#E9D5FF] px-3 py-2 text-center"
                    >
                      <p className="text-[11px] font-semibold text-[#5B3E8E] truncate">
                        {aspect.label}
                      </p>
                      <p className="font-display text-base font-bold text-[#2E1654] tabular-nums">
                        {savedData.selfScores[aspect.id] ?? 0} / 4
                      </p>
                    </div>
                  ))}
                </div>

                {allRubricAspectsRated && (
                  <div className={`rounded-xl border-2 p-3.5 space-y-1 ${scoreFeedback.toneClass}`}>
                    <p className="font-display text-sm sm:text-base font-bold">
                      {scoreFeedback.title}
                    </p>
                    <p className="text-xs sm:text-sm font-medium">{scoreFeedback.body}</p>
                  </div>
                )}
              </div>

              {rubricError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-sm font-semibold text-[#991B1B] flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{rubricError}</span>
                </div>
              )}

              {(rubricNotice || rubricDone) && !rubricError && (
                <div
                  role="status"
                  className="p-3.5 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] text-sm font-semibold text-[#065F46] flex items-start gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#059669]" />
                  <span>
                    {rubricNotice ??
                      'Penilaian kendiri dan jumlah markah kamu telah disimpan secara setempat.'}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap justify-end">
                <button
                  type="button"
                  onClick={handleSaveRubric}
                  className="btn-3d-sky px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[48px] cursor-pointer"
                >
                  <Save className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>SIMPAN PENILAIAN KENDIRI</span>
                </button>
              </div>
            </div>

            {/* RUANG 2: MAKLUM BALAS RAKAN ATAU GURU (MANUAL SAHAJA) */}
            <div className="rounded-3xl bg-[#F0F9FF] border-2 border-[#7DD3FC] p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#BAE6FD] text-[#0369A1] flex items-center justify-center shrink-0">
                  <MessageSquareHeart className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold text-[#0C4A6E]">
                    Ruang 2: Maklum Balas Rakan atau Guru (Diisi Secara Manual)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#075985]">
                    Ruangan ini hanya diisi secara manual oleh rakan sebaya atau guru setelah menonton atau mendengar persembahan kamu. Sistem tidak menilai mutu suara secara automatik.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4 space-y-1.5">
                  <label
                    htmlFor="m5-reviewer-name"
                    className="block text-sm font-bold text-[#0C4A6E]"
                  >
                    Nama Penilai (Rakan / Guru)
                  </label>
                  <input
                    id="m5-reviewer-name"
                    type="text"
                    value={savedData.peerTeacherReviewer}
                    onChange={(e) => {
                      setPeerNotice(null);
                      persistMission5((prev) => ({
                        ...prev,
                        peerTeacherReviewer: e.target.value,
                        peerTeacherSaved: false,
                      }));
                    }}
                    placeholder="Contoh: Cikgu Aminah / Aisyah"
                    className="w-full rounded-xl border-2 border-[#7DD3FC] bg-white px-3.5 py-2.5 text-sm sm:text-base text-[#1E293B] placeholder:text-[#64748B] focus:border-[#0284C7] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="sm:col-span-8 space-y-1.5">
                  <label
                    htmlFor="m5-peer-feedback"
                    className="block text-sm font-bold text-[#0C4A6E]"
                  >
                    Komen Kekuatan & Cadangan Penambahbaikan
                  </label>
                  <textarea
                    id="m5-peer-feedback"
                    rows={3}
                    value={savedData.peerTeacherFeedback}
                    onChange={(e) => {
                      setPeerError(null);
                      setPeerNotice(null);
                      persistMission5((prev) => ({
                        ...prev,
                        peerTeacherFeedback: e.target.value,
                        peerTeacherSaved: false,
                      }));
                    }}
                    placeholder="Contoh: Sebutan jelas dan ekspresi wajah amat meyakinkan. Kekalkan nada bersemangat pada rangkap terakhir."
                    className="w-full rounded-xl border-2 border-[#7DD3FC] bg-white px-3.5 py-2.5 text-sm sm:text-base text-[#1E293B] placeholder:text-[#64748B] focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
              </div>

              {peerError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-[#FEF2F2] border-2 border-[#EF4444] text-sm font-semibold text-[#991B1B]"
                >
                  {peerError}
                </div>
              )}

              {(peerNotice || savedData.peerTeacherSaved) && !peerError && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-[#ECFDF5] border-2 border-[#10B981] text-sm font-semibold text-[#065F46] flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                  <span>
                    {peerNotice ?? 'Maklum balas rakan atau guru telah disimpan secara setempat.'}
                  </span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePeerFeedback}
                  className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 min-h-[44px] cursor-pointer"
                >
                  <Save className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>SIMPAN MAKLUM BALAS RAKAN/GURU</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#FEF3C7] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak3')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Babak 3</span>
              </button>

              {rubricDone ? (
                <button
                  type="button"
                  onClick={() => goToStage('babak5')}
                  className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                >
                  <span>SETERUSNYA: REFLEKSI BINTANG SUARA</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-sm font-bold text-[#9D174D]">
                  Lengkapkan dan tekan SIMPAN PENILAIAN KENDIRI untuk ke Babak 5.
                </p>
              )}
            </div>
          </section>
        )}

        {/* BABAK 5 – REFLEKSI BINTANG SUARA */}
        {stage === 'babak5' && (
          <section
            aria-labelledby="m5-babak5-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#C4B5FD] shadow-xl p-6 sm:p-8 max-w-4xl mx-auto space-y-6"
          >
            <div className="space-y-1 border-b border-[#F3E8FF] pb-4">
              <p className="text-xs sm:text-sm font-bold text-[#6D28D9]">
                Babak 5 · Refleksi Bintang Suara
              </p>
              <h1
                id="m5-babak5-heading"
                className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
              >
                Kongsi Pengalaman & Makna Sajak
              </h1>
              <p className="text-sm sm:text-base text-[#432C6B]">
                Jawab ketiga-tiga soalan refleksi di bawah dengan jujur dan bermakna. Jawapan kamu disimpan secara setempat dalam pelayar ini.
              </p>
            </div>

            <div className="space-y-5">
              {MISSION5_REFLECTION_QUESTIONS.map((q) => {
                const value =
                  q.id === 'q1'
                    ? savedData.reflectionQ1
                    : q.id === 'q2'
                    ? savedData.reflectionQ2
                    : savedData.reflectionQ3;

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl bg-[#FAF7FF] border-2 border-[#E9D5FF] p-4 sm:p-5 space-y-2"
                  >
                    <label
                      htmlFor={`m5-ref-${q.id}`}
                      className="block font-display text-base sm:text-lg font-bold text-[#2E1654]"
                    >
                      {q.number}. {q.question}
                    </label>
                    <textarea
                      id={`m5-ref-${q.id}`}
                      rows={3}
                      value={value}
                      onChange={(e) => {
                        const nextVal = e.target.value;
                        setReflectionError(null);
                        setReflectionNotice(null);
                        persistMission5((prev) => ({
                          ...prev,
                          reflectionQ1: q.id === 'q1' ? nextVal : prev.reflectionQ1,
                          reflectionQ2: q.id === 'q2' ? nextVal : prev.reflectionQ2,
                          reflectionQ3: q.id === 'q3' ? nextVal : prev.reflectionQ3,
                          reflectionSaved: false,
                        }));
                      }}
                      placeholder={q.placeholder}
                      className="w-full rounded-xl border-2 border-[#DDD6FE] bg-white px-4 py-3 text-sm sm:text-base text-[#2B1948] placeholder:text-[#8E7AB5] focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>
                );
              })}
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
                    'Refleksi Bintang Suara kamu telah disimpan secara setempat dalam pelayar ini.'}
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-[#F3E8FF] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => goToStage('babak4')}
                  className="btn-3d-lavender px-4 py-2.5 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Kembali ke Rubrik</span>
                </button>

                <button
                  type="button"
                  onClick={() => goToStage('babak3')}
                  className="btn-3d-rose px-4 py-2.5 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>SEMAK SEMULA PERSEMBAHAN</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  className="btn-3d-sky px-5 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                >
                  <Save className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>SIMPAN REFLEKSI</span>
                </button>

                {allRequirementsMet ? (
                  <button
                    type="button"
                    onClick={handleOpenPenamat}
                    className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                  >
                    <span>PEROLEH CAHAYA KELIMA!</span>
                    <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </button>
                ) : (
                  !hasValidMedia && (
                    <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                      Fail media Babak 3 perlu tersedia sebelum menamatkan Misi 5.
                    </p>
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {/* PENAMAT MISI 5 */}
        {stage === 'penamat' && (
          <section
            aria-labelledby="m5-penamat-heading"
            className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#FFFBEB] via-[#FFF1F7] to-[#EDE9FE] border-4 border-[#FBBF24] shadow-2xl p-6 sm:p-10 max-w-3xl mx-auto text-center space-y-6"
          >
            {/* Konfeti Pentas Bercahaya (Menghormati tetapan kurangkan animasi) */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-44 overflow-hidden"
              aria-hidden="true"
            >
              {[
                { left: '8%', delay: '0s', color: 'bg-[#F59E0B]' },
                { left: '20%', delay: '0.5s', color: 'bg-[#EC4899]' },
                { left: '34%', delay: '0.9s', color: 'bg-[#8B5CF6]' },
                { left: '48%', delay: '0.2s', color: 'bg-[#38BDF8]' },
                { left: '62%', delay: '0.7s', color: 'bg-[#FBBF24]' },
                { left: '76%', delay: '0.4s', color: 'bg-[#EC4899]' },
                { left: '88%', delay: '1.1s', color: 'bg-[#10B981]' },
              ].map((dot, idx) => (
                <span
                  key={idx}
                  style={{ left: dot.left, animationDelay: dot.delay }}
                  className={`animate-stage-confetti absolute top-2 w-3 h-3 rounded-sm ${dot.color} opacity-80`}
                />
              ))}
            </div>

            {/* Pelita Bercahaya (Cahaya Kelima) + Tepukan Sokongan */}
            <div className="relative inline-flex items-center justify-center pt-2">
              <div
                className="animate-lantern-glow absolute -inset-8 rounded-full bg-[#FDE047]/85 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="animate-lantern-glow absolute -inset-4 rounded-full bg-[#F472B6]/45 blur-lg"
                aria-hidden="true"
              />
              <div className="animate-lantern-glow relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-[0_0_40px_rgba(251,191,36,0.85)] bg-[#FEF3C7] flex items-center justify-center">
                {!emblemImgError ? (
                  <img
                    src={ASSETS.pelitaEmblem}
                    alt="Pelita Kasih menyala gemilang dengan Cahaya Kelima"
                    referrerPolicy="no-referrer"
                    onError={() => setEmblemImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Heart className="w-16 h-16 fill-[#EC4899] text-[#EC4899]" aria-hidden="true" />
                )}
              </div>
              <div
                className="animate-applause-pop absolute -top-3 -right-4 px-2.5 py-1 rounded-full bg-white border-2 border-[#FBBF24] shadow-md flex items-center gap-1 text-xs font-bold text-[#B45309]"
                aria-hidden="true"
              >
                <Star className="w-4 h-4 fill-[#FBBF24]" />
                <span>Tepukan Gemuruh!</span>
              </div>
              <div
                className="animate-twinkle-star absolute -bottom-2 -left-3 w-9 h-9 rounded-full bg-white border-2 border-[#EC4899] shadow-md flex items-center justify-center text-[#DB2777]"
                aria-hidden="true"
              >
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/40 text-sm font-bold text-[#92400E]">
                <Award className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                <span>Misi 5 Selesai · Cahaya Kelima Diperoleh</span>
              </div>

              <h1
                id="m5-penamat-heading"
                className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
              >
                {MISSION5_INFO.completionLines[0]}
              </h1>

              <p className="text-lg sm:text-xl font-bold text-[#9D174D] max-w-xl mx-auto">
                {MISSION5_INFO.completionLines[1]}
              </p>

              <p className="text-base sm:text-lg font-semibold text-[#4C1D95] max-w-lg mx-auto">
                {MISSION5_INFO.completionLines[2]}
              </p>

              <p className="text-lg font-extrabold text-[#B45309]">
                {MISSION5_INFO.completionLines[3]}
              </p>
            </div>

            <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
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
                onClick={onContinueToMission6}
                className="btn-3d-primary px-6 py-3.5 rounded-2xl font-display font-bold text-base inline-flex items-center justify-center gap-2 min-h-[52px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
              >
                <span>TERUSKAN KE MISI 6</span>
                <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
