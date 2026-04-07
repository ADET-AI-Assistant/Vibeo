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
    const [loading, setLoading] = useState(true);

    // Sign in with Google
    const loginWithGoogle = () => {
        return signInWithPopup(auth, provider);
    };

    // Sign out
    const logout = () => {
        return signOut(auth);
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                setIsOnboarded(null);
                try {
                    const token = await user.getIdToken();
                    
                    // --- TEMPORARY POSTMAN DEBUGGING ---
                    console.log("MY FRESH TOKEN:", token);
                    window.tempToken = token;
                    // -----------------------------------

                    const response = await fetch("http://127.0.0.1:8000/api/auth/me/", {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setIsOnboarded(data.onboarded);
                    } else {
                        console.error("Failed to fetch user from Django", response.status);
                        setIsOnboarded(false);
                    }
                } catch (error) {
                    console.error("Error communicating with Django:", error);
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

    const completeOnboarding = () => setIsOnboarded(true);

    const value = useMemo(() => ({
        currentUser,
        loading,
        isOnboarded,
        loginWithGoogle,
        logout,
        completeOnboarding
    }), [currentUser, loading, isOnboarded]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
