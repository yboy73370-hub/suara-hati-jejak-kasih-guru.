import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  Flame,
  Heart,
  MessageCircle,
  Mic,
  Save,
  Smile,
  Sparkles,
  Square,
  Star,
  Upload,
  Volume2,
} from 'lucide-react';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  ASSETS,
  GURUKU_PELITA_HIDUP_STANZAS,
  MISSION2_AUDIO_COMPARE,
  MISSION2_EMOTION_CHOICES,
  MISSION2_INFO,
  MISSION2_REFLECTION_QUESTIONS,
  MISSION2_STANZA2_TEXT,
} from '../data/gameData';
import { EmotionChoice, Mission2SavedData, MissionStatus } from '../types/game';
import { musicEngine } from '../utils/audioEngine';
import { loadMission2Data, saveMission2Data } from '../utils/storage';

type Mission2Stage = 'babak1' | 'babak2' | 'babak3' | 'babak4' | 'penamat';

interface Mission2ViewProps {
  missionStatus: MissionStatus;
  onCompleteMission: () => void;
  onBackToMap: () => void;
  onContinueToMission3: () => void;
}

const STAGE_LIST: Array<{ id: Mission2Stage; label: string; short: string }> = [
  { id: 'babak1', label: 'Babak 1: Taman Bisikan', short: 'Babak 1' },
  { id: 'babak2', label: 'Babak 2: Dengar & Hayati', short: 'Babak 2' },
  { id: 'babak3', label: 'Babak 3: Detektif Emosi', short: 'Babak 3' },
  { id: 'babak4', label: 'Babak 4: Kongsi Suara Hati', short: 'Babak 4' },
  { id: 'penamat', label: 'Penamat Misi', short: 'Cahaya 2' },
];

function EmotionIcon({
  iconKey,
  className = 'w-5 h-5',
}: {
  iconKey: EmotionChoice['iconKey'];
  className?: string;
}) {
  switch (iconKey) {
    case 'smile':
      return <Smile className={className} aria-hidden="true" />;
    case 'sparkles':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'heart':
      return <Heart className={className} aria-hidden="true" />;
    case 'flame':
      return <Flame className={className} aria-hidden="true" />;
  }
}

const EMOTION_CARD_STYLE: Record<
  EmotionChoice['colorScheme'],
  { bg: string; border: string; iconBg: string; iconText: string }
> = {
  amber: {
    bg: 'bg-[#FFFBEB]',
    border: 'border-[#FCD34D] hover:border-[#D97706]',
    iconBg: 'bg-[#FEF3C7]',
    iconText: 'text-[#B45309]',
  },
  sky: {
    bg: 'bg-[#F0F9FF]',
    border: 'border-[#7DD3FC] hover:border-[#0284C7]',
    iconBg: 'bg-[#E0F2FE]',
    iconText: 'text-[#0369A1]',
  },
  rose: {
    bg: 'bg-[#FFF1F7]',
    border: 'border-[#F9A8D4] hover:border-[#DB2777]',
    iconBg: 'bg-[#FCE7F3]',
    iconText: 'text-[#BE185D]',
  },
  violet: {
    bg: 'bg-[#F5F3FF]',
    border: 'border-[#C4B5FD] hover:border-[#7C3AED]',
    iconBg: 'bg-[#EDE9FE]',
    iconText: 'text-[#5B21B6]',
  },
};

export function Mission2View({
  missionStatus,
  onCompleteMission,
  onBackToMap,
  onContinueToMission3,
}: Mission2ViewProps) {
  const [savedData, setSavedData] = useState<Mission2SavedData>(() => loadMission2Data());
  const [stage, setStage] = useState<Mission2Stage>('babak1');
  const [gardenImgError, setGardenImgError] = useState(false);
  const [emblemImgError, setEmblemImgError] = useState(false);

  // Babak 2 audio state
  const [playingSample, setPlayingSample] = useState<'A' | 'B' | null>(null);
  const [audioStatusMsg, setAudioStatusMsg] = useState<string | null>(null);
  const [audioErrorMsg, setAudioErrorMsg] = useState<string | null>(null);
  const [customAudioA, setCustomAudioA] = useState<{ url: string; name: string } | null>(
    null
  );
  const [customAudioB, setCustomAudioB] = useState<{ url: string; name: string } | null>(
    null
  );
  const [selectedAudioOption, setSelectedAudioOption] = useState<'A' | 'B' | null>(
    savedData.audioQuizPassed ? 'B' : null
  );
  const [audioQuizCorrect, setAudioQuizCorrect] = useState<boolean | null>(
    savedData.audioQuizPassed ? true : null
  );
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const ttsTimerRef = useRef<number | null>(null);

  // Babak 3 Detektif Emosi state
  const [selectedStanzaNum, setSelectedStanzaNum] = useState<number | null>(null);
  const [selectedEmotionId, setSelectedEmotionId] = useState<string | null>(null);
  const [matchFeedback, setMatchFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Babak 4 Refleksi state
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [reflectionConfirmation, setReflectionConfirmation] = useState<string | null>(null);

  const persistMission2 = useCallback(
    (updater: (prev: Mission2SavedData) => Mission2SavedData) => {
      setSavedData((prev) => {
        const next = updater(prev);
        saveMission2Data(next);
        return next;
      });
    },
    []
  );

  const stopAllAudio = useCallback(() => {
    if (ttsTimerRef.current !== null) {
      window.clearTimeout(ttsTimerRef.current);
      ttsTimerRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
      audioElRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Abaikan jika pelayar tidak menyokong pembatalan
      }
    }
    setPlayingSample(null);
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  useEffect(() => {
    return () => {
      if (customAudioA) URL.revokeObjectURL(customAudioA.url);
    };
  }, [customAudioA]);

  useEffect(() => {
    return () => {
      if (customAudioB) URL.revokeObjectURL(customAudioB.url);
    };
  }, [customAudioB]);

  const isAudioStepDone = savedData.audioQuizPassed;
  const isEmotionStepDone = savedData.matchedStanzas.length === 4;
  const isReflectionStepDone = savedData.reflectionSaved;
  const allMandatoryDone =
    isAudioStepDone && isEmotionStepDone && isReflectionStepDone;

  // Kira tahap tertinggi yang dibuka berdasarkan kemajuan sebenar
  const unlockedStageIndex = (() => {
    if (missionStatus === 'Selesai' || allMandatoryDone) return 4;
    if (isEmotionStepDone) return 3;
    if (isAudioStepDone) return 2;
    return 1; // Babak 1 & Babak 2 boleh diterokai apabila memasuki misi
  })();

  const goToStage = (nextStage: Mission2Stage) => {
    stopAllAudio();
    setStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fungsi memainkan audio sebenar (Fail guru atau Text-to-Speech pelayar)
  const playSampleAudio = async (sample: 'A' | 'B') => {
    stopAllAudio();
    setAudioErrorMsg(null);
    setAudioStatusMsg(null);

    const customFile = sample === 'A' ? customAudioA : customAudioB;
    if (customFile) {
      try {
        const audio = new Audio(customFile.url);
        audioElRef.current = audio;
        audio.onended = () => {
          setPlayingSample(null);
          setAudioStatusMsg(`Rakaman Bacaan ${sample} (${customFile.name}) selesai dimainkan.`);
        };
        audio.onerror = () => {
          setPlayingSample(null);
          setAudioErrorMsg(
            `Fail audio Bacaan ${sample} tidak dapat dimainkan. Sila pilih fail audio MP3 atau WAV yang sah.`
          );
        };
        setPlayingSample(sample);
        setAudioStatusMsg(`Sedang memainkan rakaman guru: ${customFile.name}`);
        await audio.play();
        return;
      } catch {
        setPlayingSample(null);
        setAudioErrorMsg(
          `Pelayar menyekat atau gagal memainkan fail rakaman Bacaan ${sample}.`
        );
        return;
      }
    }

    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      setAudioErrorMsg(
        'Fungsi suara pelayar (Text-to-Speech) tidak disokong pada peranti ini. Guru boleh memuat naik fail rakaman suara sebenar di bahagian Pilihan Guru di bawah.'
      );
      return;
    }

    try {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      const malayVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('ms')) ??
        voices.find((v) => v.lang.toLowerCase().startsWith('id')) ??
        null;

      setPlayingSample(sample);
      setAudioStatusMsg(
        sample === 'A'
          ? 'Sedang memainkan demonstrasi suara pelayar: Contoh A (nada mendatar).'
          : 'Sedang memainkan demonstrasi suara pelayar: Contoh B (nada kagum dan penuh harapan).'
      );

      if (sample === 'A') {
        const utterance = new SpeechSynthesisUtterance(MISSION2_STANZA2_TEXT.join(' '));
        if (malayVoice) utterance.voice = malayVoice;
        utterance.lang = malayVoice?.lang ?? 'ms-MY';
        utterance.rate = 1.08;
        utterance.pitch = 0.88;
        utterance.onend = () => {
          setPlayingSample(null);
          setAudioStatusMsg('Demonstrasi Bacaan A selesai dimainkan.');
        };
        utterance.onerror = () => {
          setPlayingSample(null);
          setAudioErrorMsg(
            'Suara pelayar tidak dapat dimainkan pada persekitaran ini. Sila muat naik fail audio rakaman guru di bawah untuk mendengar audio sebenar.'
          );
        };
        synth.speak(utterance);
      } else {
        // Bacaan B dibaca baris demi baris dengan jeda lembut dan intonasi lebih tinggi/penuh harapan
        const lines = [...MISSION2_STANZA2_TEXT];
        let idx = 0;

        const speakNextLine = () => {
          if (idx >= lines.length) {
            setPlayingSample(null);
            setAudioStatusMsg('Demonstrasi Bacaan B selesai dimainkan.');
            return;
          }
          const u = new SpeechSynthesisUtterance(lines[idx]);
          if (malayVoice) u.voice = malayVoice;
          u.lang = malayVoice?.lang ?? 'ms-MY';
          u.rate = idx === 3 ? 0.82 : 0.88;
          u.pitch = idx === 0 || idx === 3 ? 1.18 : 1.08;
          u.onend = () => {
            idx += 1;
            ttsTimerRef.current = window.setTimeout(speakNextLine, 260);
          };
          u.onerror = () => {
            setPlayingSample(null);
            setAudioErrorMsg(
              'Suara pelayar tidak dapat dimainkan pada persekitaran ini. Sila muat naik fail audio rakaman guru di bawah untuk mendengar audio sebenar.'
            );
          };
          synth.speak(u);
        };

        speakNextLine();
      }
    } catch {
      setPlayingSample(null);
      setAudioErrorMsg(
        'Audio suara pelayar tidak tersedia. Sila gunakan fail rakaman audio guru di bahagian bawah.'
      );
    }
  };

  const handleUploadCustomAudio = (
    sample: 'A' | 'B',
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    stopAllAudio();
    setAudioErrorMsg(null);
    const objectUrl = URL.createObjectURL(file);
    if (sample === 'A') {
      setCustomAudioA({ url: objectUrl, name: file.name });
      setAudioStatusMsg(`Fail rakaman Bacaan A berjaya dimuatkan: ${file.name}`);
    } else {
      setCustomAudioB({ url: objectUrl, name: file.name });
      setAudioStatusMsg(`Fail rakaman Bacaan B berjaya dimuatkan: ${file.name}`);
    }
  };

  const handleAnswerAudioQuiz = (choice: 'A' | 'B') => {
    if (audioQuizCorrect === true) return;
    setSelectedAudioOption(choice);
    const isCorrect = choice === MISSION2_AUDIO_COMPARE.correctAnswer;
    setAudioQuizCorrect(isCorrect);

    if (isCorrect) {
      musicEngine.playSuccessChime();
      persistMission2((prev) => ({
        ...prev,
        audioQuizPassed: true,
      }));
    }
  };

  // Padanan Detektif Emosi
  const evaluateMatchAttempt = (stanzaNum: number, emotionId: string) => {
    const choice = MISSION2_EMOTION_CHOICES.find((e) => e.id === emotionId);
    if (!choice) return;

    if (savedData.matchedStanzas.includes(stanzaNum)) return;

    if (choice.stanzaNumber === stanzaNum) {
      musicEngine.playSuccessChime();
      setMatchFeedback({
        type: 'success',
        message: `${choice.explanation} (+1 Bintang Cahaya!)`,
      });
      setSelectedStanzaNum(null);
      setSelectedEmotionId(null);
      persistMission2((prev) => ({
        ...prev,
        matchedStanzas: Array.from(new Set([...prev.matchedStanzas, stanzaNum])),
      }));
    } else {
      setMatchFeedback({
        type: 'error',
        message: `Belum tepat untuk Rangkap ${stanzaNum}. ${choice.hint}`,
      });
    }
  };

  const handleClickStanzaCard = (stanzaNum: number) => {
    if (savedData.matchedStanzas.includes(stanzaNum)) return;
    setMatchFeedback(null);
    if (selectedEmotionId) {
      evaluateMatchAttempt(stanzaNum, selectedEmotionId);
    } else {
      setSelectedStanzaNum((prev) => (prev === stanzaNum ? null : stanzaNum));
    }
  };

  const handleClickEmotionCard = (choice: EmotionChoice) => {
    if (savedData.matchedStanzas.includes(choice.stanzaNumber)) return;
    setMatchFeedback(null);
    if (selectedStanzaNum !== null) {
      evaluateMatchAttempt(selectedStanzaNum, choice.id);
    } else {
      setSelectedEmotionId((prev) => (prev === choice.id ? null : choice.id));
    }
  };

  const handleReflectionTextChange = (questionId: number, value: string) => {
    setReflectionError(null);
    setReflectionConfirmation(null);
    persistMission2((prev) => ({
      ...prev,
      reflections: {
        ...prev.reflections,
        [questionId]: value,
      },
      reflectionSaved: false,
    }));
  };

  const handleSaveReflection = () => {
    const missing = MISSION2_REFLECTION_QUESTIONS.some(
      (q) => (savedData.reflections[q.id] ?? '').trim().length < 3
    );

    if (missing) {
      setReflectionError(
        'Sila tulis jawapan ringkas bagi ketiga-tiga soalan refleksi sebelum menyimpan.'
      );
      setReflectionConfirmation(null);
      return;
    }

    const nowIso = new Date().toISOString();
    persistMission2((prev) => ({
      ...prev,
      reflectionSaved: true,
      savedAt: nowIso,
    }));

    setReflectionError(null);
    setReflectionConfirmation(
      'Refleksi Suara Hati berjaya disimpan secara setempat dalam pelayar ini. Jangan lupa berkongsi satu jawapan bersama rakan atau guru kamu!'
    );

    if (isAudioStepDone && isEmotionStepDone) {
      onCompleteMission();
      musicEngine.playSuccessChime();
    }
  };

  const handleOpenPenamat = () => {
    if (isAudioStepDone && isEmotionStepDone && isReflectionStepDone) {
      onCompleteMission();
      musicEngine.playSuccessChime();
      goToStage('penamat');
    }
  };

  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-[#7DD3FC] via-[#FCE7F3] to-[#F3E8FF] py-6 sm:py-8">
      {/* Awan hiasan lembut */}
      <div
        className="animate-cloud-drift pointer-events-none hidden md:block absolute top-6 right-10 opacity-75"
        aria-hidden="true"
      >
        <svg width="112" height="48" viewBox="0 0 118 52" fill="none">
          <path
            d="M24 44H95C105.5 44 114 35.8 114 25.5C114 15.9 106.5 8 97 7.1C93.5 2.8 88.2 0 82.2 0C73.4 0 65.9 6.1 63.9 14.3C61.4 13.1 58.6 12.4 55.6 12.4C45.3 12.4 36.9 20.6 36.7 30.8C35.2 30.4 33.6 30.2 32 30.2C23.2 30.2 16 36.4 16 44H24Z"
            fill="white"
            fillOpacity="0.82"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Bar Atas Misi 2 (Tanpa istilah teknikal kepada murid) */}
        <section
          aria-label="Maklumat Misi 2"
          className="rounded-3xl bg-[#FFFDF8]/95 backdrop-blur-md border-2 border-[#F9A8D4] shadow-lg p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-bold text-[#9D174D]">
                <span className="inline-flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-[#EC4899] text-[#EC4899]" aria-hidden="true" />
                  <span>{MISSION2_INFO.code}: {MISSION2_INFO.title}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#5B21B6]">{MISSION2_INFO.location}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#0369A1]">Bahasa Melayu Tahun 5</span>
              </div>
              <p className="text-sm sm:text-base text-[#432C6B] font-medium">
                {MISSION2_INFO.purpose}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-2xl bg-[#FFF5F9] border border-[#FBCFE8]">
                <span className="block text-[11px] font-semibold text-[#831843]">
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

          {/* Penunjuk Babak Misi 2 */}
          <nav aria-label="Kemajuan Babak Misi 2" className="pt-2 border-t border-[#FCE7F3]">
            <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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
                          ? 'bg-[#DB2777] text-white shadow-sm'
                          : isUnlocked
                          ? 'bg-[#FCE7F3] text-[#831843] hover:bg-[#FBCFE8] cursor-pointer'
                          : 'bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed'
                      }`}
                    >
                      <span className="hidden lg:inline">{item.label}</span>
                      <span className="lg:hidden">{item.short}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </section>

        {/* BABAK 1 – SELAMAT DATANG KE TAMAN BISIKAN */}
        {stage === 'babak1' && (
          <section
            aria-labelledby="m2-babak1-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#FBCFE8] shadow-xl p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-[#FCE7F3] via-[#EDE9FE] to-[#DBEAFE] aspect-[4/3]">
                  {!gardenImgError ? (
                    <img
                      src={ASSETS.mission2Garden}
                      alt="Taman Bunga Bercahaya dengan bunga ajaib, rama-rama bercahaya, air terjun pelangi, pokok berbentuk hati, mikrofon ajaib dan guru bersama murid"
                      referrerPolicy="no-referrer"
                      onError={() => setGardenImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <Heart className="w-12 h-12 text-[#DB2777] mb-2" aria-hidden="true" />
                      <p className="font-display text-xl font-bold text-[#831843]">
                        Taman Bunga Bercahaya — Bisikan Hati
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                    Babak 1 daripada 4 · Taman Bunga Bercahaya
                  </p>
                  <h1
                    id="m2-babak1-heading"
                    className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
                  >
                    Selamat Datang ke Taman Bisikan!
                  </h1>
                </div>

                <div className="rounded-3xl bg-[#FFF5F9] border-2 border-[#F9A8D4] p-5 sm:p-6 space-y-3 shadow-inner">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#9D174D]">
                    <Mic className="w-4 h-4 text-[#DB2777]" aria-hidden="true" />
                    <span>Pesanan Guru Pembimbing</span>
                  </div>
                  <div className="space-y-2.5 text-base sm:text-lg leading-relaxed text-[#2B1948]">
                    <p className="font-bold text-[#6B1340]">
                      “{MISSION2_INFO.welcomeDialog[0]}
                    </p>
                    <p>{MISSION2_INFO.welcomeDialog[1]}</p>
                    <p>{MISSION2_INFO.welcomeDialog[2]}</p>
                    <p className="font-bold text-[#5B21B6]">
                      {MISSION2_INFO.welcomeDialog[3]}”
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
                  <button
                    type="button"
                    onClick={() => goToStage('babak2')}
                    className="btn-3d-primary px-6 py-3.5 rounded-2xl font-display font-bold text-base sm:text-lg inline-flex items-center justify-center gap-2 min-h-[52px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
                  >
                    <span>MULA CABARAN</span>
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

        {/* BABAK 2 – DENGAR DAN HAYATI */}
        {stage === 'babak2' && (
          <section
            aria-labelledby="m2-babak2-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#BAE6FD] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E0F2FE] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#0369A1]">
                  Babak 2 daripada 4 · Dengar dan Hayati
                </p>
                <h1
                  id="m2-babak2-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Bandingkan Dua Contoh Bacaan Rangkap 2
                </h1>
              </div>

              {playingSample && (
                <button
                  type="button"
                  onClick={stopAllAudio}
                  className="btn-3d-rose px-4 py-2 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 min-h-[44px] cursor-pointer shrink-0"
                >
                  <Square className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Hentikan Suara</span>
                </button>
              )}
            </div>

            {/* Petikan Rangkap Kedua */}
            <div className="rounded-3xl bg-gradient-to-br from-[#F0F9FF] via-[#FAF5FF] to-[#FFF1F7] border-2 border-[#DDD6FE] p-5 sm:p-6 text-center space-y-2">
              <p className="text-xs sm:text-sm font-bold text-[#6D28D9]">
                Rangkap Kedua Sajak Guruku Pelita Hidup
              </p>
              <div className="space-y-1 font-display text-lg sm:text-2xl font-semibold text-[#2E1654] leading-relaxed">
                {MISSION2_STANZA2_TEXT.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            {/* Dua Kad Audio Bacaan A & B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Contoh A */}
              <div className="rounded-3xl bg-white border-2 border-[#CBD5E1] p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-xl font-bold text-[#334155]">
                      Contoh A
                    </h2>
                    <span className="text-xs font-bold text-[#64748B]">
                      {customAudioA ? 'Audio Guru' : 'Suara Demonstrasi'}
                    </span>
                  </div>
                  <p className="text-base text-[#475569]">
                    Bacaan mendatar tanpa perubahan nada yang ketara.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => playSampleAudio('A')}
                    className="btn-3d-sky px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>
                      {playingSample === 'A' ? 'MAIN SEMULA A' : 'DENGAR BACAAN A'}
                    </span>
                  </button>

                  {playingSample === 'A' && (
                    <button
                      type="button"
                      onClick={stopAllAudio}
                      className="px-4 py-2.5 rounded-2xl bg-[#FEF2F2] text-[#991B1B] border-2 border-[#FCA5A5] font-bold text-sm min-h-[46px] cursor-pointer"
                    >
                      Henti
                    </button>
                  )}
                </div>
              </div>

              {/* Contoh B */}
              <div className="rounded-3xl bg-gradient-to-b from-[#FFFBEB] to-white border-2 border-[#FCD34D] p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-xl font-bold text-[#78350F]">
                      Contoh B
                    </h2>
                    <span className="text-xs font-bold text-[#B45309]">
                      {customAudioB ? 'Audio Guru' : 'Suara Demonstrasi'}
                    </span>
                  </div>
                  <p className="text-base text-[#78350F]">
                    Bacaan dengan nada kagum, penuh harapan dan intonasi yang sesuai.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => playSampleAudio('B')}
                    className="btn-3d-primary px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>
                      {playingSample === 'B' ? 'MAIN SEMULA B' : 'DENGAR BACAAN B'}
                    </span>
                  </button>

                  {playingSample === 'B' && (
                    <button
                      type="button"
                      onClick={stopAllAudio}
                      className="px-4 py-2.5 rounded-2xl bg-[#FEF2F2] text-[#991B1B] border-2 border-[#FCA5A5] font-bold text-sm min-h-[46px] cursor-pointer"
                    >
                      Henti
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mesej Status Audio Sebenar */}
            {audioStatusMsg && (
              <div
                role="status"
                className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#93C5FD] text-sm sm:text-base font-medium text-[#1E3A8A]"
              >
                {audioStatusMsg}
              </div>
            )}

            {audioErrorMsg && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-[#FEF2F2] border-2 border-[#FCA5A5] text-sm sm:text-base text-[#991B1B] flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{audioErrorMsg}</span>
              </div>
            )}

            {/* Pilihan Guru: Ganti Audio Demonstrasi dengan Fail Rakaman Sebenar */}
            <details className="rounded-2xl bg-[#FAF7FF] border border-[#DDD6FE] p-4">
              <summary className="font-display font-bold text-sm sm:text-base text-[#4C1D95] cursor-pointer select-none">
                Pilihan Guru: Gantikan Audio Demonstrasi dengan Fail Rakaman Sebenar
              </summary>
              <div className="mt-3 pt-3 border-t border-[#E9D5FF] grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <label className="block space-y-1.5">
                  <span className="font-bold text-[#3B1E6D] flex items-center gap-1.5">
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    <span>Muat Naik Audio Bacaan A (MP3 / WAV / M4A)</span>
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleUploadCustomAudio('A', e)}
                    className="block w-full text-xs text-[#4C1D95] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:font-bold file:bg-[#EDE9FE] file:text-[#4C1D95] hover:file:bg-[#DDD6FE] cursor-pointer"
                  />
                  {customAudioA && (
                    <span className="block text-xs text-[#047857] font-semibold">
                      Aktif: {customAudioA.name}
                    </span>
                  )}
                </label>

                <label className="block space-y-1.5">
                  <span className="font-bold text-[#3B1E6D] flex items-center gap-1.5">
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    <span>Muat Naik Audio Bacaan B (MP3 / WAV / M4A)</span>
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleUploadCustomAudio('B', e)}
                    className="block w-full text-xs text-[#4C1D95] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:font-bold file:bg-[#FEF3C7] file:text-[#92400E] hover:file:bg-[#FDE68A] cursor-pointer"
                  />
                  {customAudioB && (
                    <span className="block text-xs text-[#047857] font-semibold">
                      Aktif: {customAudioB.name}
                    </span>
                  )}
                </label>
              </div>
            </details>

            {/* Soalan Perbandingan */}
            <div className="pt-2 space-y-4">
              <div className="p-5 rounded-3xl bg-[#FAF5FF] border-2 border-[#DDD6FE]">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]">
                  {MISSION2_AUDIO_COMPARE.question}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {MISSION2_AUDIO_COMPARE.options.map((opt) => {
                  const isSelected = selectedAudioOption === opt.id;
                  const showGreen = isSelected && audioQuizCorrect === true;
                  const showRed = isSelected && audioQuizCorrect === false;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleAnswerAudioQuiz(opt.id)}
                      disabled={audioQuizCorrect === true}
                      className={`text-left p-4 rounded-2xl border-2 font-bold text-base sm:text-lg flex items-center justify-between gap-3 transition-all min-h-[60px] ${
                        showGreen
                          ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                          : showRed
                          ? 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
                          : audioQuizCorrect === true
                          ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] cursor-not-allowed'
                          : 'bg-white border-[#DDD6FE] hover:border-[#7C3AED] hover:bg-[#FAF5FF] text-[#2B1948] cursor-pointer shadow-sm'
                      }`}
                    >
                      <span className="flex items-center gap-3">
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
                        <span>{opt.label}</span>
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

              {audioQuizCorrect === true && (
                <div
                  role="status"
                  className="p-5 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] text-[#065F46] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-6 h-6 text-[#059669] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-display font-bold text-lg">Tepat Sekali!</p>
                      <p className="text-sm sm:text-base mt-0.5">
                        {MISSION2_AUDIO_COMPARE.successFeedback}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => goToStage('babak3')}
                    className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center justify-center gap-2 min-h-[48px] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>TERUSKAN KE DETEKTIF EMOSI</span>
                    <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              )}

              {audioQuizCorrect === false && (
                <div
                  role="status"
                  className="p-4 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-[#991B1B] flex items-start gap-3"
                >
                  <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-display font-bold text-base">
                      Cuba lagi ya!
                    </p>
                    <p className="text-sm sm:text-base mt-0.5">
                      {MISSION2_AUDIO_COMPARE.hint}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* BABAK 3 – DETEKTIF EMOSI */}
        {stage === 'babak3' && (
          <section
            aria-labelledby="m2-babak3-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#FBCFE8] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#FCE7F3] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                  Babak 3 daripada 4 · Detektif Emosi
                </p>
                <h1
                  id="m2-babak3-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Padankan Rangkap Sajak dengan Perasaan
                </h1>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFFBEB] border-2 border-[#FCD34D] text-[#92400E] font-display font-bold text-sm sm:text-base shrink-0 tabular-nums">
                <Star className="w-5 h-5 fill-[#FBBF24] text-[#D97706]" aria-hidden="true" />
                <span>Bintang Cahaya: {savedData.matchedStanzas.length} / 4</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#DDD6FE] text-sm sm:text-base text-[#3B1E6D]">
              <strong>Cara Bermain:</strong> Klik atau sentuh satu <strong>Kad Rangkap</strong>, kemudian klik <strong>Kad Perasaan</strong> yang sepadan (atau seret kad perasaan terus ke kad rangkap).
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
              {/* Lajur Kiri: 4 Kad Rangkap */}
              <div className="lg:col-span-7 space-y-3.5">
                <h2 className="font-display text-lg font-bold text-[#3B1E6D]">
                  1. Pilih Rangkap Sajak
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {GURUKU_PELITA_HIDUP_STANZAS.map((stanza) => {
                    const isMatched = savedData.matchedStanzas.includes(stanza.number);
                    const isSelected = selectedStanzaNum === stanza.number;
                    const matchedChoice = MISSION2_EMOTION_CHOICES.find(
                      (e) => e.stanzaNumber === stanza.number
                    );

                    return (
                      <button
                        key={stanza.number}
                        type="button"
                        onClick={() => handleClickStanzaCard(stanza.number)}
                        onDragOver={(e) => {
                          if (!isMatched) e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const droppedId = e.dataTransfer.getData('text/plain');
                          if (droppedId && !isMatched) {
                            evaluateMatchAttempt(stanza.number, droppedId);
                          }
                        }}
                        disabled={isMatched}
                        aria-pressed={isSelected}
                        className={`text-left rounded-3xl p-4 border-2 transition-all flex flex-col justify-between gap-3 ${
                          isMatched
                            ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                            : isSelected
                            ? 'bg-[#FFFBEB] border-[#F59E0B] ring-4 ring-[#FDE68A] text-[#2E1654] cursor-pointer'
                            : 'bg-white border-[#DDD6FE] hover:border-[#7C3AED] text-[#2B1948] cursor-pointer shadow-sm'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-sm font-bold text-[#6D28D9]">
                              {stanza.label}
                            </span>
                            {isMatched && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#047857]">
                                <Star className="w-4 h-4 fill-[#FBBF24] text-[#D97706]" />
                                <span>Padan!</span>
                              </span>
                            )}
                          </div>
                          <div className="space-y-0.5 text-sm leading-relaxed font-medium">
                            {stanza.lines.map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                          </div>
                        </div>

                        {isMatched && matchedChoice ? (
                          <div className="pt-2 border-t border-[#A7F3D0] text-xs font-bold text-[#047857]">
                            Emosi: {matchedChoice.label}
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-[#F3E8FF] text-xs font-bold text-[#6D28D9]">
                            {isSelected
                              ? 'Dipilih — sekarang pilih Kad Perasaan'
                              : 'Klik untuk pilih rangkap ini'}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lajur Kanan: 4 Kad Perasaan */}
              <div className="lg:col-span-5 space-y-3.5">
                <h2 className="font-display text-lg font-bold text-[#6B1340]">
                  2. Pilih Kad Perasaan yang Sesuai
                </h2>
                <div className="space-y-3">
                  {MISSION2_EMOTION_CHOICES.map((choice) => {
                    const isUsed = savedData.matchedStanzas.includes(choice.stanzaNumber);
                    const isSelected = selectedEmotionId === choice.id;
                    const style = EMOTION_CARD_STYLE[choice.colorScheme];

                    return (
                      <button
                        key={choice.id}
                        type="button"
                        draggable={!isUsed}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', choice.id);
                        }}
                        onClick={() => handleClickEmotionCard(choice)}
                        disabled={isUsed}
                        aria-pressed={isSelected}
                        className={`w-full text-left rounded-2xl p-4 border-2 transition-all flex items-center gap-3.5 min-h-[68px] ${
                          isUsed
                            ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#065F46] opacity-80 cursor-default'
                            : isSelected
                            ? 'bg-[#FFFBEB] border-[#F59E0B] ring-4 ring-[#FDE68A] text-[#2E1654] cursor-pointer shadow-md'
                            : `${style.bg} ${style.border} text-[#2B1948] cursor-pointer shadow-sm`
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-xl ${
                            isUsed
                              ? 'bg-[#D1FAE5] text-[#047857]'
                              : `${style.iconBg} ${style.iconText}`
                          } flex items-center justify-center shrink-0`}
                        >
                          <EmotionIcon iconKey={choice.iconKey} className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                          <p className="font-display text-base font-bold leading-snug">
                            {choice.label}
                          </p>
                          <p className="text-xs font-semibold opacity-80 mt-0.5">
                            {isUsed
                              ? `Dipadankan dengan Rangkap ${choice.stanzaNumber}`
                              : isSelected
                              ? 'Dipilih — klik Rangkap yang sepadan'
                              : 'Klik atau seret ke rangkap'}
                          </p>
                        </div>

                        {isUsed && (
                          <CheckCircle2
                            className="w-5 h-5 text-[#059669] shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Navigasi Babak 3 */}
            <div className="pt-4 border-t border-[#FCE7F3] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak2')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Babak 2</span>
              </button>

              {isEmotionStepDone ? (
                <button
                  type="button"
                  onClick={() => goToStage('babak4')}
                  className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                >
                  <span>TERUSKAN KE KONGSI SUARA HATI</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-sm font-bold text-[#9D174D]">
                  Padankan semua 4 rangkap untuk membuka Babak 4.
                </p>
              )}
            </div>
          </section>
        )}

        {/* BABAK 4 – KONGSI SUARA HATI */}
        {stage === 'babak4' && (
          <section
            aria-labelledby="m2-babak4-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#DDD6FE] shadow-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6"
          >
            <div className="space-y-1 border-b border-[#F3E8FF] pb-4">
              <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                Babak 4 daripada 4 · Kongsi Suara Hati
              </p>
              <h1
                id="m2-babak4-heading"
                className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
              >
                Refleksi Diri &amp; Perbincangan
              </h1>
            </div>

            <div className="space-y-5">
              {MISSION2_REFLECTION_QUESTIONS.map((q) => (
                <div key={q.id} className="space-y-2">
                  <label
                    htmlFor={`reflection-q-${q.id}`}
                    className="block font-display text-base sm:text-lg font-bold text-[#2E1654]"
                  >
                    {q.id}. {q.question}
                  </label>
                  <textarea
                    id={`reflection-q-${q.id}`}
                    rows={3}
                    value={savedData.reflections[q.id] ?? ''}
                    onChange={(e) => handleReflectionTextChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    className="w-full rounded-2xl border-2 border-[#DDD6FE] bg-white px-4 py-3 text-base text-[#2B1948] placeholder:text-[#8E7AB5] focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Aktiviti Perbincangan */}
            <div className="rounded-2xl bg-[#FFFBEB] border-2 border-[#FDE68A] p-4 sm:p-5 space-y-3">
              <div className="flex items-start gap-3">
                <MessageCircle
                  className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-display font-bold text-base text-[#78350F]">
                    Aktiviti Perbincangan
                  </p>
                  <p className="text-sm sm:text-base text-[#92400E]">
                    Bincangkan satu jawapan dengan rakan atau guru kamu.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm font-semibold text-[#78350F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedData.discussionChecked}
                  onChange={(e) =>
                    persistMission2((prev) => ({
                      ...prev,
                      discussionChecked: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded accent-[#D97706] cursor-pointer"
                />
                <span>Saya sudah berbincang satu jawapan bersama rakan atau guru.</span>
              </label>
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

            {(reflectionConfirmation || savedData.reflectionSaved) && (
              <div
                role="status"
                className="p-4 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] text-sm sm:text-base font-semibold text-[#065F46] flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#059669]" />
                <span>
                  {reflectionConfirmation ??
                    'Refleksi kamu telah disimpan secara setempat dalam pelayar ini.'}
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-[#F3E8FF] flex flex-wrap items-center justify-between gap-3">
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

                {allMandatoryDone && (
                  <button
                    type="button"
                    onClick={handleOpenPenamat}
                    className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer"
                  >
                    <span>NYALAKAN CAHAYA KEDUA!</span>
                    <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* PENAMAT MISI 2 */}
        {stage === 'penamat' && (
          <section
            aria-labelledby="m2-penamat-heading"
            className="rounded-[32px] bg-gradient-to-b from-[#FFFBEB] via-[#FFFDF9] to-[#FCE7F3] border-4 border-[#FBBF24] shadow-2xl p-6 sm:p-10 max-w-3xl mx-auto text-center space-y-6"
          >
            {/* Animasi Pelita yang Semakin Terang */}
            <div className="relative inline-flex items-center justify-center">
              <div
                className="animate-lantern-glow absolute -inset-7 rounded-full bg-[#FDE047]/80 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="animate-lantern-glow absolute -inset-3 rounded-full bg-[#F472B6]/45 blur-lg"
                aria-hidden="true"
              />
              <div className="animate-lantern-glow relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-[0_0_36px_rgba(251,191,36,0.75)] bg-[#FEF3C7] flex items-center justify-center">
                {!emblemImgError ? (
                  <img
                    src={ASSETS.pelitaEmblem}
                    alt="Pelita Kasih bersinar lebih terang dengan Cahaya Kedua"
                    referrerPolicy="no-referrer"
                    onError={() => setEmblemImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Flame className="w-16 h-16 text-[#D97706]" aria-hidden="true" />
                )}
              </div>
              <div
                className="animate-twinkle-star absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white border-2 border-[#FBBF24] shadow-md flex items-center justify-center text-[#F59E0B]"
                aria-hidden="true"
              >
                <Star className="w-5 h-5 fill-[#FBBF24]" />
              </div>
              <div
                className="animate-twinkle-star absolute -bottom-2 -left-3 w-9 h-9 rounded-full bg-white border-2 border-[#F472B6] shadow-md flex items-center justify-center text-[#DB2777]"
                aria-hidden="true"
              >
                <Star className="w-4 h-4 fill-[#F472B6]" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/40 text-sm font-bold text-[#92400E]">
                <Award className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                <span>Misi 2 Selesai · Cahaya Kedua Diperoleh</span>
              </div>

              <h1
                id="m2-penamat-heading"
                className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
              >
                {MISSION2_INFO.completionLines[0]}
              </h1>

              <p className="text-lg sm:text-xl font-bold text-[#9D174D] max-w-xl mx-auto">
                {MISSION2_INFO.completionLines[1]}
              </p>

              <p className="text-base sm:text-lg font-semibold text-[#4C1D95]">
                {MISSION2_INFO.completionLines[2]}
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
                onClick={onContinueToMission3}
                className="btn-3d-primary px-6 py-3.5 rounded-2xl font-display font-bold text-base inline-flex items-center justify-center gap-2 min-h-[52px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
              >
                <span>TERUSKAN KE MISI 3</span>
                <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
