export type Role = 'student' | 'parent';

export interface VocabularyWord {
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  mastered: boolean;
  tier?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
  ccssStandard?: string; // e.g., CCSS.ELA-LITERACY.RI.3.1
}

export interface StoryChoice {
  id: string;
  text: string;
  nextNodeId: string;
  themeTag?: string;
}

export interface StoryNode {
  id: string;
  title: string;
  content: string[];
  illustration?: string;
  choices: StoryChoice[];
  vocabulary: VocabularyWord[];
  quiz?: QuizQuestion;
  isEnding?: boolean;
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  genre: string;
  ageRange: string;
  gradeLevel: string;
  lexileLevel: string;
  estimatedMinutes: number;
  tags: string[];
  summary: string;
  initialNodeId: string;
  nodes: Record<string, StoryNode>;
  topic?: string;
  createdAt?: string;
}

export interface ParentalControls {
  maxDailyMinutes: number;
  maxGradeBand: 'Grade 1-2' | 'Grade 3-4' | 'Grade 5-6';
  aiCreativity: 'strict' | 'balanced' | 'creative';
  topicSafetyFilter: boolean;
  alertOnAgeMismatch: boolean;
}

export interface AgeMismatchAlert {
  id: string;
  timestamp: string;
  topic: string;
  studentName: string;
  assessedAge: number;
  targetAge: number;
  differenceYears: number;
  message: string;
  severity: 'warning' | 'info';
  acknowledged: boolean;
}

export interface ChildTopicHistory {
  id: string;
  topic: string;
  storyTitle: string;
  date: string;
  durationMinutes: number;
  wordsLearned: number;
  quizScore: number;
  lexile: string;
}

export interface LearningAnalytics {
  lexileTrajectory: { month: string; score: number }[];
  oralFluencyWPM: { week: string; wpm: number }[];
  ccssMastery: { standard: string; label: string; score: number; status: 'Exceeding' | 'Proficient' | 'Developing' }[];
  vocabularyRetention: { word: string; tier: string; definition: string; status: 'Mastered' | 'Needs Review'; encounters: number }[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'reading' | 'quiz' | 'explorer' | 'creativity';
}

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  gradeLevel: string;
  xp: number;
  level: number;
  streakDays: number;
  minutesReadToday: number;
  badges: Badge[];
  preferences: {
    dyslexicFont: boolean;
    fontSize: 'normal' | 'large' | 'xlarge';
    highContrast: boolean;
    voiceId: string;
    playbackSpeed: number;
    ambientSound: string;
    ambientVolume: number;
  };
}

export interface VoicePreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  sampleText: string;
  pitch: number;
  rate: number;
  avatarIcon: string;
}
