import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
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
    const [loading, setLoading] = useState(true);

    // Sign in with Google
    const loginWithGoogle = () => {
        return signInWithPopup(auth, provider);
    };

    // Sign out
    const logout = () => {
        return signOut(auth);
    };

    // Update user profile (username, avatar)
    const updateUserProfile = async (displayName, photoURL) => {
        if (!auth.currentUser) return;
        
        await updateProfile(auth.currentUser, {
            displayName: displayName,
            photoURL: photoURL
        });
        
        // Force state un-thawing to trigger re-renders natively with the new auth reference
        setCurrentUser({ ...auth.currentUser }); 
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
                    } else {
                        setIsOnboarded(false);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setIsOnboarded(false);
                }
            } else {
                setCurrentUser(null);
                setIsOnboarded(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = useMemo(() => ({
        currentUser,
        loading,
        isOnboarded,
        loginWithGoogle,
        logout,
        updateUserProfile
    }), [currentUser, loading, isOnboarded]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
