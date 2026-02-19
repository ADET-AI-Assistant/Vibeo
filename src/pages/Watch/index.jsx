/**
 * Watch.jsx  ─ Movie Detail / Watch Page "/watch/:id"
 * ═══════════════════════════════════════════════════════════════
 * Cinematic detail page with backdrop hero, poster, metadata,
 * and an embedded player that appears when the user hits "Play".
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import MovieRow from '@/components/layout/MovieRow';
import MovieLogo from '@/components/common/MovieLogo';
import Footer from '@/components/layout/Footer';
import { useMovieDetail } from '@/hooks/useMovieDetail';
import { TMDB_IMAGE_BASE, TMDB_BACKDROP_BASE } from '@/config/constants';
import '@/components/common/Loading/styles.css';
import './styles.css';

const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    /* ── State ── */
    const { movie: movieMeta, similar, loading } = useMovieDetail(id);

    /* ── Derived data ── */
    const backdropUrl = movieMeta?.backdrop_path ? `${TMDB_BACKDROP_BASE}${movieMeta.backdrop_path}` : null;
    const posterUrl = movieMeta?.poster_path ? `${TMDB_IMAGE_BASE}${movieMeta.poster_path}` : null;
    const year = movieMeta?.release_date?.substring(0, 4);
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
                                    alt={movieMeta?.title || 'Movie poster'}
                                />
                            </div>
                        )}

                        {/* Info column */}
                        {movieMeta && (
                            <div className="detail-hero__info">
                                <h1 className="detail-hero__title watch-title">
                                    <MovieLogo
                                        tmdbId={movieMeta.id || id}
                                        title={movieMeta.title}
                                        maxHeight="60px"
                                    />
                                </h1>

                                {/* Meta row: year · rating · cert · HD */}
                                <div className="detail-hero__meta">
                                    {movieMeta.release_date && <span>{movieMeta.release_date}</span>}
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

                                {/* Play button */}
                                <button className="detail-play-btn" onClick={() => navigate(`/play/${id}`)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                    Play
                                </button>
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
