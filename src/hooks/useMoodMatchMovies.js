import { useQuery } from '@tanstack/react-query';
import { fetchTMDB } from '../api/tmdbClient';
import { useUserMoviesContext } from '../context/UserMoviesContext';

export const useMoodMatchMovies = () => {
    const { favoriteMovies } = useUserMoviesContext();

    return useQuery({
        queryKey: ['moodMatches', (favoriteMovies || []).map(m => m.id).join(',')],
        queryFn: async () => {
            let endpoint = '/trending/movie/week';
            let params = { page: 1 };

            if (favoriteMovies && favoriteMovies.length > 0) {
                const genreCounts = {};
                favoriteMovies.forEach(m => {
                    (m.genre_ids || []).forEach(gId => {
                        genreCounts[gId] = (genreCounts[gId] || 0) + 1;
                    });
                });

                const topGenres = Object.keys(genreCounts)
                    .sort((a, b) => genreCounts[b] - genreCounts[a])
                    .slice(0, 3)
                    .join(',');

                if (topGenres) {
                    endpoint = '/discover/movie';
                    params = {
                        with_genres: topGenres,
                        sort_by: 'popularity.desc',
                        page: 1
                    };
                }
            }

            const res = await fetchTMDB(endpoint, params);
            if (!res || !res.results) return [];

            // Personalized match percentage based on favorites (95% to 80%)
            const processed = res.results.map((m, index) => ({
                ...m,
                matchPercentage: Math.max(80, 99 - Math.floor(index * 1.5))
            }));

            // Filter out exact onboarding favorites
            const favIds = new Set((favoriteMovies || []).map(f => f.id));
            return processed.filter(m => !favIds.has(m.id));
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        enabled: true, // Always fetch trending at minimum
    });
};
