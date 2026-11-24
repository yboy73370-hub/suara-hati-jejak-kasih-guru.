import {
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Info,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  MISSION4_ASSESSMENT_ASPECTS,
  MISSION4_RATING_SCALE,
  MISSION5_RUBRIC_ASPECTS,
  MISSION_LOCATIONS,
} from '../data/gameData';
import { ProgressState } from '../types/game';
import {
  countCompletedMissions,
  loadLearningSupportData,
  loadMission2Data,
  loadMission3Data,
  loadMission4Data,
  loadMission5Data,
  loadMission6Data,
} from '../utils/storage';

interface AchievementSummaryModalProps {
  isOpen: boolean;
  progress: ProgressState;
  onClose: () => void;
}

type SummaryTab = 'ringkasan' | 'kuiz' | 'rubrik' | 'refleksi';

function ratingLabel(score: number | undefined): string {
  if (!score) return 'Belum dinilai';
  const match = MISSION4_RATING_SCALE.find((r) => r.value === score);
  return match ? match.label : `${score} / 4`;
}

export function AchievementSummaryModal({
  isOpen,
  progress,
  onClose,
}: AchievementSummaryModalProps) {
  const [activeTab, setActiveTab] = useState<SummaryTab>('ringkasan');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const m2 = loadMission2Data();
  const m3 = loadMission3Data();
  const m4 = loadMission4Data();
  const m5 = loadMission5Data();
  const m6 = loadMission6Data();
  const support = loadLearningSupportData();
  const completedCount = countCompletedMissions(progress);

  // Kenal pasti aspek yang boleh ditambah baik secara dinamik daripada data tersimpan
  const improvementTips: string[] = [];

  if (m3.quizLastScore !== null && m3.quizBestScore < 4) {
    improvementTips.push(
      `Kuiz Rahsia Pelita (Misi 3): Skor terbaik kamu ialah ${m3.quizBestScore}/5. Baca semula 4 Buku Ajaib di Perpustakaan Ajaib untuk memantapkan pemahaman maksud rangkap.`
    );
  }
  if (m6.quizCompleted && m6.quizBestScore < 5) {
    improvementTips.push(
      `Kuiz Permata Ilmu (Misi 6): Skor terbaik kamu ialah ${m6.quizBestScore}/6. Kamu boleh mengulang kuiz pada Babak 2 Misi 6 untuk meningkatkan penguasaan nilai dan teknik deklamasi.`
    );
  }

  for (const aspect of MISSION4_ASSESSMENT_ASPECTS) {
    const score = m4.selfScores[aspect.id];
    if (score && score <= 2) {
      improvementTips.push(
        `Latihan Misi 4 — Aspek "${aspect.label}" (${score}/4): Teruskan berlatih dengan rakaman semula bagi meningkatkan keyakinan dan ketepatan aspek ini.`
      );
    }
  }

  for (const aspect of MISSION5_RUBRIC_ASPECTS) {
    const score = m5.selfScores[aspect.id];
    if (score && score <= 2) {
      improvementTips.push(
        `Persembahan Misi 5 — Aspek "${aspect.label}" (${score}/4): Semak semula rakaman video/audio Pentas Kasih Guru dan beri tumpuan kepada aspek ini apabila membuat persembahan ulangan.`
      );
    }
  }

  if (completedCount < 6) {
    improvementTips.push(
      `Kemajuan Semasa (${completedCount}/6 Misi): Teruskan menyelesaikan misi yang masih belum selesai pada Peta Pulau Terapung untuk melengkapkan keenam-enam cahaya pelita.`
    );
  }

  if (improvementTips.length === 0) {
    improvementTips.push(
      'Tahniah! Semua aktiviti dan rubrik berada pada tahap baik hingga cemerlang. Teruskan mengasah variasi nada, ekspresi wajah dan keyakinan persembahan di pentas sebenar sekolah!'
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-summary-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#22103D]/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-4xl max-h-[90dvh] flex flex-col rounded-3xl bg-white border-2 border-[#DDD6FE] shadow-2xl overflow-hidden text-[#2B1948]">
        {/* Kepala Modal Sticky */}
        <div className="px-5 py-4 sm:px-7 sm:py-5 border-b border-[#EDE9FE] bg-gradient-to-r from-[#FAF5FF] via-[#FFFDF8] to-[#FFF1F7] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B] text-[#B45309] flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="achievement-summary-title"
                className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]"
              >
                Ringkasan Pencapaian & Semakan Rekod
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#5B3E8E]">
                Kemajuan Keseluruhan: {completedCount} / {MISSION_LOCATIONS.length} Misi Selesai
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup ringkasan pencapaian"
            className="w-10 h-10 rounded-xl bg-white hover:bg-[#F3E8FF] border border-[#DDD6FE] text-[#3B1E6D] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigasi */}
        <div
          role="tablist"
          aria-label="Bahagian rekod pembelajaran"
          className="px-5 py-3 bg-[#FAF8FF] border-b border-[#EDE9FE] flex flex-wrap gap-2 shrink-0"
        >
          {[
            { id: 'ringkasan' as const, label: 'Ringkasan & Penambahbaikan' },
            { id: 'kuiz' as const, label: 'Keputusan Kuiz' },
            { id: 'rubrik' as const, label: 'Rubrik Penilaian Kendiri' },
            { id: 'refleksi' as const, label: 'Refleksi Pembelajaran' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-display font-bold text-xs sm:text-sm transition-colors min-h-[40px] cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#6D28D9] text-white shadow-sm'
                  : 'bg-white text-[#4C1D95] border border-[#DDD6FE] hover:bg-[#F3E8FF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Kandungan Boleh Skrol */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {/* Nota Penstoran Setempat */}
          <div className="rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] px-4 py-3 text-xs sm:text-sm font-semibold text-[#075985] flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#0284C7]" aria-hidden="true" />
            <span>
              Semua keputusan kuiz, rubrik, rakaman dan refleksi disimpan secara setempat dalam pelayar peranti ini sahaja dan <strong>tidak</strong> dihantar secara automatik kepada guru atau pelayan luar.
            </span>
          </div>

          {activeTab === 'ringkasan' && (
            <div className="space-y-5">
              {/* Senarai Aktiviti Diselesaikan */}
              <div className="space-y-3">
                <h3 className="font-display text-lg font-bold text-[#2E1654] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#059669]" aria-hidden="true" />
                  <span>Aktiviti Mengikut Enam Misi</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MISSION_LOCATIONS.map((m) => {
                    const status = progress.missions[m.id] ?? 'Belum Bermula';
                    const isDone = status === 'Selesai';
                    return (
                      <div
                        key={m.id}
                        className={`rounded-2xl border-2 p-4 space-y-1 ${
                          isDone
                            ? 'bg-[#ECFDF5] border-[#6EE7B7]'
                            : 'bg-[#FAF8FF] border-[#DDD6FE]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-bold text-sm text-[#4C1D95]">
                            {m.code}: {m.title}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                              isDone
                                ? 'bg-[#059669] text-white'
                                : 'bg-[#EDE9FE] text-[#5B21B6]'
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#3B1E6D]">{m.shortDesc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Aspek Yang Boleh Ditambah Baik */}
              <div className="rounded-3xl bg-[#FFFBEB] border-2 border-[#FCD34D] p-5 space-y-3">
                <h3 className="font-display text-lg font-bold text-[#78350F] flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#D97706]" aria-hidden="true" />
                  <span>Aspek yang Boleh Ditambah Baik</span>
                </h3>
                <ul className="space-y-2 text-sm sm:text-base text-[#451A03] list-disc list-inside">
                  {improvementTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'kuiz' && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-[#2E1654] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7C3AED]" aria-hidden="true" />
                <span>Semakan Keputusan Kuiz Tersimpan</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#FAF5FF] border-2 border-[#C4B5FD] p-5 space-y-2">
                  <p className="text-xs font-bold text-[#6D28D9] uppercase">
                    Misi 3 · Kuiz Rahsia Pelita
                  </p>
                  <p className="font-display text-2xl font-bold text-[#2E1654] tabular-nums">
                    {m3.quizLastScore !== null
                      ? `Skor Terkini: ${m3.quizLastScore} / 5`
                      : 'Belum diselesaikan'}
                  </p>
                  <p className="text-sm font-semibold text-[#5B3E8E] tabular-nums">
                    Skor Terbaik: {m3.quizBestScore} / 5 · Buku Ajaib Dibuka:{' '}
                    {m3.openedBooks.length} / 4
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FFFBEB] border-2 border-[#FCD34D] p-5 space-y-2">
                  <p className="text-xs font-bold text-[#B45309] uppercase">
                    Misi 6 · Kuiz Permata Ilmu
                  </p>
                  <p className="font-display text-2xl font-bold text-[#2E1654] tabular-nums">
                    {m6.quizCompleted && m6.quizLastScore !== null
                      ? `Skor Terkini: ${m6.quizLastScore} / 6`
                      : 'Belum diselesaikan'}
                  </p>
                  <p className="text-sm font-semibold text-[#78350F] tabular-nums">
                    Skor Terbaik: {m6.quizBestScore} / 6
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rubrik' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className="font-display text-lg font-bold text-[#2E1654] flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#6D28D9]" aria-hidden="true" />
                  <span>Rubrik Penilaian Kendiri — Misi 4 (Studio Suara Hati)</span>
                </h3>
                <div className="space-y-2">
                  {MISSION4_ASSESSMENT_ASPECTS.map((aspect) => (
                    <div
                      key={aspect.id}
                      className="rounded-2xl bg-[#FAF8FF] border border-[#DDD6FE] px-4 py-3 flex flex-wrap items-center justify-between gap-2"
                    >
                      <span className="font-semibold text-sm sm:text-base text-[#2E1654]">
                        {aspect.number}. {aspect.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#EDE9FE] text-[#4C1D95] text-xs sm:text-sm font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#D97706]" aria-hidden="true" />
                        <span>{ratingLabel(m4.selfScores[aspect.id])}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-display text-lg font-bold text-[#2E1654] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D97706]" aria-hidden="true" />
                  <span>Rubrik Juri Pelita Emas — Misi 5 (Pentas Kasih Guru)</span>
                </h3>
                <div className="space-y-2">
                  {MISSION5_RUBRIC_ASPECTS.map((aspect) => (
                    <div
                      key={aspect.id}
                      className="rounded-2xl bg-[#FFFDF8] border border-[#FDE68A] px-4 py-3 flex flex-wrap items-center justify-between gap-2"
                    >
                      <span className="font-semibold text-sm sm:text-base text-[#2E1654]">
                        {aspect.number}. {aspect.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#FEF3C7] text-[#92400E] text-xs sm:text-sm font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#D97706]" aria-hidden="true" />
                        <span>{ratingLabel(m5.selfScores[aspect.id])}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'refleksi' && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-[#2E1654] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#DB2777]" aria-hidden="true" />
                <span>Catatan Refleksi Pembelajaran Kamu</span>
              </h3>

              <div className="space-y-3 text-sm">
                <div className="rounded-2xl bg-[#FFF1F7] border border-[#F9A8D4] p-4 space-y-1">
                  <p className="font-display font-bold text-[#9D174D]">
                    Misi 2 · Bisikan Hati
                  </p>
                  <p>
                    <strong>Perasaan rangkap 3:</strong>{' '}
                    {m2.reflections[1] || <em>Belum diisi</em>}
                  </p>
                  <p>
                    <strong>Nada sesuai:</strong>{' '}
                    {m2.reflections[2] || <em>Belum diisi</em>}
                  </p>
                  <p>
                    <strong>Cara menghargai guru:</strong>{' '}
                    {m2.reflections[3] || <em>Belum diisi</em>}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F0F9FF] border border-[#7DD3FC] p-4 space-y-1">
                  <p className="font-display font-bold text-[#0369A1]">
                    Misi 3 · Pemikiran Kritis
                  </p>
                  <p>{m3.criticalAnswer || <em>Belum diisi</em>}</p>
                </div>

                <div className="rounded-2xl bg-[#FAF5FF] border border-[#C4B5FD] p-4 space-y-1">
                  <p className="font-display font-bold text-[#5B21B6]">
                    Misi 4 · Cermin Refleksi & Penambahbaikan
                  </p>
                  <p>
                    <strong>Kekuatan diri:</strong>{' '}
                    {m4.strengthReflection || <em>Belum diisi</em>}
                  </p>
                  <p>
                    <strong>Perlu diperbaiki:</strong>{' '}
                    {m4.improvementNeedReflection || <em>Belum diisi</em>}
                  </p>
                  <p>
                    <strong>Perubahan rakaman kedua:</strong>{' '}
                    {m4.improvementChangeReflection || <em>Belum diisi</em>}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FFFBEB] border border-[#FCD34D] p-4 space-y-1">
                  <p className="font-display font-bold text-[#92400E]">
                    Misi 5 · Refleksi Bintang Suara
                  </p>
                  <p>
                    <strong>Peningkatan persembahan:</strong>{' '}
                    {m5.reflectionQ1 || <em>Belum diisi</em>}
                  </p>
                  <p>
                    <strong>Perasaan disampaikan:</strong>{' '}
                    {m5.reflectionQ2 || <em>Belum diisi</em>}
                  </p>
                  <p>
                    <strong>Pengajaran utama sajak:</strong>{' '}
                    {m5.reflectionQ3 || <em>Belum diisi</em>}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#ECFDF5] border border-[#6EE7B7] p-4 space-y-1">
                  <p className="font-display font-bold text-[#065F46]">
                    Misi 6 · Cermin Kenangan & Surat Kasih Guru
                  </p>
                  <p>
                    <strong>Perkara baharu dipelajari:</strong>{' '}
                    {m6.reflectionQ1 || <em>Belum diisi</em>}
                  </p>
                  <p>
                    <strong>Perkembangan kemahiran:</strong>{' '}
                    {m6.reflectionQ2 || <em>Belum diisi</em>}
                  </p>
                  <p>
                    <strong>Kepentingan menghargai guru:</strong>{' '}
                    {m6.reflectionQ3 || <em>Belum diisi</em>}
                  </p>
                  <p>
                    <strong>Sasaran seterusnya:</strong>{' '}
                    {m6.reflectionQ4 || <em>Belum diisi</em>}
                  </p>
                  {m6.teacherName && (
                    <p>
                      <strong>Guru dihargai:</strong> {m6.teacherName}
                    </p>
                  )}
                </div>

                {(support.kbatAnswers.k1 ||
                  support.kbatAnswers.k2 ||
                  support.kbatAnswers.k3) && (
                  <div className="rounded-2xl bg-[#FAF8FF] border border-[#DDD6FE] p-4 space-y-1">
                    <p className="font-display font-bold text-[#4C1D95] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" aria-hidden="true" />
                      <span>Mod Cabaran (Jawapan KBAT)</span>
                    </p>
                    <p>
                      <strong>KBAT 1:</strong> {support.kbatAnswers.k1 || <em>Belum diisi</em>}
                    </p>
                    <p>
                      <strong>KBAT 2:</strong> {support.kbatAnswers.k2 || <em>Belum diisi</em>}
                    </p>
                    <p>
                      <strong>KBAT 3:</strong> {support.kbatAnswers.k3 || <em>Belum diisi</em>}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 sm:px-7 border-t border-[#EDE9FE] bg-[#FAF8FF] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-3d-primary px-6 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-base min-h-[44px] cursor-pointer"
          >
            Tutup Ringkasan
          </button>
        </div>
      </div>
    </div>
  );
}
