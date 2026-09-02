import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check } from 'lucide-react';
import { useTVFocus, useTVFocusable } from '../context/TVFocusContext';
import { useUserMovies } from '@/hooks/useUserMovies';
import { TMDB_BACKDROP_BASE } from '@/config/constants';
import { triggerError } from '@/components/common/ErrorToast';
import { tvAudio } from '../utils/tvAudio';

const HeroButton = ({ id, label, icon: Icon, onClick, isPrimary = false, autoFocus = false }) => {
    const { ref, isFocused } = useTVFocusable({
        id,
        zone: 'hero',
        onSelect: onClick,
        autoFocus,
    });

    return (
        <button
            ref={ref}
            className={`tv-btn ${isPrimary ? 'tv-btn--primary' : ''} tv-focusable ${isFocused ? 'tv-focused' : ''}`}
            onClick={onClick}
        >
            <Icon size={20} strokeWidth={2.5} />
            <span>{label}</span>
        </button>
    );
};

export const TVHeroBanner = ({ movie }) => {
    const navigate = useNavigate();
    const { setZoneConfig } = useTVFocus();
    const { isWatchlisted, toggleWatchlist } = useUserMovies();

    useEffect(() => {
        setZoneConfig('hero', {
            type: 'horizontal',
            orderIndex: 0,
        });
    }, [setZoneConfig]);

    if (!movie) return null;

    const displayTitle = movie.title || movie.name || 'Featured Title';
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? releaseDate.substring(0, 4) : '';
    const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
    const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');

    const backdropUrl = movie.backdrop_path
        ? `${TMDB_BACKDROP_BASE}${movie.backdrop_path}`
        : (movie.poster_path ? `${TMDB_BACKDROP_BASE}${movie.poster_path}` : null);

    const inWatchlist = isWatchlisted(movie.id);

    const handlePlay = () => {
        navigate(`/tv/play/${movie.id}?type=${mediaType}`);
    };

    const handleDetails = () => {
        navigate(`/tv/watch/${movie.id}?type=${mediaType}`);
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
        <section className="tv-hero" aria-label="Featured Spotlight">
            {backdropUrl && (
                <img
                    src={backdropUrl}
                    alt={displayTitle}
                    className="tv-hero__bg"
                />
            )}
            <div className="tv-hero__overlay" />

            <div className="tv-hero__content">
                <div className="tv-hero__badge-row">
                    {rating && <span className="tv-badge tv-badge--rating">★ {rating}</span>}
                    <span className="tv-badge tv-badge--hd">4K ULTRA HD</span>
                    {year && <span className="tv-badge">{year}</span>}
                </div>

                <h1 className="tv-hero__title">{displayTitle}</h1>

                {movie.overview && (
                    <p className="tv-hero__synopsis">{movie.overview}</p>
                )}

                <div className="tv-hero__actions">
                    <HeroButton
                        id="hero-play"
                        label="Play Now"
                        icon={Play}
                        onClick={handlePlay}
                        isPrimary={true}
                        autoFocus={true}
                    />
                    <HeroButton
                        id="hero-details"
                        label="Details"
                        icon={Info}
                        onClick={handleDetails}
                    />
                    <HeroButton
                        id="hero-watchlist"
                        label={inWatchlist ? 'In Watchlist' : 'Watchlist'}
                        icon={inWatchlist ? Check : Plus}
                        onClick={handleToggleWatchlist}
                    />
                </div>
            </div>
        </section>
    );
};

export default TVHeroBanner;
