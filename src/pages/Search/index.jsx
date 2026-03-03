import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MovieCard from '@/components/common/MovieCard';
import { fetchTMDB } from '@/api/tmdbClient';
import { fetchGeminiRecommendations } from '@/api/geminiClient';
import './styles.css';

const Search = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Gemini State
    const [geminiResults, setGeminiResults] = useState([]);
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [geminiError, setGeminiError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const performSearch = async () => {
            if (!query.trim()) {
                setResults([]);
                setGeminiResults([]);
                setLoading(false);
                setGeminiLoading(false);
                return;
            }

            setLoading(true);
            setGeminiLoading(true);
            setGeminiError(false);

            // 1. Fire off Standard TMDB Search
            const tmdbPromise = fetchTMDB('/search/multi', {
                query: encodeURIComponent(query),
                include_adult: false,
                page: 1
            }).then(data => {
                if (isMounted && data && data.results) {
                    const mediaResults = data.results.filter(
                        item => item.media_type === 'movie' || item.media_type === 'tv'
                    );
                    setResults(mediaResults);
                }
            }).catch(err => {
                console.error("TMDB Search failed:", err);
                if (isMounted) setResults([]);
            }).finally(() => {
                if (isMounted) setLoading(false);
            });


            // 2. Fire Async Gemini Search in parallel
            const geminiPromise = fetchGeminiRecommendations(query).then(async titles => {
                if (titles && titles.length > 0) {
                    // For each title Gemini recommended, fetch the TMDB data
                    const moviePromises = titles.map(title =>
                        fetchTMDB('/search/multi', {
                            query: encodeURIComponent(title),
                            include_adult: false,
                            page: 1
                        })
                    );

                    const resultsArrays = await Promise.all(moviePromises);

                    // We only want the top result for each recommended title
                    const topMovies = resultsArrays
                        .map(data => data?.results && data.results.length > 0 ? data.results[0] : null)
                        .filter(movie => movie !== null && (movie.media_type === 'movie' || movie.media_type === 'tv'));

                    if (isMounted) {
                        setGeminiResults(topMovies);
                    }
                } else {
                    if (isMounted) setGeminiError(true);
                }
            }).catch(err => {
                console.error("Gemini flow failed:", err);
                if (isMounted) {
                    setGeminiError(true);
                    setGeminiResults([]);
                }
            }).finally(() => {
                if (isMounted) setGeminiLoading(false);
            });

        };

        performSearch();

        return () => {
            isMounted = false;
        };
    }, [query]);

    // Helper to render grid
    const renderGrid = (items, isGemini = false) => (
        <div className="search-grid">
            {items.map((item, index) => (
                <div className={`search-card-wrap ${isGemini ? 'gemini-card-wrap' : ''}`} key={`search-${isGemini ? 'gemini' : 'tmdb'}-${item.id}-${index}`}>
                    <MovieCard
                        movie={item}
                        onClick={(m) => navigate(`/watch/${m.id}?type=${m.media_type || 'movie'}`)}
                        animationDelay={`${(index % 20) * 30}ms`}
                    />
                    {isGemini && (
                        <div className="gemini-indicator">
                            <span title="Recommended by Gemini AI">✨ AI Pick</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="page-wrapper">
            <Header />

            <main className="search-main fade-in-up">
                <div className="search-header">
                    <h1 className="search-title">
                        {query ? `Search Results for "${query}"` : 'Search Movies & Shows'}
                    </h1>
                </div>

                {!query && (
                    <div className="search-empty">
                        <h2>Enter a query to start searching</h2>
                        <p>Tip: You can use natural language, like "Funny 90s movies" or "Movies about space exploration"</p>
                    </div>
                )}

                {query && (
                    <>
                        {/* Gemini Section */}
                        <div className="search-section">
                            <h2 className="section-subtitle gemini-title">✨ Gemini AI Suggestions</h2>
                            {geminiLoading ? (
                                <div className="loading-center gemini-loading">
                                    <div className="gemini-spinner" />
                                    <p>Gemini AI is analyzing your query...</p>
                                </div>
                            ) : geminiError || geminiResults.length === 0 ? (
                                <p className="gemini-fallback">No AI suggestions available for this query.</p>
                            ) : (
                                renderGrid(geminiResults, true)
                            )}
                        </div>

                        <hr className="search-divider" />

                        {/* Standard Search Section */}
                        <div className="search-section">
                            <h2 className="section-subtitle">Standard Search Results</h2>
                            {loading ? (
                                <div className="loading-center">
                                    <div className="spinner" />
                                    <p>Searching database...</p>
                                </div>
                            ) : results.length > 0 ? (
                                renderGrid(results, false)
                            ) : (
                                <div className="search-empty">
                                    <h2>No standard results found for "{query}"</h2>
                                </div>
                            )}
                        </div>
                    </>
                )}

            </main>

            <Footer />
        </div>
    );
};

export default Search;
