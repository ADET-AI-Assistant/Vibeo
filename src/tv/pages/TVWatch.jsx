import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Plus, Check, ArrowLeft, Star, Film } from 'lucide-react';
import { useMovieDetail } from '@/hooks/useMovieDetail';
import { useUserMovies } from '@/hooks/useUserMovies';
import { useTVFocus, useTVFocusable } from '../context/TVFocusContext';
import TVMovieRow from '../components/TVMovieRow';
import { TMDB_IMAGE_BASE, TMDB_BACKDROP_BASE } from '@/config/constants';
import { triggerError } from '@/components/common/ErrorToast';
import { tvAudio } from '../utils/tvAudio';

const DetailButton = ({ id, label, icon: Icon, onClick, isPrimary = false, autoFocus = false }) => {
    const { ref, isFocused } = useTVFocusable({
        id,
        zone: 'watch-actions',
        onSelect: onClick,
        autoFocus,
    });

    return (
        <button
            ref={ref}
            className={`tv-btn ${isPrimary ? 'tv-btn--primary' : ''} tv-focusable ${isFocused ? 'tv-focused' : ''}`}
            onClick={onClick}
        >
            <Icon size={20} strokeWidth={2.4} />
            <span>{label}</span>
        </button>
    );
};

export const TVWatch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'movie';

    const { movie, similar, loading } = useMovieDetail(id, type);
    const { isWatchlisted, toggleWatchlist } = useUserMovies();
    const { setZoneConfig } = useTVFocus();

    React.useEffect(() => {
        setZoneConfig('watch-actions', {
            type: 'horizontal',
            orderIndex: 0,
        });
    }, [setZoneConfig]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ fontSize: '1.4rem', color: 'var(--c-text2)', fontWeight: 600 }}>Loading Title...</div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <h2>Title not found</h2>
                <button className="tv-btn" onClick={() => navigate('/tv')}>Back to Home</button>
            </div>
        );
    }

    const displayTitle = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? releaseDate.substring(0, 4) : '';
    const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
    const backdropUrl = movie.backdrop_path ? `${TMDB_BACKDROP_BASE}${movie.backdrop_path}` : null;
    const inWatchlist = isWatchlisted(movie.id);

    const handlePlay = () => {
        navigate(`/tv/play/${id}?type=${type}`);
    };

    const handleToggleWatchlist = async () => {
        tvAudio.playSelect();
        const willBeAdded = !inWatchlist;
        await toggleWatchlist(movie);
        triggerError(
            willBeAdded
                ? `Added "${displayTitle}" to Watchlist`
                : `Removed "${displayTitle}" from Watchlist`,
            'success'
        );
    };

    return (
        <div className="tv-watch-page">
            {/* Backdrop Hero Header */}
            <div
                style={{
                    position: 'relative',
                    height: '520px',
                    borderRadius: '28px',
                    overflow: 'hidden',
                    marginBottom: '40px',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                {backdropUrl && (
                    <img
                        src={backdropUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }}
                    />
                )}
                <div className="tv-hero__overlay" />

                <div
                    style={{
                        position: 'absolute',
                        bottom: '48px',
                        left: '48px',
                        maxWidth: '750px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        zIndex: 10,
                    }}
                >
                    <div className="tv-hero__badge-row">
                        {rating && <span className="tv-badge tv-badge--rating">★ {rating}</span>}
                        <span className="tv-badge tv-badge--hd">4K UHD</span>
                        {year && <span className="tv-badge">{year}</span>}
                        {movie.runtime && <span className="tv-badge">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
                    </div>

                    <h1 style={{ fontSize: '3.2rem', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.1 }}>
                        {displayTitle}
                    </h1>

                    {movie.genres && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {movie.genres.map(g => (
                                <span
                                    key={g.id}
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: 'rgba(255,255,255,0.12)',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {g.name}
                                </span>
                            ))}
                        </div>
                    )}

                    <p style={{ fontSize: '1.15rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.85)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {movie.overview}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                        <DetailButton
                            id="watch-play"
                            label="Play Now"
                            icon={Play}
                            onClick={handlePlay}
                            isPrimary={true}
                            autoFocus={true}
                        />
                        <DetailButton
                            id="watch-watchlist"
                            label={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                            icon={inWatchlist ? Check : Plus}
                            onClick={handleToggleWatchlist}
                        />
                        <DetailButton
                            id="watch-back"
                            label="Back"
                            icon={ArrowLeft}
                            onClick={() => navigate('/tv')}
                        />
                    </div>
                </div>
            </div>

            {/* Similar Movies Carousel */}
            {similar && similar.length > 0 && (
                <TVMovieRow
                    id="similar"
                    title="More Like This"
                    movies={similar}
                    orderIndex={1}
                />
            )}
        </div>
    );
};

export default TVWatch;
