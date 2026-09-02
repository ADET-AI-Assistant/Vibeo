import React, { useState, useEffect } from 'react';
import TVHeroBanner from '../components/TVHeroBanner';
import TVMovieRow from '../components/TVMovieRow';
import { useHomePageData } from '@/hooks/useHomePageData';
import { useMoodMatchMovies } from '@/hooks/useMoodMatchMovies';

export const TVDashboard = () => {
    const { trending, nowPlaying, topRated, popular, upcoming, loading } = useHomePageData();
    const { data: moodMatches, isLoading: moodMatchesLoading } = useMoodMatchMovies();
    const [heroMovie, setHeroMovie] = useState(null);

    // Default hero movie to top trending title
    useEffect(() => {
        if (!heroMovie && trending && trending.length > 0) {
            setHeroMovie(trending[0]);
        }
    }, [trending, heroMovie]);

    return (
        <div className="tv-dashboard">
            {/* 10-Foot Spotlight Hero */}
            <TVHeroBanner movie={heroMovie} />

            {/* Content Carousels */}
            <div className="tv-rows-container">
                <TVMovieRow
                    id="trending"
                    title="Trending This Week"
                    movies={trending}
                    orderIndex={1}
                    loading={loading}
                    onCardFocus={setHeroMovie}
                />

                <TVMovieRow
                    id="now-playing"
                    title="Now Playing in Theaters"
                    movies={nowPlaying}
                    orderIndex={2}
                    loading={loading}
                    onCardFocus={setHeroMovie}
                />

                <TVMovieRow
                    id="top-rated"
                    title="Top Rated of All Time"
                    movies={topRated}
                    orderIndex={3}
                    loading={loading}
                    onCardFocus={setHeroMovie}
                />

                {(moodMatchesLoading || (moodMatches && moodMatches.length > 0)) && (
                    <TVMovieRow
                        id="recommended"
                        title="Recommended For You"
                        movies={moodMatches}
                        orderIndex={4}
                        loading={moodMatchesLoading}
                        onCardFocus={setHeroMovie}
                    />
                )}

                <TVMovieRow
                    id="popular"
                    title="Popular Worldwide"
                    movies={popular}
                    orderIndex={5}
                    loading={loading}
                    onCardFocus={setHeroMovie}
                />

                <TVMovieRow
                    id="upcoming"
                    title="Coming Soon"
                    movies={upcoming}
                    orderIndex={6}
                    loading={loading}
                    onCardFocus={setHeroMovie}
                />
            </div>
        </div>
    );
};

export default TVDashboard;
