/**
 * genres.js - TMDB Genre Mapping
 * ═══════════════════════════════════════════════════════════════
 * Standard mapping for TMDB genre IDs to human-readable names.
 * Covers both Movie and TV genres.
 * ═══════════════════════════════════════════════════════════════
 */

const MOVIE_GENRES = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
};

const TV_GENRES = {
    10759: 'Action & Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    10762: 'Kids',
    9648: 'Mystery',
    10763: 'News',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'War & Politics',
    37: 'Western'
};

/**
 * Get genre names from IDs
 * @param {Array<number>} genreIds 
 * @param {string} type - 'movie' or 'tv'
 * @returns {Array<string>}
 */
export const getGenreNames = (genreIds, type = 'movie') => {
    if (!genreIds || !Array.isArray(genreIds)) return [];

    const mapping = type === 'tv' ? TV_GENRES : MOVIE_GENRES;
    return genreIds
        .map(id => mapping[id])
        .filter(Boolean);
};
