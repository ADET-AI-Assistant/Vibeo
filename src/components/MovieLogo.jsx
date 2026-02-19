/**
 * MovieLogo.jsx — Movie Title Logo Component
 * ─────────────────────────────────────────────────────────────
 * Displays the movie's official title logo from fanart.tv.
 * Gracefully falls back to a styled text title if no logo is
 * available or while loading.
 *
 * Props:
 *   tmdbId    {number|string}  — TMDB movie ID
 *   title     {string}         — Fallback text title
 *   className {string}         — Additional CSS class
 *   maxHeight {string}         — Max height of logo image (default: '90px')
 *   style     {object}         — Extra inline styles
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import useFanartLogo from '../hooks/useFanartLogo';

const MovieLogo = ({ tmdbId, title, className = '', maxHeight = '90px', style = {} }) => {
    const { logoUrl, loading } = useFanartLogo(tmdbId);
    const [imgError, setImgError] = useState(false);

    // Show text title while loading, if no logo found, or if image fails
    if (loading || !logoUrl || imgError) {
        return (
            <span className={`movie-logo-text ${className}`} style={style}>
                {title}
            </span>
        );
    }

    return (
        <img
            src={logoUrl}
            alt={`${title} logo`}
            className={`movie-logo-img ${className}`}
            onError={() => setImgError(true)}
            loading="lazy"
            style={{
                maxHeight,
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.6))',
                ...style,
            }}
        />
    );
};

export default MovieLogo;
