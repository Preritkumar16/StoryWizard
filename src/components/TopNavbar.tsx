import React, { useState, useEffect } from 'react';
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
  LogOut,
  LogIn,
  Menu,
  X,
  Home
} from 'lucide-react';

export const TopNavbar: React.FC = () => {
  const { currentUser, ageMismatchAlerts, activeStoryId } = useStory();
  const { user: authUser, role: authRole, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isStudent = authRole === 'student';
  const isParent = authRole === 'parent';
  const unreadAlertsCount = ageMismatchAlerts.filter(a => !a.acknowledged).length;

  // Close mobile menu whenever user navigates
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Accessibility: Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getSubheaderTitle = () => {
    if (isParent) return 'Supervision Center';
    if (isStudent) return 'Young Explorer';
    return 'Educational Storytelling';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-sm shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Zone 1: Platform Brand Wordmark */}
          <div className="flex items-center gap-3">
            <Link to={isAuthenticated ? (isStudent ? '/dashboard' : '/parent/control') : '/'} className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 font-headline">
                  AI StoryWizard
                </span>
                <span className="block text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
                  {getSubheaderTitle()}
                </span>
              </div>
            </Link>
          </div>

          {/* Zone 2: Desktop Navigation Links (Strictly Adaptive to Role) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold" aria-label="Main Navigation">
            {/* Authenticated Student Nav */}
            {isStudent && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/dashboard'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Explore</span>
                </Link>

                <Link
                  to="/story/generate"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/story/generate'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Create Story</span>
                </Link>

                <Link
                  to={`/story/${activeStoryId || 'story-crystal-cave'}`}
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname.startsWith('/story') && location.pathname !== '/story/generate'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Story Reader</span>
                </Link>

                <Link
                  to="/voice-library"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/voice-library' || location.pathname === '/audio-studio'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Headphones className="h-3.5 w-3.5" />
                  <span>Voice Studio</span>
                </Link>

                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/profile'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  <span>Badges & XP</span>
                </Link>
              </>
            )}

            {/* Authenticated Parent Nav */}
            {isParent && (
              <>
                <Link
                  to="/parent/control"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/parent/control'
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
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
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                  <span>Story Preview</span>
                </Link>

                <Link
                  to="/voice-library"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/voice-library' || location.pathname === '/audio-studio'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Headphones className="h-3.5 w-3.5 text-teal-600" />
                  <span>Voice Personas</span>
                </Link>
              </>
            )}

            {/* Unauthenticated Guest Nav */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    location.pathname === '/'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Home</span>
                </Link>
              </>
            )}
          </nav>

          {/* Zone 3: Gamification Metrics, Authenticated Identity & Sign Out */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Gamification Stats for Student (Desktop) */}
                {isStudent && (
                  <div className="hidden lg:flex items-center gap-3 text-xs pr-2 border-r border-slate-200">
                    <div className="flex items-center gap-1 text-amber-600 font-bold" title="Daily Reading Streak">
                      <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="tabular-nums font-mono">{currentUser.streakDays}d Streak</span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 font-bold" title="Knowledge Spark Points">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span className="tabular-nums font-mono">{currentUser.xp} XP</span>
                    </div>
                  </div>
                )}

                {/* Parent Safety Alert Indicator (Desktop) */}
                {isParent && unreadAlertsCount > 0 && (
                  <Link
                    to="/parent/control"
                    className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 hover:bg-rose-100 transition"
                  >
                    <Bell className="h-3.5 w-3.5 text-rose-600" />
                    <span>{unreadAlertsCount} Alert{unreadAlertsCount > 1 ? 's' : ''}</span>
                  </Link>
                )}

                {/* Real User Greeting & Role Badge */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {authUser?.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 capitalize">
                    {isStudent ? 'Student Explorer' : 'Parent Supervisor'}
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

                {/* Sign Out Button (Desktop) */}
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out of your session"
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition shadow-sm ml-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
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

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex md:hidden items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-controls="mobile-navigation-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Accessible Responsive Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden border-t border-slate-200/90 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150"
          role="region"
          aria-label="Mobile Navigation"
        >
          {/* User Card inside Mobile Drawer if Authenticated */}
          {isAuthenticated && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={authUser?.name || 'User avatar'}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {authUser?.name}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 capitalize">
                    {isStudent ? 'Student Explorer' : 'Parent Supervisor'}
                  </div>
                </div>
              </div>

              {isStudent && (
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{currentUser.xp} XP</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-1">
            {/* Student Links */}
            {isStudent && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname === '/dashboard'
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Compass className="h-4 w-4 text-indigo-600" />
                  <span>Explore Topics</span>
                </Link>

                <Link
                  to="/story/generate"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname === '/story/generate'
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Create Story</span>
                </Link>

                <Link
                  to={`/story/${activeStoryId || 'story-crystal-cave'}`}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname.startsWith('/story') && location.pathname !== '/story/generate'
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="h-4 w-4 text-slate-600" />
                  <span>Story Reader</span>
                </Link>

                <Link
                  to="/voice-library"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname === '/voice-library' || location.pathname === '/audio-studio'
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Headphones className="h-4 w-4 text-teal-600" />
                  <span>Voice Studio</span>
                </Link>

                <Link
                  to="/profile"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname === '/profile'
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Badges & XP</span>
                </Link>
              </>
            )}

            {/* Parent Links */}
            {isParent && (
              <>
                <Link
                  to="/parent/control"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname === '/parent/control'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span>Parent Controls</span>
                  </div>
                  {unreadAlertsCount > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {unreadAlertsCount} alert{unreadAlertsCount > 1 ? 's' : ''}
                    </span>
                  )}
                </Link>

                <Link
                  to={`/story/${activeStoryId || 'story-crystal-cave'}`}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname.startsWith('/story')
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="h-4 w-4 text-slate-600" />
                  <span>Story Preview</span>
                </Link>

                <Link
                  to="/voice-library"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname === '/voice-library' || location.pathname === '/audio-studio'
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Headphones className="h-4 w-4 text-teal-600" />
                  <span>Voice Personas</span>
                </Link>
              </>
            )}

            {/* Guest Links */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname === '/'
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Home className="h-4 w-4 text-indigo-600" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Log In to Platform</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Sign Out Action */}
          {isAuthenticated && (
            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-200 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out of {authUser?.name}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
