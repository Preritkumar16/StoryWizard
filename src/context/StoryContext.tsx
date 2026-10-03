import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Role,
  UserProfile,
  Story,
  ParentalControls,
  AgeMismatchAlert,
  ChildTopicHistory,
  LearningAnalytics,
  VocabularyWord
} from '../types';
import {
  INITIAL_STUDENT,
  INITIAL_PARENT,
  INITIAL_STORIES,
  INITIAL_PARENTAL_CONTROLS,
  INITIAL_AGE_MISMATCH_ALERTS,
  INITIAL_CHILD_TOPIC_HISTORY,
  INITIAL_LEARNING_ANALYTICS,
  heroImg,
  crystalCaveImg,
  leoAvatarImg
} from '../data/mockData';
import { startAmbientSoundscape, setAmbientVolume, stopAmbientSoundscape } from '../utils/audioSynth';
import { storyService } from '../services/storyService';
import { adaptGeneratedStoryToReader } from '../utils/storyAdapter';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';

interface StoryContextType {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: UserProfile;
  parentalControls: ParentalControls;
  updateParentalControls: (controls: Partial<ParentalControls>) => void;
  ageMismatchAlerts: AgeMismatchAlert[];
  dismissAlert: (id: string) => void;
  childTopicsLearned: ChildTopicHistory[];
  learningAnalytics: LearningAnalytics;
  stories: Story[];
  activeStoryId: string;
  setActiveStoryId: (id: string) => void;
  exploreNewTopic: (
    topic: string,
    gradeLevel?: string,
    interests?: string[],
    learningObjective?: string
  ) => Promise<Story>;
  addGeneratedStory: (story: Story) => void;
  masteredWords: Set<string>;
  toggleWordMastered: (word: string) => void;
  addXP: (amount: number) => void;
  updateUserPreferences: (prefs: Partial<UserProfile['preferences']>) => void;
  triggerCelebration: () => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

// Helper to evaluate age rating for topics
const evaluateTopicAgeRating = (topic: string): { assessedAge: number; isAgeMismatch: boolean; yearsAbove: number } => {
  const t = topic.toLowerCase();
  // Complex or advanced academic topics
  if (t.includes('quantum') || t.includes('relativity') || t.includes('neuroscience') || t.includes('calculus')) {
    return { assessedAge: 13, isAgeMismatch: true, yearsAbove: 5 };
  }
  if (t.includes('crispr') || t.includes('gene editing') || t.includes('nuclear') || t.includes('cryptography')) {
    return { assessedAge: 12, isAgeMismatch: true, yearsAbove: 4 };
  }
  if (t.includes('artificial intelligence') || t.includes('cybersecurity') || t.includes('microbiology')) {
    return { assessedAge: 11, isAgeMismatch: true, yearsAbove: 3 };
  }
  return { assessedAge: 8, isAgeMismatch: false, yearsAbove: 0 };
};

export const StoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser, role: authRole } = useAuth();
  const role: Role = authRole === 'parent' ? 'parent' : 'student';

  const [parentalControls, setParentalControls] = useState<ParentalControls>(INITIAL_PARENTAL_CONTROLS);
  const [ageMismatchAlerts, setAgeMismatchAlerts] = useState<AgeMismatchAlert[]>(INITIAL_AGE_MISMATCH_ALERTS);
  const [childTopicsLearned, setChildTopicsLearned] = useState<ChildTopicHistory[]>(INITIAL_CHILD_TOPIC_HISTORY);
  const [learningAnalytics, setLearningAnalytics] = useState<LearningAnalytics>(INITIAL_LEARNING_ANALYTICS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [activeStoryId, setActiveStoryId] = useState<string>('story-crystal-cave');
  const [masteredWords, setMasteredWords] = useState<Set<string>>(
    new Set(['luminescence', 'subterranean', 'transparent', 'harmonic', 'trajectory'])
  );

  const [userPreferences, setUserPreferences] = useState<UserProfile['preferences']>({
    voiceId: 'grandpa-oak',
    playbackSpeed: 1.0,
    fontSize: 'normal',
    dyslexicFont: false,
    highContrast: false,
    ambientSound: 'enchanted-forest',
    ambientVolume: 0.3,
  });
  const [xp, setXp] = useState(1650);
  const [streakDays] = useState(9);
  const [minutesReadToday] = useState(22);

  // Compute currentUser dynamically from authenticated identity
  const currentUser: UserProfile = {
    id: authUser?.userId || (role === 'student' ? 'student-alex' : 'parent-sarah'),
    name: authUser?.name || (role === 'student' ? 'Student Explorer' : 'Parent Supervisor'),
    role,
    avatar: role === 'student' ? leoAvatarImg : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
    gradeLevel: '3rd Grade',
    xp,
    level: Math.floor(xp / 300) + 1,
    streakDays,
    minutesReadToday,
    badges: INITIAL_STUDENT.badges,
    preferences: userPreferences,
  };

  const setRole = (_newRole: Role) => {
    // Role is governed by AuthContext session; retained for API contract compatibility
  };

  // Sync ambient audio preferences
  useEffect(() => {
    if (currentUser.preferences.ambientSound && currentUser.preferences.ambientSound !== 'none') {
      startAmbientSoundscape(currentUser.preferences.ambientSound, currentUser.preferences.ambientVolume);
    } else {
      stopAmbientSoundscape();
    }
    return () => {
      stopAmbientSoundscape();
    };
  }, [currentUser.preferences.ambientSound]);

  useEffect(() => {
    setAmbientVolume(currentUser.preferences.ambientVolume);
  }, [currentUser.preferences.ambientVolume]);

  const updateParentalControls = (controls: Partial<ParentalControls>) => {
    setParentalControls(prev => ({ ...prev, ...controls }));
  };

  const dismissAlert = (id: string) => {
    setAgeMismatchAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#14B8A6', '#F59E0B', '#6366F1'],
    });
  };

  const addXP = (amount: number) => {
    setXp(prev => {
      const newXp = prev + amount;
      const nextLevel = Math.floor(newXp / 300) + 1;
      const currentLevel = Math.floor(prev / 300) + 1;
      if (nextLevel > currentLevel) {
        triggerCelebration();
      }
      return newXp;
    });
  };

  const toggleWordMastered = (word: string) => {
    const clean = word.toLowerCase().trim();
    setMasteredWords(prev => {
      const next = new Set(prev);
      if (next.has(clean)) {
        next.delete(clean);
      } else {
        next.add(clean);
        addXP(25);
      }
      return next;
    });

    // Update learning analytics table
    setLearningAnalytics(prev => ({
      ...prev,
      vocabularyRetention: prev.vocabularyRetention.map(item =>
        item.word.toLowerCase() === clean
          ? { ...item, status: item.status === 'Mastered' ? 'Needs Review' : 'Mastered' }
          : item
      ),
    }));
  };

  const updateUserPreferences = (prefs: Partial<UserProfile['preferences']>) => {
    setUserPreferences(prev => ({
      ...prev,
      ...prefs,
    }));
  };

  const addGeneratedStory = (generatedStory: Story) => {
    setStories(prev => [generatedStory, ...prev.filter(s => s.id !== generatedStory.id)]);
    setActiveStoryId(generatedStory.id);

    const newHistoryEntry: ChildTopicHistory = {
      id: `hist-${Date.now()}`,
      topic: generatedStory.topic || generatedStory.title,
      storyTitle: generatedStory.title,
      date: 'Just now',
      durationMinutes: generatedStory.estimatedMinutes || 8,
      wordsLearned: Object.values(generatedStory.nodes).reduce(
        (acc, n) => acc + (n.vocabulary?.length || 0),
        0
      ),
      quizScore: 100,
      lexile: generatedStory.lexileLevel || '580L',
    };
    setChildTopicsLearned(prev => [newHistoryEntry, ...prev]);
  };

  const exploreNewTopic = async (
    topic: string,
    gradeLevel: string = 'Grade 3-4',
    interests: string[] = ['space', 'exploration'],
    learningObjective?: string
  ): Promise<Story> => {
    // 1. Check Age-Mismatch
    const evaluation = evaluateTopicAgeRating(topic);
    if (evaluation.isAgeMismatch && parentalControls.alertOnAgeMismatch) {
      const newAlert: AgeMismatchAlert = {
        id: `alert-${Date.now()}`,
        timestamp: 'Just now',
        topic,
        studentName: currentUser.name.split(' ')[0],
        assessedAge: evaluation.assessedAge,
        targetAge: 8,
        differenceYears: evaluation.yearsAbove,
        message: `${currentUser.name.split(' ')[0]} searched for '${topic}' – rated ${evaluation.yearsAbove} years above configured ${parentalControls.maxGradeBand} target band.`,
        severity: 'warning',
        acknowledged: false,
      };
      setAgeMismatchAlerts(prev => [newAlert, ...prev]);
    }

    const cleanTopic = topic.trim();
    const effectiveGrade = gradeLevel || parentalControls.maxGradeBand || 'Grade 3-4';

    // 2. Attempt real multi-agent generation via storyService
    try {
      const response = await storyService.generateStory({
        topic: cleanTopic,
        grade_band: effectiveGrade,
        interests: interests && interests.length > 0 ? interests : ['exploration', 'science'],
        learning_objective:
          learningObjective ||
          `Understand foundational principles of ${cleanTopic} and its relevance in nature.`,
      });

      if (response.status === 'rejected_safety') {
        const safetyReason =
          response.safety_validation?.reason ||
          response.errors?.[0] ||
          'Story was rejected by the safety audit.';
        throw new Error(`SAFETY_REJECTED: ${safetyReason}`);
      }

      if (response.story) {
        const adaptedStory = adaptGeneratedStoryToReader(response);
        addGeneratedStory(adaptedStory);
        return adaptedStory;
      }
    } catch (apiError: any) {
      console.warn('Backend AI generation encountered issue, evaluating fallback:', apiError);
      if (apiError?.message?.startsWith('SAFETY_REJECTED')) {
        throw apiError;
      }
      // Re-throw if error was from an intentional server rejection
      if (apiError?.response?.status === 400 || apiError?.response?.status === 401 || apiError?.response?.status === 403) {
        throw apiError;
      }
    }

    // 3. Fallback deterministic story generation (preserves offline preview resilience)
    const newStoryId = `story-topic-${Date.now()}`;
    const capitalizedTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

    const generatedStory: Story = {
      id: newStoryId,
      title: `The Wonders of ${capitalizedTopic}`,
      subtitle: `An inquisitive expedition discovering the mysteries of ${capitalizedTopic.toLowerCase()}`,
      coverImage: heroImg,
      genre: 'STEM Exploration',
      ageRange: 'Ages 8–11',
      gradeLevel: effectiveGrade,
      lexileLevel: '580L',
      estimatedMinutes: 9,
      tags: [capitalizedTopic, 'CCSS Aligned', 'Tier-2 Vocab'],
      summary: `Join young explorer ${currentUser.name.split(' ')[0]} as they investigate the core principles and amazing science behind ${capitalizedTopic.toLowerCase()}.`,
      initialNodeId: 'node-explore-1',
      topic: cleanTopic,
      createdAt: 'Just now',
      nodes: {
        'node-explore-1': {
          id: 'node-explore-1',
          title: `Chapter 1: The Investigation of ${capitalizedTopic}`,
          illustration: heroImg,
          content: [
            `${currentUser.name.split(' ')[0]} opened the digital field researcher journal. The glowing screen illuminated key queries about ${cleanTopic}.`,
            `Every great scientific discovery begins with observation. By analyzing the fundamental properties, ${currentUser.name.split(' ')[0]} noticed patterns that previous explorers had completely overlooked.`,
            `Ahead lay two promising research methodologies: conducting an empirical experiment in the field laboratory, or consulting ancient historical archives.`
          ],
          choices: [
            {
              id: 'choice-lab',
              text: `Conduct an empirical simulation on ${cleanTopic}`,
              nextNodeId: 'node-explore-2',
              themeTag: 'Empirical Inquiry',
            },
          ],
          vocabulary: [
            {
              word: 'empirical',
              phonetic: 'em-PEER-ih-kuhl',
              definition: 'Based on, concerned with, or verifiable by observation or experiment rather than pure theory.',
              example: `${currentUser.name.split(' ')[0]} collected empirical evidence from multiple test runs.`,
              mastered: false,
              tier: 'Tier 2',
            },
            {
              word: 'methodology',
              phonetic: 'meth-uh-DOL-uh-jee',
              definition: 'A system of methods, rules, and postulates used in a particular science or art.',
              example: 'A rigorous research methodology guarantees dependable findings.',
              mastered: true,
              tier: 'Tier 2',
            },
          ],
          isEnding: false,
        },
        'node-explore-2': {
          id: 'node-explore-2',
          title: `Chapter 2: The Breakthrough in ${capitalizedTopic}`,
          illustration: heroImg,
          content: [
            `The simulation monitors flashed with green confirmation runes. The hypothesis held true!`,
            `By examining ${cleanTopic} with patience and curiosity, ${currentUser.name.split(' ')[0]} synthesized a breakthrough model that answered their initial question with crystal clarity.`
          ],
          choices: [],
          vocabulary: [
            {
              word: 'hypothesis',
              phonetic: 'hye-POTH-uh-sis',
              definition: 'A proposed explanation made on the basis of limited evidence as a starting point for further investigation.',
              example: 'Their hypothesis proved accurate once the test concluded.',
              mastered: false,
              tier: 'Tier 3',
            },
          ],
          isEnding: true,
        },
      },
    };

    addGeneratedStory(generatedStory);
    return generatedStory;
  };

  return (
    <StoryContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        parentalControls,
        updateParentalControls,
        ageMismatchAlerts,
        dismissAlert,
        childTopicsLearned,
        learningAnalytics,
        stories,
        activeStoryId,
        setActiveStoryId,
        exploreNewTopic,
        addGeneratedStory,
        masteredWords,
        toggleWordMastered,
        addXP,
        updateUserPreferences,
        triggerCelebration,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
};
