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

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Dashboard from './pages/Dashboard';
import Watch from './pages/Watch';

const App = () => {
  return (
    /*
     * <Routes> replaces the deprecated <Switch> from React Router v5.
     * Each <Route> maps a URL path to a page component.
     */
    <Routes>
      {/* Homepage – Discovery Dashboard */}
      <Route path="/" element={<Dashboard />} />

      {/* Watch page – dynamic :id segment is the TMDB movie ID */}
      <Route path="/watch/:id" element={<Watch />} />

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
            <span style={{ fontSize: '4rem' }}>🎬</span>
            <h1 style={{ fontSize: '1.5rem', color: '#f1f0f5' }}>404 – Page Not Found</h1>
            <a href="/" style={{ color: '#a855f7', fontWeight: 600 }}>
              ← Back to VibeReel
            </a>
          </div>
        }
      />
    </Routes>
  );
};

export default App;
