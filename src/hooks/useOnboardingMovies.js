import { useQuery } from '@tanstack/react-query';
import { fetchTMDB } from '../api/tmdbClient';

export const useOnboardingMovies = () => {
    const { data: movies = [], isLoading: loading, error } = useQuery({
        queryKey: ['onboarding-movies'],
        queryFn: async () => {
            // Fetch only 1 page of trending movies for faster onboarding load
            const data = await fetchTMDB('/trending/movie/week', { page: 1 });

            const results = data?.results || [];

            // Remove duplicates just in case
            const uniqueMovies = Array.from(new Map(results.map(m => [m.id, m])).values());

            return uniqueMovies;
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    return { movies, loading, error };
};
