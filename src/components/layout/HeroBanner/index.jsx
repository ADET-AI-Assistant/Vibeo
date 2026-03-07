import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieLogo from '../../common/MovieLogo';
import HeroSlide from './HeroSlide';
import TrailerPlayer from './TrailerPlayer';
import { useTrailers } from '../../../hooks/useTrailers';
import { useLayout } from '../../../context/LayoutContext';
import './styles.css';

const HeroBanner = ({ movies = [] }) => {
    const navigate = useNavigate();
    const { heroAutoNext, heroInterval } = useLayout();
    const total = Math.min(movies.length, 5);
    const timerRef = useRef(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [trailerReady, setTrailerReady] = useState(false);

    // Custom hook for fetching trailers
    const { trailerKeys } = useTrailers(movies);

    /* ── Start/stop auto-advance ── */
    const startAutoAdvance = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (total < 2 || !heroAutoNext) return;
        timerRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % total);
        }, heroInterval);
    }, [total, heroAutoNext, heroInterval]);

    const stopAutoAdvance = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    /* ── Go to slide ── */
    const goTo = useCallback((idx) => {
        setActiveIndex(idx);
        setTrailerReady(false);
        startAutoAdvance();
    }, [startAutoAdvance]);

    /* ── Auto-advance on mount ── */
    useEffect(() => {
        startAutoAdvance();
        return () => stopAutoAdvance();
    }, [startAutoAdvance, stopAutoAdvance]);

    /* ── When trailer starts playing, pause auto-advance ── */
    useEffect(() => {
        if (trailerReady) {
            stopAutoAdvance();
        }
    }, [trailerReady, stopAutoAdvance]);

    /* ── Reset trailer ready state on slide change ── */
    useEffect(() => {
        setTrailerReady(false);
    }, [activeIndex]);

    /* ── Keyboard accessibility ── */
    const handleKey = (e) => {
        if (e.key === 'ArrowRight') goTo((activeIndex + 1) % total);
        if (e.key === 'ArrowLeft') goTo((activeIndex - 1 + total) % total);
    };

    // Current movie & trailer
    const currentMovie = movies[activeIndex];
    const currentTrailerKey = currentMovie ? trailerKeys[currentMovie.id] : null;

    // ── Skeleton while TMDB data loads ─────────────────────────
    if (!total) {
        return (
            <div className="hero-skeleton">
                <div className="hero-skeleton-inner" />
            </div>
        );
    }

    return (
        <section
            className="hero"
            aria-label="Featured Movie Spotlight"
            onKeyDown={handleKey}
            tabIndex={-1}
        >
            {/* ── SLIDE TRACK ────────────────────────────────────────── */}
            <div
                className="hero-track"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                aria-live="off"
            >
                {movies.slice(0, 5).map((movie, i) => (
                    <HeroSlide key={movie.id} movie={movie} isActive={i === activeIndex} />
                ))}
            </div>

            {/* ── TRAILER LAYER ───────────────────────────────────────── */}
            {currentTrailerKey && (
                <div className={`hero-trailer-container ${trailerReady ? 'visible' : 'hidden'}`}>
                    <TrailerPlayer
                        trailerKey={currentTrailerKey}
                        title={currentMovie.title}
                        onLoad={() => setTrailerReady(true)}
                    />
                </div>
            )}


            {/* ── CONTENT LAYER ───────────────────────────────────────── */}
            <div className="hero-content" key={activeIndex}>


                <h1 className="hero-title">
                    <MovieLogo
                        tmdbId={movies[activeIndex].id}
                        title={movies[activeIndex].title}
                        maxHeight="200px"
                    />
                </h1>

                <div className="hero-meta">
                    {movies[activeIndex].release_date && (
                        <span className="hero-meta__year">
                            {movies[activeIndex].release_date.substring(0, 4)}
                        </span>
                    )}
                    <span className="hero-meta__sep">·</span>
                    {movies[activeIndex].vote_average > 0 && (
                        <span className="hero-meta__rating">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b">
                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                            </svg>
                            {Number(movies[activeIndex].vote_average).toFixed(1)}
                        </span>
                    )}
                    <span className="hero-meta__hd">HD</span>
                </div>

                {movies[activeIndex].overview && (
                    <p className="hero-overview">
                        {movies[activeIndex].overview}
                    </p>
                )}

                <div className="hero-actions">
                    <button
                        className="hero-btn-primary"
                        onClick={() => navigate(`/watch/${movies[activeIndex].id}`)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                        Watch Now
                    </button>

                    {currentTrailerKey && (
                        <button
                            className="hero-btn-secondary"
                            onClick={() => setTrailerReady(true)}
                            style={{ gap: '10px' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                            Trailer
                        </button>
                    )}

                    <button
                        className="hero-btn-secondary"
                        onClick={() => navigate(`/watch/${movies[activeIndex].id}`)}
                    >
                        Details
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Left / Right arrow buttons ── */}
            {total > 1 && (
                <>
                    <button
                        className="hero-arrow hero-arrow--left"
                        onClick={() => goTo((activeIndex - 1 + total) % total)}
                        aria-label="Previous spotlight"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button
                        className="hero-arrow hero-arrow--right"
                        onClick={() => goTo((activeIndex + 1) % total)}
                        aria-label="Next spotlight"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </>
            )}

            {/* ── Dot indicators ── */}
            <div className="hero-dots-bar" role="tablist" aria-label="Spotlight slides">
                {Array.from({ length: total }).map((_, i) => (
                    <button
                        key={i}
                        role="tab"
                        aria-selected={i === activeIndex}
                        aria-label={`Spotlight slide ${i + 1}: ${movies[i]?.title}`}
                        className={`hero-dot ${i === activeIndex ? 'active' : ''}`}
                        onClick={() => goTo(i)}
                    />
                ))}
            </div>

        </section>
    );
};

export default HeroBanner;
