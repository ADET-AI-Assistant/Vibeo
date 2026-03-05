import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WatchlistDropdown from '../WatchlistDropdown';
import { getGenreNames } from '@/utils/genres';
import './styles.css';

const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w342';
const FALLBACK_IMG = 'https://placehold.co/220x330/1a1a2e/6b6b8a?text=No+Poster';

const MovieCard = React.memo(({ movie, onClick, animationDelay = '0ms', showMatchBadge = false }) => {
    const [imgError, setImgError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const hoverTimeoutRef = useRef(null);
    const navigate = useNavigate();

    if (!movie) return null;

    const displayTitle = movie.title || movie.name;
    const displayDate = movie.release_date || movie.first_air_date;
    const { poster_path, vote_average, matchPercentage, overview, original_language, genre_ids } = movie;

    const posterSrc = (!imgError && poster_path) ? `${TMDB_IMG_BASE}${poster_path}` : FALLBACK_IMG;
    const year = displayDate ? displayDate.substring(0, 4) : '';
    const ratingColor = vote_average >= 7 ? '#22c55e' : vote_average >= 5 ? '#f59e0b' : '#ef4444';

    // Fallback to 'movie' if media_type is missing
    const mediaType = movie.media_type || 'movie';
    const genres = getGenreNames(genre_ids, mediaType).slice(0, 3);

    const handleMouseEnter = () => {
        setIsHovered(true);
        hoverTimeoutRef.current = setTimeout(() => setShowDetails(true), 300);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setShowDetails(false);
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };

    useEffect(() => {
        return () => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); };
    }, []);

    const handlePlayClick = (e) => {
        e.stopPropagation();
        navigate(`/play/${movie.id}?type=${mediaType}`);
    };

    const handleDetailsClick = (e) => {
        e.stopPropagation();
        if (onClick) {
            onClick(movie);
        } else {
            navigate(`/watch/${movie.id}?type=${mediaType}`);
        }
    };

    return (
        <article
            className={`mc ${isHovered ? 'mc--hovered' : ''} fade-in-up`}
            style={{ animationDelay }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleDetailsClick}
            role="button"
            tabIndex={0}
        >
            <div className="mc__poster-wrap">
                <img
                    src={posterSrc}
                    alt={`${displayTitle} poster`}
                    className={`mc__poster ${showDetails ? 'mc__poster--dimmed' : ''}`}
                    onError={() => setImgError(true)}
                    loading="lazy"
                />

                <div className={`mc__gradient ${showDetails ? 'mc__gradient--strong' : ''}`} />

                {!showDetails && vote_average > 0 && (
                    <div className="mc__rating" style={{ background: ratingColor }}>
                        {Number(vote_average).toFixed(1)}
                    </div>
                )}
                {!showDetails && showMatchBadge && matchPercentage !== undefined && (
                    <div className="mc__match">🤖 {matchPercentage}%</div>
                )}
            </div>

            <div className={`mc__details-panel ${showDetails ? 'mc__details-panel--visible' : ''}`}>

                <div className="mc__details-top">
                    <div className="mc__details-header">
                        <h4 className="mc__details-title">{displayTitle}</h4>
                        <WatchlistDropdown movie={movie} compact={true} />
                    </div>

                    <div className="mc__details-meta">
                        {vote_average > 0 && (
                            <span className="mc__meta-tag mc__meta-rating">
                                ★ {Number(vote_average).toFixed(1)}
                            </span>
                        )}
                        <span className="mc__meta-tag mc__meta-hd">HD</span>
                        {year && <span className="mc__meta-tag">{year}</span>}
                    </div>

                    {genres.length > 0 && (
                        <div className="mc__genres">
                            {genres.map(g => (
                                <span key={g} className="mc__genre-tag">{g}</span>
                            ))}
                        </div>
                    )}

                    {overview && <p className="mc__details-synopsis">{overview}</p>}
                </div>

                <div className="mc__details-bottom">
                    <div className="mc__action-btns">
                        <button className="mc__btn mc__btn--secondary" onClick={handleDetailsClick}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                            </svg>
                            Info
                        </button>
                        <button className="mc__btn mc__btn--primary" onClick={handlePlayClick}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                            </svg>
                            Play
                        </button>
                    </div>
                </div>
            </div>

            <div className={`mc__info ${showDetails ? 'mc__info--dimmed' : ''}`}>
                <p className="mc__title">{displayTitle}</p>
                {year && <span className="mc__year">{year}</span>}
            </div>
        </article>
    );
});

export default MovieCard;