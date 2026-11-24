import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileAudio,
  Mic,
  RefreshCw,
  Square,
  Upload,
} from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { RecordingSlotId, StoredAudioRecord } from '../utils/recordingDb';

export interface ActiveRecordingEntry {
  url: string;
  record: StoredAudioRecord;
}

interface VoiceRecorderCardProps {
  slotId: RecordingSlotId;
  title: string;
  subtitle: string;
  accentScheme?: 'violet' | 'amber';
  recording: ActiveRecordingEntry | null;
  storageWarning: string | null;
  onSaveRecording: (record: StoredAudioRecord) => Promise<void>;
  onPauseBackgroundMusic: () => void;
  onRecordingActiveChange?: (isActive: boolean) => void;
}

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
];

function pickSupportedMimeType(): string | undefined {
  if (typeof window === 'undefined' || !('MediaRecorder' in window)) {
    return undefined;
  }
  if (typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

function extensionFromMime(mimeType: string, fallbackName?: string): string {
  const lower = mimeType.toLowerCase();
  if (lower.includes('mp4') || lower.includes('m4a')) return 'm4a';
  if (lower.includes('ogg')) return 'ogg';
  if (lower.includes('wav')) return 'wav';
  if (lower.includes('mpeg') || lower.includes('mp3')) return 'mp3';
  if (lower.includes('webm')) return 'webm';
  if (fallbackName && fallbackName.includes('.')) {
    const ext = fallbackName.split('.').pop();
    if (ext) return ext;
  }
  return 'webm';
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function readAudioFileDuration(objectUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    let settled = false;
    const finish = (val: number) => {
      if (settled) return;
      settled = true;
      audio.src = '';
      resolve(Number.isFinite(val) && val > 0 ? Math.round(val) : 0);
    };
    const timer = window.setTimeout(() => finish(0), 2000);
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      window.clearTimeout(timer);
      finish(audio.duration);
    };
    audio.onerror = () => {
      window.clearTimeout(timer);
      finish(0);
    };
    audio.src = objectUrl;
  });
}

export function VoiceRecorderCard({
  slotId,
  title,
  subtitle,
  accentScheme = 'violet',
  recording,
  storageWarning,
  onSaveRecording,
  onPauseBackgroundMusic,
  onRecordingActiveChange,
}: VoiceRecorderCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [waveLevels, setWaveLevels] = useState<number[]>(() => Array(16).fill(22));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const supportsMediaRecorder =
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

  const handleStartRecording = async () => {
    if (isRecording || isProcessing) return;
    setErrorMsg(null);
    setStatusMsg(null);
    onPauseBackgroundMusic();

    if (!supportsMediaRecorder) {
      setErrorMsg(
        'Pelayar ini tidak menyokong rakaman mikrofon secara langsung. Sila gunakan pilihan Muat Naik Fail Audio di bawah.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickSupportedMimeType();
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
        setIsRecording(false);
        setIsProcessing(false);
        onRecordingActiveChange?.(false);
        setErrorMsg(
          'Berlaku gangguan semasa merakam suara. Sila cuba rakam semula atau muat naik fail audio.'
        );
      };

      recorder.onstop = async () => {
        const finalDuration = Math.max(1, elapsedRef.current);
        const finalMime = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: finalMime });

        stopHardwareAndTimers();
        setIsRecording(false);
        onRecordingActiveChange?.(false);

        if (blob.size === 0) {
          setErrorMsg(
            'Rakaman kosong dikesan. Pastikan mikrofon tidak disenyapkan dan cuba rakam selama sekurang-kurangnya 2 saat.'
          );
          setIsProcessing(false);
          return;
        }

        setIsProcessing(true);
        const ext = extensionFromMime(finalMime);
        const record: StoredAudioRecord = {
          id: slotId,
          blob,
          mimeType: finalMime,
          durationSeconds: finalDuration,
          fileName: `${slotId}.${ext}`,
          source: 'recorded',
          updatedAt: new Date().toISOString(),
        };
        await onSaveRecording(record);
        setIsProcessing(false);
        setStatusMsg('Rakaman suara berjaya disimpan! Dengar semula rakaman kamu di bawah.');
      };

      recorder.start(250);
      setIsRecording(true);
      onRecordingActiveChange?.(true);
      startWaveformMonitor(stream);

      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSeconds(elapsedRef.current);
      }, 1000);
    } catch (err) {
      stopHardwareAndTimers();
      setIsRecording(false);
      onRecordingActiveChange?.(false);

      const errorName = err instanceof DOMException ? err.name : '';
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setErrorMsg(
          'Akses mikrofon tidak dibenarkan. Sila benarkan akses mikrofon pada pelayar atau gunakan butang Muat Naik Fail Audio di bawah.'
        );
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setErrorMsg(
          'Tiada mikrofon dikesan pada peranti ini. Gunakan pilihan Muat Naik Fail Audio di bawah.'
        );
      } else {
        setErrorMsg(
          'Mikrofon tidak dapat dimulakan buat masa ini. Cuba semula atau muat naik fail audio dari peranti kamu.'
        );
      }
    }
  };

  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      setIsProcessing(true);
      recorder.stop();
    }
  };

  const handleUploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setErrorMsg(null);
    setStatusMsg(null);
    onPauseBackgroundMusic();

    const lowerName = file.name.toLowerCase();
    const looksLikeAudio =
      file.type.startsWith('audio/') ||
      /\.(mp3|wav|ogg|m4a|webm|aac|flac|opus)$/i.test(lowerName);

    if (!looksLikeAudio) {
      setErrorMsg(
        'Sila pilih fail audio yang sah sahaja (contohnya MP3, WAV, M4A, OGG atau WebM).'
      );
      return;
    }

    if (file.size === 0) {
      setErrorMsg('Fail audio yang dipilih kosong. Sila pilih fail audio lain.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Saiz fail audio terlalu besar (had maksimum 25 MB).');
      return;
    }

    setIsProcessing(true);
    const tempUrl = URL.createObjectURL(file);
    const detectedDuration = await readAudioFileDuration(tempUrl);
    URL.revokeObjectURL(tempUrl);

    const record: StoredAudioRecord = {
      id: slotId,
      blob: file,
      mimeType: file.type || 'audio/mpeg',
      durationSeconds: detectedDuration,
      fileName: file.name,
      source: 'uploaded',
      updatedAt: new Date().toISOString(),
    };

    await onSaveRecording(record);
    setIsProcessing(false);
    setStatusMsg(`Fail audio "${file.name}" berjaya dimuat naik dan disimpan!`);
  };

  const borderTheme =
    accentScheme === 'amber'
      ? 'border-[#FCD34D] bg-gradient-to-br from-[#FFFBEB] via-white to-[#FFF1F7]'
      : 'border-[#C4B5FD] bg-gradient-to-br from-[#F5F3FF] via-white to-[#F0F9FF]';

  const downloadFileName = recording
    ? recording.record.source === 'uploaded' && recording.record.fileName
      ? recording.record.fileName
      : `${slotId}_deklamasi.${extensionFromMime(
          recording.record.mimeType,
          recording.record.fileName
        )}`
    : `${slotId}.webm`;

  return (
    <div className={`rounded-3xl border-2 p-5 sm:p-6 shadow-md space-y-5 ${borderTheme}`}>
      <div className="space-y-1">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2E1654]">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-[#432C6B]">{subtitle}</p>
      </div>

      {/* Kawalan Rakaman & Pemasa */}
      <div className="rounded-2xl bg-white border-2 border-[#E9D5FF] p-4 sm:p-5 space-y-4 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                isRecording
                  ? 'bg-[#FEE2E2] text-[#DC2626] border-2 border-[#FCA5A5]'
                  : recording
                  ? 'bg-[#D1FAE5] text-[#059669] border-2 border-[#6EE7B7]'
                  : 'bg-[#EDE9FE] text-[#6D28D9] border-2 border-[#DDD6FE]'
              }`}
            >
              <Mic className="w-6 h-6" aria-hidden="true" />
            </div>

            <div>
              <p className="text-xs font-bold text-[#5B3E8E]">
                {isRecording
                  ? 'Sedang Merakam Suara...'
                  : isProcessing
                  ? 'Menyimpan Rakaman...'
                  : recording
                  ? 'Rakaman Siap Didengar'
                  : 'Sedia Untuk Merakam'}
              </p>
              <p className="font-display text-2xl font-bold text-[#2E1654] tabular-nums">
                {isRecording
                  ? formatDuration(elapsedSeconds)
                  : recording && recording.record.durationSeconds > 0
                  ? formatDuration(recording.record.durationSeconds)
                  : '00:00'}
              </p>
            </div>
          </div>

          {isRecording && (
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-bold text-[#B91C1C]"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" aria-hidden="true" />
              <span>MIKROFON AKTIF</span>
            </div>
          )}
        </div>

        {/* Gelombang Suara Visual */}
        <div
          aria-hidden="true"
          className="h-14 rounded-2xl bg-gradient-to-r from-[#FAF5FF] via-[#F0F9FF] to-[#FFF1F7] border border-[#E9D5FF] px-3 flex items-center justify-center gap-1.5"
        >
          {waveLevels.map((lvl, idx) => (
            <span
              key={idx}
              style={{ height: `${isRecording ? lvl : 22}%` }}
              className={`w-2 rounded-full transition-all duration-100 ${
                isRecording
                  ? idx % 3 === 0
                    ? 'bg-[#EC4899]'
                    : idx % 3 === 1
                    ? 'bg-[#7C3AED]'
                    : 'bg-[#0EA5E9]'
                  : recording
                  ? 'bg-[#10B981]/55'
                  : 'bg-[#CBD5E1]'
              }`}
            />
          ))}
        </div>

        {/* Butang Mula / Henti / Rakam Semula */}
        <div className="flex flex-wrap items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleStartRecording}
              className={`px-5 py-3 rounded-2xl font-display font-bold text-sm sm:text-base inline-flex items-center gap-2 min-h-[48px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309] ${
                recording ? 'btn-3d-lavender' : 'btn-3d-primary'
              }`}
            >
              {recording ? (
                <>
                  <RefreshCw className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>RAKAM SEMULA</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>MULAKAN RAKAMAN</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopRecording}
              className="btn-3d-rose px-6 py-3 rounded-2xl font-display font-bold text-base inline-flex items-center gap-2 min-h-[50px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE185D]"
            >
              <Square className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
              <span>HENTIKAN RAKAMAN</span>
            </button>
          )}

          {!isRecording && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleUploadFile}
                className="sr-only"
                id={`upload-${slotId}`}
              />
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="btn-3d-sky px-4 py-3 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 min-h-[48px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7]"
              >
                <Upload className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Muat Naik Fail Audio</span>
              </button>
            </>
          )}
        </div>

        <p className="text-xs text-[#5B3E8E]">
          Nota: Muzik latar akan dijeda secara automatik apabila kamu merakam atau memainkan semula suara.
        </p>

        <details className="text-left rounded-xl bg-white/85 border border-[#DDD6FE] px-3.5 py-2 text-xs text-[#3B1E6D]">
          <summary className="font-bold cursor-pointer select-none">
            Arahan alternatif jika akses mikrofon disekat
          </summary>
          <ol className="mt-1.5 space-y-1 list-decimal list-inside leading-relaxed">
            <li>Klik ikon mangga/tetapan laman di bar alamat pelayar dan pilih <strong>Allow</strong> untuk Mikrofon, kemudian cuba semula.</li>
            <li>Jika pelayar atau tetingkap pratonton menyekat mikrofon, rakam suara menggunakan aplikasi perakam telefon/komputer dan muat naik melalui butang <strong>Muat Naik Fail Audio</strong>.</li>
            <li>Rakaman disimpan setempat pada peranti ini dan tidak dihantar kepada guru secara automatik.</li>
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

      {/* Pemain Audio & Muat Turun apabila rakaman wujud */}
      {recording && (
        <div className="rounded-2xl bg-[#ECFDF5] border-2 border-[#6EE7B7] p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#065F46]">
              <FileAudio className="w-5 h-5 text-[#059669] shrink-0" aria-hidden="true" />
              <span>
                {recording.record.source === 'uploaded'
                  ? `Fail Dimuat Naik: ${recording.record.fileName}`
                  : 'Rakaman Mikrofon Kamu'}
              </span>
            </div>

            {recording.record.durationSeconds > 0 && (
              <span className="text-xs font-bold text-[#047857] tabular-nums">
                Tempoh: {formatDuration(recording.record.durationSeconds)}
              </span>
            )}
          </div>

          <audio
            controls
            src={recording.url}
            onPlay={onPauseBackgroundMusic}
            className="w-full"
            aria-label={`Pemain audio untuk ${title}`}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs font-semibold text-[#047857]">
              Dengar semula sebutan, nada, intonasi dan jeda dalam rakaman ini.
            </p>
            <a
              href={recording.url}
              download={downloadFileName}
              className="btn-3d-primary px-4 py-2 rounded-xl font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 min-h-[42px] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
            >
              <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>MUAT TURUN RAKAMAN</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
