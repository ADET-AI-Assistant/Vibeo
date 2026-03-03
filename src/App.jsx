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

import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Pages
import Dashboard from '@/pages/Dashboard';
import Watch from '@/pages/Watch';
import Play from '@/pages/Play';
import Profile from '@/pages/Profile';
import Browse from '@/pages/Browse';
import Search from '@/pages/Search';
import Onboarding from '@/pages/Onboarding';
import AZList from '@/pages/AZList';

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
    <Routes>
      {/* Homepage – Discovery Dashboard */}
      <Route path="/" element={<Dashboard />} />

      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/browse/:categoryId" element={<Browse />} />
      <Route path="/search" element={<Search />} />
      <Route path="/az-list" element={<AZList />} />
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
  );
};

export default App;
