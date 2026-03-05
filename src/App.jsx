/**
 * App.jsx  ─ Root Application Component
 * ───────────────────────────────────────────────────────────
 * Sets up React Router with two routes:
 *
 *   /          → <Dashboard>  (Discovery Dashboard)
 *   /watch/:id → <Watch>      (Streaming + Movie Info)
 *
 * BrowserRouter is wrapped in main.jsx; App just defines routes.
 * ───────────────────────────────────────────────────────────
 */

import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Core Components (Keep synchronous for immediate load)
import Dashboard from '@/pages/Dashboard';
import VibeyChat from '@/components/common/VibeyChat';

// Lazy Loaded Pages
const Watch = lazy(() => import('@/pages/Watch'));
const Play = lazy(() => import('@/pages/Play'));
const Profile = lazy(() => import('@/pages/Profile'));
const Browse = lazy(() => import('@/pages/Browse'));
const Search = lazy(() => import('@/pages/Search'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const AZList = lazy(() => import('@/pages/AZList'));
const Settings = lazy(() => import('@/pages/Settings'));
const TermsOfService = lazy(() => import('@/pages/Legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('@/pages/Legal/PrivacyPolicy'));
const CookiePreferences = lazy(() => import('@/pages/Legal/CookiePreferences'));
const AIRecommender = lazy(() => import('@/pages/AIRecommender'));
const SmartSearch = lazy(() => import('@/pages/SmartSearch'));
const VibeyPage = lazy(() => import('@/pages/VibeyPage'));

/**
 * Premium Loading Fallback
 */
const LoadingScreen = () => (
  <div style={{
    height: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--c-bg)',
    gap: '20px'
  }}>
    <div className="navbar-logo" style={{ fontSize: '2rem' }}>
      <span className="logo-icon">V</span>
      <span className="logo-text">Vibeo</span>
    </div>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid var(--c-surface2)',
      borderTopColor: 'var(--c-accent)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

const App = () => {
  const { currentUser, isOnboarded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Basic route protection for onboarding flow
    // We strictly check if isOnboarded is explicitly true or false to prevent flashing
    if (currentUser && isOnboarded !== null) {
      if (isOnboarded === false && location.pathname !== '/onboarding') {
        navigate('/onboarding');
      } else if (isOnboarded === true && location.pathname === '/onboarding') {
        navigate('/');
      }
    }
  }, [currentUser, isOnboarded, location.pathname, navigate]);

  return (
    /*
     * <Routes> replaces the deprecated <Switch> from React Router v5.
     * Each <Route> maps a URL path to a page component.
     */
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Homepage – Discovery Dashboard */}
          <Route path="/" element={<Dashboard />} />

          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/browse/:categoryId" element={<Browse />} />
          <Route path="/search" element={<Search />} />
          <Route path="/az-list" element={<AZList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePreferences />} />
          <Route path="/ai-match" element={<AIRecommender />} />
          <Route path="/smart-search" element={<SmartSearch />} />
          <Route path="/vibey" element={<VibeyPage />} />
          <Route path="/watch/:id" element={<Watch />} />

          {/* Play page – dedicated player */}
          <Route path="/play/:id" element={<Play />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div
                style={{
                  minHeight: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  color: '#8b8a9a',
                }}
              >
                <h1 style={{ fontSize: '1.5rem', color: '#f1f0f5' }}>404 – Page Not Found</h1>
                <a href="/" style={{ color: '#a855f7', fontWeight: 600 }}>
                  ← Back to Vibeo
                </a>
              </div>
            }
          />
        </Routes>
      </Suspense>

      {/* Vibey AI Chatbot — global floating overlay */}
      <VibeyChat />
    </>
  );
};

export default App;
