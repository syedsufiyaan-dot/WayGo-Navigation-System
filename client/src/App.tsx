import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider } from './components/UI/Toast.js';
import { Navbar } from './components/UI/Navbar.js';
import { Footer } from './components/UI/Footer.js';
import { AuthPage } from './pages/AuthPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { SavedRoutesPage } from './pages/SavedRoutesPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { Navigation } from 'lucide-react';

/**
 * Protected Route Wrapper
 * Guarantees that only authenticated users can access the dashboard and tools
 */
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-waygo-lightBg dark:bg-navy-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30 animate-bounce">
          <Navigation className="w-7 h-7 text-white transform -rotate-45" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Loading WayGo Chennai...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-waygo-lightBg dark:bg-navy-900 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Authentication is the first gatekeeper page */}
              <Route path="/login" element={<AuthPage />} />

              {/* Protected Application Routes */}
              <Route
                path="/"
                element={
                  <ProtectedLayout>
                    <DashboardPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedLayout>
                    <SavedRoutesPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedLayout>
                    <HistoryPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <ProtectedLayout>
                    <AboutPage />
                  </ProtectedLayout>
                }
              />

              {/* Fallback to root */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
