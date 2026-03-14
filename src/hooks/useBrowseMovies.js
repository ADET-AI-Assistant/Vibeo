/**
 * useBrowseMovies.js
 * ═══════════════════════════════════════════════════════════════
 * Infinite scroll hook for the Browse page.
 * Uses React Query's useInfiniteQuery for paginated infinite loading.
 * Capped at 10 pages (~200 movies) to prevent memory issues.
 * ═══════════════════════════════════════════════════════════════
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchTMDB } from '../api/tmdbClient';
import { getLocalISOString } from '../context/UserMoviesContext';

const MAX_PAGES = 10; // Safety cap to prevent memory issues

/**
 * TMDB Genre IDs
 */
export const GENRE_MAP = [
    { id: '', label: 'All Genres' },
    { id: '28', label: 'Action' },
    { id: '12', label: 'Adventure' },
    { id: '16', label: 'Animation' },
    { id: '35', label: 'Comedy' },
    { id: '80', label: 'Crime' },
    { id: '99', label: 'Documentary' },
    { id: '18', label: 'Drama' },
    { id: '10751', label: 'Family' },
    { id: '14', label: 'Fantasy' },
    { id: '36', label: 'History' },
    { id: '27', label: 'Horror' },
    { id: '10402', label: 'Music' },
    { id: '9648', label: 'Mystery' },
    { id: '10749', label: 'Romance' },
    { id: '878', label: 'Science Fiction' },
    { id: '53', label: 'Thriller' },
    { id: '10752', label: 'War' },
    { id: '37', label: 'Western' },
];

/**
 * Sort options map to different TMDB endpoints/params
 */
export const SORT_OPTIONS = [
    { id: 'popular', label: 'Popular', endpoint: '/movie/popular' },
    { id: 'top_rated', label: 'Top Rated', endpoint: '/movie/top_rated' },
    { id: 'now_playing', label: 'Now Playing', endpoint: '/movie/now_playing' },
    { id: 'upcoming', label: 'Upcoming', endpoint: '/movie/upcoming' },
    { id: 'trending', label: 'Trending', endpoint: '/trending/movie/week' },
];

export const useBrowseMovies = (sortId = 'popular', genreId = '') => {
    const sortOption = SORT_OPTIONS.find(s => s.id === sortId) || SORT_OPTIONS[0];

    // If a genre is selected, use /discover/movie to filter by genre
    const useDiscover = !!genreId;
    const endpoint = useDiscover ? '/discover/movie' : sortOption.endpoint;

    const buildParams = (page) => {
        const params = { page };
        if (useDiscover) {
            params.with_genres = genreId;
            switch (sortId) {
                case 'popular':
                    params.sort_by = 'popularity.desc';
                    break;
                case 'top_rated':
                    params.sort_by = 'vote_average.desc';
                    params['vote_count.gte'] = 200;
                    break;
                case 'now_playing':
                    params.sort_by = 'primary_release_date.desc';
                    params['primary_release_date.lte'] = getLocalISOString();
                    params['primary_release_date.gte'] = getLocalISOString(new Date(Date.now() - 90 * 86400000));
                    break;
                case 'upcoming':
                    params.sort_by = 'primary_release_date.asc';
                    params['primary_release_date.gte'] = getLocalISOString();
                    break;
                default:
                    params.sort_by = 'popularity.desc';
            }
        }
        return params;
    };

    const {
        data,
        isLoading: loading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ['browse', sortId, genreId],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await fetchTMDB(endpoint, buildParams(pageParam));
            return {
                results: res?.results || [],
                page: pageParam,
                total_pages: res?.total_pages || 1,
            };
        },
        getNextPageParam: (lastPage) => {
            const nextPage = lastPage.page + 1;
            if (nextPage > Math.min(lastPage.total_pages, MAX_PAGES)) return undefined;
            return nextPage;
        },
        staleTime: 1000 * 60 * 5,
    });

    // Flatten all pages into a single movie array
    const movies = data?.pages?.flatMap(p => p.results) || [];

    const title = genreId
        ? `${GENRE_MAP.find(g => g.id === genreId)?.label || 'Movies'} — ${sortOption.label}`
        : sortOption.label;

    return {
        movies,
        loading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage: !!hasNextPage,
        title,
        error,
    };
};
