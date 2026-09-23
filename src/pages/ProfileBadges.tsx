import React from 'react';
import { useStory } from '../context/StoryContext';
import {
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Compass,
  Map,
  Wand2,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfileBadges: React.FC = () => {
  const { currentUser, triggerCelebration } = useStory();

  const xpTowardsNextLevel = currentUser.xp % 300;
  const levelProgressPercent = Math.round((xpTowardsNextLevel / 300) * 100);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className="h-5 w-5 text-amber-500" />;
      case 'compass':
        return <Compass className="h-5 w-5 text-indigo-600" />;
      case 'map':
        return <Map className="h-5 w-5 text-teal-600" />;
      case 'wand2':
        return <Wand2 className="h-5 w-5 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-indigo-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Profile Explorer Card */}
        <div className="rounded-2xl glass-panel p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-full object-cover ring-4 ring-indigo-200 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-headline">
                  {currentUser.name}
                </h1>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full capitalize">
                  {currentUser.role === 'student' ? 'Young Explorer' : 'Parent'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentUser.gradeLevel} · Level {currentUser.level} Story Alchemist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-4 sm:pt-0 sm:pl-6">
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg">
                <Flame className="h-5 w-5 fill-current" />
                <span className="tabular-nums font-mono">{currentUser.streakDays}</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Days Streak</span>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-indigo-600 font-bold text-lg">
                <Sparkles className="h-5 w-5" />
                <span className="tabular-nums font-mono">{currentUser.xp}</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Total XP</span>
            </div>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="rounded-2xl glass-panel p-6 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 font-headline text-sm">
                Level {currentUser.level} Progress
              </span>
              <p className="text-slate-500 text-[11px]">
                Earn XP by inspecting vocabulary words and acing chapter comprehension mini-quizzes
              </p>
            </div>
            <span className="font-mono font-bold text-indigo-600 text-xs tabular-nums">
              {xpTowardsNextLevel} / 300 XP ({levelProgressPercent}%)
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>Level {currentUser.level}</span>
            <span>{300 - xpTowardsNextLevel} XP until Level {currentUser.level + 1}</span>
          </div>
        </div>

        {/* Trophies & Gamification Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-headline">
                Trophy Showcase & Badges
              </h2>
              <p className="text-xs text-slate-500">
                Achievements unlocked through curious topic exploration and CCSS reading mastery
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
              {currentUser.badges.length} Badges Earned
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentUser.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm flex items-start gap-4 hover:border-slate-300 transition"
              >
                <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                  {getBadgeIcon(badge.icon)}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 font-headline">
                      {badge.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {badge.unlockedAt}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {badge.description}
                  </p>
                  <span className="inline-block text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1">
                    Category: {badge.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick CTA to continue reading */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-indigo-950 font-headline">
              Ready to earn your next badge?
            </h3>
            <p className="text-xs text-indigo-800">
              Explore a new topic or inspect 3 more vocabulary words in your storybook!
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition self-start sm:self-auto"
          >
            <Compass className="h-4 w-4" />
            <span>Find Next Adventure</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export const ProfilePage = ProfileBadges;
