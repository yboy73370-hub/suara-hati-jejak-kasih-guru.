import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { AchievementSummaryModal } from './components/AchievementSummaryModal';
import { CertificateModal } from './components/CertificateModal';
import { CreditsModal } from './components/CreditsModal';
import { GuideModal } from './components/GuideModal';
import { HomeView } from './components/HomeView';
import { Mission1View } from './components/Mission1View';
import { Mission2View } from './components/Mission2View';
import { Mission3View } from './components/Mission3View';
import { Mission4View } from './components/Mission4View';
import { Mission5View } from './components/Mission5View';
import { Mission6View } from './components/Mission6View';
import { MissionMapView } from './components/MissionMapView';
import { ObjectivesModal } from './components/ObjectivesModal';
import { TopBar } from './components/TopBar';
import { ActiveModal, LearningMode, ProgressState, ViewMode } from './types/game';
import { musicEngine } from './utils/audioEngine';
import { attemptDirectPrint, PrintAttemptResult } from './utils/certificatePdf';
import {
  loadLearningSupportData,
  loadMission6Data,
  loadProgress,
  loadReducedMotion,
  saveProgress,
  saveReducedMotion,
} from './utils/storage';

function formatCertDateFromIso(isoString: string | null): string {
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

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('utama');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => loadReducedMotion());
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [pendingPreviewMissionId, setPendingPreviewMissionId] = useState<number | null>(
    null
  );
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [learningMode, setLearningMode] = useState<LearningMode>(
    () => loadLearningSupportData().mode
  );
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [certificateModalState, setCertificateModalState] = useState<{
    isOpen: boolean;
    studentName: string;
    issuedDate: string;
    initialPdfNotice: boolean;
    initialPrintResult: PrintAttemptResult | null;
  }>({
    isOpen: false,
    studentName: '',
    issuedDate: '',
    initialPdfNotice: false,
    initialPrintResult: null,
  });

  useEffect(() => {
    return () => {
      musicEngine.stop();
    };
  }, []);

  const handleToggleMusic = useCallback(async () => {
    if (musicEngine.getPlaying()) {
      musicEngine.stop();
      setIsMusicPlaying(false);
    } else {
      const started = await musicEngine.start();
      setIsMusicPlaying(started);
    }
  }, []);

  const handlePauseMusic = useCallback(() => {
    if (musicEngine.getPlaying()) {
      musicEngine.stop();
      setIsMusicPlaying(false);
    }
  }, []);

  const handleToggleReducedMotion = useCallback(() => {
    setReducedMotion((prev) => {
      const next = !prev;
      saveReducedMotion(next);
      return next;
    });
  }, []);

  const handleNavigateUtama = useCallback(() => {
    setActiveModal(null);
    setPendingPreviewMissionId(null);
    setCurrentView('utama');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const handleNavigateMisi = useCallback(() => {
    setActiveModal(null);
    setCurrentView('misi');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const handleSelectMission = useCallback((missionId: number) => {
    setProgress((prev) => {
      const next: ProgressState = {
        ...prev,
        lastVisitedMissionId: missionId,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const handleEnterMission1 = useCallback(() => {
    setProgress((prev) => {
      const currentStatus = prev.missions[1] ?? 'Belum Bermula';
      const nextStatus =
        currentStatus === 'Belum Bermula' ? 'Sedang Berlangsung' : currentStatus;
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          1: nextStatus,
        },
        lastVisitedMissionId: 1,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
    setActiveModal(null);
    setCurrentView('misi1');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const handleCompleteMission1 = useCallback(() => {
    setProgress((prev) => {
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          1: 'Selesai',
        },
        lastVisitedMissionId: 1,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const handleEnterMission2 = useCallback(() => {
    setProgress((prev) => {
      const currentStatus = prev.missions[2] ?? 'Belum Bermula';
      const nextStatus =
        currentStatus === 'Belum Bermula' ? 'Sedang Berlangsung' : currentStatus;
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          2: nextStatus,
        },
        lastVisitedMissionId: 2,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
    setActiveModal(null);
    setPendingPreviewMissionId(null);
    setCurrentView('misi2');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const handleCompleteMission2 = useCallback(() => {
    setProgress((prev) => {
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          2: 'Selesai',
        },
        lastVisitedMissionId: 2,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const handleEnterMission3 = useCallback(() => {
    setProgress((prev) => {
      const currentStatus = prev.missions[3] ?? 'Belum Bermula';
      const nextStatus =
        currentStatus === 'Belum Bermula' ? 'Sedang Berlangsung' : currentStatus;
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          3: nextStatus,
        },
        lastVisitedMissionId: 3,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
    setActiveModal(null);
    setPendingPreviewMissionId(null);
    setCurrentView('misi3');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const handleCompleteMission3 = useCallback(() => {
    setProgress((prev) => {
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          3: 'Selesai',
        },
        lastVisitedMissionId: 3,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const handleEnterMission4 = useCallback(() => {
    setProgress((prev) => {
      const currentStatus = prev.missions[4] ?? 'Belum Bermula';
      const nextStatus =
        currentStatus === 'Belum Bermula' ? 'Sedang Berlangsung' : currentStatus;
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          4: nextStatus,
        },
        lastVisitedMissionId: 4,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
    setActiveModal(null);
    setPendingPreviewMissionId(null);
    setCurrentView('misi4');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const handleCompleteMission4 = useCallback(() => {
    setProgress((prev) => {
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          4: 'Selesai',
        },
        lastVisitedMissionId: 4,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const handleEnterMission5 = useCallback(() => {
    setProgress((prev) => {
      const currentStatus = prev.missions[5] ?? 'Belum Bermula';
      const nextStatus =
        currentStatus === 'Belum Bermula' ? 'Sedang Berlangsung' : currentStatus;
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          5: nextStatus,
        },
        lastVisitedMissionId: 5,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
    setActiveModal(null);
    setPendingPreviewMissionId(null);
    setCurrentView('misi5');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const handleCompleteMission5 = useCallback(() => {
    setProgress((prev) => {
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          5: 'Selesai',
        },
        lastVisitedMissionId: 5,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const handleEnterMission6 = useCallback(() => {
    setProgress((prev) => {
      const currentStatus = prev.missions[6] ?? 'Belum Bermula';
      const nextStatus =
        currentStatus === 'Belum Bermula' ? 'Sedang Berlangsung' : currentStatus;
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          6: nextStatus,
        },
        lastVisitedMissionId: 6,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
    setActiveModal(null);
    setPendingPreviewMissionId(null);
    setCurrentView('misi6');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const handleCompleteMission6 = useCallback(() => {
    setProgress((prev) => {
      const next: ProgressState = {
        ...prev,
        missions: {
          ...prev.missions,
          6: 'Selesai',
        },
        lastVisitedMissionId: 6,
        updatedAt: new Date().toISOString(),
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const handleOpenCertificateFromM6 = useCallback(
    (confirmedName: string, issuedDate: string, mode: 'view' | 'print' | 'pdf') => {
      if (mode === 'view') {
        setCertificateModalState({
          isOpen: true,
          studentName: confirmedName,
          issuedDate,
          initialPdfNotice: false,
          initialPrintResult: null,
        });
        return;
      }

      // Pastikan modal sijil terbuka secara segerak dalam DOM sebelum window.print() dipanggil secara langsung
      flushSync(() => {
        setCertificateModalState({
          isOpen: true,
          studentName: confirmedName,
          issuedDate,
          initialPdfNotice: mode === 'pdf',
          initialPrintResult: null,
        });
      });

      const printResult = attemptDirectPrint();
      setCertificateModalState((prev) => ({
        ...prev,
        initialPrintResult: printResult,
      }));
    },
    []
  );

  const handleOpenCertificateFromMap = useCallback(() => {
    const m6 = loadMission6Data();
    const cleanName =
      m6.certificateConfirmedName.trim() || m6.studentName.trim() || 'Wira Suara Hati';
    const issuedDate = formatCertDateFromIso(m6.certificateIssuedAt);
    setCertificateModalState({
      isOpen: true,
      studentName: cleanName,
      issuedDate,
      initialPdfNotice: false,
      initialPrintResult: null,
    });
  }, []);

  const clearPendingPreview = useCallback(() => {
    setPendingPreviewMissionId(null);
  }, []);

  const isPrintModalOpen = isCardModalOpen || certificateModalState.isOpen;
  const mission6Saved = loadMission6Data();
  const canViewCertificateOnMap =
    progress.missions[6] === 'Selesai' &&
    mission6Saved.certificateNameConfirmed &&
    mission6Saved.certificateConfirmedName.trim().length >= 2;

  return (
    <div
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      className={`min-h-screen flex flex-col bg-[#FAF6FF] text-[#2B1948] ${
        isPrintModalOpen ? 'print-hide-shell' : ''
      }`}
    >
      <TopBar
        currentView={currentView}
        activeModal={activeModal}
        isMusicPlaying={isMusicPlaying}
        reducedMotion={reducedMotion}
        onNavigateUtama={handleNavigateUtama}
        onNavigateMisi={handleNavigateMisi}
        onOpenPanduan={() => setActiveModal('panduan')}
        onOpenObjektif={() => setActiveModal('objektif')}
        onToggleMusic={handleToggleMusic}
        onToggleReducedMotion={handleToggleReducedMotion}
      />

      {currentView === 'utama' && (
        <HomeView
          onStartAdventure={handleNavigateMisi}
          onOpenPanduan={() => setActiveModal('panduan')}
          onOpenObjektif={() => setActiveModal('objektif')}
        />
      )}

      {currentView === 'misi' && (
        <MissionMapView
          progress={progress}
          initialPreviewMissionId={pendingPreviewMissionId}
          onClearInitialPreview={clearPendingPreview}
          onEnterMission1={handleEnterMission1}
          onEnterMission2={handleEnterMission2}
          onEnterMission3={handleEnterMission3}
          onEnterMission4={handleEnterMission4}
          onEnterMission5={handleEnterMission5}
          onEnterMission6={handleEnterMission6}
          canViewCertificate={canViewCertificateOnMap}
          onOpenCertificate={handleOpenCertificateFromMap}
          onSelectMission={handleSelectMission}
          onBackHome={handleNavigateUtama}
          learningMode={learningMode}
          onChangeLearningMode={setLearningMode}
          onOpenAchievementSummary={() => setShowSummaryModal(true)}
          onOpenCredits={() => setShowCreditsModal(true)}
        />
      )}

      {currentView === 'misi1' && (
        <Mission1View
          missionStatus={progress.missions[1] ?? 'Sedang Berlangsung'}
          onCompleteMission={handleCompleteMission1}
          onBackToMap={handleNavigateMisi}
          onContinueToMission2={handleEnterMission2}
        />
      )}

      {currentView === 'misi2' && (
        <Mission2View
          missionStatus={progress.missions[2] ?? 'Sedang Berlangsung'}
          onCompleteMission={handleCompleteMission2}
          onBackToMap={handleNavigateMisi}
          onContinueToMission3={handleEnterMission3}
        />
      )}

      {currentView === 'misi3' && (
        <Mission3View
          missionStatus={progress.missions[3] ?? 'Sedang Berlangsung'}
          onCompleteMission={handleCompleteMission3}
          onBackToMap={handleNavigateMisi}
          onContinueToMission4={handleEnterMission4}
        />
      )}

      {currentView === 'misi4' && (
        <Mission4View
          missionStatus={progress.missions[4] ?? 'Sedang Berlangsung'}
          onCompleteMission={handleCompleteMission4}
          onBackToMap={handleNavigateMisi}
          onContinueToMission5={handleEnterMission5}
          onPauseBackgroundMusic={handlePauseMusic}
        />
      )}

      {currentView === 'misi5' && (
        <Mission5View
          missionStatus={progress.missions[5] ?? 'Sedang Berlangsung'}
          onCompleteMission={handleCompleteMission5}
          onBackToMap={handleNavigateMisi}
          onContinueToMission6={handleEnterMission6}
          onPauseBackgroundMusic={handlePauseMusic}
        />
      )}

      {currentView === 'misi6' && (
        <Mission6View
          missionStatus={progress.missions[6] ?? 'Sedang Berlangsung'}
          onCompleteMission={handleCompleteMission6}
          onBackToMap={handleNavigateMisi}
          onOpenCertificate={handleOpenCertificateFromM6}
          onCardModalOpenChange={setIsCardModalOpen}
          onOpenAchievementSummary={() => setShowSummaryModal(true)}
        />
      )}

      <GuideModal
        isOpen={activeModal === 'panduan'}
        onClose={() => setActiveModal(null)}
        onOpenCredits={() => setShowCreditsModal(true)}
      />

      <ObjectivesModal
        isOpen={activeModal === 'objektif'}
        onClose={() => setActiveModal(null)}
      />

      <AchievementSummaryModal
        isOpen={showSummaryModal}
        progress={progress}
        onClose={() => setShowSummaryModal(false)}
      />

      <CreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />

      <CertificateModal
        isOpen={certificateModalState.isOpen}
        studentName={certificateModalState.studentName}
        issuedDate={certificateModalState.issuedDate}
        initialPdfNotice={certificateModalState.initialPdfNotice}
        initialPrintResult={certificateModalState.initialPrintResult}
        onClose={() =>
          setCertificateModalState((prev) => ({
            ...prev,
            isOpen: false,
            initialPrintResult: null,
          }))
        }
        onBackToMap={handleNavigateMisi}
      />
    </div>
  );
}
