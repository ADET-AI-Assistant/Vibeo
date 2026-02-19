/**
 * Watch.jsx  ─ Watch Page "/watch/:id"
 * ═══════════════════════════════════════════════════════════════
 * Streams the selected movie via Videasy iframe (default).
 * Falls back to alternate providers if Videasy is unavailable.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '../components/Header';
import StatusCard from '../components/StatusCard';
import MovieRow from '../components/MovieRow';
import MovieLogo from '../components/MovieLogo';
import { MOOD_MOVIES } from '../data/moodData';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BD_BASE = 'https://image.tmdb.org/t/p/original';

/* ── Stream providers — Videasy first, fallbacks below ── */
const PROVIDERS = [
    { key: 'videasy', label: 'Videasy', url: (id) => `https://player.videasy.net/movie/${id}` },
    { key: 'vidsrc', label: 'VidSrc', url: (id) => `https://vidsrc.to/embed/movie/${id}` },
    { key: '2embed', label: '2Embed', url: (id) => `https://www.2embed.cc/embed/${id}` },
];

const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    /* ── Provider switcher ── */
    const [providerIdx, setProviderIdx] = useState(0);
    const provider = PROVIDERS[providerIdx];
    const embedUrl = provider.url(id);

    /* ── iframe load state ── */
    const [playerReady, setPlayerReady] = useState(false);
    const [playerError, setPlayerError] = useState(false);
    const [showSlowWarning, setShowSlowWarning] = useState(false);
    const slowTimer = useRef(null);

    /* Reset state + start 10-sec slow-load timer whenever provider/id changes */
    useEffect(() => {
        setPlayerReady(false);
        setPlayerError(false);
        setShowSlowWarning(false);
        clearTimeout(slowTimer.current);
        slowTimer.current = setTimeout(() => setShowSlowWarning(true), 10000);
        return () => clearTimeout(slowTimer.current);
    }, [id, providerIdx]);

    const handleLoad = () => {
        setPlayerReady(true);
        setShowSlowWarning(false);
        clearTimeout(slowTimer.current);
    };

    const switchProvider = () => {
        setProviderIdx(i => (i + 1) % PROVIDERS.length);
    };

    /* ── useState: info panel visibility toggle ── */
    const [showInfo, setShowInfo] = useState(true);

    const [movieMeta, setMovieMeta] = useState(null);
    const [similar, setSimilar] = useState([]);

    // ── Fetch movie metadata ──────────────────────────────────
    useEffect(() => {
        setPlayerReady(false);
        setMovieMeta(null);

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

    const backdropUrl = movieMeta?.backdrop_path
        ? `${TMDB_BD_BASE}${movieMeta.backdrop_path}` : null;

    return (
        <div className="page-wrapper">
            <Header subtitle={movieMeta ? `Watching: ${movieMeta.title}` : 'Loading…'} />

            <main>
                {/* ══════════════════════════════════════════════
            PLAYER SECTION — full width
        ══════════════════════════════════════════════ */}
                <section className="watch-player-section" aria-label="Movie Player">
                    <div className="watch-player-wrap">
                        {/* Loading shimmer */}
                        {!playerReady && !playerError && (
                            <div className="watch-player-shimmer skeleton">
                                <div className="loading-center">
                                    <div className="spinner" />
                                    <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginTop: 8 }}>
                                        Connecting via <strong style={{ color: 'var(--c-text)' }}>{provider.label}</strong>…
                                    </p>
                                    {/* Slow-load warning after 10 s */}
                                    {showSlowWarning && (
                                        <div className="watch-slow-warning">
                                            <p>Taking too long? Try a different source.</p>
                                            <button className="watch-switch-btn" onClick={switchProvider}>
                                                Switch to {PROVIDERS[(providerIdx + 1) % PROVIDERS.length].label} ↗
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error fallback */}
                        {playerError && (
                            <div className="watch-player-error">
                                <span style={{ fontSize: '2.5rem' }}>⚠️</span>
                                <p style={{ color: 'var(--c-text)', fontWeight: 700 }}>Stream failed to load</p>
                                <p style={{ color: 'var(--c-muted)', fontSize: '0.82rem', textAlign: 'center', maxWidth: 320 }}>
                                    {provider.label} couldn't serve this title right now.
                                </p>
                                <button className="watch-switch-btn" onClick={switchProvider}>
                                    Try {PROVIDERS[(providerIdx + 1) % PROVIDERS.length].label} instead ↗
                                </button>
                            </div>
                        )}

                        <iframe
                            key={embedUrl}
                            src={embedUrl}
                            title={movieMeta ? `Watch ${movieMeta.title}` : 'Movie Player'}
                            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; web-share"
                            referrerPolicy="no-referrer-when-downgrade"
                            scrolling="no"
                            onLoad={handleLoad}
                            onError={() => { setPlayerError(true); setPlayerReady(true); }}
                            className={`watch-iframe ${playerReady ? 'watch-iframe--ready' : ''}`}
                        />
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
            BELOW-PLAYER AREA: back btn + title + info
        ══════════════════════════════════════════════ */}
                <div className="watch-below">

                    {/* ── Provider pills + action row ── */}
                    <div className="watch-action-row">
                        <button className="watch-back-btn" onClick={() => navigate('/')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <polyline points="19 12 5 12" />
                                <polyline points="12 5 5 12 12 19" />
                            </svg>
                            Back
                        </button>

                        {/* Source pills */}
                        <div className="watch-provider-pills">
                            {PROVIDERS.map((p, i) => (
                                <button
                                    key={p.key}
                                    className={`watch-provider-pill ${i === providerIdx ? 'active' : ''}`}
                                    onClick={() => setProviderIdx(i)}
                                    title={`Stream via ${p.label}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <button
                            className={`watch-info-btn ${showInfo ? 'active' : ''}`}
                            onClick={() => setShowInfo(p => !p)} /* ← useState toggle */
                        >
                            {showInfo ? 'Hide Details' : 'Show Details'}
                        </button>
                    </div>

                    {/* ── Movie title row ── */}
                    {movieMeta && (
                        <div className="watch-title-row">
                            <h1 className="watch-title">
                                <MovieLogo
                                    tmdbId={movieMeta.id || id}
                                    title={movieMeta.title}
                                    maxHeight="80px"
                                />
                            </h1>
                            <div className="watch-meta">
                                {movieMeta.release_date && (
                                    <span>{movieMeta.release_date.substring(0, 4)}</span>
                                )}
                                {movieMeta.runtime && (
                                    <span>{movieMeta.runtime} min</span>
                                )}
                                {movieMeta.vote_average > 0 && (
                                    <span className="watch-rating">
                                        ⭐ {Number(movieMeta.vote_average).toFixed(1)}
                                    </span>
                                )}
                                <span className="hd-pill">HD</span>
                            </div>
                        </div>
                    )}

                    {/* ── Info panel (toggled by showInfo state) ── */}
                    {showInfo && movieMeta && (
                        <div className="watch-info-grid fade-in-up">

                            {/* Left: overview + genres */}
                            <div className="watch-info-left">
                                {movieMeta.tagline && (
                                    <p className="watch-tagline">"{movieMeta.tagline}"</p>
                                )}
                                {movieMeta.overview && (
                                    <p className="watch-overview">{movieMeta.overview}</p>
                                )}
                                {/* Genre pills via .map() [MAP-RENDER] */}
                                {movieMeta.genres?.length > 0 && (
                                    <div className="watch-genres">
                                        {movieMeta.genres.map(g => (
                                            <span key={g.id} className="genre-pill">{g.name}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: stat cards via .map() [MAP-RENDER] */}
                            <div className="watch-stats">
                                {[
                                    { icon: '⭐', label: 'Rating', value: movieMeta.vote_average ? `${Number(movieMeta.vote_average).toFixed(1)} / 10` : 'N/A', color: 'rgba(245,158,11,0.2)' },
                                    { icon: '📅', label: 'Released', value: movieMeta.release_date || 'N/A', color: 'rgba(168,85,247,0.2)' },
                                    { icon: '⏱️', label: 'Runtime', value: movieMeta.runtime ? `${movieMeta.runtime} min` : 'N/A', color: 'rgba(59,130,246,0.2)' },
                                    { icon: '💰', label: 'Revenue', value: movieMeta.revenue ? `$${(movieMeta.revenue / 1e6).toFixed(0)}M` : 'N/A', color: 'rgba(16,185,129,0.2)' },
                                ].map(s => (
                                    <StatusCard
                                        key={s.label}
                                        icon={s.icon}
                                        label={s.label}
                                        value={s.value}
                                        color={s.color}
                                    />
                                ))}
                            </div>

                        </div>
                    )}

                    {/* ── Similar Movies carousel ── */}
                    {similar.length > 0 && (
                        <MovieRow
                            title="More Like This"
                            icon="🎬"
                            movies={similar}
                            onCardClick={(m) => navigate(`/watch/${m.id}`)}
                        />
                    )}

                    {/* Attribution */}
                    <p className="watch-attribution">
                        Streaming via <a href="https://videasy.net" target="_blank" rel="noopener noreferrer">Videasy</a>
                        &nbsp;·&nbsp; TMDB ID: <code>{id}</code>
                    </p>
                </div>
            </main>

            <footer className="site-footer">
                <div className="site-footer__inner">
                    <span className="site-footer__logo">VibeReel</span>
                    <p>AppDev Lab 3 · Streaming via Videasy · Data from TMDB</p>
                    <p>© 2026 VibeReel</p>
                </div>
            </footer>
        </div>
    );
};

export default Watch;
