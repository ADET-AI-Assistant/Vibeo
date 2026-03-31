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

import { Suspense, lazy, useEffect, useLayoutEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLayout } from '@/context/LayoutContext';
import { UserMoviesProvider } from '@/context/UserMoviesContext';
import ErrorToast from '@/components/common/ErrorToast';

/**
 * Utility to Scroll to top on route change
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**
 * Route wrapper to prevent unauthenticated access to sensitive pages.
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !currentUser) {
      // Save the attempted path to redirect back after login if needed
      // For now, just send to home
      navigate('/', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  if (loading) return null; // Wait for auth to resolve
  return currentUser ? children : null;
};

// Core Components (Keep synchronous for immediate load)

// Lazy Loaded Pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const VibeyChat = lazy(() => import('@/components/common/VibeyChat'));
const Watch = lazy(() => import('@/pages/Watch'));
const Play = lazy(() => import('@/pages/Play'));
const Profile = lazy(() => import('@/pages/Profile'));
const Discover = lazy(() => import('@/pages/Discover'));
const Search = lazy(() => import('@/pages/Search'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const AZList = lazy(() => import('@/pages/AZList'));
const Settings = lazy(() => import('@/pages/Settings'));
const TermsOfService = lazy(() => import('@/pages/Legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('@/pages/Legal/PrivacyPolicy'));
const CookiePreferences = lazy(() => import('@/pages/Legal/CookiePreferences'));
const TasteMatcher = lazy(() => import('@/pages/TasteMatcher'));
const SmartSearch = lazy(() => import('@/pages/SmartSearch'));
const VibeyPage = lazy(() => import('@/pages/VibeyPage'));
const ThemeStore = lazy(() => import('@/pages/ThemeStore'));
const Library = lazy(() => import('@/pages/Library'));
const DeveloperDocs = lazy(() => import('@/pages/Docs/DocsLayout'));

/**
 * Premium Loading Fallback - Cinematic & Polished
 */
const LoadingScreen = () => (
  <div style={{
    height: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at center, var(--c-surface) 0%, var(--c-bg) 100%)',
    gap: '32px',
    overflow: 'hidden',
    position: 'fixed',
    inset: 0,
    zIndex: 9999
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      transform: 'translateY(-20px)',
      animation: 'float 3s ease-in-out infinite'
    }}>
      <div className="navbar-logo" style={{
        fontSize: '3rem',
        display: 'flex',
        alignItems: 'center',
        filter: 'drop-shadow(0 0 20px var(--c-accent-glow))'
      }}>
        <span className="logo-icon" style={{
          background: 'var(--c-accent)',
          color: 'white',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          fontWeight: '800',
          marginRight: '12px'
        }}>V</span>
        <span className="logo-text" style={{
          color: 'var(--c-text)',
          fontWeight: '700',
          letterSpacing: '-1px'
        }}>ibeo</span>
      </div>

      <div style={{
        fontSize: '0.9rem',
        color: 'var(--c-text2)',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        opacity: 0.8,
        animation: 'pulse-text 2s ease-in-out infinite'
      }}>
        Loading Cinematic Experience
      </div>
    </div>

    <div style={{
      width: '200px',
      height: '3px',
      background: 'var(--c-surface2)',
      borderRadius: '10px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '40%',
        background: 'linear-gradient(90deg, transparent, var(--c-accent), transparent)',
        animation: 'loading-bar 1.5s infinite ease-in-out'
      }} />
    </div>

    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(-20px); }
        50% { transform: translateY(-30px); }
      }
      @keyframes pulse-text {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      @keyframes loading-bar {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(250%); }
      }
    `}</style>
  </div>
);


const App = () => {
  const { currentUser, isOnboarded } = useAuth();
  const { showVibeyChat } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Disable browser scroll restoration to prevent "flashing" old scroll positions
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Basic route protection for onboarding flow
    if (currentUser && isOnboarded !== null) {
      const isNavigatingToOnboarding = location.pathname === '/onboarding';

      if (isOnboarded === false && !isNavigatingToOnboarding) {
        navigate('/onboarding', { replace: true });
      } else if (isOnboarded === true && isNavigatingToOnboarding) {
        navigate('/', { replace: true });
      }
    }
  }, [currentUser, isOnboarded, location.pathname, navigate]);

  // Centralized Flicker-Free Scrollbar Management
  useLayoutEffect(() => {
    const noScrollbarPages = ['/vibey', '/smart-search', '/taste-matcher'];
    const isNoScrollbarPage = noScrollbarPages.includes(location.pathname);

    const html = document.documentElement;
    if (isNoScrollbarPage) {
      html.classList.add('no-scrollbar');
    } else {
      html.classList.remove('no-scrollbar');
    }

    // Cleanup to ensure no leaks
    return () => {
      // We don't necessarily want to remove it on every tiny re-render, 
      // but just to be safe if the component unmounts for some reason.
    };
  }, [location.pathname]);

  return (
    /*
     * <Routes> replaces the deprecated <Switch> from React Router v5.
     * Each <Route> maps a URL path to a page component.
     */
    <>
      <UserMoviesProvider>
        <ScrollToTop />
        {location.pathname !== '/onboarding' && <Header />}
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Homepage – Discovery Dashboard */}
            <Route path="/" element={<Dashboard />} />

            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/discover" element={<Navigate to="/discover/trending" replace />} />
            <Route path="/discover/:categoryId" element={<Discover />} />
            <Route path="/search" element={<Search />} />
            <Route path="/az-list" element={<AZList />} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/cookies" element={<CookiePreferences />} />
            <Route path="/taste-matcher" element={<ProtectedRoute><TasteMatcher /></ProtectedRoute>} />
            <Route path="/smart-search" element={<ProtectedRoute><SmartSearch /></ProtectedRoute>} />
            <Route path="/vibey" element={<ProtectedRoute><VibeyPage /></ProtectedRoute>} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/theme-store" element={<ThemeStore />} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/docs" element={<DeveloperDocs />} />

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

        {/* Avoid rendering footer on app-like views */}
        {!['/onboarding', '/profile', '/settings'].includes(location.pathname) && <Footer />}

        {/* Vibey AI Chatbot — global floating overlay (Hidden on app-like views) */}
        {showVibeyChat && !['/settings', '/onboarding', '/profile'].includes(location.pathname) && <VibeyChat />}

        {/* Global Error Notifications */}
        <ErrorToast />
      </UserMoviesProvider>
    </>
  );
};

export default App;
