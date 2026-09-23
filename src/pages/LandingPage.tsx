import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStory } from '../context/StoryContext';
import { heroImg, crystalCaveImg, cosmicVoyageImg } from '../data/mockData';
import {
  BookOpen,
  Headphones,
  Shield,
  Sparkles,
  Compass,
  ArrowRight,
  Brain,
  Layers,
  Cpu,
  CheckCircle2,
  Lock,
  UserCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setRole, setActiveStoryId } = useStory();
  const navigate = useNavigate();

  const handleStudentLogin = () => {
    setRole('student');
    navigate('/dashboard');
  };

  const handleParentLogin = () => {
    setRole('parent');
    navigate('/parent/control');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-18 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                <Sparkles className="h-4 w-4" />
                <span>Multi-Agent Educational Storytelling</span>
                <span aria-hidden="true">·</span>
                <span>CCSS & Lexile Aligned</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl font-headline [text-wrap:balance]">
                Where Curiosity Becomes An Interactive Story.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Empower children with personalized branching adventures, clickable Tier-2 vocabulary drawers, and AI voice narration—while parents oversee progress, Lexile growth, and safety limits.
              </p>

              {/* Strict Role-Based Direct CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleStudentLogin}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-[0.98]"
                >
                  <Compass className="h-4 w-4" />
                  <span>Student Login (Young Explorer)</span>
                </button>

                <button
                  type="button"
                  onClick={handleParentLogin}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
                >
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span>Parent Portal & Supervision</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              {/* Zero-Pill Quantitative Proof */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-6 text-xs text-slate-500">
                <div>
                  <span className="block text-2xl font-extrabold text-slate-900 tabular-nums font-headline">+45L</span>
                  <span>Average Lexile growth</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-slate-900 tabular-nums font-headline">92.4%</span>
                  <span>CCSS quiz accuracy</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-slate-900 tabular-nums font-headline">350+</span>
                  <span>Tier-2 words mastered</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xl overflow-hidden">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <img
                      src={heroImg}
                      alt="AI StoryWizard interactive story adventure with young hero and companion"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                        Featured Adventure
                      </span>
                      <h3 className="mt-1 text-lg font-bold font-headline">
                        The Mystery of the Crystal Cavern
                      </h3>
                      <p className="text-xs text-slate-200">
                        Lexile 520L · Tier-2 Vocabulary · Interactive Branching
                      </p>
                    </div>
                  </div>

                  {/* Micro Live Inspector Preview Card */}
                  <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-700">Vocabulary Inspector:</span>
                      <span className="text-slate-700 italic">"luminescence" /loo-muh-NES-uhns/</span>
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                      +25 XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Multi-Agent Architecture Section */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Under The Hood
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-headline">
              Multi-Agent Pedagogical Pipeline
            </h2>
            <p className="text-sm text-slate-600">
              Each educational story is orchestrated by specialized AI agents that guarantee safety, calibrated readability, and strict curriculum alignment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-headline">
                1. Topic Discovery Agent
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ingests student curiosities, performs instant age-rating checks, and flags age-mismatches to parent supervision centers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-headline">
                2. Narrative Engine
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Constructs multi-branch choice trees tailored strictly to the student’s configured Lexile reading level and grade band.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-headline">
                3. Tier-2 Vocab Synthesizer
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identifies high-utility academic vocabulary, attaching child-friendly definitions, phonetics, and real-time live inspectors.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-headline">
                4. CCSS Assessment Agent
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates textual evidence comprehension questions (RI.3.1, RL.3.3) to reinforce retention and award XP sparks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Story Showcase */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                Curated Library
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-headline">
                Ready-To-Read Adventures
              </h2>
            </div>
            <Link
              to="/dashboard"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <span>Explore All Topics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="aspect-[16/9] rounded-xl overflow-hidden">
                  <img
                    src={crystalCaveImg}
                    alt="The Mystery of the Crystal Cavern"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold text-indigo-600">Earth Science</span>
                  <span aria-hidden="true">·</span>
                  <span>Lexile 520L</span>
                  <span aria-hidden="true">·</span>
                  <span>Grade 3-4</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-headline">
                  The Mystery of the Crystal Cavern
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Join Maya and Pip the glowing fox as they venture deep underground to discover why mountain geodes chime harmonic frequencies at twilight.
                </p>
              </div>

              <Link
                to="/story/story-crystal-cave"
                onClick={() => setActiveStoryId('story-crystal-cave')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Read Interactive Story</span>
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="aspect-[16/9] rounded-xl overflow-hidden">
                  <img
                    src={cosmicVoyageImg}
                    alt="Nova and the Starlight Compass"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold text-teal-600">Astronomy</span>
                  <span aria-hidden="true">·</span>
                  <span>Lexile 640L</span>
                  <span aria-hidden="true">·</span>
                  <span>Grade 4-5</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-headline">
                  Nova and the Starlight Compass
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Navigate orbital gravitational slingshots alongside Astra the AI co-pilot to recalibrate solar beacons across the ringed sectors.
                </p>
              </div>

              <Link
                to="/story/story-cosmic-voyage"
                onClick={() => setActiveStoryId('story-cosmic-voyage')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 transition"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Read Interactive Story</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AI StoryWizard. Built for safe, curriculum-aligned reading adventures.</p>
          <div className="flex items-center gap-4 font-semibold">
            <Link to="/login" className="hover:text-indigo-600">Switch Role</Link>
            <Link to="/parent/control" className="hover:text-indigo-600">Parent Center</Link>
            <Link to="/dashboard" className="hover:text-indigo-600">Student Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
