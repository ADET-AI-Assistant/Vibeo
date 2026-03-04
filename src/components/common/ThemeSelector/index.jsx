import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import './styles.css';

const ThemeSelector = () => {
    const { theme, changeTheme, availableThemes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleThemeChange = (id) => {
        changeTheme(id);
        setIsOpen(false);
    };

    return (
        <div className="theme-selector" ref={dropdownRef}>
            <button
                className="theme-selector__btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select Theme"
                title="Change Theme"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            </button>

            {isOpen && (
                <div className="theme-dropdown">
                    <div className="theme-dropdown__title">Select Theme</div>
                    <div className="theme-grid">
                        {availableThemes.map((t) => (
                            <button
                                key={t.id}
                                className={`theme-item ${theme === t.id ? 'active' : ''}`}
                                onClick={() => handleThemeChange(t.id)}
                                data-theme-preview={t.id}
                            >
                                <span className="theme-dot"></span>
                                <span className="theme-name">{t.name}</span>
                                {theme === t.id && (
                                    <svg className="theme-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSelector;
