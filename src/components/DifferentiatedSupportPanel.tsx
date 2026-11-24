import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Lightbulb,
  Save,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useState } from 'react';
import {
  DIFFERENTIATED_GLOSSARY,
  DIFFERENTIATED_KBAT_QUESTIONS,
  GURUKU_PELITA_HIDUP_STANZAS,
  GURUKU_PELITA_HIDUP_TITLE,
  MISSION4_STANZA_PRACTICE,
} from '../data/gameData';
import { LearningMode, LearningSupportSavedData } from '../types/game';
import { loadLearningSupportData, saveLearningSupportData } from '../utils/storage';

interface DifferentiatedSupportPanelProps {
  learningMode: LearningMode;
  onChangeMode: (nextMode: LearningMode) => void;
}

const MODE_OPTIONS: Array<{
  id: LearningMode;
  label: string;
  badge: string;
  desc: string;
  activeClass: string;
}> = [
  {
    id: 'bimbingan',
    label: 'Mod Bimbingan',
    badge: 'Teks Besar & Glosari',
    desc: 'Penerangan perkataan sukar, teks sajak lebih besar dan contoh nada setiap rangkap.',
    activeClass: 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] shadow-sm',
  },
  {
    id: 'standard',
    label: 'Mod Standard',
    badge: 'Laluan Teras',
    desc: 'Aktiviti sedia ada mengikut susunan Misi 1 hingga Misi 6.',
    activeClass: 'bg-[#F5F3FF] border-[#7C3AED] text-[#3B1E6D] shadow-sm',
  },
  {
    id: 'cabaran',
    label: 'Mod Cabaran',
    badge: 'Soalan KBAT',
    desc: 'Soalan pemikiran aras tinggi (KBAT) tentang mesej, nilai dan penghayatan sajak.',
    activeClass: 'bg-[#FFFBEB] border-[#F59E0B] text-[#78350F] shadow-sm',
  },
];

export function DifferentiatedSupportPanel({
  learningMode,
  onChangeMode,
}: DifferentiatedSupportPanelProps) {
  const [supportData, setSupportData] = useState<LearningSupportSavedData>(() =>
    loadLearningSupportData()
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(learningMode !== 'standard');
  const [revealedIdeas, setRevealedIdeas] = useState<Record<string, boolean>>({});
  const [kbatNotice, setKbatNotice] = useState<string | null>(null);
  const [kbatError, setKbatError] = useState<string | null>(null);

  const handleSelectMode = (mode: LearningMode) => {
    onChangeMode(mode);
    setSupportData((prev) => {
      const next: LearningSupportSavedData = {
        ...prev,
        mode,
        savedAt: new Date().toISOString(),
      };
      saveLearningSupportData(next);
      return next;
    });
    if (mode !== 'standard') {
      setIsExpanded(true);
    }
  };

  const handleSaveKbat = () => {
    const q1 = supportData.kbatAnswers.k1.trim();
    const q2 = supportData.kbatAnswers.k2.trim();
    const q3 = supportData.kbatAnswers.k3.trim();
    if (q1.length < 8 && q2.length < 8 && q3.length < 8) {
      setKbatError(
        'Sila tulis jawapan KBAT bagi sekurang-kurangnya satu soalan sebelum menyimpan.'
      );
      setKbatNotice(null);
      return;
    }

    const next: LearningSupportSavedData = {
      ...supportData,
      mode: learningMode,
      kbatSaved: true,
      savedAt: new Date().toISOString(),
    };
    saveLearningSupportData(next);
    setSupportData(next);
    setKbatError(null);
    setKbatNotice(
      'Jawapan KBAT berjaya disimpan secara setempat dalam pelayar ini!'
    );
  };

  return (
    <section
      aria-label="Sokongan Pembelajaran Berbeza Mengikut Tahap Murid"
      className="rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#DDD6FE] shadow-md p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6D28D9]">
            <Sparkles className="w-4 h-4 text-[#DB2777]" aria-hidden="true" />
            <span>Sokongan Pembelajaran Berbeza</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#2E1654]">
            Pilih Tahap Keselesaan Belajar Kamu
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 lg:max-w-2xl">
          {MODE_OPTIONS.map((opt) => {
            const isActive = learningMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleSelectMode(opt.id)}
                className={`text-left px-3.5 py-2.5 rounded-2xl border-2 transition-all min-h-[54px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
                  isActive
                    ? opt.activeClass
                    : 'bg-[#FAF8FF] border-[#E9D5FF] text-[#3B1E6D] hover:border-[#C4B5FD]'
                }`}
              >
                <span className="block font-display text-sm font-bold leading-tight">
                  {opt.label}
                </span>
                <span className="block text-[11px] font-semibold opacity-85 mt-0.5">
                  {opt.badge}
                </span>
              </button>
            );
          })}
        </div>

        {learningMode !== 'standard' && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="px-3.5 py-2 rounded-xl bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#DDD6FE] text-xs sm:text-sm font-bold text-[#4C1D95] inline-flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer shrink-0"
          >
            <span>{isExpanded ? 'Sembunyikan Bahan' : 'Buka Bahan Tahap'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Penerangan Ringkas Mod Aktif */}
      {learningMode === 'standard' && (
        <p className="text-xs sm:text-sm text-[#432C6B] bg-[#FAF5FF] rounded-2xl px-4 py-2.5 border border-[#EDE9FE]">
          <strong>Mod Standard aktif:</strong> Semua aktiviti sedia ada dari Misi 1 hingga Misi 6 sedia dimainkan pada peta pulau di atas. Kamu boleh bertukar ke <strong>Mod Bimbingan</strong> atau <strong>Mod Cabaran</strong> pada bila-bila masa.
        </p>
      )}

      {/* MOD BIMBINGAN: Glosari, Teks Lebih Besar & Contoh Nada */}
      {learningMode === 'bimbingan' && isExpanded && (
        <div className="space-y-5 pt-2 border-t border-[#E9D5FF]">
          <div className="rounded-2xl bg-[#ECFDF5] border border-[#6EE7B7] p-4 text-sm sm:text-base text-[#065F46] font-medium">
            <strong>Mod Bimbingan Aktif:</strong> Teks sajak dipaparkan dengan saiz huruf lebih besar bersama maksud perkataan sukar dan contoh nada setiap rangkap untuk membantu kamu membaca dengan tenang.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Teks Sajak Bersaiz Besar + Contoh Nada */}
            <div className="lg:col-span-6 rounded-3xl bg-[#FFFDF8] border-2 border-[#6EE7B7] p-5 space-y-4">
              <div className="flex items-center gap-2 font-display text-lg font-bold text-[#065F46]">
                <BookOpen className="w-5 h-5 text-[#059669]" aria-hidden="true" />
                <span>Teks Sajak Bersaiz Besar: {GURUKU_PELITA_HIDUP_TITLE}</span>
              </div>

              <div className="space-y-4">
                {GURUKU_PELITA_HIDUP_STANZAS.map((stanza, index) => {
                  const guide = MISSION4_STANZA_PRACTICE[index];
                  return (
                    <div
                      key={stanza.number}
                      className="rounded-2xl bg-[#F0FDF4] border border-[#A7F3D0] p-4 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-display text-base font-bold text-[#047857]">
                          {stanza.label}
                        </span>
                        {guide && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#9D174D] bg-[#FCE7F3] px-2.5 py-1 rounded-lg">
                            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{guide.recommendedTone}</span>
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-lg sm:text-xl leading-relaxed font-semibold text-[#1E1033]">
                        {stanza.lines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Penerangan Perkataan Sukar & Panduan Nada */}
            <div className="lg:col-span-6 rounded-3xl bg-[#FAF5FF] border-2 border-[#C4B5FD] p-5 space-y-4">
              <div className="flex items-center gap-2 font-display text-lg font-bold text-[#4C1D95]">
                <Lightbulb className="w-5 h-5 text-[#D97706]" aria-hidden="true" />
                <span>Glosari Perkataan Sukar & Contoh Nada</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {DIFFERENTIATED_GLOSSARY.map((item) => (
                  <div
                    key={item.word}
                    className="rounded-2xl bg-white border border-[#DDD6FE] p-3.5 space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-display text-base sm:text-lg font-bold text-[#5B21B6]">
                        {item.word}
                      </span>
                      <span className="text-xs font-bold text-[#9D174D] bg-[#FFF1F7] px-2.5 py-0.5 rounded-lg">
                        {item.stanzaRef}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[#2B1948]">{item.meaning}</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#047857]">
                      Contoh nada: {item.toneExample}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOD CABARAN: Soalan KBAT */}
      {learningMode === 'cabaran' && isExpanded && (
        <div className="space-y-4 pt-2 border-t border-[#FDE68A]">
          <div className="rounded-2xl bg-[#FFFBEB] border border-[#FCD34D] p-4 text-sm sm:text-base text-[#78350F] font-medium">
            <strong>Mod Cabaran (KBAT) Aktif:</strong> Uji pemikiran kritis kamu tentang mesej tersirat, nilai murni dan teknik penghayatan sajak <em>Guruku Pelita Hidup</em>.
          </div>

          <div className="space-y-4">
            {DIFFERENTIATED_KBAT_QUESTIONS.map((q) => {
              const showIdea = Boolean(revealedIdeas[q.id]);
              return (
                <div
                  key={q.id}
                  className="rounded-2xl bg-[#FFFDF8] border-2 border-[#FDE68A] p-4 sm:p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-lg">
                      <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>KBAT {q.number} · {q.focus}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedIdeas((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      className="text-xs font-bold text-[#6D28D9] hover:underline cursor-pointer"
                    >
                      {showIdea ? 'Tutup Panduan Idea' : 'Lihat Panduan Idea KBAT'}
                    </button>
                  </div>

                  <label
                    htmlFor={`kbat-${q.id}`}
                    className="block font-display text-base sm:text-lg font-bold text-[#2E1654]"
                  >
                    {q.question}
                  </label>

                  <textarea
                    id={`kbat-${q.id}`}
                    rows={2}
                    value={supportData.kbatAnswers[q.id]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setKbatNotice(null);
                      setKbatError(null);
                      setSupportData((prev) => {
                        const next: LearningSupportSavedData = {
                          ...prev,
                          kbatAnswers: { ...prev.kbatAnswers, [q.id]: val },
                          kbatSaved: false,
                        };
                        saveLearningSupportData(next);
                        return next;
                      });
                    }}
                    placeholder={q.placeholder}
                    className="w-full rounded-xl border-2 border-[#DDD6FE] bg-white px-3.5 py-2.5 text-sm sm:text-base text-[#2B1948] placeholder:text-[#8E7AB5] focus:border-[#7C3AED] focus:outline-none"
                  />

                  {showIdea && (
                    <div className="rounded-xl bg-[#FAF5FF] border border-[#C4B5FD] p-3 text-xs sm:text-sm font-medium text-[#4C1D95]">
                      {q.modelIdea}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {kbatError && (
            <p role="alert" className="text-sm font-bold text-[#DC2626]">
              {kbatError}
            </p>
          )}
          {kbatNotice && (
            <div
              role="status"
              className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#10B981] text-sm font-semibold text-[#065F46] flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
              <span>{kbatNotice}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveKbat}
              className="btn-3d-primary px-5 py-2.5 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 min-h-[44px] cursor-pointer"
            >
              <Save className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>SIMPAN JAWAPAN KBAT</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
