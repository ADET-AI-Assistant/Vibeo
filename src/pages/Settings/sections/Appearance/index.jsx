import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Palette, Check, Sun, Moon, Heart, Grid,
    Snowflake, Ghost, Box, Terminal, Coffee, Sparkles,
    Waves, Activity, Sunrise, Gamepad2, Cloud, Cpu,
    ShoppingBag
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import './styles.css';

const iconMap = {
    Palette, Sun, Moon, Snowflake, Ghost, Box, Terminal,
    Coffee, Sparkles, Waves, Activity, Sunrise,
    Gamepad2, Cloud, Cpu
};

const ThemeIcon = ({ name, size = 20, className = "" }) => {
    const IconComponent = iconMap[name] || Palette;
    return <IconComponent size={size} className={className} />;
};

const AppearanceSection = () => {
    const navigate = useNavigate();
    const {
        theme,
        changeTheme,
        backgroundPattern,
        changeBackground,
        availableThemes,
        availablePatterns,
        favorites
    } = useTheme();

    const currentThemeInfo = useMemo(() => {
        return availableThemes.find(t => t.id === theme) || availableThemes[0];
    }, [theme, availableThemes]);

    const favoriteThemes = useMemo(() => {
        return availableThemes.filter(t => favorites.includes(t.id));
    }, [availableThemes, favorites]);

    const handleQuickSwitch = (mode) => {
        if (mode === 'light') {
            changeTheme('default');
        } else {
            changeTheme('oled');
        }
    };

    return (
        <div className="settings-section animate-fade-in">
            <h2><span className="icon"><Palette size={20} /></span> Theme</h2>

            <div className="current-theme-card">
                <div className="theme-preview-box" style={{ background: currentThemeInfo.colors?.preview || 'var(--c-accent)' }}>
                    <div className="theme-icon">
                        <ThemeIcon name={currentThemeInfo.icon} size={40} />
                    </div>
                    <span className="active-badge"><Check size={12} /> Active</span>
                </div>
                <div className="theme-info">
                    <span className="label">CURRENT LOOK</span>
                    <h3>{currentThemeInfo.name}</h3>
                    <p>{currentThemeInfo.desc}</p>
                    <button
                        className="browse-store-btn"
                        onClick={() => navigate('/theme-store')}
                    >
                        <ShoppingBag size={14} />
                        Browse Theme Store
                    </button>
                </div>
                <div className="quick-switch">
                    <span className="label">QUICK SWITCH</span>
                    <div className="toggle-group">
                        <button
                            className={`icon-btn ${theme === 'default' ? 'active' : ''}`}
                            onClick={() => handleQuickSwitch('light')}
                            title="Light Theme"
                        >
                            <Sun size={18} />
                        </button>
                        <button
                            className={`icon-btn ${theme === 'oled' ? 'active' : ''}`}
                            onClick={() => handleQuickSwitch('dark')}
                            title="OLED Dark"
                        >
                            <Moon size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="favorites-section">
                <h3><span className="icon"><Heart size={16} /></span> QUICK ACCESS (FAVORITES)</h3>
                <div className="theme-grid">
                    {favoriteThemes.length > 0 ? (
                        favoriteThemes.map(t => (
                            <button
                                key={t.id}
                                className={`theme-selection-card ${theme === t.id ? 'active' : ''}`}
                                onClick={() => changeTheme(t.id)}
                            >
                                <div className={`theme-color-blob`} style={{ background: t.colors?.preview || '#333' }}>
                                    <ThemeIcon name={t.icon} size={18} className="blob-icon" />
                                </div>
                                <div className="theme-text">
                                    <strong>{t.name}</strong>
                                    <span>{t.desc}</span>
                                </div>
                                {theme === t.id && <span className="active-dot"></span>}
                            </button>
                        ))
                    ) : (
                        <div className="empty-favorites" onClick={() => navigate('/theme-store')}>
                            <Heart size={24} />
                            <p>No favorites yet. Visit the Store to add some!</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="background-section">
                <h3><span className="icon"><Grid size={16} /></span> Background Pattern</h3>
                <div className="pattern-grid">
                    {availablePatterns.map(bg => (
                        <button
                            key={bg.id}
                            className={`pattern-card ${backgroundPattern === bg.id ? 'active' : ''}`}
                            onClick={() => changeBackground(bg.id)}
                        >
                            <div className={`pattern-preview pattern-${bg.id}`}></div>
                            <strong>{bg.name}</strong>
                            <span>{bg.desc}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AppearanceSection;
