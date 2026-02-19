/**
 * useTMDB.js  ─ Custom hook (src/hooks/)
 * ───────────────────────────────────────────────────────────
 * Fetches the current list of trending movies from the
 * TMDB (The Movie Database) REST API.
 *
 * Encapsulating the fetch logic in a hook keeps the page
 * components clean and makes the data layer easy to swap.
 *
 * Returns:
 *   { movies, loading, error }
 *
 * API reference:
 *   GET https://api.themoviedb.org/3/trending/movie/week
 *   Docs: https://developer.themoviedb.org/reference/trending-movies
 * ───────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';

// TMDB API key – loaded from .env (VITE_TMDB_API_KEY)
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const useTMDB = () => {
    // ── State declarations ──────────────────────────────────
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Side-effect: fetch on mount ─────────────────────────
    useEffect(() => {
        let cancelled = false; // cleanup flag to avoid state updates on unmounted component

        const fetchTrending = async () => {
            try {
                setLoading(true);
                setError(null);

                const url = `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`;
                const res = await fetch(url);

                if (!res.ok) {
                    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
                }

                const data = await res.json();

                // Only update state if the component is still mounted
                if (!cancelled) {
                    setMovies(data.results || []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchTrending();

        // Cleanup: cancel stale async updates
        return () => { cancelled = true; };
    }, []); // Empty dep-array → runs once on mount

    return { movies, loading, error };
};

export default useTMDB;
