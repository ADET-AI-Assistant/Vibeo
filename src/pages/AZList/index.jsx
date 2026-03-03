import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MovieCard from '@/components/common/MovieCard';
import { fetchTMDB } from '@/api/tmdbClient';
import './styles.css';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const FILTERS = ['All', '#', '0-9', ...ALPHABET];

const AZList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeLetter = searchParams.get('letter') || 'All';
    const currentPage = parseInt(searchParams.get('page')) || 1;

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    /* ── Pick filter ── */
    const handleFilterClick = (letter) => {
        setSearchParams({ letter, page: 1 });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setSearchParams({ letter: activeLetter, page: newPage });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    /* ── Helper: fetch multiple TMDB pages & merge ── */
    const fetchMultiplePages = async (endpoint, params, pagesToFetch) => {
        const promises = [];
        for (let p = 0; p < pagesToFetch; p++) {
            promises.push(fetchTMDB(endpoint, { ...params, page: params.page + p }));
        }
        const results = await Promise.all(promises);
        let merged = [];
        let maxTotalPages = 1;
        for (const data of results) {
            if (data) {
                merged = merged.concat(data.results || []);
                maxTotalPages = Math.max(maxTotalPages, data.total_pages || 1);
            }
        }
        return { merged, maxTotalPages };
    };

    /* ── Fetch movies by letter ── */
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const PAGES_PER_REQUEST = 3; // fetch 3 TMDB pages to get more results

        const fetchMovies = async () => {
            try {
                let allResults = [];
                let pages = 1;
                const tmdbPage = (currentPage - 1) * PAGES_PER_REQUEST + 1;

                if (activeLetter === 'All') {
                    const { merged, maxTotalPages } = await fetchMultiplePages(
                        '/discover/movie',
                        { sort_by: 'popularity.desc', page: tmdbPage },
                        PAGES_PER_REQUEST
                    );
                    allResults = merged;
                    pages = Math.min(Math.ceil(maxTotalPages / PAGES_PER_REQUEST), 100);
                } else if (activeLetter === '#') {
                    const { merged, maxTotalPages } = await fetchMultiplePages(
                        '/search/movie',
                        { query: '.', page: tmdbPage },
                        PAGES_PER_REQUEST
                    );
                    allResults = merged.filter(m => {
                        const first = (m.title || '')[0];
                        return first && !/[A-Za-z0-9]/.test(first);
                    });
                    pages = Math.min(Math.ceil(maxTotalPages / PAGES_PER_REQUEST), 100);
                } else if (activeLetter === '0-9') {
                    // Fetch multiple number queries to get more results
                    const numPromises = [];
                    for (let n = 1; n <= 9; n++) {
                        numPromises.push(fetchTMDB('/search/movie', { query: String(n), page: currentPage }));
                    }
                    const numResults = await Promise.all(numPromises);
                    let maxPages = 1;
                    for (const data of numResults) {
                        if (data && data.results) {
                            allResults = allResults.concat(
                                data.results.filter(m => {
                                    const first = (m.title || '')[0];
                                    return first && /[0-9]/.test(first);
                                })
                            );
                            maxPages = Math.max(maxPages, data.total_pages || 1);
                        }
                    }
                    // Deduplicate by id
                    const seen = new Set();
                    allResults = allResults.filter(m => {
                        if (seen.has(m.id)) return false;
                        seen.add(m.id);
                        return true;
                    });
                    pages = Math.min(maxPages, 100);
                } else {
                    // A-Z letter — fetch 3 pages to collect more matching titles
                    const { merged, maxTotalPages } = await fetchMultiplePages(
                        '/search/movie',
                        { query: activeLetter, page: tmdbPage },
                        PAGES_PER_REQUEST
                    );
                    allResults = merged.filter(m =>
                        (m.title || '').toUpperCase().startsWith(activeLetter)
                    );
                    pages = Math.min(Math.ceil(maxTotalPages / PAGES_PER_REQUEST), 100);
                }

                // Filter out movies without posters & sort by popularity
                allResults = allResults
                    .filter(m => m.poster_path)
                    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

                if (isMounted) {
                    setMovies(allResults);
                    setTotalPages(pages);
                }
            } catch (err) {
                console.error('A-Z fetch error:', err);
                if (isMounted) setMovies([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMovies();
        return () => { isMounted = false; };
    }, [activeLetter, currentPage]);

    /* ── Pagination renderer ── */
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) pages.push(i);

        return (
            <div className="pagination">
                <button className="pagination-btn arrow" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>

                {startPage > 1 && (
                    <>
                        <button className="pagination-btn" onClick={() => handlePageChange(1)}>1</button>
                        {startPage > 2 && <span className="pagination-ellipsis">...</span>}
                    </>
                )}

                {pages.map(p => (
                    <button key={p} className={`pagination-btn ${p === currentPage ? 'active' : ''}`} onClick={() => handlePageChange(p)}>{p}</button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                        <button className="pagination-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
                    </>
                )}

                <button className="pagination-btn arrow" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
            </div>
        );
    };

    return (
        <div className="page-wrapper">
            <Header />

            <main className="azlist-main fade-in-up">
                {/* Breadcrumb */}
                <div className="azlist-breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="azlist-breadcrumb__sep">›</span>
                    <span>A-Z List</span>
                </div>

                {/* Title */}
                <h1 className="azlist-title">Sort By Letters</h1>

                {/* Letter Filter Grid */}
                <div className="azlist-filter">
                    {FILTERS.map(letter => (
                        <button
                            key={letter}
                            className={`azlist-filter__btn ${activeLetter === letter ? 'active' : ''}`}
                            onClick={() => handleFilterClick(letter)}
                        >
                            {letter}
                        </button>
                    ))}
                </div>

                {/* Results heading */}
                <h2 className="azlist-results-heading">
                    Results for "<span className="azlist-results-heading__letter">{activeLetter}</span>"
                </h2>

                {/* Movies grid */}
                {loading ? (
                    <div className="loading-center" style={{ padding: '6rem 0' }}>
                        <div className="spinner" />
                        <p>Loading movies…</p>
                    </div>
                ) : movies.length > 0 ? (
                    <>
                        <div className="azlist-grid">
                            {movies.map((movie, idx) => (
                                <div className="azlist-card-wrap" key={`${movie.id}-${idx}`}>
                                    <MovieCard
                                        movie={movie}
                                        onClick={(m) => navigate(`/watch/${m.id}`)}
                                        animationDelay={`${(idx % 20) * 30}ms`}
                                    />
                                </div>
                            ))}
                        </div>
                        {renderPagination()}
                    </>
                ) : (
                    <div className="azlist-empty">
                        <h2>No movies found starting with "{activeLetter}"</h2>
                        <p>Try a different letter.</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default AZList;
