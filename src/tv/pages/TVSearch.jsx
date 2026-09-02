import React, { useState, useEffect, useRef } from 'react';
import TVVirtualKeyboard from '../components/TVVirtualKeyboard';
import TVMovieCard from '../components/TVMovieCard';
import { useTVFocus } from '../context/TVFocusContext';
import { fetchTMDB } from '@/api/tmdbClient';

export const TVSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const debounceTimer = useRef(null);
    const { setZoneConfig } = useTVFocus();

    useEffect(() => {
        setZoneConfig('search-results', {
            type: 'grid',
            columns: 3,
            orderIndex: 1,
        });
    }, [setZoneConfig]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);
        clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            try {
                const data = await fetchTMDB('/search/multi', {
                    query: encodeURIComponent(query.trim()),
                    include_adult: false,
                    page: 1,
                });

                if (data && data.results) {
                    const filtered = data.results.filter(
                        item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
                    );
                    setResults(filtered);
                }
            } catch {
                // Ignore search error
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer.current);
    }, [query]);

    return (
        <div className="tv-search-page">
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '28px' }}>
                Search Movies & TV Shows
            </h1>

            <div className="tv-keyboard-container">
                {/* Left Side: Virtual Remote Keyboard */}
                <TVVirtualKeyboard
                    query={query}
                    onQueryChange={setQuery}
                />

                {/* Right Side: Live Search Results */}
                <div className="tv-search-results-pane">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--c-text2)', fontWeight: 600 }}>
                            {searching ? 'Searching...' : results.length > 0 ? `Found ${results.length} results` : query ? 'No results found' : 'Type or speak to search'}
                        </h2>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '20px',
                            maxHeight: 'calc(100vh - 220px)',
                            overflowY: 'auto',
                            padding: '8px',
                        }}
                    >
                        {results.map((item) => (
                            <TVMovieCard
                                key={item.id}
                                movie={item}
                                zone="search-results"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TVSearch;
