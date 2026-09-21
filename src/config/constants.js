export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

export const STREAM_PROVIDERS = [
    {
        key: 'vidzy',
        label: 'Vidzy',
        movieUrl: (id) => `https://vidzy.org/movie/${id}`,
        tvUrl: (id, season, episode) => `https://vidzy.org/serie/${id}/${season}/${episode}`,
    }
];

