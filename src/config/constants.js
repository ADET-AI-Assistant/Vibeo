export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

export const STREAM_PROVIDERS = [
    {
        key: 'videasy',
        label: 'Videasy',
        movieUrl: (id) => `https://player.videasy.net/movie/${id}`,
        tvUrl: (id, season, episode) => `https://player.videasy.net/tv/${id}/${season}/${episode}`,
    }
];

