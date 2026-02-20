/**
 * Dashboard.jsx  ─ Homepage "/"
 * ═══════════════════════════════════════════════════════════════
 * UI inspired by Yorumi & Mercy streaming sites:
 *  • Full-width hero spotlight banner (first trending movie)
 *  • Filter tab row (Mercy-style)
 *  • Horizontal carousel rows (Yorumi-style)
 *
 * Lab Requirements:
 *  ✅ Lab 2, Task 3  – .map() rendering (in MovieRow & here)
 *  ✅ Lab 3, Task 3  – useState toggle (viewMode + showInsights)
 *  ✅ Semantic HTML  – <main>, <section>, <article>, <header>
 *  ✅ Reusable components with props
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Reusable components (Lab 3, Task 1) ──────────────────────
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import StatusCard from '../components/StatusCard';
import Footer from "../components/Footer"

// ── Data sources ──────────────────────────────────────────────
import useTMDB from '../hooks/useTMDB';
import { MOOD_MOVIES } from '../data/moodData';

// ─────────────────────────────────────────────────────────────
// Tab filter config (Mercy-style top filter bar)
// ─────────────────────────────────────────────────────────────
const TABS = [
    { id: 'trending', label: '🌐 Trending', icon: '🌐' },
    { id: 'mood', label: '🤖 Mood Matches', icon: '🤖' },
    { id: 'toprated', label: '⭐ Top Rated', icon: '⭐' },
    { id: 'action', label: '💥 Action', icon: '💥' },
    { id: 'drama', label: '🎭 Drama', icon: '🎭' },
];

const Dashboard = () => {
    const navigate = useNavigate();

    /*
     * ── Lab 3, Task 3: useState – active tab controls visible rows ──
     * Changing `activeTab` triggers a re-render with different
     * movie data — a clear, visible UI update.
     */
    const [activeTab, setActiveTab] = useState('trending');

    /*
     * ── Lab 3, Task 3: useState – ML insights panel toggle ──
     */
    const [showInsights, setShowInsights] = useState(false);

    // Live TMDB trending data
    const { movies: trending, loading } = useTMDB();

    // Derived slices for different "sections"
    // (simulate multiple categories from one API call)
    const topRated = [...trending].sort((a, b) => b.vote_average - a.vote_average).slice(0, 12);
    const actionMix = trending.filter((_, i) => i % 2 === 0).slice(0, 12);
    const dramaMix = trending.filter((_, i) => i % 2 !== 0).slice(0, 12);

    const handleCardClick = (movie) => navigate(`/watch/${movie.id}`);

    // Hero movies = first 5 trending results for the spotlight carousel
    const heroMovies = trending.slice(0, 5);

    return (
        <div className="page-wrapper">
            {/* ── Sticky top navigation ── */}
            <Header />

            <main>
                {/* ══════════════════════════════════════════════
            HERO BANNER
        ══════════════════════════════════════════════ */}
                <HeroBanner movies={heroMovies} />

                {/* ══════════════════════════════════════════════
            FILTER TAB BAR  (Mercy-inspired)
            Lab 3 Task 3: activeTab useState drives which
            rows are highlighted / visible below
        ══════════════════════════════════════════════ */}
                <section className="filter-bar" aria-label="Content Filter">
                    <div className="filter-bar__inner">
                        {/*
              [MAP-RENDER] ─ Lab 2, Task 3
              Renders tab buttons dynamically from TABS array
            */}
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                className={`filter-tab ${activeTab === tab.id ? 'filter-tab--active' : ''}`}
                                onClick={() => {
                                    setActiveTab(tab.id);   // ← useState setter
                                    setShowInsights(false);
                                }}
                                aria-pressed={activeTab === tab.id}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
            CONTENT ROWS
            Show different carousels based on activeTab
        ══════════════════════════════════════════════ */}
                <div className="rows-container">

                    {/* ── TRENDING tab ── */}
                    {activeTab === 'trending' && !loading && (
                        <>
                            <MovieRow
                                title="Trending This Week"
                                icon="🔥"
                                movies={trending}
                                onCardClick={handleCardClick}
                            />
                            <MovieRow
                                title="New Releases"
                                icon="🆕"
                                movies={[...trending].reverse().slice(0, 12)}
                                onCardClick={handleCardClick}
                            />
                        </>
                    )}

                    {/* ── MOOD MATCHES tab ── */}
                    {activeTab === 'mood' && (
                        <>
                            {/* Insight toggle button */}
                            <div className="insight-toggle-row">
                                <button
                                    className={`insight-btn ${showInsights ? 'insight-btn--active' : ''}`}
                                    onClick={() => setShowInsights(p => !p)} /* ← useState toggle */
                                >
                                    {showInsights ? '🔽 Hide ML Insights' : '🔍 Show ML Algorithm Insights'}
                                </button>
                            </div>

                            {/* ── ML Insights Panel ── */}
                            {showInsights && (
                                <section className="insight-panel fade-in-up" aria-label="ML Algorithm Details">
                                    <h3 className="insight-panel__title">
                                        🤖 Content-Based Filtering — How Your Matches Are Scored
                                    </h3>
                                    <div className="insight-panel__list">
                                        {/*
                      [MAP-RENDER] ─ Lab 2, Task 3
                      Renders CBF explanation row per mock movie
                    */}
                                        {MOOD_MOVIES.map(m => (
                                            <div key={m.id} className="insight-row">
                                                <span className="insight-row__score">{m.matchPercentage}%</span>
                                                <div className="insight-row__text">
                                                    <strong>{m.title}</strong>
                                                    <p>{m.cbfNote}</p>
                                                </div>
                                                <div className="insight-row__tags">
                                                    {/* Nested .map() for mood tags [MAP-RENDER] */}
                                                    {m.moodTags.map(tag => (
                                                        <span key={tag} className="mood-tag">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <MovieRow
                                title="AI Mood Matches"
                                icon="🤖"
                                movies={MOOD_MOVIES}
                                onCardClick={handleCardClick}
                                showBadge={true}
                            />
                            <MovieRow
                                title="Because You Like Dark Thrillers"
                                icon="🌑"
                                movies={[...MOOD_MOVIES].reverse()}
                                onCardClick={handleCardClick}
                                showBadge={true}
                            />
                        </>
                    )}

                    {/* ── TOP RATED tab ── */}
                    {activeTab === 'toprated' && !loading && (
                        <>
                            <MovieRow
                                title="Top Rated Movies"
                                icon="⭐"
                                movies={topRated}
                                onCardClick={handleCardClick}
                            />
                            <MovieRow
                                title="Critically Acclaimed"
                                icon="🏆"
                                movies={[...topRated].slice(0, 8)}
                                onCardClick={handleCardClick}
                            />
                        </>
                    )}

                    {/* ── ACTION tab ── */}
                    {activeTab === 'action' && !loading && (
                        <MovieRow
                            title="Action & Adventure"
                            icon="💥"
                            movies={actionMix}
                            onCardClick={handleCardClick}
                        />
                    )}

                    {/* ── DRAMA tab ── */}
                    {activeTab === 'drama' && !loading && (
                        <MovieRow
                            title="Drama"
                            icon="🎭"
                            movies={dramaMix}
                            onCardClick={handleCardClick}
                        />
                    )}

                    {/* ── Loading spinner ── */}
                    {loading && (
                        <div className="loading-center">
                            <div className="spinner" />
                            <p>Fetching latest from TMDB…</p>
                        </div>
                    )}

                    {/* ── Stats row (always visible) ── */}
                    <section className="stats-row" aria-label="Dashboard Statistics">
                        {/*
              [MAP-RENDER] ─ Lab 2, Task 3
              Renders StatusCard components from a config array
            */}
                        {[
                            { icon: '🌍', label: 'Data Source', value: activeTab === 'mood' ? 'AI Mood Engine' : 'TMDB API Live', color: 'rgba(168,85,247,0.2)' },
                            { icon: '🎞️', label: 'Titles Loaded', value: loading ? '…' : `${trending.length} Movies`, color: 'rgba(245,158,11,0.2)' },
                            { icon: '🤖', label: 'ML Algorithm', value: 'Content-Based Filtering', color: 'rgba(59,130,246,0.2)' },
                            { icon: '📡', label: 'Stream Engine', value: 'Videasy iframe API', color: 'rgba(16,185,129,0.2)' },
                        ].map(card => (
                            <StatusCard
                                key={card.label}
                                icon={card.icon}
                                label={card.label}
                                value={card.value}
                                color={card.color}
                            />
                        ))}
                    </section>

                </div>{/* /rows-container */}
            </main>

            {/* ── Footer ── */}
            <Footer />
        </div>
    );
};

export default Dashboard;
