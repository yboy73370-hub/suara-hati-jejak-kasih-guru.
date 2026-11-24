import { MISSION_LOCATIONS } from '../data/gameData';
import {
  LearningMode,
  LearningSupportSavedData,
  Mission2SavedData,
  Mission3SavedData,
  Mission4SavedData,
  Mission5SavedData,
  Mission6SavedData,
  MissionStatus,
  PerformanceStyleId,
  ProgressState,
} from '../types/game';

const STORAGE_KEY = 'suara_hati_jejak_kasih_guru_v1';
const REDUCED_MOTION_KEY = 'suara_hati_reduced_motion_v1';
const MISSION2_STORAGE_KEY = 'suara_hati_misi2_bisikan_hati_v1';
const MISSION3_STORAGE_KEY = 'suara_hati_misi3_rahsia_pelita_v1';
const MISSION4_STORAGE_KEY = 'suara_hati_misi4_studio_suara_hati_v1';
const MISSION5_STORAGE_KEY = 'suara_hati_misi5_pentas_kasih_guru_v1';
const MISSION6_STORAGE_KEY = 'suara_hati_misi6_cahaya_penghargaan_v1';
const LEARNING_SUPPORT_KEY = 'suara_hati_tahap_pembelajaran_v1';

export function createDefaultProgress(): ProgressState {
  const missions: Record<number, MissionStatus> = {};
  for (const m of MISSION_LOCATIONS) {
    missions[m.id] = 'Belum Bermula';
  }
  return {
    missions,
    lastVisitedMissionId: null,
    updatedAt: new Date().toISOString(),
  };
}

export function loadProgress(): ProgressState {
  const fallback = createDefaultProgress();
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const sanitizedMissions: Record<number, MissionStatus> = { ...fallback.missions };
    if (parsed.missions && typeof parsed.missions === 'object') {
      for (const m of MISSION_LOCATIONS) {
        const val = parsed.missions[m.id] as string | undefined;
        if (val === 'Belum Bermula' || val === 'Sedang Berlangsung' || val === 'Selesai') {
          sanitizedMissions[m.id] = val;
        } else if (val === 'Sedang Diterokai') {
          sanitizedMissions[m.id] = 'Sedang Berlangsung';
        }
      }
    }
    return {
      missions: sanitizedMissions,
      lastVisitedMissionId:
        typeof parsed.lastVisitedMissionId === 'number' ? parsed.lastVisitedMissionId : null,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : fallback.updatedAt,
    };
  } catch {
    return fallback;
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    const nextState: ProgressState = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Abaikan ralat kuota storan jika mod peribadi pelayar menyekatnya
  }
}

export function countCompletedMissions(state: ProgressState): number {
  return Object.values(state.missions).filter((status) => status === 'Selesai').length;
}

export function loadReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = window.localStorage.getItem(REDUCED_MOTION_KEY);
    if (saved === 'true') return true;
    if (saved === 'false') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  } catch {
    return false;
  }
}

export function saveReducedMotion(reduced: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REDUCED_MOTION_KEY, String(reduced));
  } catch {
    // Abaikan ralat storan
  }
}

export function createDefaultMission2Data(): Mission2SavedData {
  return {
    audioQuizPassed: false,
    matchedStanzas: [],
    reflections: { 1: '', 2: '', 3: '' },
    discussionChecked: false,
    reflectionSaved: false,
    savedAt: null,
  };
}

export function loadMission2Data(): Mission2SavedData {
  const fallback = createDefaultMission2Data();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(MISSION2_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Mission2SavedData>;
    const matched = Array.isArray(parsed.matchedStanzas)
      ? parsed.matchedStanzas.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 4)
      : [];
    const reflections: Record<number, string> = {
      1: typeof parsed.reflections?.[1] === 'string' ? parsed.reflections[1] : '',
      2: typeof parsed.reflections?.[2] === 'string' ? parsed.reflections[2] : '',
      3: typeof parsed.reflections?.[3] === 'string' ? parsed.reflections[3] : '',
    };
    return {
      audioQuizPassed: Boolean(parsed.audioQuizPassed),
      matchedStanzas: Array.from(new Set(matched)),
      reflections,
      discussionChecked: Boolean(parsed.discussionChecked),
      reflectionSaved: Boolean(parsed.reflectionSaved),
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
    };
  } catch {
    return fallback;
  }
}

export function saveMission2Data(data: Mission2SavedData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MISSION2_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Abaikan ralat storan
  }
}

export function createDefaultMission3Data(): Mission3SavedData {
  return {
    openedBooks: [],
    matchedStanzas: [],
    quizBestScore: 0,
    quizLastScore: null,
    criticalAnswer: '',
    criticalSaved: false,
    savedAt: null,
  };
}

export function loadMission3Data(): Mission3SavedData {
  const fallback = createDefaultMission3Data();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(MISSION3_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Mission3SavedData>;
    const opened = Array.isArray(parsed.openedBooks)
      ? parsed.openedBooks.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 4)
      : [];
    const matched = Array.isArray(parsed.matchedStanzas)
      ? parsed.matchedStanzas.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 4)
      : [];
    return {
      openedBooks: Array.from(new Set(opened)),
      matchedStanzas: Array.from(new Set(matched)),
      quizBestScore:
        typeof parsed.quizBestScore === 'number'
          ? Math.max(0, Math.min(5, parsed.quizBestScore))
          : 0,
      quizLastScore:
        typeof parsed.quizLastScore === 'number'
          ? Math.max(0, Math.min(5, parsed.quizLastScore))
          : null,
      criticalAnswer:
        typeof parsed.criticalAnswer === 'string' ? parsed.criticalAnswer : '',
      criticalSaved: Boolean(parsed.criticalSaved),
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
    };
  } catch {
    return fallback;
  }
}

export function saveMission3Data(data: Mission3SavedData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MISSION3_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Abaikan ralat storan
  }
}

export function createDefaultMission4Data(): Mission4SavedData {
  return {
    openedTechniqueIds: [],
    practicedStanzas: [],
    selfScores: {},
    strengthReflection: '',
    improvementNeedReflection: '',
    peerTeacherFeedback: '',
    reflectionSaved: false,
    improvementChangeReflection: '',
    improvementSaved: false,
    savedAt: null,
  };
}

export function loadMission4Data(): Mission4SavedData {
  const fallback = createDefaultMission4Data();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(MISSION4_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Mission4SavedData>;
    const opened = Array.isArray(parsed.openedTechniqueIds)
      ? parsed.openedTechniqueIds.filter(
          (n): n is number => typeof n === 'number' && n >= 1 && n <= 5
        )
      : [];
    const practiced = Array.isArray(parsed.practicedStanzas)
      ? parsed.practicedStanzas.filter(
          (n): n is number => typeof n === 'number' && n >= 1 && n <= 4
        )
      : [];

    const selfScores: Record<string, number> = {};
    if (parsed.selfScores && typeof parsed.selfScores === 'object') {
      for (const key of ['1', '2', '3', '4', '5']) {
        const val = parsed.selfScores[key];
        if (typeof val === 'number' && val >= 1 && val <= 4) {
          selfScores[key] = val;
        }
      }
    }

    return {
      openedTechniqueIds: Array.from(new Set(opened)),
      practicedStanzas: Array.from(new Set(practiced)),
      selfScores,
      strengthReflection:
        typeof parsed.strengthReflection === 'string' ? parsed.strengthReflection : '',
      improvementNeedReflection:
        typeof parsed.improvementNeedReflection === 'string'
          ? parsed.improvementNeedReflection
          : '',
      peerTeacherFeedback:
        typeof parsed.peerTeacherFeedback === 'string' ? parsed.peerTeacherFeedback : '',
      reflectionSaved: Boolean(parsed.reflectionSaved),
      improvementChangeReflection:
        typeof parsed.improvementChangeReflection === 'string'
          ? parsed.improvementChangeReflection
          : '',
      improvementSaved: Boolean(parsed.improvementSaved),
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
    };
  } catch {
    return fallback;
  }
}

export function saveMission4Data(data: Mission4SavedData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MISSION4_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Abaikan ralat storan
  }
}

export function createDefaultMission5Data(): Mission5SavedData {
  return {
    selectedStyle: null,
    checkedChecklistIds: [],
    hasPlayedBackPerformance: false,
    selfScores: {},
    rubricSaved: false,
    peerTeacherReviewer: '',
    peerTeacherFeedback: '',
    peerTeacherSaved: false,
    reflectionQ1: '',
    reflectionQ2: '',
    reflectionQ3: '',
    reflectionSaved: false,
    savedAt: null,
  };
}

export function loadMission5Data(): Mission5SavedData {
  const fallback = createDefaultMission5Data();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(MISSION5_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Mission5SavedData>;

    const validStyles: PerformanceStyleId[] = ['klasik', 'kreatif', 'multimedia'];
    const selectedStyle =
      typeof parsed.selectedStyle === 'string' &&
      validStyles.includes(parsed.selectedStyle as PerformanceStyleId)
        ? (parsed.selectedStyle as PerformanceStyleId)
        : null;

    const checkedChecklistIds = Array.isArray(parsed.checkedChecklistIds)
      ? parsed.checkedChecklistIds.filter((id): id is string => typeof id === 'string')
      : [];

    const selfScores: Record<string, number> = {};
    if (parsed.selfScores && typeof parsed.selfScores === 'object') {
      for (const key of ['1', '2', '3', '4', '5']) {
        const val = parsed.selfScores[key];
        if (typeof val === 'number' && val >= 1 && val <= 4) {
          selfScores[key] = val;
        }
      }
    }

    return {
      selectedStyle,
      checkedChecklistIds: Array.from(new Set(checkedChecklistIds)),
      hasPlayedBackPerformance: Boolean(parsed.hasPlayedBackPerformance),
      selfScores,
      rubricSaved: Boolean(parsed.rubricSaved),
      peerTeacherReviewer:
        typeof parsed.peerTeacherReviewer === 'string' ? parsed.peerTeacherReviewer : '',
      peerTeacherFeedback:
        typeof parsed.peerTeacherFeedback === 'string' ? parsed.peerTeacherFeedback : '',
      peerTeacherSaved: Boolean(parsed.peerTeacherSaved),
      reflectionQ1: typeof parsed.reflectionQ1 === 'string' ? parsed.reflectionQ1 : '',
      reflectionQ2: typeof parsed.reflectionQ2 === 'string' ? parsed.reflectionQ2 : '',
      reflectionQ3: typeof parsed.reflectionQ3 === 'string' ? parsed.reflectionQ3 : '',
      reflectionSaved: Boolean(parsed.reflectionSaved),
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
    };
  } catch {
    return fallback;
  }
}

export function saveMission5Data(data: Mission5SavedData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MISSION5_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Abaikan ralat storan
  }
}

export function createDefaultMission6Data(): Mission6SavedData {
  return {
    quizCompleted: false,
    quizLastScore: null,
    quizBestScore: 0,
    studentName: '',
    teacherName: '',
    appreciationMessage: '',
    letterSaved: false,
    reflectionQ1: '',
    reflectionQ2: '',
    reflectionQ3: '',
    reflectionQ4: '',
    checkedReflectionIds: [],
    reflectionSaved: false,
    certificateConfirmedName: '',
    certificateNameConfirmed: false,
    certificateIssuedAt: null,
    savedAt: null,
  };
}

export function loadMission6Data(): Mission6SavedData {
  const fallback = createDefaultMission6Data();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(MISSION6_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Mission6SavedData>;
    const checkedReflectionIds = Array.isArray(parsed.checkedReflectionIds)
      ? parsed.checkedReflectionIds.filter((id): id is string => typeof id === 'string')
      : [];

    return {
      quizCompleted: Boolean(parsed.quizCompleted),
      quizLastScore:
        typeof parsed.quizLastScore === 'number'
          ? Math.max(0, Math.min(6, parsed.quizLastScore))
          : null,
      quizBestScore:
        typeof parsed.quizBestScore === 'number'
          ? Math.max(0, Math.min(6, parsed.quizBestScore))
          : 0,
      studentName: typeof parsed.studentName === 'string' ? parsed.studentName : '',
      teacherName: typeof parsed.teacherName === 'string' ? parsed.teacherName : '',
      appreciationMessage:
        typeof parsed.appreciationMessage === 'string' ? parsed.appreciationMessage : '',
      letterSaved: Boolean(parsed.letterSaved),
      reflectionQ1: typeof parsed.reflectionQ1 === 'string' ? parsed.reflectionQ1 : '',
      reflectionQ2: typeof parsed.reflectionQ2 === 'string' ? parsed.reflectionQ2 : '',
      reflectionQ3: typeof parsed.reflectionQ3 === 'string' ? parsed.reflectionQ3 : '',
      reflectionQ4: typeof parsed.reflectionQ4 === 'string' ? parsed.reflectionQ4 : '',
      checkedReflectionIds: Array.from(new Set(checkedReflectionIds)),
      reflectionSaved: Boolean(parsed.reflectionSaved),
      certificateConfirmedName:
        typeof parsed.certificateConfirmedName === 'string'
          ? parsed.certificateConfirmedName
          : '',
      certificateNameConfirmed: Boolean(parsed.certificateNameConfirmed),
      certificateIssuedAt:
        typeof parsed.certificateIssuedAt === 'string'
          ? parsed.certificateIssuedAt
          : null,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
    };
  } catch {
    return fallback;
  }
}

export function saveMission6Data(data: Mission6SavedData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MISSION6_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Abaikan ralat storan
  }
}

export function createDefaultLearningSupportData(): LearningSupportSavedData {
  return {
    mode: 'standard',
    kbatAnswers: { k1: '', k2: '', k3: '' },
    kbatSaved: false,
    savedAt: null,
  };
}

export function loadLearningSupportData(): LearningSupportSavedData {
  const fallback = createDefaultLearningSupportData();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(LEARNING_SUPPORT_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<LearningSupportSavedData>;
    const validModes: LearningMode[] = ['bimbingan', 'standard', 'cabaran'];
    const mode: LearningMode =
      typeof parsed.mode === 'string' && validModes.includes(parsed.mode as LearningMode)
        ? (parsed.mode as LearningMode)
        : 'standard';

    return {
      mode,
      kbatAnswers: {
        k1: typeof parsed.kbatAnswers?.k1 === 'string' ? parsed.kbatAnswers.k1 : '',
        k2: typeof parsed.kbatAnswers?.k2 === 'string' ? parsed.kbatAnswers.k2 : '',
        k3: typeof parsed.kbatAnswers?.k3 === 'string' ? parsed.kbatAnswers.k3 : '',
      },
      kbatSaved: Boolean(parsed.kbatSaved),
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
    };
  } catch {
    return fallback;
  }
}

export function saveLearningSupportData(data: LearningSupportSavedData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LEARNING_SUPPORT_KEY, JSON.stringify(data));
  } catch {
    // Abaikan ralat storan
  }
}

