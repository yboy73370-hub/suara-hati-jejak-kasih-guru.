import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileAudio,
  FileVideo,
  Mic,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Square,
  Upload,
  Video,
} from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  PerformanceMediaKind,
  StoredPerformanceRecord,
} from '../utils/performanceDb';

export interface ActivePerformanceEntry {
  url: string;
  record: StoredPerformanceRecord;
}

interface PerformanceRecorderCardProps {
  performance: ActivePerformanceEntry | null;
  hasPlayedBack: boolean;
  storageWarning: string | null;
  onSavePerformance: (record: StoredPerformanceRecord) => Promise<void>;
  onClearForRerecord: () => Promise<void>;
  onPlaybackVerified: () => void;
  onPauseBackgroundMusic: () => void;
  onRecordingActiveChange?: (isActive: boolean) => void;
}

const AUDIO_MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
];

const VIDEO_MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4',
];

function pickSupportedMime(kind: PerformanceMediaKind): string | undefined {
  if (typeof window === 'undefined' || !('MediaRecorder' in window)) {
    return undefined;
  }
  if (typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }
  const candidates = kind === 'video' ? VIDEO_MIME_CANDIDATES : AUDIO_MIME_CANDIDATES;
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function extensionFromMime(
  mimeType: string,
  kind: PerformanceMediaKind,
  fallbackName?: string
): string {
  const lower = mimeType.toLowerCase();
  if (kind === 'video') {
    if (lower.includes('mp4')) return 'mp4';
    if (lower.includes('quicktime') || lower.includes('mov')) return 'mov';
    if (lower.includes('webm')) return 'webm';
  } else {
    if (lower.includes('mp4') || lower.includes('m4a')) return 'm4a';
    if (lower.includes('ogg')) return 'ogg';
    if (lower.includes('wav')) return 'wav';
    if (lower.includes('mpeg') || lower.includes('mp3')) return 'mp3';
    if (lower.includes('webm')) return 'webm';
  }
  if (fallbackName && fallbackName.includes('.')) {
    const ext = fallbackName.split('.').pop();
    if (ext) return ext;
  }
  return 'webm';
}

export function formatPerformanceDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function readMediaDuration(objectUrl: string, kind: PerformanceMediaKind): Promise<number> {
  return new Promise((resolve) => {
    const el = document.createElement(kind === 'video' ? 'video' : 'audio');
    let settled = false;
    const finish = (val: number) => {
      if (settled) return;
      settled = true;
      el.src = '';
      resolve(Number.isFinite(val) && val > 0 ? Math.round(val) : 0);
    };
    const timer = window.setTimeout(() => finish(0), 2500);
    el.preload = 'metadata';
    el.onloadedmetadata = () => {
      window.clearTimeout(timer);
      finish(el.duration);
    };
    el.onerror = () => {
      window.clearTimeout(timer);
      finish(0);
    };
    el.src = objectUrl;
  });
}

export function PerformanceRecorderCard({
  performance,
  hasPlayedBack,
  storageWarning,
  onSavePerformance,
  onClearForRerecord,
  onPlaybackVerified,
  onPauseBackgroundMusic,
  onRecordingActiveChange,
}: PerformanceRecorderCardProps) {
  const [recordingMode, setRecordingMode] = useState<PerformanceMediaKind | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [waveLevels, setWaveLevels] = useState<number[]>(() => Array(16).fill(22));
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioUploadRef = useRef<HTMLInputElement | null>(null);
  const videoUploadRef = useRef<HTMLInputElement | null>(null);

  const supportsCapture =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof window !== 'undefined' &&
    'MediaRecorder' in window;

  const stopHardwareAndTimers = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setWaveLevels(Array(16).fill(22));
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Abaikan ralat penutupan ketika unmount
        }
      }
      stopHardwareAndTimers();
    };
  }, []);

  // Sambungkan pratinjau kamera secara langsung apabila mod rakaman video aktif
  useEffect(() => {
    if (recordingMode === 'video' && streamRef.current && liveVideoRef.current) {
      liveVideoRef.current.srcObject = streamRef.current;
      void liveVideoRef.current.play().catch(() => undefined);
    }
  }, [recordingMode]);

  const startWaveformMonitor = (stream: MediaStream) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateBars = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars: number[] = [];
        for (let i = 0; i < 16; i += 1) {
          const val = dataArray[i] ?? 0;
          const pct = Math.max(18, Math.min(100, Math.round((val / 255) * 100) + 18));
          bars.push(pct);
        }
        setWaveLevels(bars);
        rafRef.current = window.requestAnimationFrame(updateBars);
      };
      rafRef.current = window.requestAnimationFrame(updateBars);
    } catch {
      // Abaikan jika Web Audio analyser tidak disokong
    }
  };

  const handleStartCapture = async (kind: PerformanceMediaKind) => {
    if (recordingMode !== null || isProcessing) return;
    setErrorMsg(null);
    setStatusMsg(null);
    setIsPreviewPlaying(false);
    onPauseBackgroundMusic();

    if (!supportsCapture) {
      setErrorMsg(
        kind === 'video'
          ? 'Pelayar atau paparan ini tidak menyokong rakaman kamera secara langsung. Kamu boleh gunakan butang MUAT NAIK VIDEO atau MUAT NAIK AUDIO di bawah.'
          : 'Pelayar atau paparan ini tidak menyokong rakaman mikrofon secara langsung. Sila gunakan butang MUAT NAIK AUDIO di bawah.'
      );
      return;
    }

    try {
      const constraints: MediaStreamConstraints =
        kind === 'video'
          ? {
              audio: true,
              video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
            }
          : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickSupportedMime(kind);
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      elapsedRef.current = 0;
      setElapsedSeconds(0);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        stopHardwareAndTimers();
        setRecordingMode(null);
        setIsProcessing(false);
        onRecordingActiveChange?.(false);
        setErrorMsg(
          'Berlaku gangguan semasa merakam persembahan. Sila cuba semula atau muat naik fail audio/video.'
        );
      };

      recorder.onstop = async () => {
        const finalDuration = Math.max(1, elapsedRef.current);
        const fallbackMime = kind === 'video' ? 'video/webm' : 'audio/webm';
        const finalMime = recorder.mimeType || mimeType || fallbackMime;
        const blob = new Blob(chunksRef.current, { type: finalMime });

        stopHardwareAndTimers();
        setRecordingMode(null);
        onRecordingActiveChange?.(false);

        if (blob.size === 0) {
          setErrorMsg(
            'Tiada data rakaman sebenar dikesan. Pastikan mikrofon/kamera berfungsi dan cuba rakam selama sekurang-kurangnya 2 saat.'
          );
          setIsProcessing(false);
          return;
        }

        setIsProcessing(true);
        const ext = extensionFromMime(finalMime, kind);
        const record: StoredPerformanceRecord = {
          id: 'misi5_persembahan_akhir',
          mediaKind: kind,
          blob,
          mimeType: finalMime,
          durationSeconds: finalDuration,
          fileName: `pentas_kasih_guru_${kind}.${ext}`,
          source: kind === 'video' ? 'recorded-video' : 'recorded-audio',
          updatedAt: new Date().toISOString(),
        };

        await onSavePerformance(record);
        setIsProcessing(false);
        setStatusMsg(
          `Rakaman ${kind === 'video' ? 'video' : 'audio'} berjaya disimpan! Sila tekan MAIN SEMULA untuk menyemak hasil persembahan kamu.`
        );
      };

      recorder.start(300);
      setRecordingMode(kind);
      onRecordingActiveChange?.(true);
      startWaveformMonitor(stream);

      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSeconds(elapsedRef.current);
      }, 1000);
    } catch (err) {
      stopHardwareAndTimers();
      setRecordingMode(null);
      onRecordingActiveChange?.(false);

      const errorName = err instanceof DOMException ? err.name : '';
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setErrorMsg(
          kind === 'video'
            ? 'Akses kamera atau mikrofon tidak dibenarkan dalam paparan pelayar ini (contohnya sekatan kebenaran Preview). Jangan risau—kamu boleh gunakan butang MUAT NAIK VIDEO atau MUAT NAIK AUDIO di bawah sebagai alternatif.'
            : 'Akses mikrofon tidak dibenarkan dalam paparan pelayar ini. Kamu boleh benarkan mikrofon pada tetapan pelayar atau gunakan butang MUAT NAIK AUDIO di bawah.'
        );
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setErrorMsg(
          kind === 'video'
            ? 'Kamera atau mikrofon tidak dikesan pada peranti ini. Gunakan pilihan MUAT NAIK VIDEO atau MUAT NAIK AUDIO di bawah.'
            : 'Mikrofon tidak dikesan pada peranti ini. Gunakan pilihan MUAT NAIK AUDIO di bawah.'
        );
      } else {
        setErrorMsg(
          `Rakaman ${kind === 'video' ? 'video' : 'audio'} tidak dapat dimulakan dalam paparan ini. Sila gunakan butang MUAT NAIK ${
            kind === 'video' ? 'VIDEO' : 'AUDIO'
          } di bawah.`
        );
      }
    }
  };

  const handleStopCapture = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      setIsProcessing(true);
      recorder.stop();
    }
  };

  const handleUploadMedia = async (
    e: ChangeEvent<HTMLInputElement>,
    kind: PerformanceMediaKind
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setErrorMsg(null);
    setStatusMsg(null);
    setIsPreviewPlaying(false);
    onPauseBackgroundMusic();

    const lowerName = file.name.toLowerCase();
    const validAudio =
      file.type.startsWith('audio/') ||
      /\.(mp3|wav|ogg|m4a|webm|aac|flac|opus)$/i.test(lowerName);
    const validVideo =
      file.type.startsWith('video/') ||
      /\.(mp4|webm|mov|m4v|ogv)$/i.test(lowerName);

    if (kind === 'audio' && !validAudio) {
      setErrorMsg(
        'Sila pilih fail audio yang sah (contohnya MP3, WAV, M4A, OGG atau WebM).'
      );
      return;
    }

    if (kind === 'video' && !validVideo) {
      setErrorMsg(
        'Sila pilih fail video yang sah (contohnya MP4, WebM atau MOV).'
      );
      return;
    }

    if (file.size === 0) {
      setErrorMsg('Fail yang dipilih kosong dan tidak boleh dimainkan.');
      return;
    }

    const maxBytes = kind === 'video' ? 80 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg(
        `Saiz fail terlalu besar (had maksimum ${kind === 'video' ? '80 MB' : '25 MB'}).`
      );
      return;
    }

    setIsProcessing(true);
    const tempUrl = URL.createObjectURL(file);
    const detectedDuration = await readMediaDuration(tempUrl, kind);
    URL.revokeObjectURL(tempUrl);

    const record: StoredPerformanceRecord = {
      id: 'misi5_persembahan_akhir',
      mediaKind: kind,
      blob: file,
      mimeType: file.type || (kind === 'video' ? 'video/mp4' : 'audio/mpeg'),
      durationSeconds: detectedDuration,
      fileName: file.name,
      source: kind === 'video' ? 'uploaded-video' : 'uploaded-audio',
      updatedAt: new Date().toISOString(),
    };

    await onSavePerformance(record);
    setIsProcessing(false);
    setStatusMsg(
      `Fail ${kind === 'video' ? 'video' : 'audio'} "${file.name}" berjaya dimuat naik! Tekan MAIN SEMULA untuk menyemak hasil persembahan.`
    );
  };

  const getActiveMediaElement = (): HTMLMediaElement | null => {
    if (!performance) return null;
    return performance.record.mediaKind === 'video'
      ? playbackVideoRef.current
      : playbackAudioRef.current;
  };

  const handlePlayFromStartOrResume = () => {
    const mediaEl = getActiveMediaElement();
    if (!mediaEl) return;
    onPauseBackgroundMusic();
    if (mediaEl.ended) {
      mediaEl.currentTime = 0;
    }
    void mediaEl.play().catch(() => {
      setErrorMsg(
        'Fail media tidak dapat dimainkan oleh pelayar. Cuba muat naik fail dalam format MP3/WAV atau MP4/WebM.'
      );
    });
  };

  const handlePauseMedia = () => {
    const mediaEl = getActiveMediaElement();
    if (!mediaEl) return;
    mediaEl.pause();
  };

  const handleRerecordReset = async () => {
    if (recordingMode !== null || isProcessing) return;
    handlePauseMedia();
    setIsPreviewPlaying(false);
    setErrorMsg(null);
    setStatusMsg(
      'Ruang rakaman dikosongkan. Pilih RAKAM AUDIO, RAKAM VIDEO atau muat naik fail baharu.'
    );
    await onClearForRerecord();
  };

  const downloadFileName = performance
    ? performance.record.source.startsWith('uploaded') && performance.record.fileName
      ? performance.record.fileName
      : `persembahan_pentas_kasih_guru.${extensionFromMime(
          performance.record.mimeType,
          performance.record.mediaKind,
          performance.record.fileName
        )}`
    : 'persembahan_pentas_kasih_guru.webm';

  return (
    <div className="rounded-3xl border-2 border-[#FCD34D] bg-gradient-to-br from-[#FFFBEB] via-white to-[#FFF1F7] p-5 sm:p-6 shadow-lg space-y-5">
      <div className="space-y-1">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]">
          Studio Pentas Persembahan Akhir
        </h2>
        <p className="text-sm sm:text-base text-[#432C6B]">
          Pilih untuk merakam suara atau video secara terus, atau muat naik fail persembahan yang telah kamu sediakan.
        </p>
      </div>

      {/* Kotak Status Rakaman & Pratinjau Kamera Langsung */}
      <div className="rounded-2xl bg-white border-2 border-[#E9D5FF] p-4 sm:p-5 space-y-4 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                recordingMode !== null
                  ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]'
                  : performance
                  ? 'bg-[#D1FAE5] text-[#059669] border-[#6EE7B7]'
                  : 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]'
              }`}
            >
              {recordingMode === 'video' || performance?.record.mediaKind === 'video' ? (
                <Video className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Mic className="w-6 h-6" aria-hidden="true" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-[#6D28D9]">
                {recordingMode === 'video'
                  ? 'Sedang Merakam Video & Suara...'
                  : recordingMode === 'audio'
                  ? 'Sedang Merakam Audio Pentas...'
                  : isProcessing
                  ? 'Memproses Fail Persembahan...'
                  : performance
                  ? hasPlayedBack
                    ? 'Persembahan Siap & Telah Dimainkan Semula'
                    : 'Persembahan Sedia — Tekan MAIN SEMULA'
                  : 'Pentas Sedia Untuk Persembahan'}
              </p>
              <p className="font-display text-2xl font-bold text-[#2E1654] tabular-nums">
                {recordingMode !== null
                  ? formatPerformanceDuration(elapsedSeconds)
                  : performance && performance.record.durationSeconds > 0
                  ? formatPerformanceDuration(performance.record.durationSeconds)
                  : '00:00'}
              </p>
            </div>
          </div>

          {recordingMode !== null && (
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-bold text-[#B91C1C]"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" aria-hidden="true" />
              <span>{recordingMode === 'video' ? 'KAMERA & MIK AKTIF' : 'MIKROFON AKTIF'}</span>
            </div>
          )}
        </div>

        {/* Pratinjau Kamera Langsung semasa Rakaman Video */}
        {recordingMode === 'video' && (
          <div className="rounded-2xl overflow-hidden border-2 border-[#F472B6] bg-[#1E1033] aspect-video">
            <video
              ref={liveVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              aria-label="Pratinjau kamera secara langsung semasa rakaman video"
            />
          </div>
        )}

        {/* Gelombang Suara Visual */}
        <div
          aria-hidden="true"
          className="h-12 rounded-2xl bg-gradient-to-r from-[#FAF5FF] via-[#FFF1F7] to-[#FEF3C7] border border-[#E9D5FF] px-3 flex items-center justify-center gap-1.5"
        >
          {waveLevels.map((lvl, idx) => (
            <span
              key={idx}
              style={{ height: `${recordingMode !== null ? lvl : 22}%` }}
              className={`w-2 rounded-full transition-all duration-100 ${
                recordingMode !== null
                  ? idx % 3 === 0
                    ? 'bg-[#EC4899]'
                    : idx % 3 === 1
                    ? 'bg-[#7C3AED]'
                    : 'bg-[#F59E0B]'
                  : performance
                  ? 'bg-[#10B981]/55'
                  : 'bg-[#CBD5E1]'
              }`}
            />
          ))}
        </div>

        {/* Butang Kawalan Rakaman & Muat Naik */}
        {recordingMode === null ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleStartCapture('audio')}
                className="btn-3d-primary px-4 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
              >
                <Mic className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>RAKAM AUDIO</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleStartCapture('video')}
                className="btn-3d-rose px-4 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE185D]"
              >
                <Video className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>RAKAM VIDEO</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                ref={audioUploadRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
                onChange={(e) => handleUploadMedia(e, 'audio')}
                className="sr-only"
              />
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => audioUploadRef.current?.click()}
                className="btn-3d-lavender px-4 py-2.5 rounded-2xl font-display font-bold text-sm inline-flex items-center justify-center gap-2 min-h-[46px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
              >
                <Upload className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>MUAT NAIK AUDIO</span>
              </button>

              <input
                ref={videoUploadRef}
                type="file"
                accept="video/*,.mp4,.webm,.mov,.m4v"
                onChange={(e) => handleUploadMedia(e, 'video')}
                className="sr-only"
              />
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => videoUploadRef.current?.click()}
                className="btn-3d-sky px-4 py-2.5 rounded-2xl font-display font-bold text-sm inline-flex items-center justify-center gap-2 min-h-[46px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7]"
              >
                <Upload className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>MUAT NAIK VIDEO</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleStopCapture}
              className="btn-3d-rose px-6 py-3.5 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[52px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE185D]"
            >
              <Square className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
              <span>HENTIKAN RAKAMAN</span>
            </button>
          </div>
        )}

        <p className="text-xs text-[#5B3E8E]">
          Nota Privasi & Audio: Rakaman disimpan setempat dalam pelayar ini sahaja dan tidak dihantar ke mana-mana pelayan luar. Muzik latar dijeda secara automatik ketika merakam atau memainkan persembahan.
        </p>

        <details className="text-left rounded-xl bg-white/85 border border-[#DDD6FE] px-3.5 py-2 text-xs text-[#3B1E6D]">
          <summary className="font-bold cursor-pointer select-none">
            Arahan alternatif jika akses mikrofon atau kamera disekat
          </summary>
          <ol className="mt-1.5 space-y-1 list-decimal list-inside leading-relaxed">
            <li>Semak ikon kebenaran di bar alamat pelayar dan benarkan akses <strong>Mikrofon</strong> dan <strong>Kamera</strong>, atau buka aplikasi dalam tab pelayar baharu.</li>
            <li>Jika kebenaran masih disekat, rakam audio atau video persembahan menggunakan aplikasi kamera/perakam telefon dan tekan butang <strong>MUAT NAIK AUDIO</strong> atau <strong>MUAT NAIK VIDEO</strong>.</li>
            <li>Tiada rakaman dihantar kepada guru secara automatik; gunakan butang <strong>MUAT TURUN PERSEMBAHAN</strong> jika ingin menyimpan atau berkongsi fail secara manual.</li>
          </ol>
        </details>
      </div>

      {/* Mesej Ralat atau Status */}
      {errorMsg && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-sm font-semibold text-[#991B1B] flex items-start gap-2.5"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#DC2626]" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {storageWarning && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#F59E0B] text-xs sm:text-sm font-semibold text-[#92400E] flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" aria-hidden="true" />
          <span>{storageWarning}</span>
        </div>
      )}

      {statusMsg && !errorMsg && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#10B981] text-sm font-semibold text-[#065F46] flex items-start gap-2"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#059669]" aria-hidden="true" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Paparan Hasil Persembahan + Main Semula + Rakam Semula + Muat Turun */}
      {performance && recordingMode === null && (
        <div className="rounded-2xl bg-[#ECFDF5] border-2 border-[#6EE7B7] p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#065F46]">
              {performance.record.mediaKind === 'video' ? (
                <FileVideo className="w-5 h-5 text-[#059669] shrink-0" aria-hidden="true" />
              ) : (
                <FileAudio className="w-5 h-5 text-[#059669] shrink-0" aria-hidden="true" />
              )}
              <span>
                {performance.record.source.startsWith('uploaded')
                  ? `Fail Dimuat Naik: ${performance.record.fileName}`
                  : performance.record.mediaKind === 'video'
                  ? 'Rakaman Video Persembahan Kamu'
                  : 'Rakaman Audio Persembahan Kamu'}
              </span>
            </div>

            {performance.record.durationSeconds > 0 && (
              <span className="text-xs font-bold text-[#047857] tabular-nums">
                Tempoh: {formatPerformanceDuration(performance.record.durationSeconds)}
              </span>
            )}
          </div>

          {performance.record.mediaKind === 'video' ? (
            <div className="rounded-2xl overflow-hidden border-2 border-[#10B981] bg-black">
              <video
                ref={playbackVideoRef}
                controls
                playsInline
                src={performance.url}
                onPlay={() => {
                  onPauseBackgroundMusic();
                  setIsPreviewPlaying(true);
                  onPlaybackVerified();
                }}
                onPause={() => setIsPreviewPlaying(false)}
                onEnded={() => setIsPreviewPlaying(false)}
                className="w-full max-h-[340px]"
                aria-label="Pemain video persembahan Pentas Kasih Guru"
              />
            </div>
          ) : (
            <audio
              ref={playbackAudioRef}
              controls
              src={performance.url}
              onPlay={() => {
                onPauseBackgroundMusic();
                setIsPreviewPlaying(true);
                onPlaybackVerified();
              }}
              onPause={() => setIsPreviewPlaying(false)}
              onEnded={() => setIsPreviewPlaying(false)}
              className="w-full"
              aria-label="Pemain audio persembahan Pentas Kasih Guru"
            />
          )}

          {/* Butang Main Semula, Jeda, Rakam Semula, Muat Turun Persembahan */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!isPreviewPlaying ? (
              <button
                type="button"
                onClick={handlePlayFromStartOrResume}
                className="btn-3d-primary px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <Play className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>MAIN SEMULA</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseMedia}
                className="btn-3d-lavender px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <Pause className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>JEDA</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRerecordReset}
              className="btn-3d-rose px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              {performance.record.source.startsWith('uploaded') ? (
                <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>RAKAM SEMULA</span>
            </button>

            <a
              href={performance.url}
              download={downloadFileName}
              className="btn-3d-sky px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[44px] whitespace-nowrap"
            >
              <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>MUAT TURUN PERSEMBAHAN</span>
            </a>
          </div>

          <p className="text-xs font-bold text-[#047857]">
            {hasPlayedBack
              ? 'Status Semakan: Persembahan telah dimainkan semula dan disahkan berfungsi.'
              : 'Sila tekan MAIN SEMULA untuk menyemak rakaman/fail kamu sebelum meneruskan ke Juri Pelita Emas.'}
          </p>
        </div>
      )}
    </div>
  );
}
