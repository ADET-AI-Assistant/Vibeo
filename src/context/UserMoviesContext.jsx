import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, increment, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import {
    createFavorite,
    createHistoryItem,
    deleteFavorite,
    deleteWatchlistItem,
    getDjangoToken,
    syncUserStats,
    updateWatchlistItem,
} from '@/api/djangoClient';
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

    const mirrorToDjango = async (operation) => {
        if (!getDjangoToken()) return null;

        try {
            return await operation();
        } catch (error) {
            console.warn('Django API mirror failed:', error);
            triggerError('Saved locally, but Django API sync failed.', 'error');
            return null;
        }
    };

    const GUEST_WATCHLIST_KEY = 'vibeo_guest_watchlist';
    const GUEST_CONTINUE_KEY = 'vibeo_guest_continue_watching';
    const GUEST_FAVORITES_KEY = 'vibeo_guest_favorites';

    const getLocalData = (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : [];
        } catch {
            return [];
        }
    };

    const setLocalData = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn(`Failed to save ${key} to localStorage:`, e);
        }
    };

    useEffect(() => {
        if (!currentUser) {
            setWatchlist(getLocalData(GUEST_WATCHLIST_KEY));
            setContinueWatching(getLocalData(GUEST_CONTINUE_KEY));
            setFavoriteMovies(getLocalData(GUEST_FAVORITES_KEY));
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
    const syncToBackend = useCallback(async () => {
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
    }, [currentUser, totalWatchTime, streakData]);

    // BACKGROUND SYNC TO DJANGO (Leaderboard & Compliance)
    useEffect(() => {
        if (!currentUser || loading) return;

        // Debounce sync to avoid spamming the backend
        const syncTimeout = setTimeout(() => {
            syncToBackend();
        }, 8000); // 8s debounce for data changes

        return () => clearTimeout(syncTimeout);
    }, [currentUser, loading, totalWatchTime, streakData]);

    // Helper functions with optimistic updates and guest fallback

    const addToWatchlist = async (movie, status = 'planning') => {
        if (!movie) return false;

        const movieWithStatus = {
            ...movie,
            id: Number(movie.id),
            title: movie.title || movie.name || null,
            name: movie.name || movie.title || null,
            status,
            media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
            poster_path: movie.poster_path || null,
            backdrop_path: movie.backdrop_path || null,
            vote_average: movie.vote_average || 0,
            release_date: movie.release_date || movie.first_air_date || null,
            genre_ids: movie.genre_ids || [],
            addedAt: Date.now()
        };

        // Always update local state optimistically
        setWatchlist(prev => {
            const currentList = prev || [];
            const exists = currentList.some(m => Number(m.id) === Number(movie.id));
            const updated = exists
                ? currentList.map(m => Number(m.id) === Number(movie.id) ? { ...m, status, updatedAt: Date.now() } : m)
                : [movieWithStatus, ...currentList];
            if (!currentUser) setLocalData(GUEST_WATCHLIST_KEY, updated);
            return updated;
        });

        if (!currentUser) return true;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            let currentList = watchlist || [];

            // Prevent duplicates in Firestore
            if (currentList.some(m => Number(m.id) === Number(movie.id))) {
                return await updateWatchlistStatus(movie, status);
            }

            await updateDoc(userRef, {
                watchlist: arrayUnion(movieWithStatus)
            });
            await mirrorToDjango(() => updateWatchlistItem(movieWithStatus, status));
            return true;
        } catch (error) {
            console.error("Error adding to watchlist:", error);
            triggerError("Failed to sync to cloud library.");
            return true; // Still true locally for user experience
        }
    };

    const removeFromWatchlist = async (movie) => {
        if (!movie) return false;

        // Optimistic update
        setWatchlist(prev => {
            const updated = (prev || []).filter(m => Number(m.id) !== Number(movie.id));
            if (!currentUser) setLocalData(GUEST_WATCHLIST_KEY, updated);
            return updated;
        });

        if (!currentUser) return true;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            
            // USE TRANSACTION FOR ATOMICITY
            await runTransaction(db, async (transaction) => {
                const docSnap = await transaction.get(userRef);
                if (!docSnap.exists()) return;

                const currentWatchlist = docSnap.data().watchlist || [];
                const newList = currentWatchlist.filter(m => Number(m.id) !== Number(movie.id));
                
                transaction.update(userRef, { watchlist: newList });
            });
            await mirrorToDjango(() => deleteWatchlistItem(movie));
            
            return true;
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            triggerError("Failed to remove from cloud library.");
            return true;
        }
    };

    const isWatchlisted = (movieId) => {
        if (!movieId) return false;
        return (watchlist || []).some(m => Number(m.id) === Number(movieId));
    };

    const getWatchlistStatus = (movieId) => {
        if (!movieId) return null;
        const movie = (watchlist || []).find(m => Number(m.id) === Number(movieId));
        return movie ? movie.status : null;
    };

    const updateWatchlistStatus = async (movie, newStatus) => {
        if (!movie) return false;

        // Optimistic update
        setWatchlist(prev => {
            const currentList = prev || [];
            const movieIndex = currentList.findIndex(m => Number(m.id) === Number(movie.id));
            let updated;
            if (movieIndex === -1) {
                const movieWithStatus = {
                    ...movie,
                    id: Number(movie.id),
                    title: movie.title || movie.name || null,
                    name: movie.name || movie.title || null,
                    status: newStatus,
                    media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
                    poster_path: movie.poster_path || null,
                    backdrop_path: movie.backdrop_path || null,
                    vote_average: movie.vote_average || 0,
                    release_date: movie.release_date || movie.first_air_date || null,
                    genre_ids: movie.genre_ids || [],
                    addedAt: Date.now(),
                    updatedAt: Date.now()
                };
                updated = [movieWithStatus, ...currentList];
            } else {
                updated = [...currentList];
                updated[movieIndex] = {
                    ...updated[movieIndex],
                    status: newStatus,
                    updatedAt: Date.now()
                };
            }
            if (!currentUser) setLocalData(GUEST_WATCHLIST_KEY, updated);
            return updated;
        });

        if (!currentUser) return true;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            
            await runTransaction(db, async (transaction) => {
                const docSnap = await transaction.get(userRef);
                if (!docSnap.exists()) return;

                const currentList = docSnap.data().watchlist || [];
                const movieIndex = currentList.findIndex(m => Number(m.id) === Number(movie.id));

                if (movieIndex === -1) {
                    const movieWithStatus = {
                        ...movie,
                        id: Number(movie.id),
                        title: movie.title || movie.name || null,
                        name: movie.name || movie.title || null,
                        status: newStatus,
                        media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
                        poster_path: movie.poster_path || null,
                        backdrop_path: movie.backdrop_path || null,
                        genre_ids: movie.genre_ids || [],
                        addedAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    transaction.update(userRef, { watchlist: arrayUnion(movieWithStatus) });
                } else {
                    const newList = [...currentList];
                    newList[movieIndex] = {
                        ...newList[movieIndex],
                        status: newStatus,
                        updatedAt: Date.now()
                    };
                    transaction.update(userRef, { watchlist: newList });
                }
            });

            // Record Activity (points system)
            if (newStatus === 'completed') {
                recordActivity(3);
            } else {
                recordActivity(1);
            }

            await mirrorToDjango(() => updateWatchlistItem(movie, newStatus));

            return true;
        } catch (error) {
            console.error("Error updating watchlist status:", error);
            triggerError("Failed to sync status update.");
            return true;
        }
    };

    const toggleWatchlist = async (movie) => {
        if (!movie) return false;
        const simpleMovie = {
            id: Number(movie.id),
            title: movie.title || movie.name || null,
            name: movie.name || movie.title || null,
            media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
            poster_path: movie.poster_path || null,
            backdrop_path: movie.backdrop_path || null,
            vote_average: movie.vote_average || 0,
            release_date: movie.release_date || movie.first_air_date || null,
            genre_ids: movie.genre_ids || []
        };

        if (isWatchlisted(movie.id)) {
            return await removeFromWatchlist(simpleMovie);
        } else {
            return await addToWatchlist(simpleMovie, 'planning');
        }
    };

    const addToContinueWatching = async (movie) => {
        if (!movie) return;
        const simpleMovie = {
            id: Number(movie.id),
            title: movie.title || movie.name || null,
            name: movie.name || movie.title || null,
            media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
            poster_path: movie.poster_path || null,
            backdrop_path: movie.backdrop_path || null,
            vote_average: movie.vote_average || 0,
            release_date: movie.release_date || movie.first_air_date || null,
            timestamp: Date.now()
        };

        setContinueWatching(prev => {
            let currentList = (prev || []).filter(m => Number(m.id) !== Number(movie.id));
            currentList.unshift(simpleMovie);
            if (currentList.length > 20) currentList = currentList.slice(0, 20);
            if (!currentUser) setLocalData(GUEST_CONTINUE_KEY, currentList);
            return currentList;
        });

        if (!currentUser) return;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            let currentList = continueWatching || [];
            currentList = currentList.filter(m => Number(m.id) !== Number(movie.id));
            currentList.unshift(simpleMovie);
            if (currentList.length > 20) currentList = currentList.slice(0, 20);
            await setDoc(userRef, { continueWatching: currentList }, { merge: true });
            await mirrorToDjango(() => createHistoryItem(simpleMovie));
        } catch (error) {
            console.error("Error adding to continue watching:", error);
            triggerError("Could not update your watch history.");
        }
    };

    const removeFromContinueWatching = async (movieId) => {
        setContinueWatching(prev => {
            const newList = (prev || []).filter(m => Number(m.id) !== Number(movieId));
            if (!currentUser) setLocalData(GUEST_CONTINUE_KEY, newList);
            return newList;
        });

        if (!currentUser) return true;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const newList = continueWatching.filter(m => Number(m.id) !== Number(movieId));
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
    const recordActivity = async (points = 1) => {
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
        setContinueWatching([]);
        if (!currentUser) {
            setLocalData(GUEST_CONTINUE_KEY, []);
            return true;
        }
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
        setWatchlist([]);
        if (!currentUser) {
            setLocalData(GUEST_WATCHLIST_KEY, []);
            return true;
        }
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
        if (!movie) return false;
        const simpleMovie = {
            id: Number(movie.id),
            title: movie.title || movie.name || null,
            name: movie.name || movie.title || null,
            media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
            poster_path: movie.poster_path || null,
            backdrop_path: movie.backdrop_path || null,
            vote_average: movie.vote_average || 0,
            release_date: movie.release_date || movie.first_air_date || null
        };

        const isFav = (favoriteMovies || []).some(m => Number(m.id) === Number(movie.id));

        setFavoriteMovies(prev => {
            const list = prev || [];
            const updated = isFav
                ? list.filter(m => Number(m.id) !== Number(movie.id))
                : [simpleMovie, ...list];
            if (!currentUser) setLocalData(GUEST_FAVORITES_KEY, updated);
            return updated;
        });

        if (!currentUser) return true;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            if (isFav) {
                const exactMovie = favoriteMovies.find(m => Number(m.id) === Number(movie.id));
                await updateDoc(userRef, { favoriteMovies: arrayRemove(exactMovie) });
                await mirrorToDjango(() => deleteFavorite(exactMovie || movie));
            } else {
                await updateDoc(userRef, { favoriteMovies: arrayUnion(simpleMovie) });
                await mirrorToDjango(() => createFavorite(simpleMovie));
            }
            return true;
        } catch (error) {
            console.error("Error toggling favorite:", error);
            return false;
        }
    };

    const saveOnboardingData = async ({ favorites = [], seen = [] }, explicitUid = null, explicitUser = null) => {
        const uid = explicitUid || (currentUser ? currentUser.uid : null);
        const userObj = explicitUser || currentUser;
        
        if (!uid || !userObj) return;
        try {
            const userRef = doc(db, 'users', uid);

            // Add all "seen" movies to the watchlist as 'completed'
            // To do this reliably during onboarding without triggering UI weirdness,
            // we batch update the document's watchlist array directly.

            // First get the current watchlist in case there is one (unlikely but possible)
            const userSnap = await getDoc(userRef);
            let currentWatchlist = userSnap.exists() ? (userSnap.data().watchlist || []) : [];

            // Format seen movies with defensive sanitization
            const newWatchlistItems = seen.map(movie => ({
                id: Number(movie.id),
                title: movie.title || null,
                name: movie.name || null,
                status: 'completed',
                media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
                poster_path: movie.poster_path || null,
                vote_average: movie.vote_average || 0,
                release_date: movie.release_date || movie.first_air_date || null,
                genre_ids: movie.genre_ids || [],
                addedAt: Date.now(),
                updatedAt: Date.now()
            }));

            // Format favorites with defensive sanitization
            const sanitizedFavorites = favorites.map(movie => ({
                id: Number(movie.id),
                title: movie.title || null,
                name: movie.name || null,
                media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
                poster_path: movie.poster_path || null,
                vote_average: movie.vote_average || 0,
                release_date: movie.release_date || movie.first_air_date || null
            }));

            // Filter out any duplicates
            const existingIds = new Set(currentWatchlist.map(m => m.id));
            const uniqueNewItems = newWatchlistItems.filter(m => !existingIds.has(m.id));

            const updatedWatchlist = [...currentWatchlist, ...uniqueNewItems];

            await setDoc(userRef, {
                onboarded: true,
                favoriteMovies: sanitizedFavorites,
                watchlist: updatedWatchlist,
                email: userObj.email,
                displayName: userObj.displayName,
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
        favorites: favoriteMovies,
        totalWatchTime,
        streakData,
        activityPoints,
        loading,
        isWatchlisted,
        getWatchlistStatus,
        updateWatchlistStatus,
        toggleWatchlist,
        addToWatchlist,
        removeFromWatchlist,
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
