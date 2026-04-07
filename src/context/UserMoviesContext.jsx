import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { syncUserStats } from '@/api/djangoClient';
import { triggerError } from '@/components/common/ErrorToast';

const UserMoviesContext = createContext();

/**
 * Returns a YYYY-MM-DD string in the local timezone.
 * Fixes timezone bug where toISOString() uses UTC.
 */
export const getLocalISOString = (date = new Date()) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const UserMoviesProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [totalWatchTime, setTotalWatchTime] = useState(0);
    const [streakData, setStreakData] = useState({ current: 0, highest: 0, lastActiveDate: '' });
    const [activityPoints, setActivityPoints] = useState({}); // { 'YYYY-MM-DD': points }
    const [loading, setLoading] = useState(true);
    const streakCheckedRef = useRef(false);

    useEffect(() => {
        if (!currentUser) {
            setWatchlist([]);
            setContinueWatching([]);
            setTotalWatchTime(0);
            setStreakData({ current: 0, highest: 0, lastActiveDate: '' });
            setActivityPoints({});
            setLoading(false);
            streakCheckedRef.current = false;
            return;
        }

        streakCheckedRef.current = false;
        setLoading(true);
        const userRef = doc(db, 'users', currentUser.uid);

        // REAL-TIME LISTENER
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const rawWatchlist = data.watchlist || [];
                // Add legacy fallback for media_type
                const processedWatchlist = rawWatchlist.map(m => ({
                    ...m,
                    media_type: m.media_type || (m.name ? 'tv' : 'movie')
                }));
                setWatchlist(processedWatchlist);

                const rawContinueWatching = data.continueWatching || [];
                // Add legacy fallback for media_type in continue watching too
                const processedContinueWatching = rawContinueWatching.map(m => ({
                    ...m,
                    media_type: m.media_type || (m.name ? 'tv' : 'movie')
                }));
                setContinueWatching(processedContinueWatching);
                setFavoriteMovies(data.favoriteMovies || []);
                setTotalWatchTime(data.totalWatchTime || 0);

                const currentStreak = data.streak || { current: 0, highest: 0, lastActiveDate: '' };
                setStreakData(currentStreak);
                setActivityPoints(data.activityPoints || {});

                // Streak Calculation Logic & Daily Visit Point
                const today = getLocalISOString();
                if (currentStreak.lastActiveDate !== today && !streakCheckedRef.current) {
                    streakCheckedRef.current = true;
                    const updateStreak = async () => {
                        let newStreak = 1;
                        let newHighest = currentStreak.highest || 0;

                        if (currentStreak.lastActiveDate) {
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            const yesterdayStr = getLocalISOString(yesterday);

                            if (currentStreak.lastActiveDate === yesterdayStr) {
                                newStreak = (currentStreak.current || 0) + 1;
                            }
                        }

                        if (newStreak > newHighest) newHighest = newStreak;

                        await updateDoc(userRef, {
                            streak: {
                                current: newStreak,
                                highest: newHighest,
                                lastActiveDate: today
                            }
                        });
                        recordActivity(1); // Visit point
                    };
                    updateStreak();
                }
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to user movies:", error);
            triggerError("Could not sync your library. Please check your connection.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // MANUAL SYNC TRIGGER
    const syncToBackend = async () => {
        if (!currentUser) return;
        console.log('🔄 Syncing user stats to Django backend...');
        try {
            const res = await syncUserStats({
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                totalWatchTime,
                streakData
            });
            if (res) console.log('✅ Sync successful');
            return res;
        } catch (err) {
            console.error('❌ Sync failed:', err);
        }
    };

    // BACKGROUND SYNC TO DJANGO (Leaderboard & Compliance)
    useEffect(() => {
        if (!currentUser || loading) return;

        // Debounce sync to avoid spamming the backend
        const syncTimeout = setTimeout(() => {
            syncToBackend();
        }, 8000); // 8s debounce for data changes

        return () => clearTimeout(syncTimeout);
    }, [currentUser, loading, totalWatchTime, streakData]);

    // Helper functions (copied and adapted from the former hook)

    const addToWatchlist = async (movie, status = 'planning') => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            let currentList = userSnap.exists() ? (userSnap.data().watchlist || []) : [];

            // Prevent duplicates
            if (currentList.some(m => m.id === Number(movie.id))) {
                return await updateWatchlistStatus(movie, status);
            }

            const movieWithStatus = {
                ...movie,
                id: Number(movie.id),
                status,
                media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
                genre_ids: movie.genre_ids || [],
                addedAt: Date.now()
            };

            await updateDoc(userRef, {
                watchlist: arrayUnion(movieWithStatus)
            });
            return true;
        } catch (error) {
            console.error("Error adding to watchlist:", error);
            triggerError("Failed to add to library. Please try again.");
            return false;
        }
    };

    const removeFromWatchlist = async (movie) => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return false;

            const currentList = userSnap.data().watchlist || [];
            const newList = currentList.filter(m => m.id !== Number(movie.id));

            await updateDoc(userRef, {
                watchlist: newList
            });
            return true;
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            triggerError("Failed to remove from library. Please try again.");
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
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return await addToWatchlist(movie, newStatus);

            const currentList = userSnap.data().watchlist || [];
            const movieIndex = currentList.findIndex(m => m.id === Number(movie.id));

            if (movieIndex === -1) {
                return await addToWatchlist(movie, newStatus);
            }

            // Already has the status? Success.
            if (currentList[movieIndex].status === newStatus) return true;

            // Update status in a copy of the list
            const newList = [...currentList];
            newList[movieIndex] = {
                ...newList[movieIndex],
                status: newStatus,
                updatedAt: Date.now()
            };

            await updateDoc(userRef, {
                watchlist: newList
            });

            // Record Activity (points system)
            if (newStatus === 'completed') {
                recordActivity(3);
            } else {
                recordActivity(1);
            }

            return true;
        } catch (error) {
            console.error("Error updating watchlist status:", error);
            triggerError("Failed to update status. Please try again.");
            return false;
        }
    };

    const toggleWatchlist = async (movie) => {
        if (!movie) return false;
        const simpleMovie = {
            id: movie.id,
            title: movie.title,
            name: movie.name,
            media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
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
            name: movie.name,
            media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date || movie.first_air_date,
            timestamp: Date.now()
        };

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            let currentList = userSnap.exists() ? (userSnap.data().continueWatching || []) : [];
            currentList = currentList.filter(m => m.id !== movie.id);
            currentList.unshift(simpleMovie);
            if (currentList.length > 20) currentList = currentList.slice(0, 20);
            await setDoc(userRef, { continueWatching: currentList }, { merge: true });
        } catch (error) {
            console.error("Error adding to continue watching:", error);
            triggerError("Could not update your watch history.");
        }
    };

    const removeFromContinueWatching = async (movieId) => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const newList = continueWatching.filter(m => m.id !== Number(movieId));
            await updateDoc(userRef, { continueWatching: newList });
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
        } catch (error) {
            console.error("Error updating watch time:", error);
            triggerError("Could not save your watch time.");
        }
    };

    // --- ACTIVITY GRID LOGIC ---
    const recordActivity = async (points) => {
        if (!currentUser) return;
        const today = getLocalISOString();
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, {
                activityPoints: {
                    [today]: increment(points)
                }
            }, { merge: true });
        } catch (error) {
            console.error("Error recording activity:", error);
            // Don't trigger global error for silent points to avoid annoyance
        }
    };

    const clearWatchHistory = async () => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { continueWatching: [] });
            return true;
        } catch (error) {
            console.error("Error clearing watch history:", error);
            return false;
        }
    };

    const clearWatchlist = async () => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { watchlist: [] });
            return true;
        } catch (error) {
            console.error("Error clearing watchlist:", error);
            return false;
        }
    };

    // --- FAVORITES LOGIC (Consolidated from AuthContext) ---

    const toggleFavorite = async (movie) => {
        if (!currentUser) return false;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const isFav = favoriteMovies.some(m => m.id === movie.id);

            if (isFav) {
                const exactMovie = favoriteMovies.find(m => m.id === movie.id);
                await updateDoc(userRef, { favoriteMovies: arrayRemove(exactMovie) });
            } else {
                await updateDoc(userRef, { favoriteMovies: arrayUnion(movie) });
            }
            return true;
        } catch (error) {
            console.error("Error toggling favorite:", error);
            return false;
        }
    };

    const saveOnboardingData = async ({ favorites = [], seen = [] }) => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);

            // Add all "seen" movies to the watchlist as 'completed'
            // To do this reliably during onboarding without triggering UI weirdness,
            // we batch update the document's watchlist array directly.

            // First get the current watchlist in case there is one (unlikely but possible)
            const userSnap = await getDoc(userRef);
            let currentWatchlist = userSnap.exists() ? (userSnap.data().watchlist || []) : [];

            // Format seen movies
            const newWatchlistItems = seen.map(movie => ({
                ...movie,
                id: Number(movie.id),
                status: 'completed',
                media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
                genre_ids: movie.genre_ids || [],
                addedAt: Date.now(),
                updatedAt: Date.now()
            }));

            // Filter out any duplicates
            const existingIds = new Set(currentWatchlist.map(m => m.id));
            const uniqueNewItems = newWatchlistItems.filter(m => !existingIds.has(m.id));

            const updatedWatchlist = [...currentWatchlist, ...uniqueNewItems];

            await setDoc(userRef, {
                onboarded: true,
                favoriteMovies: favorites,
                watchlist: updatedWatchlist,
                email: currentUser.email,
                displayName: currentUser.displayName,
                lastActiveDate: getLocalISOString()
            }, { merge: true });

            // Record activity points for the massive onboarding completed list
            if (uniqueNewItems.length > 0) {
                recordActivity(uniqueNewItems.length * 3); // 3 points per completed movie
            }

            return true;
        } catch (error) {
            console.error("Error saving onboarding data:", error);
            throw error;
        }
    };

    const value = {
        watchlist,
        continueWatching,
        favoriteMovies,
        totalWatchTime,
        streakData,
        activityPoints,
        loading,
        isWatchlisted,
        getWatchlistStatus,
        updateWatchlistStatus,
        toggleWatchlist,
        addToContinueWatching,
        addWatchTime,
        removeFromContinueWatching,
        clearWatchHistory,
        clearWatchlist,
        recordActivity,
        toggleFavorite,
        saveOnboardingData,
        syncToBackend
    };

    return (
        <UserMoviesContext.Provider value={value}>
            {children}
        </UserMoviesContext.Provider>
    );
};

export const useUserMoviesContext = () => {
    const context = useContext(UserMoviesContext);
    if (!context) {
        throw new Error('useUserMoviesContext must be used within a UserMoviesProvider');
    }
    return context;
};
