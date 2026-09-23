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
  crystalCaveImg
} from '../data/mockData';
import { startAmbientSoundscape, setAmbientVolume, stopAmbientSoundscape } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

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
  exploreNewTopic: (topic: string, gradeLevel?: string) => Promise<Story>;
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
  const [role, setRoleState] = useState<Role>('student');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_STUDENT);
  const [parentalControls, setParentalControls] = useState<ParentalControls>(INITIAL_PARENTAL_CONTROLS);
  const [ageMismatchAlerts, setAgeMismatchAlerts] = useState<AgeMismatchAlert[]>(INITIAL_AGE_MISMATCH_ALERTS);
  const [childTopicsLearned, setChildTopicsLearned] = useState<ChildTopicHistory[]>(INITIAL_CHILD_TOPIC_HISTORY);
  const [learningAnalytics, setLearningAnalytics] = useState<LearningAnalytics>(INITIAL_LEARNING_ANALYTICS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [activeStoryId, setActiveStoryId] = useState<string>('story-crystal-cave');
  const [masteredWords, setMasteredWords] = useState<Set<string>>(
    new Set(['luminescence', 'subterranean', 'transparent', 'harmonic', 'trajectory'])
  );

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole === 'student') {
      setCurrentUser(INITIAL_STUDENT);
    } else {
      setCurrentUser(INITIAL_PARENT);
    }
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
    setCurrentUser(prev => {
      const newXp = prev.xp + amount;
      const nextLevel = Math.floor(newXp / 300) + 1;
      if (nextLevel > prev.level) {
        triggerCelebration();
      }
      return {
        ...prev,
        xp: newXp,
        level: nextLevel,
      };
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
    setCurrentUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...prefs,
      },
    }));
  };

  const exploreNewTopic = async (topic: string, gradeLevel: string = 'Grade 3-4'): Promise<Story> => {
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

    // 2. Generate structured interactive story
    const newStoryId = `story-topic-${Date.now()}`;
    const cleanTopic = topic.trim();
    const capitalizedTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

    const generatedStory: Story = {
      id: newStoryId,
      title: `The Wonders of ${capitalizedTopic}`,
      subtitle: `An inquisitive expedition discovering the mysteries of ${capitalizedTopic.toLowerCase()}`,
      coverImage: heroImg,
      genre: 'STEM Exploration',
      ageRange: 'Ages 8–11',
      gradeLevel: gradeLevel || parentalControls.maxGradeBand,
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
          quiz: {
            id: 'quiz-exp-1',
            question: `What fundamental principle did ${currentUser.name.split(' ')[0]} apply to begin investigating ${cleanTopic}?`,
            options: [
              'Careful observation and empirical data analysis',
              'Guessing without checking measurements',
              'Asking a stranger on the sidewalk',
              'Waiting for someone else to do the research'
            ],
            correctIndex: 0,
            explanation: 'The text highlights that every great scientific discovery begins with careful observation and pattern analysis.',
            xpReward: 60,
            ccssStandard: 'CCSS.ELA-LITERACY.RI.3.1',
          },
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
          quiz: {
            id: 'quiz-exp-2',
            question: `What was the key outcome of ${currentUser.name.split(' ')[0]}’s research into ${cleanTopic}?`,
            options: [
              'A validated hypothesis that answered the core question',
              'A broken computer monitor',
              'Deciding to quit exploring forever',
              'Losing the journal notes'
            ],
            correctIndex: 0,
            explanation: 'The text explicitly states: "The simulation monitors flashed with green confirmation runes. The hypothesis held true!"',
            xpReward: 80,
            ccssStandard: 'CCSS.ELA-LITERACY.RI.3.2',
          },
          isEnding: true,
        },
      },
    };

    // 3. Add to stories and topic history
    setStories(prev => [generatedStory, ...prev]);
    setActiveStoryId(generatedStory.id);

    const newHistoryEntry: ChildTopicHistory = {
      id: `hist-${Date.now()}`,
      topic: capitalizedTopic,
      storyTitle: generatedStory.title,
      date: 'Just now',
      durationMinutes: 10,
      wordsLearned: 3,
      quizScore: 100,
      lexile: '580L',
    };
    setChildTopicsLearned(prev => [newHistoryEntry, ...prev]);

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
