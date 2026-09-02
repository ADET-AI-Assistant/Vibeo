import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, SkipForward } from 'lucide-react';
import { fetchTMDB } from '@/api/tmdbClient';
import { STREAM_PROVIDERS } from '@/config/constants';
import { useUserMovies } from '@/hooks/useUserMovies';
import { useTVFocus, useTVFocusable } from '../context/TVFocusContext';

const provider = STREAM_PROVIDERS[0];

const PlayerButton = ({ id, label, icon: Icon, onClick, isLarge = false, autoFocus = false }) => {
    const { ref, isFocused } = useTVFocusable({
        id,
        zone: 'player-osd',
        onSelect: onClick,
        autoFocus,
    });

    return (
        <button
            ref={ref}
            className={`tv-player-btn ${isLarge ? 'tv-player-btn--large' : ''} tv-focusable ${isFocused ? 'tv-focused' : ''}`}
            onClick={onClick}
            title={label}
            data-testid={id}
        >
            <Icon size={isLarge ? 32 : 22} strokeWidth={2.4} />
        </button>
    );
};

export const TVPlay = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'movie';
    const isTV = type === 'tv';

    const [title, setTitle] = useState('Loading...');
    const [activeSeason, setActiveSeason] = useState(1);
    const [activeEpisode, setActiveEpisode] = useState(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showOSD, setShowOSD] = useState(true);
    const [seekFeedback, setSeekFeedback] = useState(null);

    const osdTimerRef = useRef(null);
    const seekTimerRef = useRef(null);
    const { addToContinueWatching } = useUserMovies();
    const { setZoneConfig, registerBackHandler, focusItem } = useTVFocus();

    const embedUrl = isTV
        ? provider.tvUrl(id, activeSeason, activeEpisode)
        : provider.movieUrl(id);

    // Register player-osd zone
    useEffect(() => {
        setZoneConfig('player-osd', {
            type: 'horizontal',
            orderIndex: 0,
        });
    }, [setZoneConfig]);

    // Handle remote Back button
    useEffect(() => {
        const unregister = registerBackHandler(() => {
            navigate(`/tv/watch/${id}?type=${type}`);
            return true; // Handled
        });
        return unregister;
    }, [id, type, navigate, registerBackHandler]);

    // Fetch movie/series details
    useEffect(() => {
        fetchTMDB(`/${type}/${id}`).then(data => {
            if (data) {
                const t = data.title || data.name;
                setTitle(t);
                addToContinueWatching(data);
            }
        });
    }, [id, type, addToContinueWatching]);

    // Auto-hide OSD after 4s
    const resetOSDTimer = useCallback(() => {
        setShowOSD(true);
        clearTimeout(osdTimerRef.current);
        osdTimerRef.current = setTimeout(() => {
            setShowOSD(false);
        }, 4000);
    }, []);

    useEffect(() => {
        resetOSDTimer();
        return () => clearTimeout(osdTimerRef.current);
    }, [resetOSDTimer]);

    // Remote Seek & Play Controls
    const handleSeek = (direction) => {
        resetOSDTimer();
        const label = direction === 'forward' ? '+10s ⏩' : '⏪ -10s';
        setSeekFeedback(label);
        clearTimeout(seekTimerRef.current);
        seekTimerRef.current = setTimeout(() => setSeekFeedback(null), 1200);
    };

    const handleTogglePlay = () => {
        resetOSDTimer();
        setIsPlaying(prev => !prev);
    };

    const handleBack = () => {
        navigate(`/tv/watch/${id}?type=${type}`);
    };

    // Wake up OSD on mouse or key activity
    useEffect(() => {
        const handleActivity = (e) => {
            resetOSDTimer();
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                setShowOSD(true);
            }
        };

        window.addEventListener('keydown', handleActivity);
        window.addEventListener('mousemove', handleActivity);

        return () => {
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('mousemove', handleActivity);
        };
    }, [resetOSDTimer]);

    return (
        <div className="tv-player-container">
            {/* Stream Iframe */}
            <iframe
                src={embedUrl}
                title={title}
                className="tv-player-iframe"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
            />

            {/* Quick Seek Feedback Notification */}
            {seekFeedback && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0,0,0,0.85)',
                        border: '2px solid var(--c-accent)',
                        padding: '16px 36px',
                        borderRadius: '20px',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        color: '#fff',
                        zIndex: 2000,
                        boxShadow: '0 0 30px var(--c-accent-glow)',
                    }}
                >
                    {seekFeedback}
                </div>
            )}

            {/* Remote OSD HUD */}
            <div className={`tv-player-osd ${showOSD ? '' : 'tv-osd--hidden'}`}>
                {/* Topbar */}
                <div className="tv-player-topbar">
                    <button
                        className="tv-btn"
                        style={{ padding: '10px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)' }}
                        onClick={handleBack}
                    >
                        <ArrowLeft size={20} />
                        <span>Back (Esc)</span>
                    </button>

                    <h1 className="tv-player-title">
                        {title} {isTV && `— S${activeSeason} E${activeEpisode}`}
                    </h1>

                    <div style={{ width: '100px' }} />
                </div>

                {/* Bottom Center Controls */}
                <div className="tv-player-controls">
                    <div className="tv-player-actions">
                        <PlayerButton
                            id="player-seek-back"
                            label="Seek -10s"
                            icon={RotateCcw}
                            onClick={() => handleSeek('backward')}
                        />

                        <PlayerButton
                            id="player-play-pause"
                            label={isPlaying ? 'Pause' : 'Play'}
                            icon={isPlaying ? Pause : Play}
                            onClick={handleTogglePlay}
                            isLarge={true}
                            autoFocus={true}
                        />

                        <PlayerButton
                            id="player-seek-fwd"
                            label="Seek +10s"
                            icon={RotateCw}
                            onClick={() => handleSeek('forward')}
                        />

                        {isTV && (
                            <PlayerButton
                                id="player-next-ep"
                                label="Next Episode"
                                icon={SkipForward}
                                onClick={() => {
                                    setActiveEpisode(prev => prev + 1);
                                    resetOSDTimer();
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TVPlay;
