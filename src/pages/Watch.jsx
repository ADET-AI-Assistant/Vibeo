/**
 * Watch.jsx  ─ Watch Page "/watch/:id"
 * ═══════════════════════════════════════════════════════════════
 * Streams the selected movie via the Videasy iframe embed API.
 *
 * Videasy embed URL pattern:
 *   https://player.videasy.net/movie/{tmdb_id}
 *
 * Lab Requirements demonstrated:
 *  ✅ Semantic HTML: <main>, <section>, <header> (back nav)
 *  ✅ useState – manages a "player ready" flag and info panel toggle
 *  ✅ useParams – reads the dynamic :id from the URL
 *  ✅ Reusable <Header> and <StatusCard> components with props
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '../components/Header';
import StatusCard from '../components/StatusCard';

// Combined TMDB + Mock data so we can look up movie metadata by ID
import { MOOD_MOVIES } from '../data/moodData';

const TMDB_API_KEY = '05a3f3071ad3fa222ab689fb62ed0df1';
const VIDEASY_BASE = 'https://player.videasy.net/movie';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const Watch = () => {
    const { id } = useParams();    // dynamic :id from the URL
    const navigate = useNavigate();

    /*
     * ── useState: track player load state ─────────────────────
     * When the iframe fires `onLoad`, we flip `playerReady` to
     * true and hide the loading overlay — a visible UI update.
     */
    const [playerReady, setPlayerReady] = useState(false);

    /*
     * ── useState: toggle the "Movie Info" side panel ──────────
     * Demonstrates a second independent interactive behaviour.
     */
    const [showInfo, setShowInfo] = useState(true);

    // Movie metadata fetched from TMDB (live) or from the mock array
    const [movieMeta, setMovieMeta] = useState(null);

    // ── Look up metadata ──────────────────────────────────────
    useEffect(() => {
        // First check if the movie exists in our local mock data
        const localMatch = MOOD_MOVIES.find((m) => m.id === Number(id));
        if (localMatch) {
            setMovieMeta(localMatch);
            return;
        }

        // Otherwise fetch from TMDB
        const fetchMeta = async () => {
            try {
                const res = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`
                );
                if (res.ok) {
                    const data = await res.json();
                    setMovieMeta(data);
                }
            } catch (_) {
                // Silently fail – the player will still work
            }
        };

        fetchMeta();
    }, [id]);

    // ── Build Videasy iframe URL ──────────────────────────────
    const videasyUrl = `${VIDEASY_BASE}/${id}`;

    // ─────────────────────────────────────────────────────────
    return (
        <>
            {/* Reusable Header with a contextual subtitle prop */}
            <Header subtitle={movieMeta ? `Now Streaming: ${movieMeta.title}` : 'Loading stream…'} />

            <main
                className="max-w-7xl mx-auto px-6 py-8"
                style={{ minHeight: '80vh' }}
            >

                {/* ── Back navigation ── */}
                <div className="mb-5 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--vr-surface2)',
                            border: '1px solid var(--vr-border)',
                            borderRadius: 999,
                            padding: '8px 20px',
                            color: 'var(--vr-text)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(168,85,247,0.18)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--vr-surface2)'}
                    >
                        ← Back to Dashboard
                    </button>

                    {/* Show/hide movie info toggle — useState driven */}
                    <button
                        onClick={() => setShowInfo((prev) => !prev)}
                        style={{
                            background: showInfo ? 'rgba(168,85,247,0.18)' : 'var(--vr-surface2)',
                            border: '1px solid var(--vr-border)',
                            borderRadius: 999,
                            padding: '8px 20px',
                            color: showInfo ? '#a855f7' : 'var(--vr-muted)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        {showInfo ? '🎬 Hide Info' : '🎬 Show Info'}
                    </button>
                </div>

                {/* ── Two-column layout: player + optional info panel ── */}
                <div
                    className="flex gap-6 flex-wrap"
                    style={{ alignItems: 'flex-start' }}
                >

                    {/* ══════════════════════════════════════════════
              LEFT COLUMN – Videasy iframe player
          ══════════════════════════════════════════════ */}
                    <section
                        aria-label="Movie Player"
                        style={{ flex: showInfo ? '1 1 60%' : '1 1 100%', minWidth: 300 }}
                    >
                        {/* Aspect-ratio wrapper */}
                        <div className="player-wrapper">
                            {/* Loading shimmer overlay — hidden once iframe fires onLoad */}
                            {!playerReady && (
                                <div
                                    className="skeleton"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        zIndex: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 'var(--vr-card-radius)',
                                    }}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="spinner" />
                                        <p style={{ color: 'var(--vr-muted)', fontSize: '0.85rem' }}>
                                            Connecting to stream…
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/*
                Videasy embed iframe.
                `allowFullScreen` lets the user go fullscreen.
                `onLoad` sets playerReady → true (useState update).
              */}
                            <iframe
                                src={videasyUrl}
                                title={movieMeta ? `Watch ${movieMeta.title}` : 'Movie Player'}
                                allowFullScreen
                                allow="autoplay; fullscreen; picture-in-picture"
                                onLoad={() => setPlayerReady(true)} /* ← useState setter */
                                style={{ opacity: playerReady ? 1 : 0, transition: 'opacity 0.5s' }}
                            />
                        </div>

                        {/* Attribution note */}
                        <p
                            style={{
                                marginTop: '0.75rem',
                                fontSize: '0.7rem',
                                color: 'var(--vr-muted)',
                                textAlign: 'center',
                            }}
                        >
                            Powered by{' '}
                            <a
                                href="https://videasy.net"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--vr-accent)' }}
                            >
                                Videasy
                            </a>{' '}
                            · TMDB ID: {id}
                        </p>
                    </section>

                    {/* ══════════════════════════════════════════════
              RIGHT COLUMN – Movie Info Panel
              Toggled by showInfo state [Lab 3, Task 3]
          ══════════════════════════════════════════════ */}
                    {showInfo && (
                        <section
                            aria-label="Movie Information"
                            className="fade-in-up"
                            style={{ flex: '1 1 280px', maxWidth: 340 }}
                        >
                            {movieMeta ? (
                                <div className="flex flex-col gap-4">

                                    {/* Poster */}
                                    {movieMeta.poster_path && (
                                        <img
                                            src={`${TMDB_IMG_BASE}${movieMeta.poster_path}`}
                                            alt={`${movieMeta.title} poster`}
                                            style={{
                                                width: '100%',
                                                borderRadius: 'var(--vr-card-radius)',
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                            }}
                                        />
                                    )}

                                    {/* Title */}
                                    <div>
                                        <h1
                                            style={{
                                                fontSize: '1.3rem',
                                                fontWeight: 800,
                                                lineHeight: 1.2,
                                                marginBottom: '0.4rem',
                                            }}
                                        >
                                            {movieMeta.title}
                                        </h1>
                                        {movieMeta.tagline && (
                                            <p style={{ color: 'var(--vr-accent)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                                "{movieMeta.tagline}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Stats row via .map() – [MAP-RENDER] */}
                                    <div className="flex flex-col gap-2">
                                        {[
                                            {
                                                icon: '⭐', label: 'Rating',
                                                value: movieMeta.vote_average
                                                    ? `${Number(movieMeta.vote_average).toFixed(1)} / 10`
                                                    : 'N/A',
                                                color: 'rgba(245,158,11,0.18)',
                                            },
                                            {
                                                icon: '📅', label: 'Released',
                                                value: movieMeta.release_date || 'N/A',
                                                color: 'rgba(168,85,247,0.18)',
                                            },
                                            {
                                                icon: '⏱️', label: 'Runtime',
                                                value: movieMeta.runtime ? `${movieMeta.runtime} min` : 'N/A',
                                                color: 'rgba(59,130,246,0.18)',
                                            },
                                            {
                                                icon: '💰', label: 'Revenue',
                                                value: movieMeta.revenue
                                                    ? `$${(movieMeta.revenue / 1e6).toFixed(0)}M`
                                                    : 'N/A',
                                                color: 'rgba(16,185,129,0.18)',
                                            },
                                        ].map((stat) => (
                                            <StatusCard
                                                key={stat.label}
                                                icon={stat.icon}
                                                label={stat.label}
                                                value={stat.value}
                                                color={stat.color}
                                            />
                                        ))}
                                    </div>

                                    {/* Overview */}
                                    {movieMeta.overview && (
                                        <div
                                            style={{
                                                background: 'var(--vr-surface2)',
                                                border: '1px solid var(--vr-border)',
                                                borderRadius: 'var(--vr-radius)',
                                                padding: '1rem',
                                            }}
                                        >
                                            <p
                                                style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    color: 'var(--vr-muted)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em',
                                                    marginBottom: '0.5rem',
                                                }}
                                            >
                                                Synopsis
                                            </p>
                                            <p style={{ fontSize: '0.83rem', lineHeight: 1.6, color: '#c4c3cf' }}>
                                                {movieMeta.overview}
                                            </p>
                                        </div>
                                    )}

                                    {/* Genres rendered via .map() [MAP-RENDER] */}
                                    {movieMeta.genres && movieMeta.genres.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {movieMeta.genres.map((genre) => (
                                                <span
                                                    key={genre.id}
                                                    style={{
                                                        fontSize: '0.72rem',
                                                        background: 'rgba(168,85,247,0.12)',
                                                        border: '1px solid rgba(168,85,247,0.3)',
                                                        borderRadius: 999,
                                                        padding: '4px 12px',
                                                        color: '#a855f7',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {genre.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            ) : (
                                /* Loading skeleton for the info panel */
                                <div className="flex flex-col gap-3">
                                    {[280, 40, 80, 60, 200].map((h, i) => (
                                        <div
                                            key={i}
                                            className="skeleton"
                                            style={{ height: h, borderRadius: 'var(--vr-radius)' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                </div>
            </main>

            <footer
                style={{
                    borderTop: '1px solid var(--vr-border)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    color: 'var(--vr-muted)',
                    fontSize: '0.72rem',
                    marginTop: '3rem',
                }}
            >
                VibeReel · AppDev Lab 3 · Streaming via Videasy · Data from TMDB
            </footer>
        </>
    );
};

export default Watch;
