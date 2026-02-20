/**
 * Watch.jsx  ─ Movie Detail / Watch Page "/watch/:id"
 * ═══════════════════════════════════════════════════════════════
 * Cinematic detail page with backdrop hero, poster, metadata,
 * and an embedded player that appears when the user hits "Play".
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '../components/Header';
import MovieRow from '../components/MovieRow';
import MovieLogo from '../components/MovieLogo';
import { MOOD_MOVIES } from '../data/moodData';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_BD = 'https://image.tmdb.org/t/p/original';


const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    /* ── State ── */
    const [movieMeta, setMovieMeta] = useState(null);
    const [similar, setSimilar] = useState([]);

    /* ── Fetch movie data ── */
    useEffect(() => {
        setMovieMeta(null);
        setSimilar([]);

        const local = MOOD_MOVIES.find(m => m.id === Number(id));
        if (local) { setMovieMeta(local); return; }

        const fetchAll = async () => {
            try {
                const [metaRes, simRes] = await Promise.all([
                    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`),
                    fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${TMDB_API_KEY}&language=en-US`),
                ]);
                if (metaRes.ok) setMovieMeta(await metaRes.json());
                if (simRes.ok) setSimilar((await simRes.json()).results?.slice(0, 12) || []);
            } catch (_) { }
        };
        fetchAll();
    }, [id]);

    /* ── Derived data ── */
    const backdropUrl = movieMeta?.backdrop_path ? `${TMDB_BD}${movieMeta.backdrop_path}` : null;
    const posterUrl = movieMeta?.poster_path ? `${TMDB_IMG}${movieMeta.poster_path}` : null;
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
                                <h1 className="detail-hero__title">
                                    <MovieLogo
                                        tmdbId={movieMeta.id || id}
                                        title={movieMeta.title}
                                        maxHeight="90px"
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
                        {!movieMeta && (
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

            <footer className="site-footer">
                <div className="site-footer__inner">
                    <span className="site-footer__logo">VibeReel</span>
                    <p>Streaming via Videasy · Data from TMDB</p>
                    <p>&copy; 2026 VibeReel</p>
                </div>
            </footer>
        </div>
    );
};

export default Watch;
