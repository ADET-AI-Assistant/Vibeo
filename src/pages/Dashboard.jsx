/**
 * Dashboard.jsx  ─ Homepage "/"
 * ═══════════════════════════════════════════════════════════════
 * Premium streaming homepage:
 *  • Full-width hero spotlight banner (personalized or trending)
 *  • Unique horizontal carousel rows from diverse TMDB endpoints
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Reusable components ──────────────────────────────────────
import Header from '@/components/layout/Header';
import HeroBanner from '@/components/layout/HeroBanner';
import MoodMixer from '@/components/layout/MoodMixer';
import MovieRow from '@/components/layout/MovieRow';
import Footer from '@/components/layout/Footer';
import { useLayout } from '@/context/LayoutContext';

// ── Data sources ──────────────────────────────────────────────
import { useHomePageData } from '@/hooks/useHomePageData';
import { useMoodMatchMovies } from '@/hooks/useMoodMatchMovies';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Diverse TMDB data for each row
    const { trending, nowPlaying, topRated, popular, upcoming, loading } = useHomePageData();

    const handleCardClick = (movie) => navigate(`/watch/${movie.id}`);

    // Personalized recommendations
    const { movies: moodMatches } = useMoodMatchMovies();

    // Effect for auto-scrolling to section
    useEffect(() => {
        if (!loading && location.hash) {
            const id = location.hash.replace('#', '');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        }
    }, [location.hash, loading]);

    // Use Layout settings for Hero source
    const { heroSource } = useLayout();

    const getHeroMovies = () => {
        let sourceMovies = trending;
        if (heroSource === 'nowPlaying') sourceMovies = nowPlaying;
        if (heroSource === 'topRated') sourceMovies = topRated;
        if (heroSource === 'popular') sourceMovies = popular;
        if (heroSource === 'moodMatch') sourceMovies = moodMatches;

        return sourceMovies?.slice(0, 5) || [];
    };

    return (
        <div className="page-wrapper home-page">
            <Header />

            <main>
                <HeroBanner movies={getHeroMovies()} />

                <MoodMixer />

                <div className="rows-container">
                    <MovieRow
                        id="trending"
                        title="Trending This Week"
                        movies={trending}
                        loading={loading}
                        onCardClick={handleCardClick}
                    />
                    <MovieRow
                        id="now-playing"
                        title="Now Playing in Theaters"
                        movies={nowPlaying}
                        loading={loading}
                        onCardClick={handleCardClick}
                    />
                    <MovieRow
                        id="top-rated"
                        title="Top Rated of All Time"
                        movies={topRated}
                        loading={loading}
                        onCardClick={handleCardClick}
                    />
                    {(loading || (moodMatches && moodMatches.length > 0)) && (
                        <MovieRow
                            id="mood-match"
                            title="Based on your Favorites"
                            movies={moodMatches}
                            loading={loading}
                            onCardClick={handleCardClick}
                            showBadge={true}
                        />
                    )}
                    <MovieRow
                        id="popular"
                        title="Popular Worldwide"
                        movies={popular}
                        loading={loading}
                        onCardClick={handleCardClick}
                    />
                    <MovieRow
                        id="upcoming"
                        title="Coming Soon"
                        movies={upcoming}
                        loading={loading}
                        onCardClick={handleCardClick}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
