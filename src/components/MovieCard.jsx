/**
 * MovieCard.jsx  ─ Lab 3, Task 1: Reusable Component #1
 * ──────────────────────────────────────────────────────
 * Renders a clickable movie poster card.
 * Used by both the "Trending" and "Mood Match" views,
 * demonstrating props-driven reusability.
 *
 * Props:
 *   movie           {object}   – TMDB/mock movie object
 *   movie.id        {number}
 *   movie.title     {string}
 *   movie.poster_path {string}
 *   movie.release_date {string}
 *   movie.vote_average {number}
 *   movie.matchPercentage {number|undefined}  – only for mood mode
 *   onClick         {function} – called when card is clicked
 *   animationDelay  {string}   – CSS animation-delay for stagger
 * ──────────────────────────────────────────────────────
 */

import React, { useState } from 'react';

const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_IMG = "https://via.placeholder.com/300x450/1c1c28/8b8a9a?text=No+Poster";

const MovieCard = ({ movie, onClick, animationDelay = "0ms" }) => {
    // Local state to handle image loading error gracefully
    const [imgError, setImgError] = useState(false);

    if (!movie) return null;

    const {
        title,
        poster_path,
        release_date,
        vote_average,
        matchPercentage, // Present only in Mood Match mode
    } = movie;

    const posterSrc = (!imgError && poster_path)
        ? `${TMDB_IMG_BASE}${poster_path}`
        : FALLBACK_IMG;

    // Extract the 4-digit year from release_date (e.g. "2014-11-05" → "2014")
    const year = release_date ? release_date.substring(0, 4) : "N/A";

    return (
        /*
         * <article> is the correct semantic element for a self-contained
         * piece of content (each movie card is independently meaningful).
         */
        <article
            className="movie-card fade-in-up"
            style={{ animationDelay }}
            onClick={() => onClick && onClick(movie)}
            role="button"
            tabIndex={0}
            aria-label={`Watch ${title}`}
            /* Keyboard accessibility – trigger click on Enter/Space */
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onClick && onClick(movie);
            }}
        >
            {/* ── Poster image ── */}
            <img
                src={posterSrc}
                alt={`${title} movie poster`}
                onError={() => setImgError(true)}
                loading="lazy"
            />

            {/* ── Hover overlay with play icon ── */}
            <div className="card-overlay" aria-hidden="true">
                <div className="card-play-icon">
                    {/* SVG play triangle */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                        <polygon points="5,3 19,12 5,21" />
                    </svg>
                </div>
            </div>

            {/* ── Match percentage badge (only rendered when prop is present) ── */}
            {matchPercentage !== undefined && (
                <div
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                    }}
                >
                    <span className="match-badge">🤖 {matchPercentage}% match</span>
                </div>
            )}

            {/* ── Card info footer ── */}
            <div className="card-info">
                <p className="card-title">{title}</p>
                <div className="card-meta">
                    <span className="card-year">{year}</span>
                    {vote_average > 0 && (
                        <span className="card-rating">⭐ {Number(vote_average).toFixed(1)}</span>
                    )}
                </div>
            </div>
        </article>
    );
};

export default MovieCard;
