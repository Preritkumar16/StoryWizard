import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoryProvider } from './context/StoryContext';
import { TopNavbar } from './components/TopNavbar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
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
    <BrowserRouter>
      <AuthProvider>
        <StoryProvider>
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
                {/* Public Landing & Login Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Student Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <ChildDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <ProfileBadges />
                    </ProtectedRoute>
                  }
                />

                {/* Parent Protected Supervision Center */}
                <Route
                  path="/parent/control"
                  element={
                    <ProtectedRoute requiredRole="parent">
                      <ParentControlCenter />
                    </ProtectedRoute>
                  }
                />
                <Route path="/parent" element={<Navigate to="/parent/control" replace />} />
                <Route path="/educator-analytics" element={<Navigate to="/parent/control" replace />} />

                {/* Authenticated Story Creation & Reading Studio */}
                <Route
                  path="/story/generate"
                  element={
                    <ProtectedRoute>
                      <StoryGenerator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/story/:storyId"
                  element={
                    <ProtectedRoute>
                      <StoryReader />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/story"
                  element={
                    <ProtectedRoute>
                      <StoryReader />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reader/:storyId"
                  element={
                    <ProtectedRoute>
                      <StoryReader />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reader"
                  element={
                    <ProtectedRoute>
                      <StoryReader />
                    </ProtectedRoute>
                  }
                />

                {/* Voice Library & Audio Studio */}
                <Route
                  path="/audio-studio"
                  element={
                    <ProtectedRoute>
                      <VoiceLibrary />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/voice-library"
                  element={
                    <ProtectedRoute>
                      <VoiceLibrary />
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </StoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
