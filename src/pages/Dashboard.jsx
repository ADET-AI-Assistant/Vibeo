/**
 * Dashboard.jsx  ─ Homepage "/"
 * ═══════════════════════════════════════════════════════════════
 * Netflix-style streaming homepage:
 *  • Full-width hero spotlight banner (first 5 trending movies)
 *  • Horizontal carousel rows for each category
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

// ── Reusable components ──────────────────────────────────────
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';

// ── Data sources ──────────────────────────────────────────────
import useTMDB from '../hooks/useTMDB';
import { MOOD_MOVIES } from '../data/moodData';

const Dashboard = () => {
    const navigate = useNavigate();

    // Live TMDB trending data
    const { movies: trending, loading } = useTMDB();

    // Derived slices for different sections
    const topRated = [...trending].sort((a, b) => b.vote_average - a.vote_average).slice(0, 12);
    const actionMix = trending.filter((_, i) => i % 2 === 0).slice(0, 12);
    const dramaMix = trending.filter((_, i) => i % 2 !== 0).slice(0, 12);

    const handleCardClick = (movie) => navigate(`/watch/${movie.id}`);

    // Hero movies = first 5 trending results for the spotlight carousel
    const heroMovies = trending.slice(0, 5);

    return (
        <div className="page-wrapper">
            <Header />

            <main>
                <HeroBanner movies={heroMovies} />

                <div className="rows-container">
                    {loading ? (
                        <div className="loading-center">
                            <div className="spinner" />
                            <p>Fetching latest from TMDB…</p>
                        </div>
                    ) : (
                        <>
                            <MovieRow
                                title="Trending This Week"
                                movies={trending}
                                onCardClick={handleCardClick}
                            />
                            <MovieRow
                                title="Top Rated"
                                movies={topRated}
                                onCardClick={handleCardClick}
                            />
                            <MovieRow
                                title="AI Mood Matches"
                                movies={MOOD_MOVIES}
                                onCardClick={handleCardClick}
                                showBadge={true}
                            />
                            <MovieRow
                                title="Action & Adventure"
                                movies={actionMix}
                                onCardClick={handleCardClick}
                            />
                            <MovieRow
                                title="Drama"
                                movies={dramaMix}
                                onCardClick={handleCardClick}
                            />
                            <MovieRow
                                title="New Releases"
                                movies={[...trending].reverse().slice(0, 12)}
                                onCardClick={handleCardClick}
                            />
                        </>
                    )}
                </div>
            </main>

            <footer className="site-footer">
                <div className="site-footer__inner">
                    <span className="site-footer__logo">VibeReel</span>
                    <p>Powered by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener">TMDB</a> &amp; <a href="https://videasy.net/" target="_blank" rel="noopener">Videasy</a></p>
                    <p>© 2026 VibeReel</p>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;

