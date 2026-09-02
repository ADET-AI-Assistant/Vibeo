import React from 'react';
import { useUserMovies } from '@/hooks/useUserMovies';
import TVMovieRow from '../components/TVMovieRow';

export const TVLibrary = () => {
    const { watchlist, favorites, favoriteMovies, continueWatching } = useUserMovies();
    const favs = favorites || favoriteMovies || [];

    const hasAny = (continueWatching?.length > 0) || (watchlist?.length > 0) || (favs?.length > 0);

    return (
        <div className="tv-library-page">
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '28px' }}>
                My Library
            </h1>

            {!hasAny ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--c-text2)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📑</div>
                    <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '8px' }}>Your library is empty</h2>
                    <p style={{ fontSize: '1.1rem' }}>Add movies to your Watchlist or Favorites to easily access them on TV.</p>
                </div>
            ) : (
                <div className="tv-rows-container">
                    {continueWatching?.length > 0 && (
                        <TVMovieRow
                            id="continue-watching"
                            title="Continue Watching"
                            movies={continueWatching}
                            orderIndex={0}
                        />
                    )}

                    {watchlist?.length > 0 && (
                        <TVMovieRow
                            id="watchlist"
                            title="Watchlist"
                            movies={watchlist}
                            orderIndex={1}
                        />
                    )}

                    {favs?.length > 0 && (
                        <TVMovieRow
                            id="favorites"
                            title="Favorites"
                            movies={favs}
                            orderIndex={2}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default TVLibrary;
