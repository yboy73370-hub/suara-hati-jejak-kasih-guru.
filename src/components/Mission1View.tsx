import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  DoorOpen,
  Flame,
  Heart,
  Sparkles,
  Star,
  Target,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import {
  ASSETS,
  GURUKU_PELITA_HIDUP_STANZAS,
  GURUKU_PELITA_HIDUP_TITLE,
  LEARNING_OBJECTIVES,
  MISSION1_INFO,
  MISSION1_QUIZ_QUESTIONS,
} from '../data/gameData';
import { MissionStatus, PoemStanza } from '../types/game';
import { musicEngine } from '../utils/audioEngine';

type Mission1Stage = 'babak1' | 'babak2' | 'babak3' | 'babak4' | 'penamat';

interface Mission1ViewProps {
  missionStatus: MissionStatus;
  onCompleteMission: () => void;
  onBackToMap: () => void;
  onContinueToMission2: () => void;
}

const STAGE_LIST: Array<{ id: Mission1Stage; label: string; short: string }> = [
  { id: 'babak1', label: 'Babak 1: Selamat Datang', short: 'Babak 1' },
  { id: 'babak2', label: 'Babak 2: Matlamat', short: 'Babak 2' },
  { id: 'babak3', label: 'Babak 3: Kenali Sajak', short: 'Babak 3' },
  { id: 'babak4', label: 'Babak 4: Cabaran', short: 'Babak 4' },
  { id: 'penamat', label: 'Penamat Misi', short: 'Cahaya 1' },
];

function StanzaMiniIllustration({ type }: { type: PoemStanza['illustrationType'] }) {
  switch (type) {
    case 'morning-gate':
      return (
        <svg viewBox="0 0 80 64" className="w-16 h-13 shrink-0" aria-hidden="true">
          <rect width="80" height="64" rx="14" fill="#F3E8FF" />
          <circle cx="58" cy="18" r="9" fill="#FBBF24" />
          <path d="M16 52V30C16 20 26 14 36 14C46 14 56 20 56 30V52H16Z" fill="#C4B5FD" />
          <path d="M24 52V33C24 26 29 22 36 22C43 22 48 26 48 33V52H24Z" fill="#FFFBEB" />
          <path d="M8 52H72" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
          <circle cx="22" cy="18" r="3" fill="#F472B6" />
          <circle cx="49" cy="16" r="2.5" fill="#F472B6" />
        </svg>
      );
    case 'glowing-lantern':
      return (
        <svg viewBox="0 0 80 64" className="w-16 h-13 shrink-0" aria-hidden="true">
          <rect width="80" height="64" rx="14" fill="#FFFBEB" />
          <circle cx="40" cy="34" r="22" fill="#FDE68A" fillOpacity="0.65" />
          <path d="M40 10V16" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
          <rect
            x="29"
            y="18"
            width="22"
            height="28"
            rx="6"
            fill="#FEF3C7"
            stroke="#B45309"
            strokeWidth="2.5"
          />
          <path
            d="M40 26C37.5 26 35.5 28 35.5 30.3C35.5 33.7 40 38 40 38C40 38 44.5 33.7 44.5 30.3C44.5 28 42.5 26 40 26Z"
            fill="#EC4899"
          />
          <path d="M31 50H49" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'heart-support':
      return (
        <svg viewBox="0 0 80 64" className="w-16 h-13 shrink-0" aria-hidden="true">
          <rect width="80" height="64" rx="14" fill="#FCE7F3" />
          <path
            d="M40 48C40 48 20 36 20 23C20 17.5 24.5 13 30 13C33.8 13 37.2 15.2 40 18.5C42.8 15.2 46.2 13 50 13C55.5 13 60 17.5 60 23C60 36 40 48 40 48Z"
            fill="#EC4899"
          />
          <circle cx="18" cy="15" r="3" fill="#FBBF24" />
          <circle cx="63" cy="46" r="3.5" fill="#A855F7" />
        </svg>
      );
    case 'bright-future':
      return (
        <svg viewBox="0 0 80 64" className="w-16 h-13 shrink-0" aria-hidden="true">
          <rect width="80" height="64" rx="14" fill="#E0F2FE" />
          <path
            d="M16 44C23 41 31 41 40 46C49 41 57 41 64 44V24C57 21 49 21 40 26C31 21 23 21 16 24V44Z"
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth="2.5"
          />
          <path d="M40 26V46" stroke="#0284C7" strokeWidth="2.2" />
          <path
            d="M40 8L42.5 13.5L48.5 14.2L44 18.2L45.2 24L40 21L34.8 24L36 18.2L31.5 14.2L37.5 13.5L40 8Z"
            fill="#FBBF24"
          />
        </svg>
      );
  }
}

export function Mission1View({
  missionStatus,
  onCompleteMission,
  onBackToMap,
  onContinueToMission2,
}: Mission1ViewProps) {
  const [stage, setStage] = useState<Mission1Stage>('babak1');
  const [highestStageIndex, setHighestStageIndex] = useState<number>(
    missionStatus === 'Selesai' ? 4 : 0
  );
  const [readStanzas, setReadStanzas] = useState<Record<number, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [gateImgError, setGateImgError] = useState(false);
  const [emblemImgError, setEmblemImgError] = useState(false);

  const currentStageIndex = STAGE_LIST.findIndex((s) => s.id === stage);

  const goToStage = (nextStage: Mission1Stage) => {
    const nextIdx = STAGE_LIST.findIndex((s) => s.id === nextStage);
    setStage(nextStage);
    setHighestStageIndex((prev) => Math.max(prev, nextIdx));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleReadStanza = (stanzaNumber: number) => {
    setReadStanzas((prev) => ({
      ...prev,
      [stanzaNumber]: !prev[stanzaNumber],
    }));
  };

  const currentQuestion = MISSION1_QUIZ_QUESTIONS[currentQuestionIndex];
  const readCount = Object.values(readStanzas).filter(Boolean).length;

  const handleSelectQuizOption = (optionId: 'A' | 'B' | 'C') => {
    if (isAnswerCorrect === true) return;
    setSelectedOption(optionId);
    const correct = optionId === currentQuestion.correctAnswer;
    setIsAnswerCorrect(correct);

    if (correct) {
      musicEngine.playSuccessChime();
    }
  };

  const handleNextQuestionOrFinish = () => {
    if (currentQuestionIndex < MISSION1_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerCorrect(null);
    } else {
      onCompleteMission();
      musicEngine.playSuccessChime();
      goToStage('penamat');
    }
  };

  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-[#7DD3FC] via-[#E0F2FE] to-[#F5EBFF] py-6 sm:py-8">
      {/* Latar hiasan lembut */}
      <div
        className="animate-cloud-drift pointer-events-none hidden md:block absolute top-6 left-8 opacity-75"
        aria-hidden="true"
      >
        <svg width="108" height="46" viewBox="0 0 118 52" fill="none">
          <path
            d="M24 44H95C105.5 44 114 35.8 114 25.5C114 15.9 106.5 8 97 7.1C93.5 2.8 88.2 0 82.2 0C73.4 0 65.9 6.1 63.9 14.3C61.4 13.1 58.6 12.4 55.6 12.4C45.3 12.4 36.9 20.6 36.7 30.8C35.2 30.4 33.6 30.2 32 30.2C23.2 30.2 16 36.4 16 44H24Z"
            fill="white"
            fillOpacity="0.82"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Bar Atas Misi 1: Lokasi, WHERETO, Status & Butang Kembali */}
        <section
          aria-label="Maklumat Misi 1"
          className="rounded-3xl bg-[#FFFDF8]/95 backdrop-blur-md border-2 border-[#FDE68A] shadow-lg p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-bold text-[#9D174D]">
                <span className="inline-flex items-center gap-1.5">
                  <DoorOpen className="w-4 h-4" aria-hidden="true" />
                  <span>{MISSION1_INFO.code}: {MISSION1_INFO.title}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#5B21B6]">{MISSION1_INFO.location}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#0369A1]">{MISSION1_INFO.whereto}</span>
              </div>
              <p className="text-sm sm:text-base text-[#432C6B] font-medium">
                {MISSION1_INFO.purpose}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-2xl bg-[#FAF5FF] border border-[#DDD6FE]">
                <span className="block text-[11px] font-semibold text-[#5B3E8E]">
                  Status Misi
                </span>
                <span className="inline-flex items-center gap-1.5 font-display text-sm font-bold text-[#2E1654]">
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
                <span>Kembali ke Peta Misi</span>
              </button>
            </div>
          </div>

          {/* Penunjuk Kemajuan Babak */}
          <nav aria-label="Kemajuan Babak Misi 1" className="pt-2 border-t border-[#F3E8FF]">
            <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STAGE_LIST.map((item, idx) => {
                const isActive = item.id === stage;
                const isUnlocked = idx <= highestStageIndex;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => {
                        if (isUnlocked) setStage(item.id);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-center transition-colors min-h-[40px] ${
                        isActive
                          ? 'bg-[#7C3AED] text-white shadow-sm'
                          : isUnlocked
                          ? 'bg-[#F3E8FF] text-[#4C1D95] hover:bg-[#DDD6FE] cursor-pointer'
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

        {/* BABAK 1 – SELAMAT DATANG */}
        {stage === 'babak1' && (
          <section
            aria-labelledby="babak1-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#DDD6FE] shadow-xl p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
              {/* Ilustrasi Gerbang Istana & Guru Pembimbing */}
              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-[#EDE9FE] via-[#FCE7F3] to-[#DBEAFE] aspect-[4/3]">
                  {!gateImgError ? (
                    <img
                      src={ASSETS.mission1Gate}
                      alt="Guru penyayang menyambut murid di Pintu Gerbang Istana Ajaib sambil memegang pelita emas berbentuk hati"
                      referrerPolicy="no-referrer"
                      onError={() => setGateImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <DoorOpen className="w-12 h-12 text-[#6D28D9] mb-2" aria-hidden="true" />
                      <p className="font-display text-xl font-bold text-[#3B1E6D]">
                        Gerbang Kasih — Istana Ajaib
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dialog Guru Pembimbing */}
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                    Babak 1 daripada 4 · Sambutan Guru Pembimbing
                  </p>
                  <h1
                    id="babak1-heading"
                    className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
                  >
                    Selamat Datang ke Gerbang Kasih!
                  </h1>
                </div>

                <div className="rounded-3xl bg-[#FAF5FF] border-2 border-[#C4B5FD] p-5 sm:p-6 space-y-3 shadow-inner">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#6D28D9]">
                    <Heart className="w-4 h-4 fill-[#EC4899] text-[#EC4899]" aria-hidden="true" />
                    <span>Pesanan Guru Pembimbing</span>
                  </div>
                  <div className="space-y-2.5 text-base sm:text-lg leading-relaxed text-[#2B1948]">
                    <p className="font-bold text-[#4C1D95]">
                      “{MISSION1_INFO.welcomeDialog[0]}
                    </p>
                    <p>{MISSION1_INFO.welcomeDialog[1]}</p>
                    <p className="font-bold text-[#9D174D]">
                      {MISSION1_INFO.welcomeDialog[2]}”
                    </p>
                  </div>
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

        {/* BABAK 2 – MATLAMAT PEMBELAJARAN */}
        {stage === 'babak2' && (
          <section
            aria-labelledby="babak2-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#FBCFE8] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#FCE7F3] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                  Babak 2 daripada 4 · Hala Tuju Pengembaraan (Where & Why)
                </p>
                <h1
                  id="babak2-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Matlamat Pembelajaran &amp; Kriteria Kejayaan
                </h1>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-sm font-bold text-[#92400E] shrink-0">
                <Target className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                <span>3 Objektif · 1 Produk Akhir</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Tiga Objektif Pembelajaran */}
              <div className="lg:col-span-7 space-y-3">
                <h2 className="font-display text-xl font-bold text-[#3B1E6D]">
                  Objektif Pembelajaran Kita
                </h2>
                <ol className="space-y-3">
                  {LEARNING_OBJECTIVES.map((obj) => (
                    <li
                      key={obj.number}
                      className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAF7FF] border border-[#DDD6FE]"
                    >
                      <span className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white font-display font-bold text-base flex items-center justify-center shrink-0 tabular-nums">
                        {obj.number}
                      </span>
                      <p className="text-base leading-relaxed text-[#2B1948] font-medium">
                        {obj.number === 3
                          ? 'Menghasilkan video deklamasi yang kreatif dan yakin serta menambah baik persembahan berdasarkan maklum balas.'
                          : obj.text}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Produk Akhir & Kriteria Kejayaan */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border-2 border-[#FCD34D] space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#92400E]">
                    <Video className="w-5 h-5 text-[#D97706]" aria-hidden="true" />
                    <span>Produk Akhir Pengembaraan</span>
                  </div>
                  <p className="font-display text-xl font-bold text-[#451A03]">
                    “{MISSION1_INFO.finalProduct}”
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-[#FFF5F9] border-2 border-[#FBCFE8] space-y-3">
                  <h2 className="font-display text-xl font-bold text-[#6B1340]">
                    Kriteria Kejayaan
                  </h2>
                  <ul className="space-y-2.5">
                    {MISSION1_INFO.successCriteria.map((criterion) => (
                      <li
                        key={criterion}
                        className="flex items-start gap-2.5 text-base text-[#4A1D38] font-medium"
                      >
                        <CheckCircle2
                          className="w-5 h-5 text-[#DB2777] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F3E8FF] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak1')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={() => goToStage('babak3')}
                className="btn-3d-primary px-7 py-3 rounded-2xl font-display font-bold text-base sm:text-lg inline-flex items-center gap-2 min-h-[50px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
              >
                <span>SETERUSNYA</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {/* BABAK 3 – KENALI SAJAK */}
        {stage === 'babak3' && (
          <section
            aria-labelledby="babak3-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#DDD6FE] shadow-xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-[#F3E8FF] pb-4">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                  Babak 3 daripada 4 · Kenali Teks Sajak Asli
                </p>
                <h1
                  id="babak3-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  TAJUK: {GURUKU_PELITA_HIDUP_TITLE}
                </h1>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-[#5B21B6] bg-[#F3E8FF] px-4 py-2 rounded-2xl shrink-0">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                <span className="tabular-nums">
                  {readCount} / {GURUKU_PELITA_HIDUP_STANZAS.length} Rangkap Dibaca
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#432C6B]">
              Baca keempat-empat rangkap sajak di bawah dengan teliti. Kamu boleh menekan setiap kad rangkap untuk menandakannya selepas membaca.
            </p>

            {/* Susun Atur Empat Kad Rangkap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {GURUKU_PELITA_HIDUP_STANZAS.map((stanza) => {
                const isRead = Boolean(readStanzas[stanza.number]);
                return (
                  <button
                    key={stanza.number}
                    type="button"
                    onClick={() => toggleReadStanza(stanza.number)}
                    aria-pressed={isRead}
                    className={`text-left rounded-3xl p-5 sm:p-6 border-2 transition-all duration-150 flex flex-col justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                      isRead
                        ? 'bg-[#FFFBEB] border-[#F59E0B] shadow-[0_0_20px_rgba(251,191,36,0.28)]'
                        : 'bg-white border-[#DDD6FE] hover:border-[#8B5CF6] shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <span className="inline-block font-display text-base font-bold text-[#6D28D9]">
                          {stanza.label}:
                        </span>
                        <div className="space-y-1 text-base sm:text-[17px] leading-relaxed font-medium text-[#2B1948]">
                          {stanza.lines.map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                      </div>
                      <StanzaMiniIllustration type={stanza.illustrationType} />
                    </div>

                    <div className="pt-2 border-t border-[#F3E8FF] flex items-center justify-between text-xs sm:text-sm font-bold">
                      {isRead ? (
                        <span className="inline-flex items-center gap-1.5 text-[#B45309]">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          <span>Sudah Dibaca</span>
                        </span>
                      ) : (
                        <span className="text-[#6D28D9]">Tekan untuk tanda sudah baca</span>
                      )}
                      <span className="text-[#9D174D] tabular-nums">
                        {stanza.number} / 4
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#F3E8FF] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('babak2')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={() => goToStage('babak4')}
                className="btn-3d-primary px-7 py-3 rounded-2xl font-display font-bold text-base sm:text-lg inline-flex items-center gap-2 min-h-[50px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
              >
                <span>TERUSKAN KE CABARAN</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {/* BABAK 4 – CABARAN GERBANG KASIH (Kuiz 3 Soalan, Satu Pada Satu Masa) */}
        {stage === 'babak4' && (
          <section
            aria-labelledby="babak4-heading"
            className="rounded-[32px] bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#FDE68A] shadow-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#F3E8FF] pb-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#9D174D]">
                  Babak 4 daripada 4 · Cabaran Gerbang Kasih
                </p>
                <h1
                  id="babak4-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#2E1654]"
                >
                  Jawab Kuiz untuk Membuka Gerbang!
                </h1>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-[#FAF5FF] border border-[#DDD6FE] font-display font-bold text-sm sm:text-base text-[#4C1D95] tabular-nums shrink-0">
                Soalan {currentQuestionIndex + 1} / {MISSION1_QUIZ_QUESTIONS.length}
              </div>
            </div>

            {/* Soalan Semasa */}
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-[#FAF5FF] border-2 border-[#DDD6FE]">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]">
                  Soalan {currentQuestion.id}: {currentQuestion.question}
                </h2>
              </div>

              {/* Pilihan Jawapan A, B, C */}
              <div className="space-y-3" role="group" aria-label="Pilihan Jawapan">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const showGreen = isSelected && isAnswerCorrect === true;
                  const showRed = isSelected && isAnswerCorrect === false;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectQuizOption(opt.id)}
                      disabled={isAnswerCorrect === true}
                      className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-base sm:text-lg flex items-center justify-between gap-4 transition-all duration-150 min-h-[58px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                        showGreen
                          ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] shadow-md'
                          : showRed
                          ? 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
                          : isAnswerCorrect === true
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
                        <CheckCircle2
                          className="w-6 h-6 text-[#059669] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {showRed && (
                        <AlertCircle
                          className="w-6 h-6 text-[#DC2626] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Kotak Maklum Balas Betul / Salah */}
              {isAnswerCorrect === true && (
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
                      <p className="font-display font-bold text-lg">Jawapan Betul!</p>
                      <p className="text-sm sm:text-base mt-0.5">
                        {currentQuestion.successFeedback}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextQuestionOrFinish}
                    className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center justify-center gap-2 min-h-[48px] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>
                      {currentQuestionIndex < MISSION1_QUIZ_QUESTIONS.length - 1
                        ? 'SOALAN SETERUSNYA'
                        : 'BUKA GERBANG KASIH!'}
                    </span>
                    <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              )}

              {isAnswerCorrect === false && (
                <div
                  role="status"
                  className="p-5 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-[#991B1B] flex items-start gap-3"
                >
                  <AlertCircle
                    className="w-6 h-6 text-[#DC2626] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-display font-bold text-lg">
                      Kurang tepat! Cuba lagi ya, Wira Suara Hati.
                    </p>
                    <p className="text-sm sm:text-base mt-1">{currentQuestion.hint}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#F3E8FF] flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToStage('babak3')}
                className="btn-3d-lavender px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[46px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Semak Sajak Semula</span>
              </button>
            </div>
          </section>
        )}

        {/* PENAMAT MISI */}
        {stage === 'penamat' && (
          <section
            aria-labelledby="penamat-heading"
            className="rounded-[32px] bg-gradient-to-b from-[#FFFBEB] via-[#FFFDF9] to-[#F5F3FF] border-4 border-[#FCD34D] shadow-2xl p-6 sm:p-10 max-w-3xl mx-auto text-center space-y-6"
          >
            {/* Animasi Pelita Bercahaya & Cahaya Pertama */}
            <div className="relative inline-flex items-center justify-center">
              <div
                className="animate-lantern-glow absolute -inset-4 rounded-full bg-[#FDE68A]/70 blur-xl"
                aria-hidden="true"
              />
              <div className="animate-lantern-glow relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-[#FEF3C7] flex items-center justify-center">
                {!emblemImgError ? (
                  <img
                    src={ASSETS.pelitaEmblem}
                    alt="Pelita Kasih menyala terang dengan Cahaya Pertama"
                    referrerPolicy="no-referrer"
                    onError={() => setEmblemImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Flame className="w-16 h-16 text-[#D97706]" aria-hidden="true" />
                )}
              </div>
              <div
                className="animate-twinkle-star absolute -top-2 -right-3 w-10 h-10 rounded-full bg-white border-2 border-[#FBBF24] shadow-md flex items-center justify-center text-[#F59E0B]"
                aria-hidden="true"
              >
                <Star className="w-5 h-5 fill-[#FBBF24]" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/40 text-sm font-bold text-[#92400E]">
                <Award className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                <span>Misi 1 Selesai · Cahaya Pertama Diperoleh</span>
              </div>

              <h1
                id="penamat-heading"
                className="font-display text-3xl sm:text-4xl font-bold text-[#2E1654]"
              >
                {MISSION1_INFO.completionLines[0]}
              </h1>

              <p className="text-lg sm:text-xl font-bold text-[#9D174D] max-w-xl mx-auto">
                {MISSION1_INFO.completionLines[1]}
              </p>

              <p className="text-base sm:text-lg font-semibold text-[#4C1D95]">
                {MISSION1_INFO.completionLines[2]}
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
                onClick={onContinueToMission2}
                className="btn-3d-primary px-6 py-3.5 rounded-2xl font-display font-bold text-base inline-flex items-center justify-center gap-2 min-h-[52px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
              >
                <span>TERUSKAN KE MISI 2</span>
                <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
