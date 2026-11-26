export type ViewMode =
  | 'utama'
  | 'misi'
  | 'misi1'
  | 'misi2'
  | 'misi3'
  | 'misi4'
  | 'misi5'
  | 'misi6'
  | 'kppb';

export type ActiveModal = 'panduan' | 'objektif' | null;

export type MissionStatus = 'Belum Bermula' | 'Sedang Berlangsung' | 'Selesai';

export type MissionIconKey =
  | 'door'
  | 'heart'
  | 'flame'
  | 'mic'
  | 'theater'
  | 'sun';

export interface MissionLocation {
  id: number;
  code: string;
  title: string;
  islandLandmark: string;
  shortDesc: string;
  upcomingFocus: string;
  icon: MissionIconKey;
  colorScheme: 'lavender' | 'rose' | 'sky' | 'amber' | 'violet' | 'gold';
  /** Percentage coordinates on the 16:9 floating islands map */
  mapX: number;
  mapY: number;
}

export interface ProgressState {
  missions: Record<number, MissionStatus>;
  lastVisitedMissionId: number | null;
  updatedAt: string;
}

export interface PoemStanza {
  number: number;
  label: string;
  lines: string[];
  illustrationType: 'morning-gate' | 'glowing-lantern' | 'heart-support' | 'bright-future';
}

export interface QuizOption {
  id: 'A' | 'B' | 'C';
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correctAnswer: 'A' | 'B' | 'C';
  successFeedback: string;
  hint: string;
}

export interface EmotionChoice {
  id: string;
  stanzaNumber: number;
  label: string;
  iconKey: 'smile' | 'sparkles' | 'heart' | 'flame';
  colorScheme: 'amber' | 'sky' | 'rose' | 'violet';
  explanation: string;
  hint: string;
}

export interface Mission2SavedData {
  audioQuizPassed: boolean;
  matchedStanzas: number[];
  reflections: Record<number, string>;
  discussionChecked: boolean;
  reflectionSaved: boolean;
  savedAt: string | null;
}

export interface MagicBookItem {
  id: number;
  bookTitle: string;
  stanzaLabel: string;
  lines: string[];
  meaning: string;
  value: string;
  briefNote: string;
  colorScheme: 'lavender' | 'sky' | 'rose' | 'mint';
}

export interface MeaningMatchItem {
  id: string;
  stanzaNumber: number;
  meaningText: string;
  hint: string;
}

export interface Mission3SavedData {
  openedBooks: number[];
  matchedStanzas: number[];
  quizBestScore: number;
  quizLastScore: number | null;
  criticalAnswer: string;
  criticalSaved: boolean;
  savedAt: string | null;
}

export interface TechniqueCardItem {
  id: number;
  code: string;
  title: string;
  summary: string;
  exampleTip: string;
  iconKey: 'music' | 'sparkles' | 'mic' | 'pause' | 'heart';
  colorScheme: 'lavender' | 'sky' | 'rose' | 'amber' | 'mint';
}

export interface StanzaPracticeItem {
  number: number;
  label: string;
  lines: string[];
  recommendedTone: string;
  expressionTip: string;
  pauseHint: string;
}

export interface SelfAssessmentAspect {
  id: string;
  number: number;
  label: string;
  description: string;
}

export interface Mission4SavedData {
  openedTechniqueIds: number[];
  practicedStanzas: number[];
  selfScores: Record<string, number>;
  strengthReflection: string;
  improvementNeedReflection: string;
  peerTeacherFeedback: string;
  reflectionSaved: boolean;
  improvementChangeReflection: string;
  improvementSaved: boolean;
  savedAt: string | null;
}

export type PerformanceStyleId = 'klasik' | 'kreatif' | 'multimedia';

export interface PerformanceStyleOption {
  id: PerformanceStyleId;
  code: 'A' | 'B' | 'C';
  title: string;
  summary: string;
  guideTips: string[];
  colorScheme: 'lavender' | 'rose' | 'sky';
}

export interface Mission5ChecklistItem {
  id: string;
  text: string;
}

export interface Mission5RubricAspect {
  id: string;
  number: number;
  label: string;
  levelDescriptions: Record<1 | 2 | 3 | 4, string>;
}

export interface Mission5SavedData {
  selectedStyle: PerformanceStyleId | null;
  checkedChecklistIds: string[];
  hasPlayedBackPerformance: boolean;
  selfScores: Record<string, number>;
  rubricSaved: boolean;
  peerTeacherReviewer: string;
  peerTeacherFeedback: string;
  peerTeacherSaved: boolean;
  reflectionQ1: string;
  reflectionQ2: string;
  reflectionQ3: string;
  reflectionSaved: boolean;
  savedAt: string | null;
}

export type Quiz4OptionId = 'A' | 'B' | 'C' | 'D';

export interface Quiz4Question {
  id: number;
  question: string;
  options: Array<{ id: Quiz4OptionId; text: string }>;
  correctAnswer: Quiz4OptionId;
  successFeedback: string;
  hint: string;
}

export interface Mission6SavedData {
  quizCompleted: boolean;
  quizLastScore: number | null;
  quizBestScore: number;
  studentName: string;
  teacherName: string;
  appreciationMessage: string;
  letterSaved: boolean;
  reflectionQ1: string;
  reflectionQ2: string;
  reflectionQ3: string;
  reflectionQ4: string;
  checkedReflectionIds: string[];
  reflectionSaved: boolean;
  certificateConfirmedName: string;
  certificateNameConfirmed: boolean;
  certificateIssuedAt: string | null;
  savedAt: string | null;
}

export type LearningMode = 'bimbingan' | 'standard' | 'cabaran';

export interface GlossaryWordItem {
  word: string;
  meaning: string;
  stanzaRef: string;
  toneExample: string;
}

export interface KbatQuestionItem {
  id: 'k1' | 'k2' | 'k3';
  number: number;
  focus: string;
  question: string;
  placeholder: string;
  modelIdea: string;
}

export interface LearningSupportSavedData {
  mode: LearningMode;
  kbatAnswers: Record<'k1' | 'k2' | 'k3', string>;
  kbatSaved: boolean;
  savedAt: string | null;
}

