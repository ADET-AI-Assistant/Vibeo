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
// ── Reusable components ──────────────────────────────────────
import Header from '@/components/layout/Header';
import HeroBanner from '@/components/layout/HeroBanner';
import MovieRow from '@/components/layout/MovieRow';
import Footer from '@/components/layout/Footer';

// ── Data sources ──────────────────────────────────────────────
import { useMovies } from '@/hooks/useMovies';
import { MOOD_MOVIES } from '@/data/moodData';

const Dashboard = () => {
    const navigate = useNavigate();

    // Live TMDB trending data
    const { movies: trending, loading } = useMovies();

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

            <Footer />
        </div>
    );
};

export default Dashboard;

