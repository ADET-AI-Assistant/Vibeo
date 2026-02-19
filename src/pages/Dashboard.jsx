/**
 * Dashboard.jsx  ─ Homepage "/"  (Discovery Dashboard)
 * ═══════════════════════════════════════════════════════════════
 * Lab Requirements demonstrated in this file:
 *
 *  ✅ Lab 2, Task 3 – Dynamic Rendering via .map()
 *     Lines marked with [MAP-RENDER] show where .map() is used
 *     to render both the TMDB API list and the Mock ML data list.
 *
 *  ✅ Lab 3, Task 3 – Interactivity with useState
 *     `viewMode` state (line ~47) drives the toggle between
 *     "Global Trending" and "My Mood Matches" views.
 *     A second state `showInsights` toggles the ML insight panel.
 *
 *  ✅ Semantic HTML: <main>, <section>, <article> are used.
 *
 *  ✅ Reusable components: <Header>, <MovieCard>, <StatusCard>
 *     are imported and rendered with props.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Reusable components (Lab 3, Task 1) ──────────────────────
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import StatusCard from '../components/StatusCard';

// ── Custom hook for live TMDB data ────────────────────────────
import useTMDB from '../hooks/useTMDB';

// ── Mock ML / CBF mood-match data ────────────────────────────
import { MOOD_MOVIES } from '../data/moodData';

// ─────────────────────────────────────────────────────────────
// View mode constants (used with the useState toggle)
// ─────────────────────────────────────────────────────────────
const VIEW_TRENDING = 'trending';
const VIEW_MOOD = 'mood';

const Dashboard = () => {
    const navigate = useNavigate();

    /*
     * ── Lab 3, Task 3: useState for view-mode toggle ──────────
     * `viewMode` controls which dataset is rendered in the grid.
     * Changing it causes React to re-render the MovieCard list
     * with a completely different array — a visible UI update.
     */
    const [viewMode, setViewMode] = useState(VIEW_TRENDING);

    /*
     * ── Lab 3, Task 3: useState for ML insights panel ─────────
     * `showInsights` toggles the CBF explanation panel below the
     * grid when the user is in Mood Match mode.
     */
    const [showInsights, setShowInsights] = useState(false);

    // ── Fetch live TMDB data from the custom hook ─────────────
    const { movies: trendingMovies, loading, error } = useTMDB();

    /*
     * Determine which array to display based on viewMode state.
     * This is the core of the interactive toggle behaviour.
     */
    const displayMovies = viewMode === VIEW_TRENDING
        ? trendingMovies   // Live TMDB data
        : MOOD_MOVIES;     // Mock CBF / ML data

    // Navigate to the watch page when a card is clicked
    const handleCardClick = (movie) => {
        navigate(`/watch/${movie.id}`);
    };

    // ─────────────────────────────────────────────────────────
    return (
        <>
            {/*
        <Header> reusable component — subtitle changes based on
        current view to reflect the active data source.
      */}
            <Header
                subtitle={
                    viewMode === VIEW_TRENDING
                        ? "Discover what the world is watching right now."
                        : "Your AI mood-matched recommendations."
                }
            />

            {/* ── Main content landmark ── */}
            <main className="max-w-7xl mx-auto px-6 py-8" style={{ minHeight: '80vh' }}>

                {/* ══════════════════════════════════════════════════
            SECTION 1 – Dashboard stats row
            Uses <StatusCard> reusable component with props
        ══════════════════════════════════════════════════ */}
                <section
                    aria-label="Dashboard Statistics"
                    className="flex flex-wrap gap-4 mb-8"
                >
                    {/*
            [MAP-RENDER] ─ Lab 2, Task 3
            Renders StatusCard list via .map() over a config array.
            This keeps the JSX DRY and demonstrates dynamic rendering.
          */}
                    {[
                        {
                            icon: '🌍',
                            label: 'Data Source',
                            value: viewMode === VIEW_TRENDING ? 'TMDB API Live' : 'AI Mood Engine',
                            color: 'rgba(168,85,247,0.18)',
                        },
                        {
                            icon: '🎞️',
                            label: 'Titles Shown',
                            value: loading ? '…' : `${displayMovies.length} Movies`,
                            color: 'rgba(245,158,11,0.18)',
                        },
                        {
                            icon: '🤖',
                            label: 'ML Algorithm',
                            value: 'Content-Based Filtering',
                            color: 'rgba(59,130,246,0.18)',
                        },
                        {
                            icon: '📡',
                            label: 'Stream Engine',
                            value: 'Videasy iframe API',
                            color: 'rgba(16,185,129,0.18)',
                        },
                    ].map((card) => (
                        <StatusCard
                            key={card.label}
                            icon={card.icon}
                            label={card.label}
                            value={card.value}
                            color={card.color}
                        />
                    ))}
                </section>

                {/* ══════════════════════════════════════════════════
            SECTION 2 – Interactive Toggle + Section Title
            Lab 3, Task 3: useState drives this toggle
        ══════════════════════════════════════════════════ */}
                <section aria-label="View Controls" className="mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">

                        {/* Section heading */}
                        <h2 className="section-title" style={{ minWidth: 200 }}>
                            {viewMode === VIEW_TRENDING
                                ? '🌐 Global Trending'
                                : '🤖 My Mood Matches'}
                        </h2>

                        {/* ── Toggle pill ─────────────────────────────────
                Clicking either button calls setViewMode(),
                which updates state and triggers a re-render
                with a different movie array [Lab 3, Task 3]
            ── */}
                        <div className="toggle-pill" role="group" aria-label="View Mode Toggle">
                            <button
                                className={viewMode === VIEW_TRENDING ? 'active' : ''}
                                onClick={() => {
                                    setViewMode(VIEW_TRENDING); // ← useState setter
                                    setShowInsights(false);
                                }}
                                aria-pressed={viewMode === VIEW_TRENDING}
                            >
                                🌐 Trending
                            </button>
                            <button
                                className={viewMode === VIEW_MOOD ? 'active' : ''}
                                onClick={() => setViewMode(VIEW_MOOD)} // ← useState setter
                                aria-pressed={viewMode === VIEW_MOOD}
                            >
                                🤖 Mood Match
                            </button>
                        </div>

                        {/* ── ML Insights toggle button (Mood mode only) ── */}
                        {viewMode === VIEW_MOOD && (
                            <button
                                onClick={() => setShowInsights(prev => !prev)} // ← useState toggle
                                style={{
                                    background: showInsights
                                        ? 'linear-gradient(135deg,#a855f7,#7c3aed)'
                                        : 'var(--vr-surface2)',
                                    color: showInsights ? '#fff' : 'var(--vr-muted)',
                                    border: '1px solid var(--vr-border)',
                                    borderRadius: 999,
                                    padding: '8px 18px',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.25s ease',
                                }}
                            >
                                {showInsights ? '🔽 Hide ML Insights' : '🔍 Show ML Insights'}
                            </button>
                        )}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
            SECTION 3 – ML Insights Panel
            Only visible when showInsights === true [useState]
        ══════════════════════════════════════════════════ */}
                {viewMode === VIEW_MOOD && showInsights && (
                    <section
                        aria-label="ML Algorithm Insights"
                        className="mb-6 fade-in-up"
                    >
                        <div className="ml-insight-panel">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#a855f7' }}>
                                🤖 How your recommendations are generated
                            </h3>

                            {/*
                [MAP-RENDER] ─ Lab 2, Task 3
                Renders per-movie CBF explanations via .map()
              */}
                            <div className="flex flex-col gap-3">
                                {MOOD_MOVIES.slice(0, 4).map((movie) => (
                                    <div
                                        key={movie.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem',
                                            padding: '0.6rem 0',
                                            borderBottom: '1px solid var(--vr-border)',
                                        }}
                                    >
                                        <span className="match-badge" style={{ flexShrink: 0, marginTop: 2 }}>
                                            {movie.matchPercentage}%
                                        </span>
                                        <div>
                                            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--vr-text)' }}>
                                                {movie.title}
                                            </p>
                                            <p style={{ fontSize: '0.72rem', color: 'var(--vr-muted)', marginTop: 2 }}>
                                                {movie.cbfNote}
                                            </p>
                                        </div>
                                        {/* Mood tags rendered via nested .map() */}
                                        <div className="flex gap-1 flex-wrap ml-auto" style={{ flexShrink: 0 }}>
                                            {movie.moodTags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    style={{
                                                        fontSize: '0.65rem',
                                                        background: 'var(--vr-surface)',
                                                        border: '1px solid var(--vr-border)',
                                                        borderRadius: 999,
                                                        padding: '2px 8px',
                                                        color: 'var(--vr-muted)',
                                                    }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ══════════════════════════════════════════════════
            SECTION 4 – Movie Grid
            Lab 2, Task 3: Rendered with .map()
            Lab 3, Task 1: Uses <MovieCard> reusable component
        ══════════════════════════════════════════════════ */}
                <section aria-label="Movie Grid">

                    {/* ── Loading state ── */}
                    {loading && viewMode === VIEW_TRENDING && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="spinner" />
                            <p style={{ color: 'var(--vr-muted)', fontSize: '0.9rem' }}>
                                Fetching trending titles from TMDB…
                            </p>
                        </div>
                    )}

                    {/* ── Error state ── */}
                    {error && (
                        <div
                            style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 'var(--vr-radius)',
                                padding: '1.5rem',
                                color: '#f87171',
                                textAlign: 'center',
                            }}
                        >
                            ⚠️ {error}
                        </div>
                    )}

                    {/* ── Movie Grid ────────────────────────────────────
              [MAP-RENDER] ─ Lab 2, Task 3
              `displayMovies.map()` iterates over either the TMDB
              trending array OR the MOOD_MOVIES mock array,
              rendering one <MovieCard> per item.
              The `animationDelay` prop staggers the fade-in-up
              animation so cards appear one after another.
          ── */}
                    {!loading && !error && (
                        <div className="movie-grid">
                            {displayMovies.map((movie, index) => (
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                    onClick={handleCardClick}
                                    animationDelay={`${index * 50}ms`}
                                />
                            ))}
                        </div>
                    )}

                </section>
            </main>

            {/* ── Semantic footer ── */}
            <footer
                style={{
                    borderTop: '1px solid var(--vr-border)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: 'var(--vr-muted)',
                    fontSize: '0.75rem',
                    marginTop: '3rem',
                }}
            >
                <p>
                    VibeReel — AppDev Lab 3 Project &nbsp;·&nbsp;
                    Powered by{' '}
                    <a
                        href="https://www.themoviedb.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--vr-accent)' }}
                    >
                        TMDB API
                    </a>
                    {' '}&amp;{' '}
                    <a
                        href="https://videasy.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--vr-accent)' }}
                    >
                        Videasy
                    </a>
                </p>
            </footer>
        </>
    );
};

export default Dashboard;
