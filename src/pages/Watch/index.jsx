/**
 * Watch.jsx  ─ Movie Detail / Watch Page "/watch/:id"
 * ═══════════════════════════════════════════════════════════════
 * Cinematic detail page with backdrop hero, poster, metadata,
 * and an embedded player that appears when the user hits "Play".
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import Header from '@/components/layout/Header';
import MovieRow from '@/components/layout/MovieRow';
import MovieLogo from '@/components/common/MovieLogo';
import StarRating from '@/components/common/StarRating';
import TrailerModal from '@/components/common/TrailerModal';
import WatchlistDropdown from '@/components/common/WatchlistDropdown';
import CastScroller from '@/components/common/CastScroller';
import ImageGallery from '@/components/common/ImageGallery';
import ReviewSection from '@/components/common/ReviewSection';
import CollectionGrid from '@/components/layout/CollectionGrid';
import Footer from '@/components/layout/Footer';
import { useMovieDetail } from '@/hooks/useMovieDetail';
import { useUserMovies } from '@/hooks/useUserMovies';
import { TMDB_IMAGE_BASE, TMDB_BACKDROP_BASE } from '@/config/constants';
import '@/components/common/Loading/styles.css';
import './styles.css';

const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'movie';

    /* ── State ── */
    const { movie: movieMeta, similar, loading, error } = useMovieDetail(id, type);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const { isWatchlisted, toggleWatchlist } = useUserMovies();

    if (error) {
        return (
            <div className="page-wrapper">
                <Header />
                <main className="loading-center" style={{ minHeight: '60vh', gap: '1.5rem' }}>
                    <div style={{ fontSize: '4rem' }}>🎬</div>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: 'var(--c-text)', marginBottom: '0.5rem' }}>{type === 'movie' ? 'Movie' : 'Show'} Not Found</h2>
                        <p style={{ color: 'var(--c-muted)', maxWidth: '400px' }}>
                            We couldn't find the {type} you're looking for. It might have been removed or the ID is incorrect.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '0.8rem 2rem',
                            background: 'var(--c-accent)',
                            color: 'white',
                            borderRadius: '12px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Go Back
                    </button>
                </main>
                <Footer />
            </div>
        );
    }

    const inWatchlist = movieMeta ? isWatchlisted(movieMeta.id) : false;

    /* ── Derived data ── */
    const displayTitle = movieMeta?.title || movieMeta?.name;
    const releaseDate = movieMeta?.release_date || movieMeta?.first_air_date;
    const backdropUrl = movieMeta?.backdrop_path ? `${TMDB_BACKDROP_BASE}${movieMeta.backdrop_path}` : null;
    const posterUrl = movieMeta?.poster_path ? `${TMDB_IMAGE_BASE}${movieMeta.poster_path}` : null;
    const rating = movieMeta?.vote_average ? Number(movieMeta.vote_average).toFixed(1) : null;
    const certification = movieMeta?.adult ? 'R' : 'PG-13';

    return (
        <div className="page-wrapper">
            <Header />

            <main>
                {/* ═══════════════════════════════════════════════
                    DETAIL HERO — Backdrop + poster + info
                ═══════════════════════════════════════════════ */}
                <section className="detail-hero" aria-label="Movie Details">
                    {/* Background: Auto-play Trailer or Backdrop */}
                    {movieMeta?.trailerKey ? (
                        <div className="detail-hero__backdrop detail-hero__video-bg">
                            <iframe
                                src={`https://www.youtube.com/embed/${movieMeta.trailerKey}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${movieMeta.trailerKey}&modestbranding=1`}
                                title="Trailer Background"
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                tabIndex="-1"
                                aria-hidden="true"
                            ></iframe>
                        </div>
                    ) : backdropUrl ? (
                        <div className="detail-hero__backdrop">
                            <img src={backdropUrl} alt="" aria-hidden="true" />
                        </div>
                    ) : null}
                    <div className="detail-hero__overlay" />

                    <div className="detail-hero__content">
                        {/* Poster */}
                        {posterUrl && (
                            <div className="detail-hero__poster">
                                <img
                                    src={posterUrl}
                                    alt={displayTitle || 'Movie poster'}
                                />
                            </div>
                        )}

                        {/* Info column */}
                        {movieMeta && (
                            <div className="detail-hero__info">
                                <h1 className="detail-hero__title watch-title">
                                    <MovieLogo
                                        tmdbId={movieMeta.id || id}
                                        title={displayTitle}
                                        maxHeight="100px"
                                        type={type}
                                    />
                                </h1>

                                {/* Meta row: year · rating · cert · HD */}
                                <div className="detail-hero__meta">
                                    {releaseDate && <span>{releaseDate}</span>}
                                    {movieMeta.vote_average > 0 && (
                                        <div style={{ transform: 'translateY(-1px)' }}>
                                            <StarRating rating={movieMeta.vote_average} />
                                        </div>
                                    )}
                                    <span className="detail-cert-badge">{certification}</span>
                                    <span className="detail-hd-badge">HD</span>
                                </div>

                                {/* Director & Genre pills */}
                                <div className="detail-hero__genres">
                                    {movieMeta.director && (
                                        <span className="detail-genre-pill" style={{ background: 'rgba(168, 85, 247, 0.2)', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"></path><rect x="3" y="6" width="12" height="12" rx="2" ry="2"></rect></svg>
                                            {movieMeta.director}
                                        </span>
                                    )}
                                    {movieMeta.genres?.map(g => (
                                        <span key={g.id} className="detail-genre-pill">{g.name}</span>
                                    ))}
                                </div>

                                {/* Overview */}
                                {movieMeta.overview && (
                                    <p className="detail-hero__overview">{movieMeta.overview}</p>
                                )}

                                {/* Production & Box Office Details */}
                                <div className="detail-hero__production">
                                    {(movieMeta.budget > 0 || movieMeta.revenue > 0) && (
                                        <div className="production-finances">
                                            {movieMeta.budget > 0 && (
                                                <span><strong>Budget:</strong> ${movieMeta.budget.toLocaleString()}</span>
                                            )}
                                            {movieMeta.revenue > 0 && (
                                                <span><strong>Revenue:</strong> ${movieMeta.revenue.toLocaleString()}</span>
                                            )}
                                        </div>
                                    )}
                                    {movieMeta.production_companies?.length > 0 && (
                                        <div className="production-studios">
                                            <strong>Studios:</strong> {movieMeta.production_companies.map(c => c.name).join(', ')}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="detail-actions">
                                    <button className="detail-play-btn" onClick={() => navigate(`/play/${id}?type=${type}`)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        Play
                                    </button>

                                    {movieMeta?.trailerKey && (
                                        <button
                                            className="detail-watchlist-btn"
                                            onClick={() => setIsTrailerOpen(true)}
                                            style={{ color: '#e2e8f0' }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                            Trailer
                                        </button>
                                    )}
                                    <WatchlistDropdown movie={movieMeta} />
                                </div>
                            </div>
                        )}

                        {/* Loading state */}
                        {loading && (
                            <div className="loading-center" style={{ padding: '4rem 0' }}>
                                <div className="spinner" />
                                <p>Loading movie details...</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    CAST & CREW SCROLLER
                ═══════════════════════════════════════════════ */}
                <CastScroller cast={movieMeta?.cast} />

                {/* ═══════════════════════════════════════════════
                    IMAGE GALLERY
                ═══════════════════════════════════════════════ */}
                <ImageGallery images={movieMeta?.backdrops} />

                {/* ═══════════════════════════════════════════════
                    FEATURED REVIEWS
                ═══════════════════════════════════════════════ */}
                <ReviewSection reviews={movieMeta?.reviews} />

                {/* ═══════════════════════════════════════════════
                    COLLECTION FRANCHISE GRID (If Applicable)
                ═══════════════════════════════════════════════ */}
                {movieMeta?.belongs_to_collection && (
                    <CollectionGrid collectionId={movieMeta.belongs_to_collection.id} />
                )}

                {/* ═══════════════════════════════════════════════
                    SIMILAR MOVIES
                ═══════════════════════════════════════════════ */}
                <div className="rows-container" style={{ paddingTop: '1rem' }}>
                    {similar.length > 0 && (
                        <MovieRow
                            title="More Like This"
                            movies={similar}
                            onCardClick={(m) => navigate(`/watch/${m.id}?type=${m.media_type || type}`)}
                        />
                    )}
                </div>
            </main>



            <Footer />

            <TrailerModal
                isOpen={isTrailerOpen}
                videoId={movieMeta?.trailerKey}
                onClose={() => setIsTrailerOpen(false)}
            />
        </div>
    );
};

export default Watch;
