import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStory } from '../context/StoryContext';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Sparkles,
  Flame,
  Award,
  Shield,
  Headphones,
  Compass,
  Bell,
  Sliders,
  UserCheck,
  LogOut,
  LogIn
} from 'lucide-react';

export const TopNavbar: React.FC = () => {
  const { currentUser, ageMismatchAlerts, activeStoryId } = useStory();
  const { user: authUser, role: authRole, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isStudent = authRole === 'student';
  const unreadAlertsCount = ageMismatchAlerts.filter(a => !a.acknowledged).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Zone 1: Brand Wordmark with Adaptive Role Tag */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 font-headline">
                  AI StoryWizard
                </span>
                <span className="block text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                  {isStudent ? 'Young Explorer' : 'Supervision Center'}
                </span>
              </div>
            </Link>
          </div>

          {/* Zone 2: Navigation Links (Strictly Adaptive to Role) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {isStudent ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/dashboard'
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Explore Topics</span>
                </Link>

                <Link
                  to="/story/generate"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/story/generate'
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Create Story</span>
                </Link>

                <Link
                  to={`/story/${activeStoryId || 'story-crystal-cave'}`}
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname.startsWith('/story')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Interactive Reader</span>
                </Link>

                <Link
                  to="/audio-studio"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/audio-studio'
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Headphones className="h-3.5 w-3.5" />
                  <span>Voice Library</span>
                </Link>

                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/profile'
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  <span>Badges & XP</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/dashboard'
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Child Activity Log</span>
                </Link>

                <Link
                  to="/parent/control"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/parent/control'
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Parent Controls</span>
                  {unreadAlertsCount > 0 && (
                    <span className="h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {unreadAlertsCount}
                    </span>
                  )}
                </Link>

                <Link
                  to={`/story/${activeStoryId || 'story-crystal-cave'}`}
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname.startsWith('/story')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                  <span>Preview Story</span>
                </Link>

                <Link
                  to="/audio-studio"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/audio-studio'
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Headphones className="h-3.5 w-3.5 text-teal-600" />
                  <span>Voice Personas</span>
                </Link>
              </>
            )}
          </nav>

          {/* Zone 3: Gamification Metrics, Authenticated Identity & Sign Out */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Gamification Stats for Student */}
                {isStudent && (
                  <div className="hidden sm:flex items-center gap-3 text-xs pr-2 border-r border-slate-200">
                    <div className="flex items-center gap-1 text-amber-600 font-bold" title="Daily Reading Streak">
                      <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="tabular-nums">{currentUser.streakDays}d Streak</span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 font-bold" title="Knowledge Spark Points">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span className="tabular-nums">{currentUser.xp} XP</span>
                    </div>
                  </div>
                )}

                {/* Parent Safety Alert Indicator */}
                {!isStudent && unreadAlertsCount > 0 && (
                  <Link
                    to="/parent/control"
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 hover:bg-rose-100 transition animate-pulse"
                  >
                    <Bell className="h-3.5 w-3.5 text-rose-600" />
                    <span>{unreadAlertsCount} Safety Alert{unreadAlertsCount > 1 ? 's' : ''}</span>
                  </Link>
                )}

                {/* Real User Badge */}
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {authUser?.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 capitalize">
                    {authRole === 'student' ? 'Student Explorer' : 'Parent Supervisor'}
                  </span>
                </div>

                {/* User Profile Avatar Link */}
                <Link
                  to={isStudent ? '/profile' : '/parent/control'}
                  className="flex items-center gap-2 group"
                  title={`${authUser?.name || 'User Profile'} - View profile`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={authUser?.name || 'User avatar'}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition"
                  />
                </Link>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out of your session"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition shadow-sm ml-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
