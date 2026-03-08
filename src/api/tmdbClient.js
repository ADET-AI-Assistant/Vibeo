import { TMDB_API_KEY, TMDB_BASE_URL } from '../config/constants';

// Simple in-memory cache for TMDB requests
const tmdbCache = new Map();
// Track in-flight requests to prevent duplicate calls
const pendingRequests = new Map();

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

    const cacheKey = url.toString();

    // 1. Check persistent cache
    if (tmdbCache.has(cacheKey)) {
        return tmdbCache.get(cacheKey);
    }

    // 2. Check for in-flight requests (deduplication)
    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
    }

    // 3. Perform fetch and track promise
    const requestPromise = (async () => {
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
        } finally {
            // Clean up pending request
            pendingRequests.delete(cacheKey);
        }
    })();

    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
};
