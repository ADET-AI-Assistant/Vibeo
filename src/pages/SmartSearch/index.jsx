import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MovieCard from '@/components/common/MovieCard';
import { fetchTMDB } from '@/api/tmdbClient';
import { parseSmartQuery, buildDiscoverParams } from '@/utils/queryParser';
import { querySmartSearchAI, hasAIProvider } from '@/api/smartSearchAI';
import './styles.css';

const SUGGESTION_CHIPS = [
    'Funny 90s movies',
    'Scary movies',
    'Top rated sci-fi',
    'Romantic dramas',
    'Action blockbusters',
    'Animated family movies',
    'Classic westerns',
    'Spy thrillers',
    'Movies about time travel',
    'A man stuck on Mars',
    'Dystopian sci-fi',
    'Heist movies like Ocean\'s Eleven',
];

const PROVIDER_LABELS = {
    groq: { name: 'Groq · Llama 3', color: '#f97316' },
    huggingface: { name: 'HuggingFace · Mistral', color: '#fbbf24' },
};

const AIRecommender = () => {
    const navigate = useNavigate();

    // Assuming useAuth and useUserMovies are defined elsewhere
    // const { currentUser } = useAuth();
    // const { isWatchlisted, toggleWatchlist } = useUserMovies();

    // Hide global scrollbar for this specific page
    useEffect(() => {
        const html = document.documentElement;
        html.classList.add('no-scrollbar');
        return () => html.classList.remove('no-scrollbar');
    }, []);

    // Placeholder for AIRecommender content
    return null;
};

const SmartSearch = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [hasSearched, setHasSearched] = useState(false);

    // AI results
    const [aiResults, setAiResults] = useState([]);
    const [aiProvider, setAiProvider] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Keyword parser / discover results
    const [parsed, setParsed] = useState(null);
    const [discoverResults, setDiscoverResults] = useState([]);
    const [discoverLoading, setDiscoverLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const inputRef = useRef(null);
    const observerRef = useRef(null);

    // ── Main search handler ───────────────────────────────────
    const handleSearch = useCallback((searchText) => {
        const text = (searchText || query).trim();
        if (!text) return;

        setHasSearched(true);
        setSearchParams({ q: text });

        // Reset state
        setAiResults([]);
        setAiProvider(null);
        setDiscoverResults([]);
        setPage(1);

        // 1. Run keyword parser + discover (always)
        const parsedResult = parseSmartQuery(text);
        setParsed(parsedResult);

        // 2. Run AI search in parallel (if configured)
        if (hasAIProvider()) {
            runAISearch(text);
        }
    }, [query, setSearchParams]);

    // ── AI Search ─────────────────────────────────────────────
    const runAISearch = async (text) => {
        setAiLoading(true);
        try {
            const { titles, provider } = await querySmartSearchAI(text);

            if (titles && titles.length > 0) {
                setAiProvider(provider);

                // Look up each AI-recommended title on TMDB
                const moviePromises = titles.map(title =>
                    fetchTMDB('/search/multi', {
                        query: encodeURIComponent(title),
                        include_adult: false,
                        page: 1,
                    })
                );

                const resultsArrays = await Promise.all(moviePromises);
                const topMovies = resultsArrays
                    .map(data => data?.results?.[0] || null)
                    .filter(m => m !== null && (m.media_type === 'movie' || m.media_type === 'tv'));

                // Deduplicate by ID
                const seen = new Set();
                const unique = topMovies.filter(m => {
                    if (seen.has(m.id)) return false;
                    seen.add(m.id);
                    return true;
                });

                setAiResults(unique);
            }
        } catch (err) {
            console.error('[SmartSearch] AI search failed:', err);
        } finally {
            setAiLoading(false);
        }
    };

    // ── Discover Fetch (on parsed change or page change) ──────
    useEffect(() => {
        if (!parsed) return;

        let isMounted = true;

        const fetchResults = async () => {
            setDiscoverLoading(true);

            const cacheKey = `smart_discover_${JSON.stringify(parsed.genres)}_${JSON.stringify(parsed.yearRange)}_${parsed.sortBy}_${page}`;
            const cached = sessionStorage.getItem(cacheKey);

            if (cached) {
                const data = JSON.parse(cached);
                if (isMounted) {
                    if (page === 1) setDiscoverResults(data.results);
                    else setDiscoverResults(prev => [...prev, ...data.results]);
                    setTotalPages(data.totalPages);
                    setDiscoverLoading(false);
                }
                return;
            }

            try {
                const params = buildDiscoverParams(parsed, page);

                // TMDB keyword lookup for remaining words
                let keywordIds = [];
                if (parsed.remainingKeywords.length > 0 && page === 1) {
                    const kwPromises = parsed.remainingKeywords.slice(0, 3).map(kw =>
                        fetchTMDB('/search/keyword', { query: kw, page: 1 })
                    );
                    const kwResults = await Promise.all(kwPromises);
                    keywordIds = kwResults
                        .flatMap(r => r?.results || [])
                        .slice(0, 5)
                        .map(k => k.id);

                    if (keywordIds.length > 0) params.with_keywords = keywordIds.join('|');
                }

                const data = await fetchTMDB('/discover/movie', params);

                if (isMounted && data) {
                    const movies = data.results || [];
                    if (page === 1) setDiscoverResults(movies);
                    else setDiscoverResults(prev => [...prev, ...movies]);
                    setTotalPages(Math.min(data.total_pages || 1, 10));

                    sessionStorage.setItem(cacheKey, JSON.stringify({
                        results: movies,
                        totalPages: Math.min(data.total_pages || 1, 10),
                    }));
                }
            } catch (err) {
                console.error('Discover error:', err);
            } finally {
                if (isMounted) setDiscoverLoading(false);
            }
        };

        fetchResults();
        return () => { isMounted = false; };
    }, [parsed, page]);

    // Handle initial query from URL
    useEffect(() => {
        if (initialQuery && !hasSearched) {
            handleSearch(initialQuery);
        }
    }, [initialQuery]);

    // ── Infinite scroll ───────────────────────────────────────
    const loadMoreRef = useCallback((node) => {
        if (discoverLoading) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && page < totalPages) {
                setPage(prev => prev + 1);
            }
        }, { threshold: 0.1 });
        if (node) observerRef.current.observe(node);
    }, [discoverLoading, page, totalPages]);

    // ── Filter chip handlers ──────────────────────────────────
    const removeGenre = (genreId) => {
        if (!parsed) return;
        const newGenres = parsed.genres.filter(g => g !== genreId);
        const newLabels = parsed.genreLabels.filter((_, i) => parsed.genres[i] !== genreId);
        setParsed({ ...parsed, genres: newGenres, genreLabels: newLabels });
        setPage(1); setDiscoverResults([]);
    };

    const removeYearRange = () => {
        if (!parsed) return;
        setParsed({ ...parsed, yearRange: null });
        setPage(1); setDiscoverResults([]);
    };

    const removeSort = () => {
        if (!parsed) return;
        setParsed({ ...parsed, sortBy: null, sortLabel: null });
        setPage(1); setDiscoverResults([]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }
    };

    const handleChipClick = (suggestion) => {
        setQuery(suggestion);
        handleSearch(suggestion);
    };

    const clearSearch = () => {
        setQuery(''); setParsed(null); setAiResults([]);
        setAiProvider(null); setDiscoverResults([]);
        setHasSearched(false); setSearchParams({});
    };

    const yearLabel = parsed?.yearRange
        ? (parsed.yearRange[0] === parsed.yearRange[1]
            ? `${parsed.yearRange[0]}`
            : `${parsed.yearRange[0]}–${parsed.yearRange[1]}`)
        : null;

    const providerInfo = aiProvider ? PROVIDER_LABELS[aiProvider] : null;

    return (
        <div className="page-wrapper">
            <Header />

            <main className="smart-main fade-in-up">
                {/* ── Hero Search Area ── */}
                <div className="smart-hero">
                    <h1 className="smart-hero-title">Smart Search</h1>
                    <p className="smart-hero-subtitle">
                        Describe what you're looking for in plain english — powered by open-source AI.
                    </p>

                    <div className="smart-search-bar">
                        <svg className="smart-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            className="smart-search-input"
                            placeholder='Try "movies about time travel" or "funny 90s comedies"...'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        {query && (
                            <button className="smart-clear-btn" onClick={clearSearch} aria-label="Clear search">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                        <button className="smart-search-btn" onClick={() => handleSearch()}>
                            Search
                        </button>
                    </div>
                </div>

                {/* ── Suggestion Chips ── */}
                {!hasSearched && (
                    <div className="smart-suggestions">
                        <span className="smart-suggestions-label">Try searching:</span>
                        <div className="smart-chips-row">
                            {SUGGESTION_CHIPS.map(chip => (
                                <button key={chip} className="smart-suggestion-chip" onClick={() => handleChipClick(chip)}>
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Results ── */}
                {hasSearched && (
                    <>
                        {/* ── AI Results Section ── */}
                        {(aiLoading || aiResults.length > 0) && (
                            <div className="smart-ai-section">
                                <div className="smart-section-header">
                                    <h2 className="smart-section-title ai-title">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            <path d="M2 17l10 5 10-5" />
                                            <path d="M2 12l10 5 10-5" />
                                        </svg>
                                        AI Recommendations
                                    </h2>
                                    {providerInfo && (
                                        <span className="smart-provider-badge" style={{ '--provider-color': providerInfo.color }}>
                                            {providerInfo.name}
                                        </span>
                                    )}
                                </div>

                                {aiLoading ? (
                                    <div className="smart-ai-loading">
                                        <div className="smart-ai-spinner" />
                                        <p>AI is analyzing your query...</p>
                                    </div>
                                ) : (
                                    <div className="smart-results-grid ai-results-grid">
                                        {aiResults.map((movie, index) => (
                                            <div className="smart-card-wrap ai-card" key={`ai-${movie.id}-${index}`}
                                                style={{ animationDelay: `${index * 50}ms` }}>
                                                <MovieCard
                                                    movie={movie}
                                                    onClick={(m) => navigate(`/watch/${m.id}?type=${m.media_type || 'movie'}`)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Divider ── */}
                        {aiResults.length > 0 && discoverResults.length > 0 && (
                            <hr className="smart-divider" />
                        )}

                        {/* ── Discover / Keyword Results ── */}
                        <div className="smart-discover-section">
                            <div className="smart-section-header">
                                <h2 className="smart-section-title">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    Filtered Results
                                </h2>
                            </div>

                            {/* Active Filters */}
                            {parsed && (
                                <div className="smart-filters">
                                    <div className="smart-filter-chips">
                                        {parsed.genreLabels.map((label, i) => (
                                            <button key={parsed.genres[i]} className="smart-filter-chip genre-chip" onClick={() => removeGenre(parsed.genres[i])}>
                                                {label}
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        ))}
                                        {yearLabel && (
                                            <button className="smart-filter-chip year-chip" onClick={removeYearRange}>
                                                {yearLabel}
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        )}
                                        {parsed.sortLabel && (
                                            <button className="smart-filter-chip sort-chip" onClick={removeSort}>
                                                {parsed.sortLabel}
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        )}
                                        {parsed.remainingKeywords.map(kw => (
                                            <span key={kw} className="smart-filter-chip keyword-chip">🔑 {kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Grid */}
                            {discoverLoading && discoverResults.length === 0 ? (
                                <div className="smart-loading">
                                    <div className="spinner" />
                                    <p>Finding movies...</p>
                                </div>
                            ) : discoverResults.length > 0 ? (
                                <>
                                    <div className="smart-results-grid">
                                        {discoverResults.map((movie, index) => (
                                            <div className="smart-card-wrap" key={`disc-${movie.id}-${index}`}
                                                style={{ animationDelay: `${(index % 20) * 30}ms` }}>
                                                <MovieCard
                                                    movie={movie}
                                                    onClick={(m) => navigate(`/watch/${m.id}?type=${m.media_type || 'movie'}`)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {page < totalPages && (
                                        <div ref={loadMoreRef} className="smart-load-trigger">
                                            {discoverLoading && (
                                                <div className="smart-loading-more">
                                                    <div className="spinner" /><span>Loading more...</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : !discoverLoading ? (
                                <div className="smart-empty">
                                    <h2>No filtered results found</h2>
                                    <p>Try adjusting your search or removing some filters.</p>
                                </div>
                            ) : null}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default SmartSearch;
