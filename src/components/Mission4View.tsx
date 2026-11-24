import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Download,
  Flame,
  Heart,
  Lightbulb,
  Mic,
  Music,
  PauseCircle,
  Save,
  Sparkles,
  Star,
  Volume2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ASSETS,
  GURUKU_PELITA_HIDUP_STANZAS,
  GURUKU_PELITA_HIDUP_TITLE,
  MISSION4_ASSESSMENT_ASPECTS,
  MISSION4_INFO,
  MISSION4_RATING_SCALE,
  MISSION4_STANZA_PRACTICE,
  MISSION4_TECHNIQUE_CARDS,
} from '../data/gameData';
import {
  Mission4SavedData,
  MissionStatus,
  TechniqueCardItem,
} from '../types/game';
import { musicEngine } from '../utils/audioEngine';
import {
  loadAudioRecording,
  RecordingSlotId,
  saveAudioRecording,
  StoredAudioRecord,
} from '../utils/recordingDb';
import { loadMission4Data, saveMission4Data } from '../utils/storage';
import {
  ActiveRecordingEntry,
  formatDuration,
  VoiceRecorderCard,
} from './VoiceRecorderCard';

type Mission4Stage = 'babak1' | 'babak2' | 'babak3' | 'babak4' | 'babak5' | 'penamat';

interface Mission4ViewProps {
  missionStatus: MissionStatus;
  onCompleteMission: () => void;
  onBackToMap: () => void;
  onContinueToMission5: () => void;
  onPauseBackgroundMusic: () => void;
}

const STAGE_LIST: Array<{ id: Mission4Stage; label: string; short: string }> = [
  { id: 'babak1', label: 'Babak 1: Akademi Suara', short: 'Babak 1' },
  { id: 'babak2', label: 'Babak 2: Latihan Mikrofon', short: 'Babak 2' },
  { id: 'babak3', label: 'Babak 3: Rakaman Pertama', short: 'Babak 3' },
  { id: 'babak4', label: 'Babak 4: Cermin Refleksi', short: 'Babak 4' },
  { id: 'babak5', label: 'Babak 5: Penambahbaikan', short: 'Babak 5' },
  { id: 'penamat', label: 'Penamat Misi', short: 'Cahaya 4' },
];

const CARD_STYLE_MAP: Record<
  TechniqueCardItem['colorScheme'],
  { card: string; badge: string; iconBg: string }
> = {
  lavender: {
    card: 'bg-gradient-to-br from-[#F5F3FF] to-white border-[#C4B5FD]',
    badge: 'bg-[#EDE9FE] text-[#5B21B6]',
    iconBg: 'bg-[#DDD6FE] text-[#5B21B6]',
  },
  sky: {
    card: 'bg-gradient-to-br from-[#F0F9FF] to-white border-[#7DD3FC]',
    badge: 'bg-[#E0F2FE] text-[#0369A1]',
    iconBg: 'bg-[#BAE6FD] text-[#0369A1]',
  },
  rose: {
    card: 'bg-gradient-to-br from-[#FFF1F7] to-white border-[#F9A8D4]',
    badge: 'bg-[#FCE7F3] text-[#9D174D]',
    iconBg: 'bg-[#FBCFE8] text-[#9D174D]',
  },
  amber: {
    card: 'bg-gradient-to-br from-[#FFFBEB] to-white border-[#FCD34D]',
    badge: 'bg-[#FEF3C7] text-[#B45309]',
    iconBg: 'bg-[#FDE68A] text-[#B45309]',
  },
  mint: {
    card: 'bg-gradient-to-br from-[#ECFDF5] to-white border-[#6EE7B7]',
    badge: 'bg-[#D1FAE5] text-[#047857]',
    iconBg: 'bg-[#A7F3D0] text-[#047857]',
  },
};

function renderTechniqueIcon(iconKey: TechniqueCardItem['iconKey']) {
  switch (iconKey) {
    case 'music':
      return <Music className="w-5 h-5" aria-hidden="true" />;
    case 'sparkles':
      return <Sparkles className="w-5 h-5" aria-hidden="true" />;
    case 'mic':
      return <Mic className="w-5 h-5" aria-hidden="true" />;
    case 'pause':
      return <PauseCircle className="w-5 h-5" aria-hidden="true" />;
    case 'heart':
      return <Heart className="w-5 h-5" aria-hidden="true" />;
  }
}

function isMeaningfulReflection(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 8) return false;
  const words = trimmed.split(/\s+/).filter((w) => w.length >= 2);
  return words.length >= 2;
}

export function Mission4View({
  missionStatus,
  onCompleteMission,
  onBackToMap,
  onContinueToMission5,
  onPauseBackgroundMusic,
}: Mission4ViewProps) {
  const [savedData, setSavedData] = useState<Mission4SavedData>(() => loadMission4Data());
  const [stage, setStage] = useState<Mission4Stage>('babak1');
  const [studioImgError, setStudioImgError] = useState(false);
  const [emblemImgError, setEmblemImgError] = useState(false);

  // Babak 1: Akademi Suara Ajaib
  const [activeTechniqueId, setActiveTechniqueId] = useState<number>(1);

  // Babak 2: Latihan Mikrofon Ajaib
  const [selectedPracticeStanza, setSelectedPracticeStanza] = useState<number>(1);

  // Babak 3 & 5: Storan Audio Sebenar (IndexedDB + Blob URL)
  const [rec1, setRec1] = useState<ActiveRecordingEntry | null>(null);
  const [rec2, setRec2] = useState<ActiveRecordingEntry | null>(null);
  const [checkingStoredAudio, setCheckingStoredAudio] = useState<boolean>(true);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [isRecordingNow, setIsRecordingNow] = useState<boolean>(false);
  const [largeTeleprompter, setLargeTeleprompter] = useState<boolean>(false);
  const [activeTeleprompterStanza, setActiveTeleprompterStanza] = useState<number | null>(
    null
  );

  const rec1UrlRef = useRef<string | null>(null);
  const rec2UrlRef = useRef<string | null>(null);

  // Babak 4: Cermin Refleksi
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [reflectionNotice, setReflectionNotice] = useState<string | null>(null);

  // Babak 5: Refleksi Penambahbaikan
  const [improvementError, setImprovementError] = useState<string | null>(null);
  const [improvementNotice, setImprovementNotice] = useState<string | null>(null);

  const persistMission4 = useCallback(
    (updater: (prev: Mission4SavedData) => Mission4SavedData) => {
      setSavedData((prev) => {
        const next = updater(prev);
        saveMission4Data(next);
        return next;
      });
    },
    []
  );

  // Sahkan kewujudan fail audio sebenar dari IndexedDB apabila komponen dimuatkan
  useEffect(() => {
    let active = true;

    async function hydrateStoredRecordings() {
      const [stored1, stored2] = await Promise.all([
        loadAudioRecording('misi4_rakaman_1'),
        loadAudioRecording('misi4_rakaman_2'),
      ]);

      if (!active) return;

      if (stored1 && stored1.blob.size > 0) {
        const url1 = URL.createObjectURL(stored1.blob);
        rec1UrlRef.current = url1;
        setRec1({ url: url1, record: stored1 });
      }

      if (stored2 && stored2.blob.size > 0) {
        const url2 = URL.createObjectURL(stored2.blob);
        rec2UrlRef.current = url2;
        setRec2({ url: url2, record: stored2 });
      }

      setCheckingStoredAudio(false);
    }

    void hydrateStoredRecordings();

    return () => {
      active = false;
      if (rec1UrlRef.current) {
        URL.revokeObjectURL(rec1UrlRef.current);
        rec1UrlRef.current = null;
      }
      if (rec2UrlRef.current) {
        URL.revokeObjectURL(rec2UrlRef.current);
        rec2UrlRef.current = null;
      }
    };
  }, []);

  const handleSaveRecordingSlot = useCallback(
    async (slotId: RecordingSlotId, record: StoredAudioRecord) => {
      const persisted = await saveAudioRecording(record);
      if (!persisted) {
        setStorageWarning(
          'Pelayar ini mengehadkan storan audio setempat. Rakaman kamu sedia didengar sekarang—sila tekan MUAT TURUN RAKAMAN supaya fail audio tidak hilang jika halaman dimuat semula.'
        );
      } else {
        setStorageWarning(null);
      }

      const nextUrl = URL.createObjectURL(record.blob);
      if (slotId === 'misi4_rakaman_1') {
        if (rec1UrlRef.current) URL.revokeObjectURL(rec1UrlRef.current);
        rec1UrlRef.current = nextUrl;
        setRec1({ url: nextUrl, record });
      } else {
        if (rec2UrlRef.current) URL.revokeObjectURL(rec2UrlRef.current);
        rec2UrlRef.current = nextUrl;
        setRec2({ url: nextUrl, record });
      }
    },
    []
  );

  // Syarat lengkap 6 kriteria Misi 4
  const cardsDone = savedData.openedTechniqueIds.length === 5;
  const practiceDone = savedData.practicedStanzas.length === 4;
  const hasRec1 = Boolean(rec1 && rec1.record.blob.size > 0);
  const allAspectsRated = MISSION4_ASSESSMENT_ASPECTS.every((aspect) => {
    const score = savedData.selfScores[aspect.id];
    return typeof score === 'number' && score >= 1 && score <= 4;
  });
  const reflectionDone =
    savedData.reflectionSaved &&
    allAspectsRated &&
    isMeaningfulReflection(savedData.strengthReflection) &&
    isMeaningfulReflection(savedData.improvementNeedReflection);
  const hasRec2 = Boolean(rec2 && rec2.record.blob.size > 0);
  const improvementDone =
    savedData.improvementSaved &&
    isMeaningfulReflection(savedData.improvementChangeReflection);

  const allRequirementsMet =
    cardsDone &&
    practiceDone &&
    hasRec1 &&
    reflectionDone &&
    hasRec2 &&
    improvementDone;

  // Kira tahap tertinggi yang dibuka berdasarkan kemajuan sebenar (termasuk audio sah)
  const unlockedStageIndex = (() => {
    if (allRequirementsMet) return 5;
    if (cardsDone && practiceDone && hasRec1 && reflectionDone) return 4;
    if (cardsDone && practiceDone && hasRec1) return 3;
    if (cardsDone && practiceDone) return 2;
    if (cardsDone) return 1;
    return 0;
  })();

  const goToStage = (nextStage: Mission4Stage) => {
    if (isRecordingNow) return;
    setStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler Babak 1: Buka Kad Teknik
  const handleSelectTechniqueCard = (cardId: number) => {
    setActiveTechniqueId(cardId);
    if (!savedData.openedTechniqueIds.includes(cardId)) {
      persistMission4((prev) => ({
        ...prev,
        openedTechniqueIds: Array.from(new Set([...prev.openedTechniqueIds, cardId])),
      }));
    }
  };

  const activeTechnique =
    MISSION4_TECHNIQUE_CARDS.find((c) => c.id === activeTechniqueId) ??
    MISSION4_TECHNIQUE_CARDS[0];

  // Handler Babak 2: Tanda Sudah Dilatih (manual sahaja)
  const handleToggleStanzaPracticed = (stanzaNumber: number) => {
    const alreadyPracticed = savedData.practicedStanzas.includes(stanzaNumber);
    if (!alreadyPracticed) {
      musicEngine.playSuccessChime();
    }
    persistMission4((prev) => ({
      ...prev,
      practicedStanzas: alreadyPracticed
        ? prev.practicedStanzas.filter((n) => n !== stanzaNumber)
        : Array.from(new Set([...prev.practicedStanzas, stanzaNumber])),
    }));
  };

  const activeStanzaGuide =
    MISSION4_STANZA_PRACTICE.find((s) => s.number === selectedPracticeStanza) ??
    MISSION4_STANZA_PRACTICE[0];

  // Handler Babak 4: Cermin Refleksi
  const handleScoreChange = (aspectId: string, value: number) => {
    setReflectionError(null);
    setReflectionNotice(null);
    persistMission4((prev) => ({
      ...prev,
      selfScores: {
        ...prev.selfScores,
        [aspectId]: value,
      },
      reflectionSaved: false,
    }));
  };

  const handleSaveReflection = () => {
    if (!allAspectsRated) {
      setReflectionError(
        'Sila pilih skor (1 hingga 4) untuk kesemua 5 aspek penilaian kendiri terlebih dahulu.'
      );
      setReflectionNotice(null);
      return;
    }

    if (!isMeaningfulReflection(savedData.strengthReflection)) {
      setReflectionError(
        'Sila nyatakan kekuatan deklamasi kamu (sekurang-kurangnya satu frasa atau ayat yang jelas).'
      );
      setReflectionNotice(null);
      return;
    }

    if (!isMeaningfulReflection(savedData.improvementNeedReflection)) {
      setReflectionError(
        'Sila nyatakan perkara yang perlu kamu perbaiki supaya kamu boleh fokus semasa Rakaman Penambahbaikan.'
      );
      setReflectionNotice(null);
      return;
    }

    const nowIso = new Date().toISOString();
    persistMission4((prev) => ({
      ...prev,
      reflectionSaved: true,
      savedAt: nowIso,
    }));
    setReflectionError(null);
    setReflectionNotice(
      'Penilaian kendiri dan refleksi kamu berjaya disimpan secara setempat! Kamu kini sedia untuk Rakaman Penambahbaikan.'
    );
    musicEngine.playSuccessChime();
  };

  // Handler Babak 5: Simpan Refleksi Penambahbaikan
  const handleSaveImprovement = () => {
    if (!isMeaningfulReflection(savedData.improvementChangeReflection)) {
      setImprovementError(
        'Sila terangkan sekurang-kurangnya satu perubahan yang telah kamu lakukan untuk meningkatkan mutu deklamasi.'
      );
      setImprovementNotice(null);
      return;
    }

    const nowIso = new Date().toISOString();
    persistMission4((prev) => ({
      ...prev,
      improvementSaved: true,
      savedAt: nowIso,
    }));
    setImprovementError(null);
    setImprovementNotice(
      'Catatan penambahbaikan berjaya disimpan! Pastikan Rakaman Penambahbaikan sudah siap untuk membuka Cahaya Keempat.'
    );
    musicEngine.playSuccessChime();
  };

  const handleOpenPenamat = () => {
    if (!allRequirementsMet) return;
    onCompleteMission();
    musicEngine.playSuccessChime();
    goToStage('penamat');
  };

  const totalSelfScore = MISSION4_ASSESSMENT_ASPECTS.reduce(
    (sum, aspect) => sum + (savedData.selfScores[aspect.id] ?? 0),
    0
  );

  // Panel Teleprompter Sajak Penuh (digunakan di Babak 3 dan Babak 5)
  const renderTeleprompter = () => (
    <aside
      aria-label="Paparan Sajak Penuh Guruku Pelita Hidup"
      className="rounded-3xl bg-[#FFFDF9] border-2 border-[#DDD6FE] p-5 sm:p-6 shadow-md space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F3E8FF] pb-3">
        <div>
          <p className="text-xs font-bold text-[#6D28D9]">Panduan Bacaan Semasa Merakam</p>
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

      <p className="text-xs text-[#5B3E8E]">
        Klik mana-mana rangkap untuk menyerlahkannya ketika kamu mendeklamasi.
      </p>

      <div className="space-y-3">
        {GURUKU_PELITA_HIDUP_STANZAS.map((stanza) => {
          const isHighlighted = activeTeleprompterStanza === stanza.number;
          const guide = MISSION4_STANZA_PRACTICE.find((g) => g.number === stanza.number);
          return (
            <button
              key={stanza.number}
              type="button"
              onClick={() =>
                setActiveTeleprompterStanza((prev) =>
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
                  {stanza.label}
                </span>
                {guide && (
                  <span className="text-[11px] font-semibold text-[#9D174D]">
                    {guide.recommendedTone}
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
    <main className="relative overflow-hidden min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-[#A78BFA]/35 via-[#FCE7F3]/50 to-[#E0F2FE] py-6 sm:py-8">
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
        {/* Bar Atas Misi 4 */}
        <section
          aria-label="Maklumat Misi 4"
          className="rounded-3xl bg-[#FFFDF8]/95 backdrop-blur-md border-2 border-[#C4B5FD] shadow-lg p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-bold text-[#6D28D9]">
                <span className="inline-flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-[#DB2777]" aria-hidden="true" />
                  <span>
                    {MISSION4_INFO.code}: {MISSION4_INFO.title}
                  </span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#0369A1]">{MISSION4_INFO.location}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#9D174D]">Bahasa Melayu Tahun 5</span>
              </div>
              <p className="text-sm sm:text-base text-[#432C6B] font-medium">
                {MISSION4_INFO.purpose}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-2xl bg-[#FAF5FF] border border-[#DDD6FE]">
                <span className="block text-[11px] font-semibold text-[#6D28D9]">
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

          {/* Navigasi Babak Misi 4 */}
          <nav aria-label="Kemajuan Babak Misi 4" className="pt-2 border-t border-[#F3E8FF]">
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
                          ? 'bg-[#6D28D9] text-white shadow-sm'
                          : isUnlocked && !isRecordingNow
                          ? 'bg-[#EDE9FE] text-[#4C1D95] hover:bg-[#DDD6FE] cursor-pointer'
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

        {/* Peringatan jika rakaman terdahulu tiada lagi dalam IndexedDB */}
        {!checkingStoredAudio &&
          (savedData.reflectionSaved || savedData.improvementSaved) &&
          (!hasRec1 || (savedData.improvementSaved && !hasRec2)) && (
            <div
              role="status"
              className="rounded-2xl bg-[#FFFBEB] border-2 border-[#F59E0B] p-4 text-sm font-semibold text-[#78350F] flex items-start gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#D97706]" aria-hidden="true" />
              <span>
                Fail audio rakaman tidak dijumpai dalam storan pelayar buat masa ini (mungkin kerana storan sementara pelayar dikosongkan). Sila rakam semula atau muat naik fail audio yang telah kamu simpan sebelum meneruskan ke penamat misi.
              </span>
            </div>
          )}

        {/* BABAK 1 – AKADEMI SUARA AJAIB */}
        {stage === 'babak1' && (
          <section
            aria-labelledby="m4-babak1-heading"
            className="space-y-6"
          >
            {/* Pengenalan Studio & Dialog Guru */}
            <div className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#DDD6FE] shadow-xl p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-[#EDE9FE] via-[#FCE7F3] to-[#E0F2FE] aspect-[4/3]">
                    {!studioImgError ? (
                      <img
                        src={ASSETS.mission4Studio}
                        alt="Menara Mikrofon Ajaib dengan mikrofon emas bercahaya, gelombang suara berwarna-warni, buku puisi terapung, pelita hati dan guru pembimbing"
                        referrerPolicy="no-referrer"
                        onError={() => setStudioImgError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <Mic className="w-12 h-12 text-[#7C3AED] mb-2" aria-hidden="true" />
                        <p className="font-display text-xl font-bold text-[#4C1D95]">
                          Menara Mikrofon Ajaib — Studio Suara Hati
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-[#6D28D9]">
                      Babak 1 · Akademi Suara Ajaib
                    </p>
                    <h1
                      id="m4-babak1-heading"
                      className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
                    >
                      Kuasai Lima Teknik Deklamasi Sajak
                    </h1>
                  </div>

                  <div className="rounded-3xl bg-[#F5F3FF] border-2 border-[#C4B5FD] p-5 space-y-2 shadow-inner">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#6D28D9]">
                      <Flame className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                      <span>Bimbingan Guru di Menara Mikrofon Ajaib</span>
                    </div>
                    <div className="space-y-1.5 text-sm sm:text-base leading-relaxed text-[#2B1948]">
                      <p className="font-bold text-[#4C1D95]">
                        “{MISSION4_INFO.welcomeDialog[0]}
                      </p>
                      <p>{MISSION4_INFO.welcomeDialog[1]}</p>
                      <p>{MISSION4_INFO.welcomeDialog[2]}</p>
                      <p className="font-semibold text-[#9D174D]">
                        {MISSION4_INFO.welcomeDialog[3]}”
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#ECFDF5] border-2 border-[#6EE7B7] font-display font-bold text-sm sm:text-base text-[#047857] tabular-nums">
                      <BookOpen className="w-5 h-5" aria-hidden="true" />
                      <span>{savedData.openedTechniqueIds.length} / 5 Kad Teknik Dibuka</span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-[#5B3E8E]">
                      Klik kesemua 5 kad teknik di bawah untuk membukanya.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Kad Teknik Deklamasi Interaktif */}
            <div className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#C4B5FD] shadow-xl p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {MISSION4_TECHNIQUE_CARDS.map((card) => {
                  const isOpened = savedData.openedTechniqueIds.includes(card.id);
                  const isActive = activeTechnique.id === card.id;
                  const style = CARD_STYLE_MAP[card.colorScheme];

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSelectTechniqueCard(card.id)}
                      aria-pressed={isActive}
                      className={`text-left rounded-3xl p-4 border-2 transition-all flex flex-col justify-between gap-3 min-h-[136px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                        isActive
                          ? 'bg-[#FFFBEB] border-[#F59E0B] ring-4 ring-[#FDE68A] shadow-lg'
                          : `${style.card} hover:-translate-y-1 shadow-sm hover:shadow-md`
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}
                        >
                          {renderTechniqueIcon(card.iconKey)}
                        </span>
                        {isOpened ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#047857]">
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            <span>Dibuka</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-[#64748B]">
                            Klik Buka
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-[#9D174D]">{card.code}</p>
                        <p className="font-display text-base font-bold text-[#2E1654] leading-snug mt-0.5">
                          {card.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Paparan Terperinci Kad Teknik Terpilih */}
              <div className="rounded-3xl bg-gradient-to-br from-[#FFFDF7] via-[#FAF5FF] to-[#F0F9FF] border-2 border-[#DDD6FE] p-5 sm:p-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9D5FF] pb-3">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                      {activeTechnique.code}
                    </p>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]">
                      {activeTechnique.title}
                    </h2>
                  </div>

                  {!savedData.openedTechniqueIds.includes(activeTechnique.id) && (
                    <button
                      type="button"
                      onClick={() => handleSelectTechniqueCard(activeTechnique.id)}
                      className="btn-3d-primary px-4 py-2 rounded-xl font-display font-bold text-sm min-h-[42px] cursor-pointer"
                    >
                      Tanda Kad Dibaca
                    </button>
                  )}
                </div>

                <p className="text-base sm:text-lg leading-relaxed text-[#2B1948] font-medium">
                  {activeTechnique.summary}
                </p>

                <div className="rounded-2xl bg-[#FFFBEB] border-2 border-[#FCD34D] p-4 flex items-start gap-3">
                  <Lightbulb
                    className="w-6 h-6 text-[#D97706] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="text-sm sm:text-base font-semibold text-[#78350F] leading-relaxed">
                    {activeTechnique.exampleTip}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F3E8FF] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onBackToMap}
                  className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Kembali ke Peta Misi</span>
                </button>

                {cardsDone ? (
                  <button
                    type="button"
                    onClick={() => goToStage('babak2')}
                    className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                  >
                    <span>SETERUSNYA: LATIHAN MIKROFON</span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                ) : (
                  <p className="text-sm font-bold text-[#9D174D]">
                    Buka kesemua 5 kad teknik di atas (termasuk Kad 1) untuk membuka Latihan Mikrofon Ajaib.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* BABAK 2 – LATIHAN MIKROFON AJAIB */}
        {stage === 'babak2' && (
          <section
            aria-labelledby="m4-babak2-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#7DD3FC] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E0F2FE] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#0369A1]">
                  Babak 2 · Latihan Mikrofon Ajaib
                </p>
                <h1
                  id="m4-babak2-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Latihan Berpandu Mengikut Rangkap
                </h1>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#ECFDF5] border-2 border-[#6EE7B7] font-display font-bold text-sm sm:text-base text-[#047857] shrink-0 tabular-nums">
                <Volume2 className="w-5 h-5" aria-hidden="true" />
                <span>{savedData.practicedStanzas.length} / 4 Rangkap Dilatih</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#432C6B]">
              Pilih setiap rangkap di bawah, baca dengan suara yang lantang serta ikut panduan nada, jeda dan ekspresi. Setelah selesai berlatih rangkap tersebut, tekan butang <strong>TANDA SUDAH DILATIH</strong>.
            </p>

            {/* Pilihan 4 Rangkap */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {MISSION4_STANZA_PRACTICE.map((stanza) => {
                const isPracticed = savedData.practicedStanzas.includes(stanza.number);
                const isSelected = selectedPracticeStanza === stanza.number;

                return (
                  <button
                    key={stanza.number}
                    type="button"
                    onClick={() => setSelectedPracticeStanza(stanza.number)}
                    aria-pressed={isSelected}
                    className={`text-left rounded-2xl p-4 border-2 transition-all flex flex-col justify-between gap-2 min-h-[102px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7] ${
                      isSelected
                        ? 'bg-[#FFFBEB] border-[#F59E0B] ring-4 ring-[#FDE68A] shadow-md'
                        : isPracticed
                        ? 'bg-[#ECFDF5] border-[#10B981] hover:shadow-sm'
                        : 'bg-white border-[#BAE6FD] hover:border-[#0284C7]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-base font-bold text-[#2E1654]">
                        {stanza.label}
                      </span>
                      {isPracticed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                      ) : (
                        <Mic className="w-4 h-4 text-[#0284C7] shrink-0" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#0369A1]">
                      {isPracticed ? 'Sudah Dilatih' : 'Belum Ditanda Dilatih'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ruang Latihan Rangkap Aktif */}
            <div className="rounded-3xl bg-gradient-to-br from-[#F0F9FF] via-white to-[#FAF5FF] border-2 border-[#BAE6FD] p-5 sm:p-7 space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-6 rounded-2xl bg-white border-2 border-[#DDD6FE] p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-lg font-bold text-[#5B21B6]">
                      Teks {activeStanzaGuide.label}
                    </h2>
                    {savedData.practicedStanzas.includes(activeStanzaGuide.number) && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#047857]">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Sudah Dilatih</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-lg sm:text-xl leading-relaxed font-semibold text-[#2E1654]">
                    {activeStanzaGuide.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-3.5">
                  <div className="rounded-2xl bg-[#FFF1F7] border border-[#F9A8D4] p-4 space-y-1">
                    <p className="font-display text-sm font-bold text-[#9D174D]">
                      Panduan Nada Suara
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-[#6B1340]">
                      {activeStanzaGuide.recommendedTone}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FFFBEB] border border-[#FCD34D] p-4 space-y-1">
                    <p className="font-display text-sm font-bold text-[#B45309]">
                      Panduan Jeda & Nafas
                    </p>
                    <p className="text-sm sm:text-base text-[#451A03]">
                      {activeStanzaGuide.pauseHint}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] p-4 space-y-1">
                    <p className="font-display text-sm font-bold text-[#5B21B6]">
                      Tips Ekspresi & Penghayatan
                    </p>
                    <p className="text-sm sm:text-base text-[#2B1948]">
                      {activeStanzaGuide.expressionTip}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E0F2FE]">
                <p className="text-xs sm:text-sm font-semibold text-[#5B3E8E]">
                  Sudah cuba mendeklamasikan {activeStanzaGuide.label} dengan kuat dan jelas?
                </p>

                <button
                  type="button"
                  onClick={() => handleToggleStanzaPracticed(activeStanzaGuide.number)}
                  className={`px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[48px] cursor-pointer ${
                    savedData.practicedStanzas.includes(activeStanzaGuide.number)
                      ? 'btn-3d-lavender'
                      : 'btn-3d-primary'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>
                    {savedData.practicedStanzas.includes(activeStanzaGuide.number)
                      ? 'BATALKAN TANDA LATIHAN'
                      : 'TANDA SUDAH DILATIH'}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E0F2FE] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak1')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Babak 1</span>
              </button>

              {practiceDone ? (
                <button
                  type="button"
                  onClick={() => goToStage('babak3')}
                  className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                >
                  <span>SETERUSNYA: RAKAMAN PERTAMA</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-sm font-bold text-[#0369A1]">
                  Tandakan kesemua 4 rangkap sudah dilatih untuk memasuki Studio Rakaman Pertama.
                </p>
              )}
            </div>
          </section>
        )}

        {/* BABAK 3 – STUDIO RAKAMAN PERTAMA */}
        {stage === 'babak3' && (
          <section
            aria-labelledby="m4-babak3-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#C4B5FD] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#F3E8FF] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#6D28D9]">
                  Babak 3 · Studio Rakaman Pertama
                </p>
                <h1
                  id="m4-babak3-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Rakam Percubaan Pertama Deklamasi Sajak
                </h1>
              </div>

              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-display font-bold text-sm shrink-0 ${
                  hasRec1
                    ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#047857]'
                    : 'bg-[#FAF5FF] border-[#DDD6FE] text-[#5B21B6]'
                }`}
              >
                <Mic className="w-4 h-4" aria-hidden="true" />
                <span>{hasRec1 ? 'Rakaman Pertama Siap' : 'Menunggu Rakaman'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 space-y-4">
                <VoiceRecorderCard
                  slotId="misi4_rakaman_1"
                  title="Perakam Suara — Rakaman Pertama"
                  subtitle="Tekan MULAKAN RAKAMAN dan deklamasikan keempat-empat rangkap sajak Guruku Pelita Hidup dengan penuh perasaan."
                  accentScheme="violet"
                  recording={rec1}
                  storageWarning={storageWarning}
                  onSaveRecording={(record) =>
                    handleSaveRecordingSlot('misi4_rakaman_1', record)
                  }
                  onPauseBackgroundMusic={onPauseBackgroundMusic}
                  onRecordingActiveChange={setIsRecordingNow}
                />
              </div>

              <div className="lg:col-span-6">{renderTeleprompter()}</div>
            </div>

            <div className="pt-4 border-t border-[#F3E8FF] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={isRecordingNow}
                onClick={() => goToStage('babak2')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Babak 2</span>
              </button>

              {hasRec1 ? (
                <button
                  type="button"
                  disabled={isRecordingNow}
                  onClick={() => goToStage('babak4')}
                  className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer disabled:opacity-60"
                >
                  <span>SETERUSNYA: CERMIN REFLEKSI</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-sm font-bold text-[#9D174D]">
                  Hasilkan atau muat naik Rakaman Pertama untuk membuka Cermin Refleksi.
                </p>
              )}
            </div>
          </section>
        )}

        {/* BABAK 4 – CERMIN REFLEKSI */}
        {stage === 'babak4' && (
          <section
            aria-labelledby="m4-babak4-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#F9A8D4] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#FCE7F3] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                  Babak 4 · Cermin Refleksi
                </p>
                <h1
                  id="m4-babak4-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Nilai Kekuatan & Peluang Penambahbaikan
                </h1>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-[#FFF1F7] border-2 border-[#F9A8D4] font-display font-bold text-sm sm:text-base text-[#831843] tabular-nums shrink-0">
                Jumlah Skor Kendiri: {totalSelfScore} / 20
              </div>
            </div>

            {/* Pemain Semula Rakaman Pertama */}
            {rec1 && (
              <div className="rounded-2xl bg-[#F5F3FF] border-2 border-[#C4B5FD] p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-base font-bold text-[#4C1D95]">
                    Dengar Semula Rakaman Pertama Sebelum Menilai
                  </p>
                  {rec1.record.durationSeconds > 0 && (
                    <span className="text-xs font-bold text-[#6D28D9] tabular-nums">
                      Tempoh: {formatDuration(rec1.record.durationSeconds)}
                    </span>
                  )}
                </div>
                <audio
                  controls
                  src={rec1.url}
                  onPlay={onPauseBackgroundMusic}
                  className="w-full"
                  aria-label="Pemain audio Rakaman Pertama untuk rujukan penilaian kendiri"
                />
              </div>
            )}

            {/* Bahagian A: 5 Aspek Penilaian Kendiri */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="font-display text-xl font-bold text-[#2E1654]">
                  1. Borang Penilaian Kendiri (Skala 1 hingga 4)
                </h2>
                <p className="text-sm text-[#432C6B]">
                  Pilih tahap pencapaian yang paling jujur menggambarkan rakaman pertama kamu.
                </p>
              </div>

              <div className="space-y-3.5">
                {MISSION4_ASSESSMENT_ASPECTS.map((aspect) => {
                  const selectedScore = savedData.selfScores[aspect.id];
                  return (
                    <div
                      key={aspect.id}
                      className="rounded-2xl bg-white border-2 border-[#E9D5FF] p-4 sm:p-5 space-y-3 shadow-sm"
                    >
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-[#2E1654]">
                          {aspect.number}. {aspect.label}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#5B3E8E] mt-0.5">
                          {aspect.description}
                        </p>
                      </div>

                      <div
                        role="radiogroup"
                        aria-label={`Skor untuk ${aspect.label}`}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5"
                      >
                        {MISSION4_RATING_SCALE.map((scale) => {
                          const isChosen = selectedScore === scale.value;
                          return (
                            <button
                              key={scale.value}
                              type="button"
                              role="radio"
                              aria-checked={isChosen}
                              onClick={() => handleScoreChange(aspect.id, scale.value)}
                              className={`px-3.5 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-bold text-left transition-all min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                                isChosen
                                  ? 'bg-[#FFFBEB] border-[#F59E0B] text-[#78350F] ring-2 ring-[#FDE68A] shadow-sm'
                                  : 'bg-[#FAF7FF] border-[#DDD6FE] text-[#3B1E6D] hover:border-[#7C3AED]'
                              }`}
                            >
                              {scale.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bahagian B: Soalan Refleksi Kendiri */}
            <div className="space-y-4 pt-2 border-t border-[#FCE7F3]">
              <h2 className="font-display text-xl font-bold text-[#2E1654]">
                2. Soalan Refleksi Kendiri
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="m4-strength-input"
                    className="block text-sm sm:text-base font-bold text-[#3B1E6D]"
                  >
                    Apakah kekuatan deklamasi saya?
                  </label>
                  <textarea
                    id="m4-strength-input"
                    rows={3}
                    value={savedData.strengthReflection}
                    onChange={(e) => {
                      setReflectionError(null);
                      setReflectionNotice(null);
                      persistMission4((prev) => ({
                        ...prev,
                        strengthReflection: e.target.value,
                        reflectionSaved: false,
                      }));
                    }}
                    placeholder="Contoh: Sebutan saya jelas pada Rangkap 1 dan nada suara saya ceria."
                    className="w-full rounded-2xl border-2 border-[#DDD6FE] bg-white px-4 py-3 text-sm sm:text-base text-[#2B1948] placeholder:text-[#8E7AB5] focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="m4-improve-input"
                    className="block text-sm sm:text-base font-bold text-[#3B1E6D]"
                  >
                    Apakah perkara yang perlu saya perbaiki?
                  </label>
                  <textarea
                    id="m4-improve-input"
                    rows={3}
                    value={savedData.improvementNeedReflection}
                    onChange={(e) => {
                      setReflectionError(null);
                      setReflectionNotice(null);
                      persistMission4((prev) => ({
                        ...prev,
                        improvementNeedReflection: e.target.value,
                        reflectionSaved: false,
                      }));
                    }}
                    placeholder="Contoh: Saya perlu berhenti seketika pada tanda koma dan melembutkan nada di Rangkap 3."
                    className="w-full rounded-2xl border-2 border-[#DDD6FE] bg-white px-4 py-3 text-sm sm:text-base text-[#2B1948] placeholder:text-[#8E7AB5] focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bahagian C: Catatan Manual Maklum Balas Rakan / Guru */}
            <div className="rounded-2xl bg-[#F0F9FF] border-2 border-[#BAE6FD] p-5 space-y-2.5">
              <label
                htmlFor="m4-peer-feedback-input"
                className="block font-display text-base sm:text-lg font-bold text-[#075985]"
              >
                3. Catatan Maklum Balas Rakan atau Guru (Pilihan)
              </label>
              <p className="text-xs sm:text-sm text-[#0369A1]">
                Perdengarkan rakaman pertama kamu kepada rakan atau guru secara bersemuka, kemudian catatkan komen atau cadangan mereka di sini.
              </p>
              <textarea
                id="m4-peer-feedback-input"
                rows={2}
                value={savedData.peerTeacherFeedback}
                onChange={(e) => {
                  setReflectionNotice(null);
                  persistMission4((prev) => ({
                    ...prev,
                    peerTeacherFeedback: e.target.value,
                    reflectionSaved: false,
                  }));
                }}
                placeholder="Contoh: Cikgu menasihatkan saya supaya memperlahankan sedikit bacaan di Rangkap 3 supaya lebih menyentuh hati."
                className="w-full rounded-2xl border-2 border-[#7DD3FC] bg-white px-4 py-3 text-sm sm:text-base text-[#1E293B] placeholder:text-[#64748B] focus:border-[#0284C7] focus:outline-none"
              />
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
                    'Penilaian kendiri dan refleksi kamu telah disimpan secara setempat.'}
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-[#FCE7F3] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak3')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Babak 3</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  className="btn-3d-sky px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
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
                    <span>SETERUSNYA: RAKAMAN PENAMBAHBAIKAN</span>
                    <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* BABAK 5 – RAKAMAN PENAMBAHBAIKAN & BANDINGAN */}
        {stage === 'babak5' && (
          <section
            aria-labelledby="m4-babak5-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#FCD34D] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#FEF3C7] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#B45309]">
                  Babak 5 · Rakaman Penambahbaikan
                </p>
                <h1
                  id="m4-babak5-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Hasilkan Versi Kedua yang Lebih Mantap!
                </h1>
              </div>

              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-display font-bold text-sm shrink-0 ${
                  hasRec2
                    ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#047857]'
                    : 'bg-[#FFFBEB] border-[#FCD34D] text-[#B45309]'
                }`}
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>
                  {hasRec2 ? 'Rakaman Kedua Siap' : 'Menunggu Rakaman Kedua'}
                </span>
              </div>
            </div>

            {/* Peringatan Sasaran Penambahbaikan daripada Babak 4 */}
            <div className="rounded-2xl bg-[#FFFBEB] border-2 border-[#FCD34D] p-4 sm:p-5 space-y-2">
              <p className="font-display text-sm sm:text-base font-bold text-[#92400E]">
                Fokus Penambahbaikan Kamu daripada Cermin Refleksi:
              </p>
              <p className="text-sm sm:text-base font-semibold text-[#451A03]">
                “{savedData.improvementNeedReflection}”
              </p>
              {savedData.peerTeacherFeedback.trim().length > 0 && (
                <p className="text-xs sm:text-sm text-[#78350F] pt-1 border-t border-[#FDE68A]">
                  <strong>Catatan Rakan / Guru:</strong> {savedData.peerTeacherFeedback}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 space-y-4">
                <VoiceRecorderCard
                  slotId="misi4_rakaman_2"
                  title="Perakam Suara — Rakaman Penambahbaikan"
                  subtitle="Aplikasikan sasaran penambahbaikan di atas semasa merakam deklamasi kedua kamu!"
                  accentScheme="amber"
                  recording={rec2}
                  storageWarning={storageWarning}
                  onSaveRecording={(record) =>
                    handleSaveRecordingSlot('misi4_rakaman_2', record)
                  }
                  onPauseBackgroundMusic={onPauseBackgroundMusic}
                  onRecordingActiveChange={setIsRecordingNow}
                />
              </div>

              <div className="lg:col-span-6">{renderTeleprompter()}</div>
            </div>

            {/* Perbandingan Rakaman Pertama vs Rakaman Penambahbaikan */}
            <div className="rounded-3xl bg-gradient-to-br from-[#F5F3FF] via-white to-[#FFFBEB] border-2 border-[#DDD6FE] p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="font-display text-xl font-bold text-[#2E1654]">
                  Bandingkan Kedua-dua Rakaman Kamu
                </h2>
                <p className="text-sm text-[#432C6B]">
                  Dengarkan Rakaman Pertama dan Rakaman Penambahbaikan secara bergilir untuk mengesan peningkatan suara kamu.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kad Rakaman Pertama */}
                <div className="rounded-2xl bg-white border-2 border-[#C4B5FD] p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-base font-bold text-[#5B21B6]">
                      RAKAMAN PERTAMA
                    </span>
                    {rec1 && rec1.record.durationSeconds > 0 && (
                      <span className="text-xs font-bold text-[#6D28D9] tabular-nums">
                        {formatDuration(rec1.record.durationSeconds)}
                      </span>
                    )}
                  </div>

                  {rec1 ? (
                    <>
                      <audio
                        controls
                        src={rec1.url}
                        onPlay={onPauseBackgroundMusic}
                        className="w-full"
                        aria-label="Pemain Rakaman Pertama"
                      />
                      <a
                        href={rec1.url}
                        download={rec1.record.fileName || 'misi4_rakaman_1.webm'}
                        className="btn-3d-lavender px-3.5 py-2 rounded-xl font-display font-bold text-xs inline-flex items-center gap-1.5 min-h-[38px]"
                      >
                        <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Muat Turun Rakaman 1</span>
                      </a>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-[#991B1B]">
                      Rakaman Pertama tidak dijumpai. Sila kembali ke Babak 3 untuk merakam atau memuat naik.
                    </p>
                  )}
                </div>

                {/* Kad Rakaman Penambahbaikan */}
                <div className="rounded-2xl bg-white border-2 border-[#FCD34D] p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-base font-bold text-[#B45309]">
                      RAKAMAN PENAMBAHBAIKAN
                    </span>
                    {rec2 && rec2.record.durationSeconds > 0 && (
                      <span className="text-xs font-bold text-[#B45309] tabular-nums">
                        {formatDuration(rec2.record.durationSeconds)}
                      </span>
                    )}
                  </div>

                  {rec2 ? (
                    <>
                      <audio
                        controls
                        src={rec2.url}
                        onPlay={onPauseBackgroundMusic}
                        className="w-full"
                        aria-label="Pemain Rakaman Penambahbaikan"
                      />
                      <a
                        href={rec2.url}
                        download={rec2.record.fileName || 'misi4_rakaman_2.webm'}
                        className="btn-3d-primary px-3.5 py-2 rounded-xl font-display font-bold text-xs inline-flex items-center gap-1.5 min-h-[38px]"
                      >
                        <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Muat Turun Rakaman 2</span>
                      </a>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-[#78350F]">
                      Hasilkan atau muat naik Rakaman Penambahbaikan di atas untuk membuat perbandingan.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Soalan Penambahbaikan */}
            <div className="space-y-3 pt-2 border-t border-[#FEF3C7]">
              <label
                htmlFor="m4-improvement-change-input"
                className="block font-display text-lg font-bold text-[#2E1654]"
              >
                Apakah perubahan yang telah kamu lakukan untuk meningkatkan mutu deklamasi?
              </label>
              <textarea
                id="m4-improvement-change-input"
                rows={3}
                value={savedData.improvementChangeReflection}
                onChange={(e) => {
                  setImprovementError(null);
                  setImprovementNotice(null);
                  persistMission4((prev) => ({
                    ...prev,
                    improvementChangeReflection: e.target.value,
                    improvementSaved: false,
                  }));
                }}
                placeholder="Contoh: Saya telah membetulkan jeda pada setiap tanda koma, menyebut kata dengan lebih terang dan menaikkan intonasi dengan penuh semangat di Rangkap 4."
                className="w-full rounded-2xl border-2 border-[#DDD6FE] bg-white px-4 py-3 text-sm sm:text-base text-[#2B1948] placeholder:text-[#8E7AB5] focus:border-[#7C3AED] focus:outline-none"
              />

              {improvementError && (
                <div
                  role="alert"
                  className="p-4 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-sm font-semibold text-[#991B1B] flex items-start gap-2.5"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{improvementError}</span>
                </div>
              )}

              {(improvementNotice || improvementDone) && !improvementError && (
                <div
                  role="status"
                  className="p-4 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] text-sm font-semibold text-[#065F46] flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#059669]" />
                  <span>
                    {improvementNotice ??
                      'Catatan perubahan penambahbaikan kamu telah disimpan secara setempat.'}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#FEF3C7] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={isRecordingNow}
                onClick={() => goToStage('babak4')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer disabled:opacity-60"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Babak 4</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isRecordingNow}
                  onClick={handleSaveImprovement}
                  className="btn-3d-sky px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>SIMPAN PENAMBAHBAIKAN</span>
                </button>

                {allRequirementsMet ? (
                  <button
                    type="button"
                    disabled={isRecordingNow}
                    onClick={handleOpenPenamat}
                    className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                  >
                    <span>PEROLEH CAHAYA KEEMPAT!</span>
                    <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </button>
                ) : (
                  <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                    Lengkapkan Rakaman Kedua dan simpan catatan perubahan untuk membuka Cahaya Keempat.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* PENAMAT MISI 4 */}
        {stage === 'penamat' && (
          <section
            aria-labelledby="m4-penamat-heading"
            className="rounded-[32px] bg-gradient-to-b from-[#FFFBEB] via-[#FFFDF9] to-[#F5F3FF] border-4 border-[#FBBF24] shadow-2xl p-6 sm:p-10 max-w-3xl mx-auto text-center space-y-6"
          >
            {/* Animasi Pelita Bercahaya (Cahaya Keempat) */}
            <div className="relative inline-flex items-center justify-center">
              <div
                className="animate-lantern-glow absolute -inset-8 rounded-full bg-[#FDE047]/85 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="animate-lantern-glow absolute -inset-4 rounded-full bg-[#A78BFA]/45 blur-lg"
                aria-hidden="true"
              />
              <div className="animate-lantern-glow relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-[0_0_40px_rgba(251,191,36,0.85)] bg-[#FEF3C7] flex items-center justify-center">
                {!emblemImgError ? (
                  <img
                    src={ASSETS.pelitaEmblem}
                    alt="Pelita Kasih menyala terang dengan Cahaya Keempat"
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
                className="animate-twinkle-star absolute -bottom-2 -left-3 w-9 h-9 rounded-full bg-white border-2 border-[#A78BFA] shadow-md flex items-center justify-center text-[#7C3AED]"
                aria-hidden="true"
              >
                <Star className="w-4 h-4 fill-[#A78BFA]" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/40 text-sm font-bold text-[#92400E]">
                <Award className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                <span>Misi 4 Selesai · Cahaya Keempat Diperoleh</span>
              </div>

              <h1
                id="m4-penamat-heading"
                className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
              >
                {MISSION4_INFO.completionLines[0]}
              </h1>

              <p className="text-lg sm:text-xl font-bold text-[#9D174D] max-w-xl mx-auto">
                {MISSION4_INFO.completionLines[1]}
              </p>

              <p className="text-lg font-extrabold text-[#B45309]">
                {MISSION4_INFO.completionLines[2]}
              </p>

              <p className="text-base sm:text-lg font-semibold text-[#4C1D95]">
                {MISSION4_INFO.completionLines[3]}
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
                onClick={onContinueToMission5}
                className="btn-3d-primary px-6 py-3.5 rounded-2xl font-display font-bold text-base inline-flex items-center justify-center gap-2 min-h-[52px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
              >
                <span>TERUSKAN KE MISI 5</span>
                <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
