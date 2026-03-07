import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ShoppingBag, Search, Heart,
    Filter, Star, Sparkles, LayoutGrid, Check,
    Monitor, Moon, Sun, Snowflake, Ghost, Box,
    Terminal, Coffee, Waves, Activity, Sunrise,
    TreePine, Flower2, MoonStar
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './styles.css';

const ICON_MAP = {
    Palette: LayoutGrid,
    Sun: Sun,
    Moon: Moon,
    Snowflake: Snowflake,
    Ghost: Ghost,
    Box: Box,
    Terminal: Terminal,
    Coffee: Coffee,
    Sparkles: Sparkles,
    Waves: Waves,
    Activity: Activity,
    Sunrise: Sunrise,
    TreePine: TreePine,
    Flower2: Flower2,
    MoonStar: MoonStar
};

const ThemeStore = () => {
    const navigate = useNavigate();
    const { availableThemes, theme: currentTheme, changeTheme, favorites, toggleFavorite } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Favorites', 'Live', 'Standard'];

    const filteredThemes = useMemo(() => {
        return availableThemes.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.desc.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesCategory = true;
            if (activeCategory === 'Favorites') {
                matchesCategory = favorites.includes(t.id);
            } else if (activeCategory !== 'All') {
                matchesCategory = t.category === activeCategory;
            }

            return matchesSearch && matchesCategory;
        });
    }, [availableThemes, searchQuery, activeCategory, favorites]);

    return (
        <div className="theme-store-page">
            <header className="theme-store-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="title-group">
                        <div className="main-title">
                            <ShoppingBag size={24} />
                            <h1>Theme Store</h1>
                        </div>
                        <p className="subtitle">DISCOVER YOUR LOOK</p>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="category-filters">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat === 'All' && <Filter size={14} />}
                                {cat === 'Favorites' && <Heart size={14} />}
                                {cat === 'Live' && <Sparkles size={14} />}
                                {cat === 'Standard' && <LayoutGrid size={14} />}
                                <span>{cat}</span>
                            </button>
                        ))}
                    </div>

                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search themes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="theme-grid">
                {filteredThemes.map((t) => {
                    const ThemeIcon = ICON_MAP[t.icon] || LayoutGrid;
                    const isFavorite = favorites.includes(t.id);
                    const isActive = currentTheme === t.id;

                    return (
                        <div key={t.id} className={`theme-card ${isActive ? 'active' : ''}`}>
                            <div className="theme-preview" style={{ background: t.colors?.preview || '#333' }}>
                                <div className="preview-icon-wrapper">
                                    <ThemeIcon size={40} className="preview-icon" />
                                </div>
                                <button
                                    className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(t.id);
                                    }}
                                >
                                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                                </button>
                            </div>

                            <div className="theme-info">
                                <div className="info-main">
                                    <h3>{t.name}</h3>
                                    <p>{t.desc}</p>
                                </div>

                                <div className="card-footer">
                                    <span className="theme-badge">{t.category.toUpperCase()}</span>
                                    {isActive ? (
                                        <div className="store-active-badge">
                                            <Check size={14} />
                                            <span>ACTIVE</span>
                                        </div>
                                    ) : (
                                        <button className="apply-btn" onClick={() => changeTheme(t.id)}>
                                            Apply Theme →
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
};

export default ThemeStore;
