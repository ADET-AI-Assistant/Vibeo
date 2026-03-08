import { useUserMoviesContext } from '../context/UserMoviesContext';

export const useUserMovies = () => {
    return useUserMoviesContext();
};
