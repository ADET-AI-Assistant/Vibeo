import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import MovieCard from '@/components/common/MovieCard';
import StarRating from '@/components/common/StarRating';
import TrailerModal from '@/components/common/TrailerModal';
import WatchlistDropdown from '@/components/common/WatchlistDropdown';
import { useBrowseMovies, SORT_OPTIONS, GENRE_MAP } from '@/hooks/useBrowseMovies';
import { fetchTMDB } from '@/api/tmdbClient';
import { TMDB_BACKDROP_BASE, TMDB_IMAGE_BASE } from '@/config/constants';
import './styles.css';

/* ── Custom Dropdown ────────────────────────────────────────── */
const FilterDropdown = ({ options, value, onChange, labelKey = 'label', valueKey = 'id' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = options.find(o => o[valueKey] === value) || options[0];

    // Close on click outside
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="filter-dropdown" ref={ref}>
            <button
                className={`filter-dropdown__trigger ${open ? 'open' : ''}`}
                onClick={() => setOpen(!open)}
            >
                <span>{selected[labelKey]}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z" />
                </svg>
            </button>

            {open && (
                <div className="filter-dropdown__menu">
                    {options.map(opt => (
                        <button
                            key={opt[valueKey]}
                            className={`filter-dropdown__item ${opt[valueKey] === value ? 'active' : ''}`}
                            onClick={() => { onChange(opt[valueKey]); setOpen(false); }}
                        >
                            {opt[labelKey]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════ */

const Browse = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    // ── Filter & Modal state ──────────────────────────────────
    const mapCategoryToSort = (cat) => {
        const map = {
            trending: 'trending',
            'top-rated': 'top_rated',
            'now-playing': 'now_playing',
            'new-release': 'now_playing',
            popular: 'popular',
            upcoming: 'upcoming',
        };
        return map[cat] || 'popular';
    };

    const [sortBy, setSortBy] = useState(mapCategoryToSort(categoryId));
    const [genreId, setGenreId] = useState('');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [movieDetails, setMovieDetails] = useState(null);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

    // Sync sort from category param
    useEffect(() => {
        setSortBy(mapCategoryToSort(categoryId));
    }, [categoryId]);

    // Infinite scroll data
    const {
        movies, loading, isFetchingNextPage, fetchNextPage, hasNextPage, title
    } = useBrowseMovies(sortBy, genreId);

    // ── Infinite scroll observer ──────────────────────────────
    const observerRef = useRef(null);
    const loadMoreRef = useCallback((node) => {
        if (loading || isFetchingNextPage) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        }, { threshold: 0.1 });

        if (node) observerRef.current.observe(node);
    }, [loading, isFetchingNextPage, hasNextPage, fetchNextPage]);

    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1100);

    // Track window width to differentiate mobile/desktop auto-select behavior
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 1100);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-select first movie when results change (Desktop ONLY)
    useEffect(() => {
        if (isDesktop && movies.length > 0 && !selectedMovie) {
            setSelectedMovie(movies[0]);
        }
    }, [movies, isDesktop, selectedMovie]);

    // Fetch detail panel data when selected movie changes
    useEffect(() => {
        if (!selectedMovie) {
            setMovieDetails(null);
            return;
        }

        let isMounted = true;

        const fetchDetails = async () => {
            try {
                // Fetch details, cast/crew, and videos simultaneously
                const [details, credits, videosRes] = await Promise.all([
                    fetchTMDB(`/movie/${selectedMovie.id}`),
                    fetchTMDB(`/movie/${selectedMovie.id}/credits`),
                    fetchTMDB(`/movie/${selectedMovie.id}/videos`),
                ]);

                if (isMounted) {
                    // Extract director
                    const director = credits?.crew?.find(member => member.job === 'Director');

                    // Extract official YouTube trailer
                    const trailer = videosRes?.results?.find(
                        vid => vid.site === 'YouTube' && vid.type === 'Trailer'
                    );

                    setMovieDetails({
                        ...details,
                        cast: (credits?.cast || []).slice(0, 5),
                        director: director?.name || null,
                        trailerKey: trailer?.key || null,
                    });
                }
            } catch (err) {
                console.error('Error fetching movie details:', err);
            }
        };

        fetchDetails();
        return () => { isMounted = false; };
    }, [selectedMovie?.id]);

    // ── Handlers ──────────────────────────────────────────────
    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        setSelectedMovie(null);
    };

    const handleGenreChange = (newGenre) => {
        setGenreId(newGenre);
        setSelectedMovie(null);
    };

    const handleCardClick = (movie) => {
        setSelectedMovie(movie);
    };

    // ── Detail panel helper ───────────────────────────────────
    const d = movieDetails || selectedMovie;
    const backdropUrl = d?.backdrop_path ? `${TMDB_BACKDROP_BASE}${d.backdrop_path}` : null;

    return (
        <div className="page-wrapper">
            <Header />

            <main className="browse-main">
                {/* ── Filter Bar ── */}
                <div className="browse-filter-bar">
                    <div className="filter-group">
                        <FilterDropdown
                            options={SORT_OPTIONS}
                            value={sortBy}
                            onChange={handleSortChange}
                        />
                        <FilterDropdown
                            options={GENRE_MAP}
                            value={genreId}
                            onChange={handleGenreChange}
                        />
                    </div>
                </div>

                {/* ── Two-Column Layout ── */}
                <div className="browse-layout">
                    {/* ── Left: Movie Grid ── */}
                    <div className="browse-grid-container">
                        {loading ? (
                            <div className="loading-center" style={{ padding: '6rem 0' }}>
                                <div className="spinner" />
                                <p>Loading movies…</p>
                            </div>
                        ) : movies.length > 0 ? (
                            <div className="browse-grid">
                                {movies.map((movie, index) => (
                                    <div
                                        className={`browse-card-wrap ${selectedMovie?.id === movie.id ? 'selected' : ''}`}
                                        key={`${movie.id}-${index}`}
                                        onClick={() => handleCardClick(movie)}
                                    >
                                        <MovieCard
                                            movie={movie}
                                            onClick={() => handleCardClick(movie)}
                                            animationDelay={`${(index % 20) * 30}ms`}
                                        />
                                    </div>
                                ))}

                                {/* ── Infinite scroll trigger ── */}
                                <div ref={loadMoreRef} className="browse-load-trigger" />
                            </div>
                        ) : (
                            <div className="browse-empty">
                                <h2>No movies found</h2>
                                <p>Try adjusting your filters.</p>
                            </div>
                        )}

                        {/* Loading more indicator */}
                        {isFetchingNextPage && (
                            <div className="browse-loading-more">
                                <div className="spinner" />
                                <span>Loading more…</span>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Detail Panel ── */}
                    {d && (
                        <aside className="browse-detail-panel">
                            {/* Mobile Close Button */}
                            <button className="detail-close-btn" onClick={() => setSelectedMovie(null)} aria-label="Close details">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>

                            <div className="detail-card">
                                {backdropUrl && (
                                    <div className="detail-backdrop">
                                        <img src={backdropUrl} alt="" />
                                        <div className="detail-backdrop-fade" />
                                    </div>
                                )}

                                <div className="detail-body">
                                    <h2 className="detail-title">{d.title || d.name}</h2>

                                    <div className="detail-meta">
                                        {d.release_date && (
                                            <span className="detail-year">{d.release_date.substring(0, 4)}</span>
                                        )}
                                        {(movieDetails?.runtime || 0) > 0 && (
                                            <span className="detail-runtime">{movieDetails.runtime} min</span>
                                        )}
                                        {d.vote_average > 0 && (
                                            <StarRating rating={d.vote_average} />
                                        )}
                                    </div>

                                    {d.overview && (
                                        <p className="detail-overview">{d.overview}</p>
                                    )}

                                    {movieDetails?.director && (
                                        <div className="detail-section">
                                            <span className="detail-label">DIRECTOR</span>
                                            <div className="detail-chips">
                                                <span className="detail-chip director-chip">{movieDetails.director}</span>
                                            </div>
                                        </div>
                                    )}

                                    {movieDetails?.genres && movieDetails.genres.length > 0 && (
                                        <div className="detail-section">
                                            <span className="detail-label">GENRES</span>
                                            <div className="detail-chips">
                                                {movieDetails.genres.map(g => (
                                                    <span className="detail-chip" key={g.id}>{g.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {movieDetails?.cast && movieDetails.cast.length > 0 && (
                                        <div className="detail-section">
                                            <span className="detail-label">CAST</span>
                                            <div className="detail-chips">
                                                {movieDetails.cast.map(c => (
                                                    <span className="detail-chip" key={c.id}>{c.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="detail-actions" style={{ flexWrap: 'wrap' }}>
                                        <button
                                            className="detail-btn-watch"
                                            onClick={() => navigate(`/watch/${d.id}`)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                                            Watch Now
                                        </button>

                                        {movieDetails?.trailerKey && (
                                            <button
                                                className="detail-btn-trailer"
                                                onClick={() => setIsTrailerOpen(true)}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                                Trailer
                                            </button>
                                        )}
                                        <div style={{ width: '100%' }}>
                                            <WatchlistDropdown movie={d} customClass="browse-watchlist-dropdown" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </main>

            <TrailerModal
                isOpen={isTrailerOpen}
                videoId={movieDetails?.trailerKey}
                onClose={() => setIsTrailerOpen(false)}
            />
        </div>
    );
};

export default Browse;
