import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, provider, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isOnboarded, setIsOnboarded] = useState(null);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sign in with Google
    const loginWithGoogle = () => {
        return signInWithPopup(auth, provider);
    };

    // Sign out
    const logout = () => {
        return signOut(auth);
    };

    // Save Onboarding Data
    const saveOnboardingData = async (selectedMovies) => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, {
                onboarded: true,
                favoriteMovies: selectedMovies,
                email: currentUser.email,
                displayName: currentUser.displayName,
                createdAt: new Date()
            }, { merge: true });

            setIsOnboarded(true);
            setFavoriteMovies(selectedMovies);
        } catch (error) {
            console.error("Error saving onboarding data:", error);
            throw error;
        }
    };

    // Add single movie to favorites
    const addToFavorites = async (movie) => {
        if (!currentUser) {
            alert("Please sign in to save movies to your Watchlist!");
            return;
        }

        // Prevent duplicates
        if (favoriteMovies.find(m => m.id === movie.id)) {
            return;
        }

        const newFavorites = [...favoriteMovies, movie];
        setFavoriteMovies(newFavorites);

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, { favoriteMovies: newFavorites }, { merge: true });
        } catch (error) {
            console.error("Error adding to favorites:", error);
            // Revert state on failure
            setFavoriteMovies(favoriteMovies);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                setIsOnboarded(null);
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists() && userSnap.data().onboarded) {
                        setIsOnboarded(true);
                        setFavoriteMovies(userSnap.data().favoriteMovies || []);
                    } else {
                        setIsOnboarded(false);
                        setFavoriteMovies([]);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setIsOnboarded(false);
                }
            } else {
                setCurrentUser(null);
                setIsOnboarded(false);
                setFavoriteMovies([]);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = useMemo(() => ({
        currentUser,
        isOnboarded,
        favoriteMovies,
        loginWithGoogle,
        logout,
        saveOnboardingData,
        addToFavorites
    }), [currentUser, isOnboarded, favoriteMovies]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
