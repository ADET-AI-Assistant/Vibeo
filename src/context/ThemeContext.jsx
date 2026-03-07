import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    Palette, Sun, Moon, Snowflake, Ghost, Box, Terminal,
    Coffee, Sparkles, Waves, Activity, Sunrise,
    Gamepad2, Cloud, Cpu
} from 'lucide-react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Default to 'default' or read from localStorage
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('vibeo-theme') || 'default';
    });

    // Default to 'none' or read from localStorage
    const [backgroundPattern, setBackgroundPattern] = useState(() => {
        return localStorage.getItem('vibeo-pattern') || 'none';
    });

    useEffect(() => {
        // Persist theme
        localStorage.setItem('vibeo-theme', theme);
        // Apply to html for root-level CSS selectors (scrollbar, etc)
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        // Persist pattern
        localStorage.setItem('vibeo-pattern', backgroundPattern);
        // Apply to html for root-level CSS selectors
        document.documentElement.setAttribute('data-pattern', backgroundPattern);
    }, [backgroundPattern]);

    // Favorites persistent in localStorage
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('vibeo-theme-favorites');
        return saved ? JSON.parse(saved) : ['default', 'oled']; // Default favorites
    });

    useEffect(() => {
        localStorage.setItem('vibeo-theme-favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (id) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const changeTheme = (id) => setTheme(id);
    const changeBackground = (id) => setBackgroundPattern(id);

    const resetTheme = () => {
        setTheme('default');
        setBackgroundPattern('none');
    };

    const value = {
        theme,
        changeTheme,
        resetTheme,
        backgroundPattern,
        changeBackground,
        favorites,
        toggleFavorite,
        availableThemes: [
            // Standard / Base Themes
            {
                id: 'default', name: 'System', desc: 'Match device', icon: 'Palette', category: 'Standard',
                colors: { primary: '#6e56cf', preview: 'linear-gradient(135deg, #ffffff 0%, #000000 100%)' }
            },
            {
                id: 'light', name: 'Light', desc: 'Clean & bright', icon: 'Sun', category: 'Standard',
                colors: { primary: '#6e56cf', preview: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%)' }
            },
            {
                id: 'oled', name: 'OLED Black', desc: 'Pure black', icon: 'Moon', category: 'Standard',
                colors: { primary: '#6e56cf', preview: '#000000' }
            },
            {
                id: 'nord', name: 'Nord', desc: 'Arctic Code', icon: 'Snowflake', category: 'Standard',
                colors: { primary: '#88c0d0', preview: '#2e3440' }
            },
            {
                id: 'dracula', name: 'Dracula', desc: 'Vampire Dark', icon: 'Ghost', category: 'Standard',
                colors: { primary: '#bd93f9', preview: '#282a36' }
            },
            {
                id: 'slate', name: 'Slate', desc: 'Muted Blue', icon: 'Box', category: 'Standard',
                colors: { primary: '#3b82f6', preview: '#0f172a' }
            },
            {
                id: 'terminal', name: 'Terminal', desc: 'Retro Hacker', icon: 'Terminal', category: 'Standard',
                colors: { primary: '#22c55e', preview: '#020617' }
            },

            // Legacy / Live Themes
            {
                id: 'coffee', name: 'Coffee', desc: 'Warm brown', icon: 'Coffee', category: 'Live',
                colors: { primary: '#964b00', preview: 'linear-gradient(135deg, #3d2b1f 0%, #6f4e37 100%)' }
            },
            {
                id: 'aurora', name: 'Cyberpunk', desc: 'Neon & grid', icon: 'Sparkles', category: 'Live',
                colors: { primary: '#00ffff', preview: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)' }
            },
            {
                id: 'abyss', name: 'Ocean', desc: 'Deep blue', icon: 'Waves', category: 'Live',
                colors: { primary: '#0077be', preview: 'linear-gradient(135deg, #000c24 0%, #0077be 100%)' }
            },
            {
                id: 'cyberwire', name: 'Synthwave', desc: 'Neon retro', icon: 'Activity', category: 'Live',
                colors: { primary: '#ff00ff', preview: 'linear-gradient(135deg, #2b0b3d 0%, #ff00ff 100%)' }
            },
            {
                id: 'sunset', name: 'Sunset', desc: 'Warm orange', icon: 'Sunrise', category: 'Live',
                colors: { primary: '#ff4e00', preview: 'linear-gradient(135deg, #ff4e00 0%, #ec9f05 100%)' }
            },
            {
                id: 'forest', name: 'Forest', desc: 'Nature green', icon: 'TreePine', category: 'Live',
                colors: { primary: '#22c55e', preview: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' }
            },
            {
                id: 'lavender', name: 'Lavender', desc: 'Soft purple', icon: 'Flower2', category: 'Live',
                colors: { primary: '#a78bfa', preview: 'linear-gradient(135deg, #4c1d95 0%, #a78bfa 100%)' }
            },
            {
                id: 'midnight', name: 'Midnight', desc: 'Deep purple', icon: 'MoonStar', category: 'Live',
                colors: { primary: '#6366f1', preview: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }
            },
            {
                id: 'rose', name: 'Rose', desc: 'Soft pink', icon: 'Heart', category: 'Live',
                colors: { primary: '#f43f5e', preview: 'linear-gradient(135deg, #881337 0%, #f43f5e 100%)' }
            },
        ],
        availablePatterns: [
            { id: 'grid', name: 'Grid', desc: 'Cyberpunk' },
            { id: 'dots', name: 'Dots', desc: 'Minimal' },
            { id: 'cross', name: 'Cross', desc: 'Technical' },
            { id: 'waves', name: 'Waves', desc: 'Fluid' },
            { id: 'none', name: 'None', desc: 'Clean' }
        ]
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
