/**
 * Django REST API client for Vibeo.
 * Used by the React UI to demonstrate the full DRF data flow:
 * UI -> API -> database -> API -> UI.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
const DJANGO_TOKEN_KEY = 'vibeo_django_auth_token';

const parseResponse = async (response) => {
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        const message =
            data?.error ||
            data?.detail ||
            Object.values(data || {})?.flat?.()?.[0] ||
            `Request failed (${response.status})`;
        throw new Error(message);
    }

    return data;
};

const request = async (path, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    return parseResponse(response);
};

const authRequest = async (path, options = {}) => {
    const token = getDjangoToken();
    if (!token) {
        throw new Error('Unauthorized. Please log in to the Django API first.');
    }

    return request(path, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Token ${token}`,
        },
    });
};

export const getDjangoToken = () => localStorage.getItem(DJANGO_TOKEN_KEY);

export const storeDjangoToken = (token) => {
    localStorage.setItem(DJANGO_TOKEN_KEY, token);
    return token;
};

export const clearDjangoToken = () => {
    localStorage.removeItem(DJANGO_TOKEN_KEY);
};

export const djangoLogin = async ({ username, password }) => {
    const data = await request('/auth/login/', {
        method: 'POST',
        body: { username, password },
    });
    storeDjangoToken(data.token);
    return data;
};

export const djangoRegister = async ({ username, email, password }) => {
    const data = await request('/auth/register/', {
        method: 'POST',
        body: { username, email, password },
    });
    storeDjangoToken(data.token);
    return data;
};

const toDjangoMediaItem = (movie, status = 'planning') => ({
    tmdb_id: Number(movie.tmdb_id || movie.id),
    title: movie.title || null,
    name: movie.name || null,
    poster_path: movie.poster_path || null,
    media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
    status,
});

export const normalizePaginated = (data) => data?.results || (Array.isArray(data) ? data : []);

export const syncUserStats = async (stats) => {
    try {
        return await request('/sync-stats/', {
            method: 'POST',
            body: {
                firebase_uid: stats.uid,
                username: stats.displayName || stats.email?.split('@')[0] || 'User',
                avatar_url: stats.photoURL || '',
                total_watch_time: stats.totalWatchTime || 0,
                current_streak: stats.streakData?.current || 0,
                highest_streak: stats.streakData?.highest || 0,
            },
        });
    } catch (error) {
        console.error('Django Sync Error:', error);
        return null;
    }
};

export const fetchLeaderboard = async () => {
    try {
        return await request('/leaderboard/');
    } catch (error) {
        console.error('Leaderboard Fetch Error:', error);
        return [];
    }
};

export const fetchWatchlist = async () => normalizePaginated(await authRequest('/watchlist/'));

export const findWatchlistItem = async (movie) => {
    const tmdbId = Number(movie.tmdb_id || movie.id);
    const mediaType = movie.media_type || (movie.name ? 'tv' : 'movie');
    const items = await fetchWatchlist();
    return items.find((item) => Number(item.tmdb_id) === tmdbId && item.media_type === mediaType) || null;
};

export const createWatchlistItem = async (movie, status = 'planning') =>
    authRequest('/watchlist/', {
        method: 'POST',
        body: toDjangoMediaItem(movie, status),
    });

export const updateWatchlistItem = async (movie, status) => {
    const existing = await findWatchlistItem(movie);
    if (!existing) {
        return createWatchlistItem(movie, status);
    }

    return authRequest(`/watchlist/${existing.id}/`, {
        method: 'PATCH',
        body: toDjangoMediaItem(movie, status),
    });
};

export const deleteWatchlistItem = async (movie) => {
    const existing = await findWatchlistItem(movie);
    if (!existing) return null;

    return authRequest(`/watchlist/${existing.id}/`, {
        method: 'DELETE',
    });
};

export const fetchFavorites = async () => normalizePaginated(await authRequest('/favorites/'));

export const createFavorite = async (movie) =>
    authRequest('/favorites/', {
        method: 'POST',
        body: toDjangoMediaItem(movie),
    });

export const deleteFavorite = async (movie) => {
    const tmdbId = Number(movie.tmdb_id || movie.id);
    const mediaType = movie.media_type || (movie.name ? 'tv' : 'movie');
    const items = await fetchFavorites();
    const existing = items.find((item) => Number(item.tmdb_id) === tmdbId && item.media_type === mediaType);

    if (!existing) return null;

    return authRequest(`/favorites/${existing.id}/`, {
        method: 'DELETE',
    });
};

export const fetchHistory = async () => normalizePaginated(await authRequest('/history/'));

export const createHistoryItem = async (movie) =>
    authRequest('/history/', {
        method: 'POST',
        body: toDjangoMediaItem(movie),
    });

