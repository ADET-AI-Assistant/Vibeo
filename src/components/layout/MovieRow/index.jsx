import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../../common/MovieCard';
import MovieCardSkeleton from '../../common/MovieCard/Skeleton';
import './styles.css';

const MovieRow = ({ title, movies = [], onCardClick, showBadge = false, icon = '', id, loading = false }) => {
    const rowRef = useRef(null);
    const navigate = useNavigate();

    // Scroll the row left or right by one viewport width
    const scroll = (dir) => {
        if (!rowRef.current) return;
        const amount = rowRef.current.clientWidth * 0.75;
        rowRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
    };

    if (!loading && !movies.length) return null;

    return (
        <section className="movie-row" aria-label={title} id={id}>
            {/* ── Row header ── */}
            <div className="row-header">
                <h2 className="row-title">
                    {icon && <span className="row-icon">{icon}</span>}
                    {title}
                </h2>
                <div className="row-controls">
                    <button className="row-arrow row-arrow--left" onClick={() => scroll('left')} aria-label="Scroll left">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button className="row-arrow row-arrow--right" onClick={() => scroll('right')} aria-label="Scroll right">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                    <span className="row-see-all" onClick={() => navigate(`/browse/${id || 'trending'}`)}>See All</span>
                </div>
            </div>

            {/* ── Scrollable track ── */}
            <div className="row-track" ref={rowRef}>
                {loading ? (
                    // Show 8 skeletons while loading
                    Array.from({ length: 8 }).map((_, i) => (
                        <div className="row-card-wrap" key={i}>
                            <MovieCardSkeleton />
                        </div>
                    ))
                ) : (
                    movies.map((movie, index) => (
                        <div className="row-card-wrap" key={movie.id}>
                            <MovieCard
                                movie={movie}
                                onClick={onCardClick}
                                animationDelay={`${index * 40}ms`}
                                showMatchBadge={showBadge}
                            />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default MovieRow;
