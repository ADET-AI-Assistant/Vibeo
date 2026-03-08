import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MovieCard from '@/components/common/MovieCard';
import { fetchTMDB } from '@/api/tmdbClient';
import './styles.css';

const Search = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const performSearch = async () => {
            if (!query.trim()) {
                setResults([]);
                setLoading(false);
                return;
            }

            // --- SESSION CACHE CHECK ---
            const cacheKey = `tmdb_search_${query.trim().toLowerCase()}`;
            const cached = sessionStorage.getItem(cacheKey);

            if (cached) {
                console.log(`[Search Cache Hit] Loaded results for: "${query}"`);
                setResults(JSON.parse(cached));
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const data = await fetchTMDB('/search/multi', {
                    query: encodeURIComponent(query),
                    include_adult: false,
                    page: 1
                });

                if (isMounted && data && data.results) {
                    const mediaResults = data.results.filter(
                        item => item.media_type === 'movie' || item.media_type === 'tv'
                    );
                    setResults(mediaResults);
                    sessionStorage.setItem(cacheKey, JSON.stringify(mediaResults));
                }
            } catch (err) {
                console.error("TMDB Search failed:", err);
                if (isMounted) setResults([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        performSearch();

        return () => {
            isMounted = false;
        };
    }, [query]);

    const renderGrid = (items) => (
        <div className="search-results-grid">
            {items.map((item, index) => (
                <div className="search-card-wrap" key={`search-${item.id}-${index}`}>
                    <MovieCard
                        movie={item}
                        onClick={(m) => navigate(`/watch/${m.id}?type=${m.media_type || 'movie'}`)}
                        animationDelay={`${(index % 20) * 30}ms`}
                    />
                </div>
            ))}
        </div>
    );

    return (
        <div className="page-wrapper">
            <main className="search-main fade-in-up">
                <div className="search-header">
                    <h1 className="search-title">
                        {query ? `Search Results for "${query}"` : 'Search Movies & Shows'}
                    </h1>
                </div>

                {!query && (
                    <div className="search-empty">
                        <h2>Enter a query to start searching</h2>
                        <p>Search for any movie or TV show by title.</p>
                    </div>
                )}

                {query && (
                    <div className="search-section">
                        {loading ? (
                            <div className="loading-center">
                                <div className="spinner" />
                                <p>Searching database...</p>
                            </div>
                        ) : results.length > 0 ? (
                            renderGrid(results)
                        ) : (
                            <div className="search-empty">
                                <h2>No results found for "{query}"</h2>
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
};

export default Search;
