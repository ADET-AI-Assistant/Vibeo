import { TMDB_API_KEY, TMDB_BASE_URL } from '../config/constants';

// Simple in-memory cache for TMDB requests
const tmdbCache = new Map();

/**
 * reliable fetch wrapper for TMDB API
 * @param {string} endpoint 
 * @param {object} params 
 * @returns {Promise<any>}
 */
export const fetchTMDB = async (endpoint, params = {}) => {
    if (!TMDB_API_KEY) {
        console.error("TMDB API Key is missing!");
        return null;
    }

    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    url.searchParams.append('language', 'en-US');

    // Add params to URL
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    // Check cache
    const cacheKey = url.toString();
    if (tmdbCache.has(cacheKey)) {
        return tmdbCache.get(cacheKey);
    }

    try {
        const response = await fetch(cacheKey);
        if (!response.ok) {
            throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // Save to cache
        tmdbCache.set(cacheKey, data);

        return data;
    } catch (error) {
        console.error("Fetch TMDB Error:", error);
        return null;
    }
};
