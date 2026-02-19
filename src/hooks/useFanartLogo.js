/**
 * useFanartLogo.js — Custom Hook for fanart.tv Movie Logos
 * ─────────────────────────────────────────────────────────────
 * Fetches HD movie title logos from the fanart.tv API using
 * TMDB movie IDs.
 *
 * Returns the best English HD logo URL (sorted by likes).
 * Falls back to standard movielogo if HD is unavailable.
 * Includes an in-memory cache to avoid redundant API calls.
 *
 * Usage:
 *   const { logoUrl, loading } = useFanartLogo(tmdbId);
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';

const FANART_API_KEY = import.meta.env.VITE_FANART_API_KEY;

// In dev, Vite proxies /fanart-api → webservice.fanart.tv/v3 (bypasses CORS)
// In production, you'd need your own proxy or a serverless function
const FANART_BASE = '/fanart-api/movies';

// ── In-memory cache so we never fetch the same movie twice ──
const logoCache = {};

const useFanartLogo = (tmdbId) => {
    const [logoUrl, setLogoUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tmdbId) {
            setLoading(false);
            return;
        }

        // Check cache first
        if (logoCache[tmdbId] !== undefined) {
            setLogoUrl(logoCache[tmdbId]);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const fetchLogo = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${FANART_BASE}/${tmdbId}?api_key=${FANART_API_KEY}`
                );

                if (!res.ok) throw new Error(`fanart.tv ${res.status}`);

                const data = await res.json();

                // ── Pick the best logo ──
                // Priority: hdmovielogo (EN, most liked) → movielogo (EN, most liked)
                let logo = null;

                const pickBest = (arr) => {
                    if (!arr || arr.length === 0) return null;
                    // Prefer English logos, sorted by likes descending
                    const english = arr.filter(l => l.lang === 'en');
                    const pool = english.length > 0 ? english : arr;
                    // Sort by likes (string → number)
                    pool.sort((a, b) => Number(b.likes) - Number(a.likes));
                    return pool[0]?.url || null;
                };

                logo = pickBest(data.hdmovielogo);
                if (!logo) logo = pickBest(data.movielogo);

                // Cache the result (even null, to avoid retrying)
                logoCache[tmdbId] = logo;

                if (!cancelled) {
                    setLogoUrl(logo);
                }
            } catch (err) {
                // Cache null on error to prevent hammering the API
                logoCache[tmdbId] = null;
                if (!cancelled) {
                    setLogoUrl(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchLogo();

        return () => { cancelled = true; };
    }, [tmdbId]);

    return { logoUrl, loading };
};

export default useFanartLogo;
