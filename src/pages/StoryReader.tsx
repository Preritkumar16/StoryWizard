import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStory } from '../context/StoryContext';
import { StoryNode, VocabularyWord, QuizQuestion } from '../types';
import { VOICE_LIBRARY_PRESETS } from '../data/mockData';
import { playPageTurnSound, playSuccessChime, speakStoryContent } from '../utils/audioSynth';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Type,
  Sun,
  Moon,
  ChevronRight,
  BookOpen,
  ArrowRight,
  X,
  Headphones,
  Sliders,
  Check
} from 'lucide-react';

export const StoryReader: React.FC = () => {
  const { storyId } = useParams<{ storyId?: string }>();
  const {
    stories,
    activeStoryId,
    setActiveStoryId,
    currentUser,
    updateUserPreferences,
    masteredWords,
    toggleWordMastered,
    addXP,
    triggerCelebration
  } = useStory();

  const currentStoryId = storyId || activeStoryId;
  const story = stories.find(s => s.id === currentStoryId) || stories[0];

  useEffect(() => {
    if (story && story.id !== activeStoryId) {
      setActiveStoryId(story.id);
    }
  }, [story, activeStoryId, setActiveStoryId]);

  const [currentNodeId, setCurrentNodeId] = useState<string>(story.initialNodeId);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);

  // Quiz state
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizAnsweredNodes, setQuizAnsweredNodes] = useState<Set<string>>(new Set());

  const cancelSpeechRef = useRef<(() => void) | null>(null);

  // Reset node when story changes
  useEffect(() => {
    setCurrentNodeId(story.initialNodeId);
    setSelectedAnswerIndex(null);
    setQuizSubmitted(false);
  }, [story.id, story.initialNodeId]);

  // Clean speech when node changes or unmounts
  useEffect(() => {
    return () => {
      if (cancelSpeechRef.current) {
        cancelSpeechRef.current();
      }
    };
  }, [currentNodeId]);

  const currentNode: StoryNode = story.nodes[currentNodeId] || story.nodes[story.initialNodeId] || {
    id: 'fallback',
    title: 'Chapter 1: The Adventure Begins',
    content: ['Once upon a time in a vibrant world of imagination...'],
    choices: [],
    vocabulary: []
  };

  const handleBranchChoice = (nextNodeId: string) => {
    if (cancelSpeechRef.current) {
      cancelSpeechRef.current();
      setIsPlayingAudio(false);
    }
    playPageTurnSound();
    setCurrentNodeId(nextNodeId);
    setSelectedAnswerIndex(null);
    setQuizSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestartStory = () => {
    if (cancelSpeechRef.current) {
      cancelSpeechRef.current();
      setIsPlayingAudio(false);
    }
    playPageTurnSound();
    setCurrentNodeId(story.initialNodeId);
    setSelectedAnswerIndex(null);
    setQuizSubmitted(false);
  };

  const toggleSpeechAudio = () => {
    if (isPlayingAudio) {
      if (cancelSpeechRef.current) {
        cancelSpeechRef.current();
      }
      setIsPlayingAudio(false);
    } else {
      const fullText = currentNode.content.join(' ');
      setIsPlayingAudio(true);

      const activeVoice = VOICE_LIBRARY_PRESETS.find(v => v.id === currentUser.preferences.voiceId);
      const pitch = activeVoice ? activeVoice.pitch : 1.0;

      cancelSpeechRef.current = speakStoryContent(fullText, {
        pitch,
        rate: currentUser.preferences.playbackSpeed || 1.0,
        voiceId: currentUser.preferences.voiceId,
        onEnd: () => {
          setIsPlayingAudio(false);
        },
      });
    }
  };

  const handleWordClick = (word: VocabularyWord) => {
    setSelectedWord(word);
    setInspectorOpen(true);
  };

  const handlePronounceWord = (word: VocabularyWord) => {
    speakStoryContent(word.word, {
      pitch: 1.0,
      rate: 0.85,
    });
  };

  const handleQuizSubmit = (quiz: QuizQuestion) => {
    if (selectedAnswerIndex === null) return;
    setQuizSubmitted(true);
    setQuizAnsweredNodes(prev => new Set(prev).add(currentNode.id));

    if (selectedAnswerIndex === quiz.correctIndex) {
      playSuccessChime();
      addXP(quiz.xpReward);
      triggerCelebration();
    }
  };

  // Accessibility classes
  const fontSizeClass =
    currentUser.preferences.fontSize === 'xlarge'
      ? 'text-xl sm:text-2xl leading-relaxed'
      : currentUser.preferences.fontSize === 'large'
      ? 'text-lg sm:text-xl leading-relaxed'
      : 'text-base sm:text-lg leading-relaxed';

  const fontClass = currentUser.preferences.dyslexicFont
    ? 'font-dyslexic'
    : 'font-sans';

  const contrastClass = currentUser.preferences.highContrast
    ? 'bg-slate-900 text-slate-100'
    : 'bg-[#F8FAFC] text-slate-800';

  const cardBgClass = currentUser.preferences.highContrast
    ? 'bg-slate-800 border-slate-700 text-slate-100'
    : 'bg-white border-slate-200/90 text-slate-900';

  return (
    <div className={`min-h-screen ${contrastClass} pb-24 transition-colors duration-200 relative`}>
      
      {/* Top Reader Controls Bar */}
      <div className={`sticky top-16 z-30 border-b backdrop-blur-md px-4 sm:px-6 py-2.5 transition-colors ${
        currentUser.preferences.highContrast
          ? 'bg-slate-900/90 border-slate-800 text-slate-200'
          : 'bg-white/90 border-slate-200 text-slate-700'
      }`}>
        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-3">
          
          {/* Breadcrumb Info */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-indigo-600 truncate max-w-[200px] sm:max-w-none font-headline">
              {story.title}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">{story.lexileLevel}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">{currentNode.title.split(':')[0]}</span>
          </div>

          {/* Reader Accessibility & Audio Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause AI Narration Button */}
            <button
              type="button"
              onClick={toggleSpeechAudio}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition ${
                isPlayingAudio
                  ? 'bg-amber-500 text-white hover:bg-amber-600 animate-pulse'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Pause Voice</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>

            {/* Font Size Cycle Toggle */}
            <button
              type="button"
              onClick={() => {
                const sizes: ('normal' | 'large' | 'xlarge')[] = ['normal', 'large', 'xlarge'];
                const next = sizes[(sizes.indexOf(currentUser.preferences.fontSize) + 1) % sizes.length];
                updateUserPreferences({ fontSize: next });
              }}
              title="Toggle font size scale"
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span className="font-mono text-xs">
                {currentUser.preferences.fontSize === 'xlarge' ? 'A++' : currentUser.preferences.fontSize === 'large' ? 'A+' : 'A'}
              </span>
            </button>

            {/* OpenDyslexic Font Toggle */}
            <button
              type="button"
              onClick={() => updateUserPreferences({ dyslexicFont: !currentUser.preferences.dyslexicFont })}
              title="Toggle OpenDyslexic readable font mode"
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                currentUser.preferences.dyslexicFont
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              OpenDyslexic
            </button>

            {/* High Contrast Toggle */}
            <button
              type="button"
              onClick={() => updateUserPreferences({ highContrast: !currentUser.preferences.highContrast })}
              title="Toggle Dark / Light Contrast"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              {currentUser.preferences.highContrast ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Main Reading Canvas */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-8">
        <article className={`rounded-2xl border p-6 sm:p-10 shadow-md ${cardBgClass} transition-colors`}>
          
          {/* Chapter Header */}
          <div className="mb-6 pb-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-headline ${fontClass}`}>
                {currentNode.title}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Tap underlined Tier-2 vocabulary words to inspect definitions & earn +25 XP
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 shrink-0">
              {story.gradeLevel}
            </span>
          </div>

          {/* AI Generated Chapter Illustration Card */}
          {currentNode.illustration && (
            <div className="mb-8 rounded-xl overflow-hidden border border-slate-200/80 shadow-sm max-h-[380px] relative group">
              <img
                src={currentNode.illustration}
                alt={currentNode.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-white font-medium">
                AI Story Illustration
              </div>
            </div>
          )}

          {/* Story Paragraphs with Clickable Vocabulary Words */}
          <div className={`space-y-5 ${fontClass} ${fontSizeClass}`}>
            {currentNode.content.map((paragraph, pIdx) => {
              const words = paragraph.split(' ');
              return (
                <p key={pIdx} className="leading-relaxed">
                  {words.map((word, wIdx) => {
                    const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
                    const vocabItem = currentNode.vocabulary.find(
                      v => v.word.toLowerCase() === cleanWord
                    );

                    if (vocabItem) {
                      const isMastered = masteredWords.has(cleanWord);
                      return (
                        <span key={wIdx}>
                          <button
                            type="button"
                            onClick={() => handleWordClick(vocabItem)}
                            className={`inline cursor-pointer border-b-2 font-semibold transition-all px-0.5 rounded ${
                              isMastered
                                ? 'border-teal-400 text-teal-600 hover:bg-teal-50'
                                : 'border-indigo-400 text-indigo-600 hover:bg-indigo-50'
                            }`}
                            title={`Inspect vocabulary word: ${vocabItem.word}`}
                          >
                            {word}
                          </button>{' '}
                        </span>
                      );
                    }

                    return <span key={wIdx}>{word} </span>;
                  })}
                </p>
              );
            })}
          </div>

          {/* Interactive Branching Choices or Story Ending */}
          <div className="mt-12 pt-8 border-t border-slate-200/80">
            {!currentNode.isEnding ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-headline">
                    Decision Point: What should the explorer do next?
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentNode.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleBranchChoice(choice.nextNodeId)}
                      className="group flex flex-col justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-900">
                          {choice.text}
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
                      </div>
                      {choice.themeTag && (
                        <span className="mt-3 text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
                          Strategy: {choice.themeTag}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-teal-50 border border-teal-200 p-6 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-teal-900 font-headline">
                  Quest Path Completed!
                </h3>
                <p className="text-xs text-teal-700 max-w-md mx-auto">
                  You successfully reached a triumphant narrative conclusion. Try exploring other story branches or return to the library for new topics.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleRestartStory}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Try Another Path</span>
                  </button>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-teal-300 bg-white text-xs font-semibold text-teal-800 hover:bg-teal-50 shadow-sm"
                  >
                    <span>Explore New Topic</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* CCSS Comprehension Mini-Quiz Module */}
          {currentNode.quiz && (
            <div className="mt-10 pt-8 border-t border-slate-200/80">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-indigo-600" />
                    <h4 className="text-sm font-bold text-indigo-950 font-headline">
                      Chapter Comprehension Challenge
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {currentNode.quiz.ccssStandard && (
                      <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                        {currentNode.quiz.ccssStandard}
                      </span>
                    )}
                    <span className="font-bold text-indigo-600 tabular-nums">
                      +{currentNode.quiz.xpReward} XP
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-800">
                  {currentNode.quiz.question}
                </p>

                <div className="space-y-2">
                  {currentNode.quiz.options.map((option, idx) => {
                    const isSelected = selectedAnswerIndex === idx;
                    const isCorrect = idx === currentNode.quiz?.correctIndex;
                    let optionStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                    if (quizSubmitted) {
                      if (isCorrect) {
                        optionStyle = 'border-teal-500 bg-teal-50 text-teal-900 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'border-rose-300 bg-rose-50 text-rose-900';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-indigo-500 bg-indigo-50/80 text-indigo-900 font-semibold';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={quizSubmitted}
                        onClick={() => setSelectedAnswerIndex(idx)}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-center justify-between ${optionStyle}`}
                      >
                        <span>{option}</span>
                        {quizSubmitted && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                        )}
                        {quizSubmitted && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button
                    type="button"
                    onClick={() => currentNode.quiz && handleQuizSubmit(currentNode.quiz)}
                    disabled={selectedAnswerIndex === null}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition shadow-sm"
                  >
                    <span>Check Answer</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Pedagogical Explanation: </span>
                    {currentNode.quiz.explanation}
                  </div>
                )}
              </div>
            </div>
          )}

        </article>
      </main>

      {/* Live Vocabulary Inspector Drawer (Slide-Over on Right) */}
      {inspectorOpen && selectedWord && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                      Live Vocabulary Inspector
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectorOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 capitalize font-headline">
                      {selectedWord.word}
                    </h2>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      /{selectedWord.phonetic}/
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePronounceWord(selectedWord)}
                    className="p-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                    title="Pronounce word"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Kid-Friendly Definition
                  </h3>
                  <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    {selectedWord.definition}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Context in Story
                  </h3>
                  <blockquote className="text-xs text-slate-700 italic bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 leading-relaxed">
                    "{selectedWord.example}"
                  </blockquote>
                </div>

                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900">Academic Classification:</span>
                    <span className="font-mono text-indigo-700 font-semibold">
                      {selectedWord.tier || 'Tier 2 High-Utility'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Tier-2 words appear frequently in academic texts and significantly enhance standardized reading comprehension.
                  </p>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleWordMastered(selectedWord.word)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition shadow-sm ${
                    masteredWords.has(selectedWord.word.toLowerCase())
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {masteredWords.has(selectedWord.word.toLowerCase())
                      ? 'Word Mastered (Saved)'
                      : 'Mark as Mastered (+25 XP)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
