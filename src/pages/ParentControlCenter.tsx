import React, { useState } from 'react';
import { useStory } from '../context/StoryContext';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Filter,
  Check,
  Calendar,
  X,
  Volume2
} from 'lucide-react';

export const ParentControlCenter: React.FC = () => {
  const {
    currentUser,
    parentalControls,
    updateParentalControls,
    ageMismatchAlerts,
    dismissAlert,
    childTopicsLearned,
    learningAnalytics,
    toggleWordMastered,
    triggerCelebration
  } = useStory();
  const { user: authUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'analytics' | 'controls'>('overview');
  const [saveBanner, setSaveBanner] = useState(false);

  // Form states for controls
  const [dailyMinutes, setDailyMinutes] = useState(parentalControls.maxDailyMinutes);
  const [maxGradeBand, setMaxGradeBand] = useState(parentalControls.maxGradeBand);
  const [aiCreativity, setAiCreativity] = useState(parentalControls.aiCreativity);
  const [topicSafetyFilter, setTopicSafetyFilter] = useState(parentalControls.topicSafetyFilter);
  const [alertOnAgeMismatch, setAlertOnAgeMismatch] = useState(parentalControls.alertOnAgeMismatch);

  const unacknowledgedAlerts = ageMismatchAlerts.filter(a => !a.acknowledged);

  const handleSaveControls = (e: React.FormEvent) => {
    e.preventDefault();
    updateParentalControls({
      maxDailyMinutes: dailyMinutes,
      maxGradeBand,
      aiCreativity,
      topicSafetyFilter,
      alertOnAgeMismatch,
    });
    setSaveBanner(true);
    triggerCelebration();
    setTimeout(() => setSaveBanner(false), 3500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Parent Supervision & Safety Center</span>
              <span aria-hidden="true">·</span>
              <span>Account: {authUser?.name || 'Parent Supervisor'}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-headline">
              Parent Supervision Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Monitor topic curiosity history, Lexile trajectory, CCSS mastery, and set reading time limits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Daily Reading Goal:</span>
            <span className="font-mono text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              {parentalControls.maxDailyMinutes} mins/day
            </span>
          </div>
        </div>

        {/* Real-Time Age-Mismatch Notification Alert Banner */}
        {unacknowledgedAlerts.length > 0 && (
          <div className="space-y-3">
            {unacknowledgedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-5 shadow-sm text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700 bg-rose-200/70 px-2 py-0.5 rounded">
                        Age-Mismatch Alert
                      </span>
                      <span className="text-xs text-rose-600 font-medium">{alert.timestamp}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {alert.message}
                    </p>
                    <p className="text-xs text-slate-600">
                      Topic assessed at Age {alert.assessedAge} level vs. Target Age {alert.targetAge} ({parentalControls.maxGradeBand}).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => dismissAlert(alert.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Acknowledge & Dismiss</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {saveBanner && (
          <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 text-teal-800 text-xs flex items-center justify-between shadow-sm">
            <span className="font-semibold">Parental safety limits and AI content filters updated successfully!</span>
            <button onClick={() => setSaveBanner(false)} className="text-teal-600 font-bold">✕</button>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'topics'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Topic Curiosity History ({childTopicsLearned.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            CCSS & Vocab Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'controls'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Safety Rules & Limits
          </button>
        </div>

        {/* Tab 1: Overview & Metrics */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-2xl glass-panel p-5 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Current Lexile Score</span>
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums">545L</span>
                  <span className="text-xs font-semibold text-teal-600 tabular-nums">+45L this term</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Target for Grade 3: 450L–600L</p>
              </div>

              <div className="rounded-2xl glass-panel p-5 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Oral Fluency Cadence</span>
                  <Volume2 className="h-4 w-4 text-teal-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums">108 WPM</span>
                  <span className="text-xs font-semibold text-teal-600 tabular-nums">+24 WPM</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Measured during audio read-alouds</p>
              </div>

              <div className="rounded-2xl glass-panel p-5 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>CCSS Comprehension</span>
                  <Award className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums">91.8%</span>
                  <span className="text-xs font-semibold text-teal-600 tabular-nums">Exceeding</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Chapter mini-quiz accuracy</p>
              </div>

              <div className="rounded-2xl glass-panel p-5 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Tier-2 Vocab Retention</span>
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums">38 Words</span>
                  <span className="text-xs font-semibold text-teal-600 tabular-nums">Mastered</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">7 words currently in review</p>
              </div>
            </div>

            {/* Recent Topics Log & Quick Settings Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Topics (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl glass-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 font-headline">
                    Recent Curiosity Explorations
                  </h2>
                  <button
                    onClick={() => setActiveTab('topics')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {childTopicsLearned.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.topic}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.storyTitle} · {item.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs shrink-0">
                        <span className="font-mono text-slate-600">{item.durationMinutes} mins</span>
                        <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {item.quizScore}% Quiz
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Rules Summary (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl glass-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 font-headline">
                    Active Safety Guardrails
                  </h2>
                  <button
                    onClick={() => setActiveTab('controls')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    Edit Rules
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                    <span className="text-slate-600">Daily Reading Limit:</span>
                    <span className="font-bold text-slate-900">{parentalControls.maxDailyMinutes} minutes</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                    <span className="text-slate-600">Max Grade Band Cap:</span>
                    <span className="font-bold text-slate-900">{parentalControls.maxGradeBand}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                    <span className="text-slate-600">AI Creativity Filter:</span>
                    <span className="font-bold text-slate-900 capitalize">{parentalControls.aiCreativity}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                    <span className="text-slate-600">Age-Mismatch Alerts:</span>
                    <span className="font-bold text-emerald-700">Enforced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Child Topic & Chapter History Log */}
        {activeTab === 'topics' && (
          <div className="rounded-2xl glass-panel shadow-sm border border-slate-200/80 overflow-hidden space-y-4">
            <div className="p-6 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-headline">
                  Child Curiosity & Topic History
                </h2>
                <p className="text-xs text-slate-500">
                  Comprehensive log of all topics explored, reading duration, and comprehension scores.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 pl-6 pr-4">Topic Explored</th>
                    <th className="py-3.5 px-4">Story Title</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Duration</th>
                    <th className="py-3.5 px-4 text-right">Lexile</th>
                    <th className="py-3.5 px-4 text-right">Words Learned</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Quiz Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {childTopicsLearned.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pl-6 pr-4 font-bold text-slate-900">
                        {item.topic}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.storyTitle}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {item.date}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {item.durationMinutes} mins
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-indigo-600 tabular-nums">
                        {item.lexile}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        +{item.wordsLearned}
                      </td>
                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {item.quizScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Learning & Vocabulary Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            
            {/* Visual Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lexile Trajectory */}
              <div className="rounded-2xl glass-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-headline">
                      Lexile Growth Trajectory
                    </h3>
                    <p className="text-xs text-slate-500">Target reading level progression over the past 5 months</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    +135L Total
                  </span>
                </div>

                {/* CSS Bar Chart */}
                <div className="h-44 flex items-end justify-between gap-4 pt-6 px-2 border-b border-slate-200">
                  {learningAnalytics.lexileTrajectory.map((pt) => {
                    const heightPercent = Math.round(((pt.score - 350) / 250) * 100);
                    return (
                      <div key={pt.month} className="flex-1 flex flex-col items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-700">{pt.score}L</span>
                        <div
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[11px] font-medium text-slate-500 mt-1">{pt.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Oral Fluency (WPM) */}
              <div className="rounded-2xl glass-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-headline">
                      Oral Reading Fluency (WPM)
                    </h3>
                    <p className="text-xs text-slate-500">Words per minute recorded during synchronized audio narrations</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                    108 WPM Current
                  </span>
                </div>

                {/* CSS Bar Chart */}
                <div className="h-44 flex items-end justify-between gap-6 pt-6 px-4 border-b border-slate-200">
                  {learningAnalytics.oralFluencyWPM.map((pt) => {
                    const heightPercent = Math.round((pt.wpm / 130) * 100);
                    return (
                      <div key={pt.week} className="flex-1 flex flex-col items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-700">{pt.wpm}</span>
                        <div
                          className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg transition-all duration-500"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[11px] font-medium text-slate-500 mt-1">{pt.week}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CCSS Standards Mastery Matrix */}
            <div className="rounded-2xl glass-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-headline">
                Common Core State Standards (CCSS) Mastery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {learningAnalytics.ccssMastery.map((item) => (
                  <div key={item.standard} className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600">{item.standard}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'Exceeding' ? 'bg-teal-50 text-teal-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold">{item.label}</p>
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Accuracy</span>
                        <span className="font-bold tabular-nums">{item.score}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier-2 & Tier-3 Vocabulary Retention Table */}
            <div className="rounded-2xl glass-panel shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-6 border-b border-slate-200/80">
                <h3 className="text-base font-bold text-slate-900 font-headline">
                  Tier-2 & Tier-3 Academic Vocabulary Retention
                </h3>
                <p className="text-xs text-slate-500">
                  Encounter count and mastery status tracked across interactive stories
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 pl-6 pr-4">Word</th>
                      <th className="py-3.5 px-4">Tier</th>
                      <th className="py-3.5 px-4">Definition</th>
                      <th className="py-3.5 px-4 text-right">Encounters</th>
                      <th className="py-3.5 pl-4 pr-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {learningAnalytics.vocabularyRetention.map((vocab) => (
                      <tr key={vocab.word} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 pl-6 pr-4 font-bold text-slate-900 capitalize">
                          {vocab.word}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {vocab.tier}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {vocab.definition}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                          {vocab.encounters}x
                        </td>
                        <td className="py-3.5 pl-4 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => toggleWordMastered(vocab.word)}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded transition ${
                              vocab.status === 'Mastered'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{vocab.status}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Parental Controls & Safety Rules Editor */}
        {activeTab === 'controls' && (
          <form onSubmit={handleSaveControls} className="rounded-2xl glass-panel p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-headline">
                Parental Supervision & Content Controls
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure daily screen time boundaries, grade band caps, and age-mismatch notifications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Daily Reading Time Limit */}
              <div className="space-y-3 p-5 rounded-xl border border-slate-200/80 bg-white">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Maximum Daily Reading Time Limit
                  </label>
                  <span className="font-mono font-bold text-indigo-600 text-xs tabular-nums">
                    {dailyMinutes} minutes
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>15m</span>
                  <span>30m (Recommended)</span>
                  <span>60m</span>
                  <span>90m</span>
                </div>
              </div>

              {/* Max Reading Level Cap */}
              <div className="space-y-3 p-5 rounded-xl border border-slate-200/80 bg-white">
                <label className="text-xs font-bold text-slate-800 block">
                  Max Reading Level Cap
                </label>
                <select
                  value={maxGradeBand}
                  onChange={(e) => setMaxGradeBand(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Grade 1-2">Early Reader (Grade 1-2, 200L–400L)</option>
                  <option value="Grade 3-4">Middle Explorer (Grade 3-4, 450L–650L)</option>
                  <option value="Grade 5-6">Upper Scholar (Grade 5-6, 700L–900L)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Prevents stories from generating vocabulary and concepts above this grade ceiling.
                </p>
              </div>

              {/* AI Creativity / Temperature Slider */}
              <div className="space-y-3 p-5 rounded-xl border border-slate-200/80 bg-white">
                <label className="text-xs font-bold text-slate-800 block">
                  AI Creativity & Temperature Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['strict', 'balanced', 'creative'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAiCreativity(mode)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold capitalize transition ${
                        aiCreativity === mode
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  {aiCreativity === 'strict'
                    ? 'Strict: Textbook-aligned explanations with zero fantastical embellishment.'
                    : aiCreativity === 'balanced'
                    ? 'Balanced: Engaging pedagogical narrative with accurate scientific models.'
                    : 'Creative: Higher whimsy, magical realism, and playful narrative departures.'}
                </p>
              </div>

              {/* Age Mismatch Alert Toggle */}
              <div className="space-y-3 p-5 rounded-xl border border-slate-200/80 bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">
                      Age-Mismatch Notification Alert
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Instantly trigger a parent banner when child queries topics rated 3+ years above target band
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertOnAgeMismatch}
                    onChange={(e) => setAlertOnAgeMismatch(e.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">
                      Strict COPPA/FERPA Topic Filter
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Block mature, non-academic or violence-adjacent keywords
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={topicSafetyFilter}
                    onChange={(e) => setTopicSafetyFilter(e.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
              >
                <Check className="h-4 w-4" />
                <span>Save & Enforce Safety Rules</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
