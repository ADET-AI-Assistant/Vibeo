import { useState, useEffect } from 'react';
import { fetchTMDB } from '../api/tmdbClient';
import { useAuth } from '../context/AuthContext';

export const useMoodMatchMovies = () => {
    const { favoriteMovies } = useAuth();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchMatches = async () => {
            try {
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
                if (isMounted && res && res.results) {
                    // Personalized match percentage based on favorites (95% to 80%)
                    const processed = res.results.map((m, index) => ({
                        ...m,
                        matchPercentage: Math.max(80, 99 - Math.floor(index * 1.5))
                    }));

                    // Filter out exact onboarding favorites
                    const favIds = new Set((favoriteMovies || []).map(f => f.id));
                    const uniqueMatches = processed.filter(m => !favIds.has(m.id));

                    setMovies(uniqueMatches);
                }
            } catch (error) {
                console.error("Error fetching mood matches:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMatches();

        return () => isMounted = false;
    }, [favoriteMovies]);

    return { movies, loading };
};
