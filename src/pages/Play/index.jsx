/**
 * Play.jsx  ─ Dedicated Player Page "/play/:id"
 * ═══════════════════════════════════════════════════════════════
 * Supports both Movies and TV Series.
 * TV series: fetches seasons/episodes from TMDB, shows season
 * toggle, episode list panel, and auto-next episode.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MOOD_MOVIES } from '@/data/moodData';
import { useUserMovies } from '@/hooks/useUserMovies';
import { fetchTMDB } from '@/api/tmdbClient';
import { TMDB_API_KEY, STREAM_PROVIDERS, TMDB_IMAGE_BASE } from '@/config/constants';
import '@/components/common/Loading/styles.css';
import './styles.css';

const provider = STREAM_PROVIDERS[0];


const Play = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'movie';
    const isTV = type === 'tv';

    /* ── Common state ── */
    const [title, setTitle] = useState('Loading...');
    const [playerReady, setPlayerReady] = useState(false);
    const [playerError, setPlayerError] = useState(false);
    const [isUnreleasedTitle, setIsUnreleasedTitle] = useState(false);
    const [showSlowWarning, setShowSlowWarning] = useState(false);
    const slowTimer = useRef(null);
    const { addToContinueWatching, addWatchTime } = useUserMovies();

    /* ── Tracking watch time ── */
    const watchStartTime = useRef(null);

    /* ── TV-only state ── */
    const [seasons, setSeasons] = useState([]);           // list of season objects from TMDB
    const [activeSeason, setActiveSeason] = useState(1);
    const [episodes, setEpisodes] = useState([]);         // episodes for activeSeason
    const [activeEpisode, setActiveEpisode] = useState(1);
    const [episodeMeta, setEpisodeMeta] = useState(null); // currently playing episode details

    /* ── Embed URL ── */
    const embedUrl = isTV
        ? provider.tvUrl(id, activeSeason, activeEpisode)
        : provider.movieUrl(id);

    /* ── Fetch title ── */
    useEffect(() => {
        const local = MOOD_MOVIES.find(m => m.id === Number(id));
        if (local) {
            setTitle(local.title || local.name);
            addToContinueWatching(local);
            return;
        }
        fetchTMDB(`/${type}/${id}`).then(data => {
            if (data) {
                const releaseDate = data.release_date || data.first_air_date;
                const isUnreleased = releaseDate && releaseDate > new Date().toISOString().split('T')[0];
                
                if (isUnreleased) {
                    setIsUnreleasedTitle(true);
                    setPlayerError(true);
                    setPlayerReady(true);
                }

                const t = data.title || data.name;
                setTitle(t);
                addToContinueWatching(data);

                if (isTV) {
                    // Filter to only regular seasons (season_number > 0)
                    const regularSeasons = (data.seasons || []).filter(s => s.season_number > 0);
                    setSeasons(regularSeasons);
                }
            }
        });
    }, [id, type]);

    /* ── Fetch episodes when activeSeason changes (TV only) ── */
    useEffect(() => {
        if (!isTV) return;
        fetchTMDB(`/tv/${id}/season/${activeSeason}`).then(data => {
            if (data?.episodes) {
                setEpisodes(data.episodes);
                // Set current episode meta
                const ep = data.episodes.find(e => e.episode_number === activeEpisode);
                setEpisodeMeta(ep || data.episodes[0] || null);
            }
        });
    }, [id, isTV, activeSeason]);

    /* ── Update episode meta when activeEpisode changes ── */
    useEffect(() => {
        if (!isTV || !episodes.length) return;
        const ep = episodes.find(e => e.episode_number === activeEpisode);
        if (ep) setEpisodeMeta(ep);
    }, [activeEpisode, episodes, isTV]);

    /* ── Player lifecycle ── */
    useEffect(() => {
        setPlayerReady(false);
        setPlayerError(false);
        setShowSlowWarning(false);
        clearTimeout(slowTimer.current);

        // Reset tracking timer when embed URL changes
        watchStartTime.current = null;

        slowTimer.current = setTimeout(() => setShowSlowWarning(true), 10000);
        return () => clearTimeout(slowTimer.current);
    }, [embedUrl]);

    // Timer logic on mount/unmount context
    useEffect(() => {
        return () => {
            // When user navigates away or unmounts, report the accumulated time
            if (watchStartTime.current) {
                const endTime = Date.now();
                const durationSeconds = Math.floor((endTime - watchStartTime.current) / 1000);
                if (durationSeconds > 0) {
                    addWatchTime(durationSeconds);
                }
                watchStartTime.current = null;
            }
        };
    }, []);

    const handleLoad = () => {
        setPlayerReady(true);
        setShowSlowWarning(false);
        clearTimeout(slowTimer.current);

        // Start timing once the player iframe actually loads!
        if (!watchStartTime.current) {
            watchStartTime.current = Date.now();
        }
    };

    /* ── Auto-next episode ── */
    const goNextEpisode = useCallback(() => {
        const nextEp = episodes.find(e => e.episode_number === activeEpisode + 1);
        if (nextEp) {
            setActiveEpisode(nextEp.episode_number);
        } else {
            // Move to next season if available
            const currentSeasonIdx = seasons.findIndex(s => s.season_number === activeSeason);
            if (currentSeasonIdx < seasons.length - 1) {
                const nextSeason = seasons[currentSeasonIdx + 1];
                setActiveSeason(nextSeason.season_number);
                setActiveEpisode(1);
            }
        }
    }, [activeEpisode, episodes, activeSeason, seasons]);

    /* ── Switch season ── */
    const handleSeasonSelect = (seasonNum) => {
        setActiveSeason(seasonNum);
        setActiveEpisode(1);
    };

    /* ── Switch episode ── */
    const handleEpisodeSelect = (epNum) => {
        setActiveEpisode(epNum);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentEpisodeIdx = episodes.findIndex(e => e.episode_number === activeEpisode);
    const hasNextEpisode = currentEpisodeIdx >= 0 && currentEpisodeIdx < episodes.length - 1;
    const hasNextSeason = seasons.findIndex(s => s.season_number === activeSeason) < seasons.length - 1;
    const canGoNext = isTV && (hasNextEpisode || hasNextSeason);

    return (
        <div className="page-wrapper">

            {/* ── Breadcrumb bar ── */}
            <div className="play-topbar">
                <nav className="play-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/" className="play-breadcrumb__link">Home</Link>
                    <span className="play-breadcrumb__sep">&gt;</span>
                    <Link to={`/watch/${id}?type=${type}`} className="play-breadcrumb__link">{title}</Link>
                    {isTV && (
                        <>
                            <span className="play-breadcrumb__sep">&gt;</span>
                            <span className="play-breadcrumb__current">
                                S{activeSeason} E{activeEpisode}
                                {episodeMeta?.name ? ` — ${episodeMeta.name}` : ''}
                            </span>
                        </>
                    )}
                    {!isTV && (
                        <>
                            <span className="play-breadcrumb__sep">&gt;</span>
                            <span className="play-breadcrumb__current">{title}</span>
                        </>
                    )}
                </nav>

                {/* Auto-next button (TV only) */}
                {isTV && canGoNext && (
                    <button className="play-next-btn" onClick={goNextEpisode}>
                        Next Episode
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ── Main layout: player + episode panel ── */}
            <div className={`play-layout ${isTV ? 'play-layout--with-panel' : ''}`}>

                {/* ── Player ── */}
                <section className="play-player-section" aria-label={isTV ? 'Episode Player' : 'Movie Player'}>
                    <div className="play-player-wrap">
                        {/* Loading shimmer */}
                        {!playerReady && !playerError && (
                            <div className="play-player-shimmer">
                                <div className="loading-center">
                                    <div className="spinner" />
                                    <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginTop: 8 }}>
                                        Loading <strong style={{ color: 'var(--c-text)' }}>{provider.label}</strong>...
                                    </p>
                                    {showSlowWarning && (
                                        <div className="play-slow-warning">
                                            <p>Taking too long? We're experiencing high traffic.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error fallback */}
                        {playerError && (
                            <div className="play-player-error">
                                {isUnreleasedTitle ? (
                                    <>
                                        <p style={{ color: 'var(--c-text)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '8px' }}>Not Yet Released</p>
                                        <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 360 }}>
                                            This title has not been released yet. Please check back after its official release date.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ color: 'var(--c-text)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>Stream failed to load</p>
                                        <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: 360 }}>
                                            {provider.label} couldn't serve this title right now.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {!isUnreleasedTitle && (
                            <iframe
                                key={embedUrl}
                                src={embedUrl}
                                title={isTV ? `${title} S${activeSeason}E${activeEpisode}` : `Watch ${title}`}
                                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; web-share"
                                referrerPolicy="no-referrer-when-downgrade"
                                scrolling="no"
                                onLoad={handleLoad}
                                onError={() => { setPlayerError(true); setPlayerReady(true); }}
                                className={`play-iframe ${playerReady ? 'play-iframe--ready' : ''}`}
                            />
                        )}
                    </div>
                </section>

                {/* ── TV Episode Panel ── */}
                {isTV && (
                    <aside className="play-episode-panel">
                        {/* Panel header */}
                        <div className="play-panel-header">
                            <span>Episodes</span>
                        </div>

                        {/* Season tabs */}
                        {seasons.length > 0 && (
                            <div className="play-season-tabs">
                                {seasons.map(s => (
                                    <button
                                        key={s.season_number}
                                        className={`play-season-tab ${activeSeason === s.season_number ? 'active' : ''}`}
                                        onClick={() => handleSeasonSelect(s.season_number)}
                                    >
                                        S{s.season_number}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Episode list */}
                        <div className="play-episode-list">
                            {episodes.length === 0 ? (
                                <div className="play-episode-loading">
                                    <div className="spinner" style={{ width: 24, height: 24 }} />
                                </div>
                            ) : (
                                episodes.map(ep => (
                                    <button
                                        key={ep.episode_number}
                                        className={`play-episode-item ${activeEpisode === ep.episode_number ? 'active' : ''}`}
                                        onClick={() => handleEpisodeSelect(ep.episode_number)}
                                    >
                                        {ep.still_path ? (
                                            <img
                                                src={`${TMDB_IMAGE_BASE}${ep.still_path}`}
                                                alt={ep.name}
                                                className="play-episode-thumb"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="play-episode-thumb play-episode-thumb--placeholder">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                            </div>
                                        )}
                                        <div className="play-episode-info">
                                            <span className="play-episode-num">E{ep.episode_number}</span>
                                            <span className="play-episode-name">{ep.name}</span>
                                            {ep.runtime && (
                                                <span className="play-episode-runtime">{ep.runtime} min</span>
                                            )}
                                        </div>
                                        {activeEpisode === ep.episode_number && (
                                            <span className="play-episode-playing">▶</span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                    </aside>
                )}
            </div>
        </div>
    );
};

export default Play;
