import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookRidePage } from './pages/BookRidePage';
import { ActiveRidePage } from './pages/ActiveRidePage';
import { RideHistoryPage } from './pages/RideHistoryPage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import { TrustedContactsPage } from './pages/TrustedContactsPage';
import { PickupAssistancePage } from './pages/PickupAssistancePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { TasksPage } from './pages/TasksPage';
import { DriversPage } from './pages/DriversPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProfilePage } from './pages/ProfilePage';
import { SharedTripPage } from './pages/SharedTripPage';

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0B132B]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-cyan-400 font-semibold tracking-wider animate-pulse">RideSafe AI Loading...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/shared-trip/:token" element={<SharedTripPage />} />

            {/* Protected app routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="book-ride" element={<BookRidePage />} />
              <Route path="active-ride" element={<ActiveRidePage />} />
              <Route path="ride-history" element={<RideHistoryPage />} />
              <Route path="safety-center" element={<SafetyCenterPage />} />
              <Route path="trusted-contacts" element={<TrustedContactsPage />} />
              <Route path="pickup-assistance" element={<PickupAssistancePage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetailsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
