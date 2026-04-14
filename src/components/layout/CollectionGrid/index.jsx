import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMovieCollection } from '@/hooks/useMovieCollection';
import { TMDB_IMAGE_BASE, TMDB_BACKDROP_BASE } from '@/config/constants';
import './styles.css';

/**
 * CollectionGrid
 * Renders a premium, dark-themed franchise collection section using tmdb `belongs_to_collection` data.
 * Mimics high-end streaming platforms (like the Scream Collection reference).
 * 
 * @param {string|number} collectionId The ID of the TMDB collection
 */
const CollectionGrid = ({ collectionId }) => {
    const navigate = useNavigate();
    const { collection, loading, error } = useMovieCollection(collectionId);

    if (loading) {
        return (
            <div className="collection-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !collection || !collection.parts || collection.parts.length === 0) {
        return null;
    }

    const backdropUrl = collection.backdrop_path ? `${TMDB_BACKDROP_BASE}${collection.backdrop_path}` : null;

    return (
        <section className="collection-section">
            <div className="collection-wrapper">

                {/* ── Background Layer ── */}
                {backdropUrl && (
                    <div className="collection-backdrop">
                        <img src={backdropUrl} alt="" aria-hidden="true" loading="lazy" />
                        <div className="collection-backdrop-fade" />
                    </div>
                )}

                <div className="collection-content">
                    {/* ── Header ── */}
                    <div className="collection-header">
                        <h2 className="collection-title">{collection.name}</h2>
                        <span className="collection-count">{collection.parts.length} Movies</span>

                        {collection.overview && (
                            <div className="collection-overview">
                                <h3>Overview</h3>
                                <p>{collection.overview}</p>
                            </div>
                        )}
                    </div>

                    {/* ── Movie Grid ── */}
                    <div className="collection-movies-section">
                        <h3 className="collection-movies-title">Movies in Collection</h3>
                        <div className="collection-grid">
                            {collection.parts.map((movie) => {
                                const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : '/placeholder-poster.jpg';
                                const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
                                const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';

                                return (
                                    <div
                                        key={movie.id}
                                        className="collection-card"
                                        onClick={() => navigate(`/watch/${movie.id}?type=movie`)}
                                    >
                                        <div className="collection-card__image">
                                            <img src={posterUrl} alt={movie.title} loading="lazy" />
                                            {rating > 0 && (
                                                <div className="collection-card__rating">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                    {rating}
                                                </div>
                                            )}
                                            {/* Gradient overlay for text reading */}
                                            <div className="collection-card__overlay" />

                                            <div className="collection-card__info">
                                                <h4>{movie.title}</h4>
                                                <div className="collection-card__meta">
                                                    <span>{year}</span>
                                                    <span className="collection-card__badge">Movie</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default CollectionGrid;
