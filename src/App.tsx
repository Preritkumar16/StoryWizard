import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoryProvider } from './context/StoryContext';
import { TopNavbar } from './components/TopNavbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ChildDashboard } from './pages/ChildDashboard';
import { StoryReader } from './pages/StoryReader';
import { StoryGenerator } from './pages/StoryGenerator';
import { ParentControlCenter } from './pages/ParentControlCenter';
import { VoiceLibrary } from './pages/VoiceLibrary';
import { ProfileBadges } from './pages/ProfileBadges';
import { Toaster } from 'react-hot-toast';

export function App() {
  return (
    <StoryProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFFFF',
                color: '#1E293B',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                fontSize: '13px',
                fontWeight: 500,
              },
            }}
          />
          <TopNavbar />
          <div className="flex-1">
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Login Page with Student vs Parent tabs */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Dashboard: Topic generator for Students / Overview for Parents */}
              <Route path="/dashboard" element={<ChildDashboard />} />
              
              {/* AI Multi-Agent Story Generator */}
              <Route path="/story/generate" element={<StoryGenerator />} />

              {/* Interactive Story Reader */}
              <Route path="/story/:storyId" element={<StoryReader />} />
              <Route path="/story" element={<StoryReader />} />
              <Route path="/reader/:storyId" element={<StoryReader />} />
              <Route path="/reader" element={<StoryReader />} />
              
              {/* Parent Portal & Supervision Center */}
              <Route path="/parent/control" element={<ParentControlCenter />} />
              <Route path="/parent" element={<Navigate to="/parent/control" replace />} />
              <Route path="/educator-analytics" element={<Navigate to="/parent/control" replace />} />
              
              {/* Voice Library & Audio Studio */}
              <Route path="/audio-studio" element={<VoiceLibrary />} />
              <Route path="/voice-library" element={<VoiceLibrary />} />
              
              {/* Profile & Badges Showcase */}
              <Route path="/profile" element={<ProfileBadges />} />
              
              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </StoryProvider>
  );
}

export default App;
