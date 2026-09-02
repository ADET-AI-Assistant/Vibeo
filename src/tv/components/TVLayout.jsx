import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { TVFocusProvider } from '../context/TVFocusContext';
import TVSidebar from './TVSidebar';
import '../styles/tv.css';

const TVLayoutInner = () => {
    const [cursorHidden, setCursorHidden] = useState(false);
    const idleTimerRef = useRef(null);

    // Auto-hide mouse cursor after 3 seconds of inactivity
    useEffect(() => {
        const handleMouseMove = () => {
            setCursorHidden(false);
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
                setCursorHidden(true);
            }, 3000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        idleTimerRef.current = setTimeout(() => setCursorHidden(true), 3000);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(idleTimerRef.current);
        };
    }, []);

    // Ensure document title reflects TV Mode
    useEffect(() => {
        const prevTitle = document.title;
        document.title = 'Vibeo TV';
        return () => {
            document.title = prevTitle;
        };
    }, []);

    return (
        <div className={`tv-app-root ${cursorHidden ? 'tv-cursor-hidden' : ''}`}>
            <TVSidebar />
            <main className="tv-screen">
                <Outlet />
            </main>
        </div>
    );
};

export const TVLayout = () => {
    return (
        <TVFocusProvider>
            <TVLayoutInner />
        </TVFocusProvider>
    );
};

export default TVLayout;
