import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useUserMovies = () => {
    const { currentUser } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
    const [totalWatchTime, setTotalWatchTime] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setWatchlist([]);
            setContinueWatching([]);
            setTotalWatchTime(0);
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setWatchlist(data.watchlist || []);
                    setContinueWatching(data.continueWatching || []);
                    // Stored in seconds; format string expects minutes, we'll convert dynamically when rendering
                    setTotalWatchTime(data.totalWatchTime || 0);
                }
            } catch (error) {
                console.error("Error fetching user movies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    const addToWatchlist = async (movie, status = 'planning') => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const movieWithStatus = {
                ...movie,
                status,
                genre_ids: movie.genre_ids || []
            };
            await updateDoc(userRef, {
                watchlist: arrayUnion(movieWithStatus)
            });
            setWatchlist(prev => [...prev.filter(m => m.id !== movie.id), movieWithStatus]);
            return true;
        } catch (error) {
            // Document might not exist with these fields yet, try setDoc with merge
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                const movieWithStatus = {
                    ...movie,
                    status,
                    genre_ids: movie.genre_ids || []
                };
                await setDoc(userRef, { watchlist: arrayUnion(movieWithStatus) }, { merge: true });
                setWatchlist(prev => [...prev.filter(m => m.id !== movie.id), movieWithStatus]);
                return true;
            } catch (innerError) {
                console.error("Error adding to watchlist:", innerError);
                return false;
            }
        }
    };

    const removeFromWatchlist = async (movie) => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            // Need the exact object from the state to remove it from Firestore array
            const exactMovie = watchlist.find(m => m.id === movie.id);
            if (!exactMovie) return false;

            await updateDoc(userRef, {
                watchlist: arrayRemove(exactMovie)
            });
            setWatchlist(prev => prev.filter(m => m.id !== movie.id));
            return true;
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            return false;
        }
    };

    const isWatchlisted = (movieId) => {
        return watchlist.some(m => m.id === Number(movieId));
    };

    const getWatchlistStatus = (movieId) => {
        const movie = watchlist.find(m => m.id === Number(movieId));
        return movie ? movie.status : null;
    };

    const updateWatchlistStatus = async (movie, newStatus) => {
        if (!currentUser) return false;

        const simpleMovie = {
            id: movie.id,
            title: movie.title || movie.name,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date || movie.first_air_date,
            genre_ids: movie.genre_ids || []
        };

        const existingMovie = watchlist.find(m => m.id === Number(movie.id));

        if (existingMovie) {
            // If the status is the same, do nothing
            if (existingMovie.status === newStatus) return true;

            // Remove old, add new
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    watchlist: arrayRemove(existingMovie)
                });

                const updatedMovie = { ...simpleMovie, status: newStatus };
                await updateDoc(userRef, {
                    watchlist: arrayUnion(updatedMovie)
                });

                setWatchlist(prev => [...prev.filter(m => m.id !== movie.id), updatedMovie]);
                return true;
            } catch (error) {
                console.error("Error updating watchlist status:", error);
                return false;
            }
        } else {
            // Not in list yet, just add it
            return await addToWatchlist(simpleMovie, newStatus);
        }
    };

    const toggleWatchlist = async (movie) => {
        if (!movie) return false;

        // simplify movie object to avoid firestore limitations
        const simpleMovie = {
            id: movie.id,
            title: movie.title || movie.name,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date || movie.first_air_date,
            genre_ids: movie.genre_ids || []
        };

        if (isWatchlisted(movie.id)) {
            return await removeFromWatchlist(simpleMovie);
        } else {
            return await addToWatchlist(simpleMovie, 'planning');
        }
    };

    const addToContinueWatching = async (movie) => {
        if (!currentUser || !movie) return;

        const simpleMovie = {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            timestamp: Date.now()
        };

        try {
            const userRef = doc(db, 'users', currentUser.uid);

            // First get current
            const userSnap = await getDoc(userRef);
            let currentList = userSnap.exists() ? (userSnap.data().continueWatching || []) : [];

            // Remove if exists
            currentList = currentList.filter(m => m.id !== movie.id);

            // Add to top
            currentList.unshift(simpleMovie);

            // Keep only latest 20
            if (currentList.length > 20) currentList = currentList.slice(0, 20);

            await setDoc(userRef, { continueWatching: currentList }, { merge: true });
            setContinueWatching(currentList);
        } catch (error) {
            console.error("Error adding to continue watching:", error);
        }
    };

    const removeFromContinueWatching = async (movieId) => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const newList = continueWatching.filter(m => m.id !== Number(movieId));
            await updateDoc(userRef, { continueWatching: newList });
            setContinueWatching(newList);
            return true;
        } catch (error) {
            console.error("Error removing from continue watching:", error);
            return false;
        }
    };

    const addWatchTime = async (seconds) => {
        if (!currentUser || typeof seconds !== 'number' || seconds <= 0) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, { totalWatchTime: increment(seconds) }, { merge: true });
            setTotalWatchTime(prev => prev + seconds);
        } catch (error) {
            console.error("Error updating watch time:", error);
        }
    };

    /**
     * Wipes the entire 'continueWatching' history array for the current user.
     */
    const clearWatchHistory = async () => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { continueWatching: [] });
            setContinueWatching([]);
            return true;
        } catch (error) {
            console.error("Error clearing watch history:", error);
            return false;
        }
    };

    /**
     * Wipes the entire 'watchlist' array for the current user.
     */
    const clearWatchlist = async () => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { watchlist: [] });
            setWatchlist([]);
            return true;
        } catch (error) {
            console.error("Error clearing watchlist:", error);
            return false;
        }
    };

    return {
        watchlist,
        continueWatching,
        totalWatchTime,
        loading,
        isWatchlisted,
        getWatchlistStatus,
        updateWatchlistStatus,
        toggleWatchlist,
        addToContinueWatching,
        addWatchTime,
        removeFromContinueWatching,
        clearWatchHistory,
        clearWatchlist
    };
};
