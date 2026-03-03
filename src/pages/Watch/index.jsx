/**
 * Watch.jsx  ─ Movie Detail / Watch Page "/watch/:id"
 * ═══════════════════════════════════════════════════════════════
 * Cinematic detail page with backdrop hero, poster, metadata,
 * and an embedded player that appears when the user hits "Play".
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import Header from '@/components/layout/Header';
import MovieRow from '@/components/layout/MovieRow';
import MovieLogo from '@/components/common/MovieLogo';
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
    const { movie: movieMeta, similar, loading } = useMovieDetail(id, type);
    const { isWatchlisted, toggleWatchlist } = useUserMovies();

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
                    {/* Backdrop */}
                    {backdropUrl && (
                        <div className="detail-hero__backdrop">
                            <img src={backdropUrl} alt="" aria-hidden="true" />
                        </div>
                    )}
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
                                        maxHeight="60px"
                                        type={type}
                                    />
                                </h1>

                                {/* Meta row: year · rating · cert · HD */}
                                <div className="detail-hero__meta">
                                    {releaseDate && <span>{releaseDate}</span>}
                                    {rating && <span>{rating}</span>}
                                    <span className="detail-cert-badge">{certification}</span>
                                    <span className="detail-hd-badge">HD</span>
                                </div>

                                {/* Genre pills */}
                                {movieMeta.genres?.length > 0 && (
                                    <div className="detail-hero__genres">
                                        {movieMeta.genres.map(g => (
                                            <span key={g.id} className="detail-genre-pill">{g.name}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Overview */}
                                {movieMeta.overview && (
                                    <p className="detail-hero__overview">{movieMeta.overview}</p>
                                )}

                                {/* Actions */}
                                <div className="detail-actions">
                                    <button className="detail-play-btn" onClick={() => navigate(`/play/${id}`)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        Play
                                    </button>
                                    <button
                                        className={`detail-watchlist-btn ${inWatchlist ? 'active' : ''}`}
                                        onClick={() => toggleWatchlist(movieMeta)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill={inWatchlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            {inWatchlist ? (
                                                <path d="M20 6L9 17l-5-5" />
                                            ) : (
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            )}
                                        </svg>
                                        {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                                    </button>
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
                    SIMILAR MOVIES
                ═══════════════════════════════════════════════ */}
                <div className="rows-container" style={{ paddingTop: '1rem' }}>
                    {similar.length > 0 && (
                        <MovieRow
                            title="More Like This"
                            movies={similar}
                            onCardClick={(m) => navigate(`/watch/${m.id}`)}
                        />
                    )}
                </div>
            </main>



            <Footer />
        </div >
    );
};

export default Watch;
