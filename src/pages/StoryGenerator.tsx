import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStory } from '../context/StoryContext';
import {
  storyService,
  GenerateStoryRequestPayload,
  GenerateStoryResponsePayload,
} from '../services/storyService';
import { authService } from '../services/authService';
import { adaptGeneratedStoryToReader } from '../utils/storyAdapter';
import toast from 'react-hot-toast';
import {
  Sparkles,
  BookOpen,
  Compass,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  HelpCircle,
  Lightbulb,
  Sliders,
  Layers,
  GraduationCap,
  HeartHandshake,
} from 'lucide-react';

interface QuickPromptPreset {
  label: string;
  topic: string;
  interests: string;
  grade: 'Grade 1-2' | 'Grade 3-4' | 'Grade 5-6';
  objective: string;
  icon: string;
}

const PRESET_TOPICS: QuickPromptPreset[] = [
  {
    label: 'Photosynthesis & Sunlight',
    topic: 'Photosynthesis',
    interests: 'Space, Exploration, Botany',
    grade: 'Grade 3-4',
    objective: 'Understand how plants use sunlight, carbon dioxide, and water to produce food and oxygen.',
    icon: '🌱',
  },
  {
    label: 'Deep Sea Volcanoes',
    topic: 'Underwater Volcanoes',
    interests: 'Marine Biology, Submarines, Magma',
    grade: 'Grade 3-4',
    objective: 'Learn how hydrothermal vents form minerals and support unique sea creatures.',
    icon: '🌋',
  },
  {
    label: 'Solar System Gravity',
    topic: 'Solar System and Gravity',
    interests: 'Astronomy, Spacecraft, Stars',
    grade: 'Grade 3-4',
    objective: 'Explore why planets orbit the Sun and how gravitational pull works.',
    icon: '🌌',
  },
  {
    label: 'Friendly Robotics',
    topic: 'Robotics and Algorithms',
    interests: 'Inventions, Coding, Friendly Robots',
    grade: 'Grade 5-6',
    objective: 'Understand how sensors help machines make decisions through clear steps.',
    icon: '🤖',
  },
];

export const StoryGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { role, currentUser, parentalControls, addGeneratedStory } = useStory();

  const [topic, setTopic] = useState('Photosynthesis');
  const [gradeBand, setGradeBand] = useState<'Grade 1-2' | 'Grade 3-4' | 'Grade 5-6'>(
    parentalControls.maxGradeBand || 'Grade 3-4'
  );
  const [interestsInput, setInterestsInput] = useState('Space, Exploration');
  const [learningObjective, setLearningObjective] = useState(
    'Understand how plants use sunlight, carbon dioxide, and water to produce food and oxygen.'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasToken, setHasToken] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    const token = authService.getStoredToken();
    setHasToken(Boolean(token));
  }, []);

  // Timer while generating
  useEffect(() => {
    let interval: any = null;
    if (isGenerating) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  const applyPreset = (preset: QuickPromptPreset) => {
    if (isGenerating) return;
    setTopic(preset.topic);
    setInterestsInput(preset.interests);
    setGradeBand(preset.grade);
    setLearningObjective(preset.objective);
    setErrorMessage(null);
    setValidationErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      errors.topic = 'Please provide an inquiry topic.';
    } else if (cleanTopic.length < 2) {
      errors.topic = 'Topic must be at least 2 characters long.';
    }

    const cleanObjective = learningObjective.trim();
    if (!cleanObjective) {
      errors.learningObjective = 'Please specify a learning objective.';
    } else if (cleanObjective.length < 6) {
      errors.learningObjective = 'Please provide a clear educational objective.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    const cleanTopic = topic.trim();
    const cleanInterests = interestsInput
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);
    const cleanObjective = learningObjective.trim();

    const payload: GenerateStoryRequestPayload = {
      topic: cleanTopic,
      grade_band: gradeBand,
      interests: cleanInterests.length > 0 ? cleanInterests : ['exploration', 'science'],
      learning_objective: cleanObjective,
    };

    setIsGenerating(true);

    try {
      // Direct call to FastAPI backend through storyService -> api.ts -> POST /api/v1/ai/generate-story
      const response: GenerateStoryResponsePayload = await storyService.generateStory(payload);

      // Handle safety rejection
      if (response.status === 'rejected_safety') {
        const reason =
          response.safety_validation?.reason ||
          response.errors?.[0] ||
          'The requested topic did not meet child-safety criteria.';
        const userMsg = `Safety Notice: ${reason} Please choose a different, gentle educational topic.`;
        setErrorMessage(userMsg);
        toast.error('Story did not pass safety check. Please refine topic.', { id: 'story-safety' });
        return;
      }

      // Handle educational revision
      if (response.status === 'needs_educational_revision' && !response.story) {
        const advisory =
          response.educational_validation?.educational_summary ||
          response.errors?.[0] ||
          'Story needs adjustment to better match the learning objective.';
        const userMsg = `Pedagogical Notice: ${advisory} Please refine your objective or try again.`;
        setErrorMessage(userMsg);
        toast.error(userMsg, { id: 'story-edu' });
        return;
      }

      // Successful story response
      if (response.story) {
        const adaptedStory = adaptGeneratedStoryToReader(response);
        addGeneratedStory(adaptedStory);

        toast.success(
          `"${adaptedStory.title}" is ready! Entering Interactive Reader...`,
          { id: 'story-success', icon: '✨' }
        );

        // Transition directly to the existing StoryReader
        navigate(`/story/${adaptedStory.id}`);
        return;
      }

      // Empty story payload with errors
      if (response.errors && response.errors.length > 0) {
        setErrorMessage(response.errors.join(' '));
        toast.error('Story generation returned errors. Please try again.');
      } else {
        setErrorMessage('We could not synthesize this story right now. Please try again.');
        toast.error('No story content was returned by the server.');
      }
    } catch (err: any) {
      console.error('Story generation submission error:', err);

      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 401) {
        setErrorMessage('Your session has expired. Please log in with your Explorer PIN to create stories.');
        toast.error('Authentication required. Please log in.');
      } else if (status === 403) {
        setErrorMessage('Access restricted: Only authorized students and parents can generate stories.');
        toast.error('Permission denied.');
      } else if (status === 400 || status === 422) {
        setErrorMessage(detail || 'Please verify your topic and learning objective inputs.');
        toast.error('Invalid story parameters.');
      } else if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        setErrorMessage('The storytelling engine took longer than expected to complete all multi-agent validations. Please try again.');
        toast.error('Generation request timed out. Please try again.');
      } else {
        setErrorMessage('We could not generate the story right now. Please check server connectivity and try again.');
        toast.error('Could not connect to the story generation engine.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
              <Compass className="h-4 w-4 text-indigo-600" />
              <span>Story Studio</span>
              <span aria-hidden="true">·</span>
              <span>Educational Storyteller</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-headline mt-1">
              Create a Personalized Educational Story
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Every story is drafted by the Narrative Architect, aligned to Common Core standards, and audited for complete child safety before reaching you.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm self-start sm:self-auto"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Unauthenticated Alert if No Token Found */}
        {!hasToken && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-950 font-headline">
                  Explorer Authentication Recommended
                </h2>
                <p className="text-xs text-amber-800">
                  You are currently browsing as a guest. Please log in with your Explorer PIN (e.g. alex.chen / 1234) so your stories can be validated with full permissions.
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-700 text-xs font-bold text-white hover:bg-amber-800 shadow-sm transition self-start sm:self-auto shrink-0"
            >
              <span>Log In Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Quick Topic Inspirations Pill Bar */}
        <div className="rounded-2xl glass-panel p-5 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span>Tap a Curriculum-Aligned Prompt to Pre-fill:</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_TOPICS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                disabled={isGenerating}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 shadow-sm ${
                  topic === p.topic
                    ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-400'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xl shrink-0">{p.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">{p.label}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{p.topic}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Controlled Generation Form */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-md space-y-6">
          
          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Field 1: Topic */}
            <div>
              <label htmlFor="story-topic" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                1. Scientific Inquiry or Topic <span className="text-rose-500">*</span>
              </label>
              <input
                id="story-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
                placeholder="e.g. Photosynthesis, Black Holes, Deep Ocean Trenches..."
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none transition ${
                  validationErrors.topic
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-indigo-500'
                }`}
              />
              {validationErrors.topic ? (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{validationErrors.topic}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  The central scientific phenomenon, history event, or concept the narrative will explore.
                </p>
              )}
            </div>

            {/* Field 2: Target Grade Band */}
            <div>
              <label htmlFor="story-grade" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                2. Target Grade Level & Reading Band <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Grade 1-2', 'Grade 3-4', 'Grade 5-6'] as const).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => setGradeBand(grade)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                      gradeBand === grade
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-400'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{grade}</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      {grade === 'Grade 1-2' ? 'Ages 6-8' : grade === 'Grade 3-4' ? 'Ages 8-10' : 'Ages 10-12'}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Calibrates vocabulary complexity, sentence length, and pacing for cognitive readiness.
              </p>
            </div>

            {/* Field 3: Child Personal Interests */}
            <div>
              <label htmlFor="story-interests" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                3. Explorer Personal Interests (Themes & Setting)
              </label>
              <input
                id="story-interests"
                type="text"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                disabled={isGenerating}
                placeholder="e.g. Space, Exploration, Submarines, Crystals, Robots"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enter comma-separated interests. The Narrative Architect weaves these directly into the storyline.
              </p>
            </div>

            {/* Field 4: Learning Objective */}
            <div>
              <label htmlFor="story-objective" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                4. Pedagogical Learning Objective <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="story-objective"
                rows={3}
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                disabled={isGenerating}
                placeholder="e.g. Understand how plants use sunlight, carbon dioxide, and water to produce food and oxygen."
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none transition ${
                  validationErrors.learningObjective
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-indigo-500'
                }`}
              />
              {validationErrors.learningObjective ? (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{validationErrors.learningObjective}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  The specific skill or fact verified by the Educational Alignment Agent against Next Generation Science Standards.
                </p>
              )}
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Generation Notice:</span>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Interactive Loading State Box */}
            {isGenerating && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 text-indigo-600 animate-spin shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-indigo-950 font-headline">
                      Crafting Your Educational Story Adventure...
                    </h3>
                    <p className="text-xs text-indigo-800">
                      Creating your personalized story and checking it for learning and safety...
                    </p>
                  </div>
                  <span className="ml-auto font-mono text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full tabular-nums">
                    {elapsedSeconds}s elapsed
                  </span>
                </div>

                <div className="border-t border-indigo-100 pt-3 text-[11px] text-indigo-700/90 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span>Connecting to multi-agent reasoning pipeline on Groq</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span>Evaluating narrative structure and vocabulary tiering</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span>Auditing pedagogical alignment and child-safety guardrails</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Child-safe content filter active</span>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Story...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Story Adventure</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Academic Project Footnote */}
        <div className="text-center text-xs text-slate-400 py-2">
          AI StoryWizard · University of Mumbai Academic Project · Multi-Agent Personalized Educational Storytelling
        </div>

      </div>
    </div>
  );
};

export default StoryGenerator;
