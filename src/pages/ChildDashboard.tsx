import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStory } from '../context/StoryContext';
import {
  Sparkles,
  Compass,
  BookOpen,
  Flame,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
  AlertCircle
} from 'lucide-react';

const INTEREST_TAGS = [
  { label: 'Deep Ocean Mysteries', icon: '🌊', query: 'Deep Ocean Trench Creatures' },
  { label: 'Black Holes & Stars', icon: '🌌', query: 'Black Holes & Supernovas' },
  { label: 'Dinosaurs & Fossils', icon: '🦖', query: 'Fossils and Prehistoric Dinosaurs' },
  { label: 'Ancient Egyptian Tombs', icon: '🏛️', query: 'Ancient Egyptian Pyramids and Hieroglyphs' },
  { label: 'Volcanoes & Magma', icon: '🌋', query: 'Volcanoes and Plate Tectonics' },
  { label: 'Robotics & Bionics', icon: '🤖', query: 'Friendly Robotics and Sensors' },
  { label: 'Rainforest Canopy', icon: '🌿', query: 'Amazon Rainforest Ecosystem' },
  { label: 'Quantum Particles', icon: '⚛️', query: 'Quantum Computing and Atomic Particles' }, // Age-mismatch demo tag
];

export const ChildDashboard: React.FC = () => {
  const {
    role,
    currentUser,
    stories,
    setActiveStoryId,
    exploreNewTopic,
    parentalControls,
    childTopicsLearned,
    ageMismatchAlerts
  } = useStory();

  const navigate = useNavigate();

  const [topicInput, setTopicInput] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<'Grade 1-2' | 'Grade 3-4' | 'Grade 5-6'>(
    parentalControls.maxGradeBand || 'Grade 3-4'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  const isStudent = role === 'student';

  const handleGenerateStory = async (topicToUse?: string) => {
    const topic = (topicToUse || topicInput).trim();
    if (!topic) return;

    setIsGenerating(true);
    setGenerationNotice('Creating your personalized story and checking it for learning and safety...');

    try {
      const generated = await exploreNewTopic(topic, selectedGrade);
      setIsGenerating(false);
      navigate(`/story/${generated.id}`);
    } catch (err: any) {
      console.warn('Dashboard story generation notice:', err);
      if (err?.message?.startsWith('SAFETY_REJECTED')) {
        setGenerationNotice('Notice: This topic did not pass our child-safety criteria. Please try a different topic.');
      } else {
        setGenerationNotice('We could not generate the story right now. You can try another topic or open the full Story Studio.');
      }
      setIsGenerating(false);
    }
  };

  const activeStory = stories.find(s => s.id === 'story-crystal-cave') || stories[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Parent Mode Banner (if viewed while authenticated as Parent) */}
        {!isStudent && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-emerald-950 font-headline">
                  Parent Supervision Mode Active
                </h2>
                <p className="text-xs text-emerald-800">
                  You are viewing the learning interface for {currentUser.name.split(' ')[0]}. Safety limits and age filters are currently enforced.
                </p>
              </div>
            </div>
            <Link
              to="/parent/control"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition self-start sm:self-auto"
            >
              <span>Open Parent Control Center</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Student Welcome & Gamification Banner */}
        <div className="rounded-2xl glass-panel p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
              <Compass className="h-4 w-4" />
              <span>Student Explorer Hub</span>
              <span aria-hidden="true">·</span>
              <span>Level {currentUser.level} Alchemist</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-headline">
              Hello, {currentUser.name.split(' ')[0]}! What adventure shall we build today?
            </h1>
            <p className="text-xs text-slate-500">
              Your daily reading goal is {parentalControls.maxDailyMinutes} minutes · {currentUser.minutesReadToday} mins read today
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 self-start md:self-auto">
            <div className="text-center px-2">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Flame className="h-4 w-4 fill-current" />
                <span className="tabular-nums font-mono">{currentUser.streakDays}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Day Streak</span>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="text-center px-2">
              <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                <span className="tabular-nums font-mono">{currentUser.xp}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Spark XP</span>
            </div>
          </div>
        </div>

        {/* Topic Input: "What do you want to learn today?" */}
        <div className="rounded-2xl border-2 border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/50 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                AI Adventure Generator
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-headline">
                What do you want to learn today?
              </h2>
              <p className="text-xs text-slate-600">
                Type any topic—from deep sea volcanoes to space telescopes—and AI StoryWizard will craft an interactive story just for you.
              </p>
            </div>
            <Link
              to="/story/generate"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-indigo-700 hover:bg-indigo-50 shadow-sm transition self-start sm:self-auto shrink-0"
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Custom Objectives & Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Input & Controls Form */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateStory()}
                  placeholder="e.g. Black Holes, Bioluminescent Jellyfish, Ancient Egypt..."
                  disabled={isGenerating}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Reading Level Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value as any)}
                  disabled={isGenerating}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Grade 1-2">Early Reader (Grade 1-2)</option>
                  <option value="Grade 3-4">Middle Explorer (Grade 3-4)</option>
                  <option value="Grade 5-6">Advanced Scholar (Grade 5-6)</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleGenerateStory()}
                  disabled={isGenerating || !topicInput.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-50 whitespace-nowrap"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isGenerating ? 'Synthesizing...' : 'Create Story'}</span>
                </button>
              </div>
            </div>

            {generationNotice && (
              <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-100/60 p-3 rounded-xl border border-indigo-200 animate-pulse">
                <Sparkles className="h-4 w-4" />
                <span>{generationNotice}</span>
              </div>
            )}

            {/* Interest Tags Pill Matrix */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Or tap a popular topic to explore:
              </span>
              <div className="flex flex-wrap gap-2">
                {INTEREST_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => {
                      setTopicInput(tag.query);
                      handleGenerateStory(tag.query);
                    }}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 shadow-sm transition active:scale-95"
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Reading Spotlight */}
        <div className="rounded-2xl glass-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-headline">
              Continue Your Active Quest
            </h2>
            <Link
              to={`/story/${activeStory.id}`}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Resume Reading</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="md:col-span-4 aspect-[16/10] rounded-lg overflow-hidden">
              <img
                src={activeStory.coverImage}
                alt={activeStory.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-indigo-600">{activeStory.genre}</span>
                <span aria-hidden="true">·</span>
                <span>{activeStory.lexileLevel}</span>
                <span aria-hidden="true">·</span>
                <span>Chapter 1 in progress</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 font-headline">
                {activeStory.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2">
                {activeStory.summary}
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  to={`/story/${activeStory.id}`}
                  onClick={() => setActiveStoryId(activeStory.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Resume Chapter 1</span>
                </Link>
                <span className="text-xs text-slate-500 font-medium">
                  Estimated 8 mins remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stories Library */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-headline">
              Your Reading Library
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {stories.length} Available Adventures
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
              >
                <div className="space-y-3">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden">
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-bold text-indigo-600">{story.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span>{story.lexileLevel}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 font-headline line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {story.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {story.estimatedMinutes} min read
                  </span>
                  <Link
                    to={`/story/${story.id}`}
                    onClick={() => setActiveStoryId(story.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                  >
                    <span>Read</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
