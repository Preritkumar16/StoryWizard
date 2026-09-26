import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../context/StoryContext';
import { leoAvatarImg } from '../data/mockData';
import { authService } from '../services/authService';
import {
  Compass,
  Shield,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { role, setRole } = useStory();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'student' | 'parent'>(role);
  const [pin, setPin] = useState('1234');
  const [studentUsername, setStudentUsername] = useState('alex.chen');
  const [parentEmail, setParentEmail] = useState('sarah.chen@example.com');
  const [parentPassword, setParentPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.login({
        username_or_email: studentUsername.trim(),
        password_or_pin: pin.trim(),
        role: 'student',
      });
      setRole('student');
      navigate('/dashboard');
    } catch (err: any) {
      console.warn('Student authentication notice:', err);
      // In local preview without live backend process, allow fallback navigation
      if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
        console.info('FastAPI backend offline; applying sandbox session for preview.');
        setRole('student');
        navigate('/dashboard');
        return;
      }
      const detail = err?.response?.data?.detail || err?.message || 'Authentication failed. Please verify Explorer PIN.';
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.login({
        username_or_email: parentEmail.trim(),
        password_or_pin: parentPassword,
        role: 'parent',
      });
      setRole('parent');
      navigate('/parent/control');
    } catch (err: any) {
      console.warn('Parent authentication notice:', err);
      if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
        console.info('FastAPI backend offline; applying sandbox session for preview.');
        setRole('parent');
        navigate('/parent/control');
        return;
      }
      const detail = err?.response?.data?.detail || err?.message || 'Authentication failed. Please verify credentials.';
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-md mb-2">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-headline">
          Welcome to AI StoryWizard
        </h1>
        <p className="text-xs text-slate-500">
          Select your portal mode to access tailored reading journeys or parental controls
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 sm:p-8 shadow-lg">
          {/* Segmented Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setRole('student');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'student'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('parent');
                setRole('parent');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'parent'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Parent Portal</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'student' ? (
            /* Student Form */
            <form onSubmit={handleStudentSubmit} className="space-y-5">
              {/* Profile Card Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <img
                  src={leoAvatarImg}
                  alt="Alex Chen"
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-300"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 font-headline">Alex Chen</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                      Level 6
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">3rd Grade Explorer · 9-Day Streak</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Explorer Username / Child Code
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={studentUsername}
                    onChange={(e) => setStudentUsername(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:outline-none"
                    placeholder="alex.chen"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4-Digit Explorer PIN
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm tracking-widest font-mono text-slate-900 focus:border-indigo-500 focus:outline-none"
                    placeholder="1234"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default test account PIN: 1234 (Username: alex.chen)
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Logging In...</span>
                ) : (
                  <>
                    <span>Enter Student Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Parent Form */
            <form onSubmit={handleParentSubmit} className="space-y-5">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Supervision Center allows setting reading time limits and monitoring topic safety.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parent Email Address
                </label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  placeholder="sarah.chen@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={parentPassword}
                  onChange={(e) => setParentPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  placeholder="password123"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Default test account password: password123
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Enter Parent Supervision Center</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200/80 text-center">
            <button
              type="button"
              onClick={() => {
                const next = activeTab === 'student' ? 'parent' : 'student';
                setActiveTab(next);
                setRole(next);
                setErrorMessage(null);
              }}
              className="text-xs text-slate-500 hover:text-indigo-600 font-semibold"
            >
              Switch to {activeTab === 'student' ? 'Parent Supervision Mode' : 'Student Explorer Mode'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
