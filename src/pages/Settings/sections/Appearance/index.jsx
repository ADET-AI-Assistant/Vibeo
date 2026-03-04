import React, { useMemo } from 'react';
import {
    Palette, Check, Sun, Moon, Heart, Grid,
    Snowflake, Ghost, Box, Terminal, Coffee, Sparkles,
    Waves, Activity, Sunrise, Gamepad2, Cloud, Cpu
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
    const {
        theme,
        changeTheme,
        backgroundPattern,
        changeBackground,
        availableThemes,
        availablePatterns
    } = useTheme();

    const currentThemeInfo = useMemo(() => {
        return availableThemes.find(t => t.id === theme) || availableThemes[0];
    }, [theme, availableThemes]);

    // Grouping themes by category
    const groupedThemes = useMemo(() => {
        return availableThemes.reduce((acc, t) => {
            const category = t.category || 'Standard';
            if (!acc[category]) acc[category] = [];
            acc[category].push(t);
            return acc;
        }, {});
    }, [availableThemes]);

    const handleQuickSwitch = (mode) => {
        if (mode === 'light') {
            changeTheme('default');
        } else {
            changeTheme('abyss');
        }
    };

    return (
        <div className="settings-section animate-fade-in">
            <h2><span className="icon"><Palette size={20} /></span> Theme</h2>

            <div className="current-theme-card">
                <div className="theme-preview-box">
                    <div className="theme-icon">
                        <ThemeIcon name={currentThemeInfo.icon} size={40} />
                    </div>
                    <span className="active-badge"><Check size={12} /> Active</span>
                </div>
                <div className="theme-info">
                    <span className="label">CURRENT LOOK</span>
                    <h3>{currentThemeInfo.name}</h3>
                    <p>{currentThemeInfo.desc}</p>
                    <button className="browse-store-btn">Browse Theme Store</button>
                </div>
                <div className="quick-switch">
                    <span className="label">QUICK SWITCH</span>
                    <div className="toggle-group">
                        <button
                            className={`icon-btn ${theme === 'default' ? 'active' : ''}`}
                            onClick={() => handleQuickSwitch('light')}
                            title="Default Theme"
                        >
                            <Sun size={18} />
                        </button>
                        <button
                            className={`icon-btn ${theme === 'abyss' ? 'active' : ''}`}
                            onClick={() => handleQuickSwitch('dark')}
                            title="Dark Abyss"
                        >
                            <Moon size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="favorites-section">
                <h3><span className="icon"><Heart size={16} /></span> THEME COLLECTION</h3>
                <div className="theme-categories-container">
                    {Object.entries(groupedThemes).map(([category, themes]) => (
                        <div key={category} className="theme-category-section">
                            <h4 className="category-title">{category}</h4>
                            <div className="theme-grid">
                                {themes.map(t => (
                                    <button
                                        key={t.id}
                                        className={`theme-selection-card ${theme === t.id ? 'active' : ''}`}
                                        onClick={() => changeTheme(t.id)}
                                    >
                                        <div className={`theme-color-blob theme-${t.id}`}>
                                            <ThemeIcon name={t.icon} size={18} className="blob-icon" />
                                        </div>
                                        <div className="theme-text">
                                            <strong>{t.name}</strong>
                                            <span>{t.desc}</span>
                                        </div>
                                        {theme === t.id && <span className="active-dot"></span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
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
