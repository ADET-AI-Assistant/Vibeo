import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTVFocusable } from '../context/TVFocusContext';
import { TMDB_IMAGE_BASE } from '@/config/constants';

const FALLBACK_POSTER = 'https://placehold.co/300x450/141424/6b6b8a?text=No+Poster';

export const TVMovieCard = React.memo(({ movie, zone = 'content', onFocus, onClick, autoFocus = false }) => {
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    if (!movie) return null;

    const displayTitle = movie.title || movie.name || 'Untitled';
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? releaseDate.substring(0, 4) : '';
    const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
    const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');

    const posterSrc = (!imgError && movie.poster_path)
        ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
        : FALLBACK_POSTER;

    const handleSelect = () => {
        if (onClick) {
            onClick(movie);
        } else {
            navigate(`/tv/watch/${movie.id}?type=${mediaType}`);
        }
    };

    const { ref, isFocused } = useTVFocusable({
        id: `tv-card-${zone}-${movie.id}`,
        zone,
        onSelect: handleSelect,
        onFocus: () => onFocus?.(movie),
        autoFocus,
    });

    return (
        <div
            ref={ref}
            className={`tv-card tv-focusable ${isFocused ? 'tv-focused' : ''}`}
            onClick={handleSelect}
            role="button"
            tabIndex={-1}
            data-testid={`tv-card-${movie.id}`}
        >
            <img
                src={posterSrc}
                alt={displayTitle}
                className="tv-card__poster"
                onError={() => setImgError(true)}
                loading="lazy"
            />
            <div className="tv-card__gradient" />

            <div className="tv-card__info">
                <span className="tv-card__title">{displayTitle}</span>
                <div className="tv-card__meta">
                    {rating && (
                        <span className="tv-badge tv-badge--rating">
                            ★ {rating}
                        </span>
                    )}
                    <span className="tv-badge tv-badge--hd">HD</span>
                    {year && <span>{year}</span>}
                </div>
            </div>
        </div>
    );
});

export default TVMovieCard;
