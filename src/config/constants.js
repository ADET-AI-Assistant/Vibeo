export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

export const STREAM_PROVIDERS = [
    {
        key: 'vidsrc',
        label: 'VidSrc',
        movieUrl: (id) => `https://vidsrc.sh/embed/movie/${id}?ds_lang=en`,
        tvUrl: (id, season, episode) => `https://vidsrc.sh/embed/tv/${id}/${season}/${episode}?ds_lang=en`,
    }
];

