import React, { useState } from 'react';

const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w342';
const FALLBACK_IMG = 'https://placehold.co/220x330/1a1a2e/6b6b8a?text=No+Poster';
import './styles.css';

const MovieCard = ({ movie, onClick, animationDelay = '0ms', showMatchBadge = false }) => {
    const [imgError, setImgError] = useState(false);
    const [hovered, setHovered] = useState(false);

    if (!movie) return null;

    // TMDB uses 'name' and 'first_air_date' for TV shows, 'title' and 'release_date' for movies
    const displayTitle = movie.title || movie.name;
    const displayDate = movie.release_date || movie.first_air_date;
    const { poster_path, vote_average, matchPercentage } = movie;

    const posterSrc = (!imgError && poster_path)
        ? `${TMDB_IMG_BASE}${poster_path}`
        : FALLBACK_IMG;

    const year = displayDate ? displayDate.substring(0, 4) : '';

    // Rating colour: green ≥7, yellow ≥5, red <5
    const ratingColor = vote_average >= 7
        ? '#22c55e'   // green
        : vote_average >= 5
            ? '#f59e0b' // amber
            : '#ef4444';// red

    return (
        <article
            className={`mc ${hovered ? 'mc--hovered' : ''} fade-in-up`}
            style={{ animationDelay }}
            onClick={() => onClick && onClick(movie)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            role="button"
            tabIndex={0}
            aria-label={`Watch ${displayTitle}`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick && onClick(movie); }}
        >
            {/* ── Poster ── */}
            <div className="mc__poster-wrap">
                <img
                    src={posterSrc}
                    alt={`${displayTitle} poster`}
                    className="mc__poster"
                    onError={() => setImgError(true)}
                    loading="lazy"
                />

                {/* Hover overlay */}
                <div className="mc__overlay" aria-hidden="true">
                    <div className="mc__play">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                    </div>
                </div>

                {/* ── Rating badge (top-right corner like Yorumi) ── */}
                {vote_average > 0 && (
                    <div className="mc__rating" style={{ background: ratingColor }}>
                        {Number(vote_average).toFixed(1)}
                    </div>
                )}

                {/* ── AI Match badge (top-left, only in mood mode) ── */}
                {showMatchBadge && matchPercentage !== undefined && (
                    <div className="mc__match">
                        🤖 {matchPercentage}%
                    </div>
                )}
            </div>

            {/* ── Card footer info ── */}
            <div className="mc__info">
                <p className="mc__title">{displayTitle}</p>
                {year && <span className="mc__year">{year}</span>}
            </div>
        </article>
    );
};

export default MovieCard;
