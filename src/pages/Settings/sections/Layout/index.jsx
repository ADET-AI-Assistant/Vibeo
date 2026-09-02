import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout as LayoutIcon, Maximize, Minimize,
    Monitor, Hash, Calendar, Tag, Clock,
    Check, Layers, Star, MessageSquare, Tv
} from 'lucide-react';
import { useLayout } from '@/context/LayoutContext';
import './styles.css';

const LayoutSection = () => {
    const {
        cardSize, setCardSize,
        glassLevel, setGlassLevel,
        showMetadata, setShowMetadata,
        heroSource, setHeroSource,
        heroAutoNext, setHeroAutoNext,
        heroInterval, setHeroInterval,
        heroVideoQuality, setHeroVideoQuality,
        showVibeyChat, setShowVibeyChat,
        dataSaverMode, setDataSaverMode
    } = useLayout();

    const navigate = useNavigate();

    const toggleMetadata = (key) => {
        setShowMetadata(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="settings-section animate-fade-in layout-section">
            <h2><span className="icon"><LayoutIcon size={20} /></span> Layout</h2>

            {/* TV Mode (10-Foot UI) Card */}
            <section
                className="settings-group"
                style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(59, 130, 246, 0.12))',
                    border: '1px solid rgba(168, 85, 247, 0.35)',
                    borderRadius: '16px',
                    padding: '22px',
                    marginBottom: '28px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ maxWidth: '480px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.2rem', margin: 0 }}>
                            <Tv size={20} color="var(--c-accent)" /> TV Mode (10-Foot UI)
                        </h3>
                        <p style={{ margin: '6px 0 0 0', color: 'var(--c-text2)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                            Lean-back interface optimized for Smart TVs (Tizen, webOS, Android TV), remote controls, and gamepads with full D-Pad spatial navigation.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (typeof document !== 'undefined' && !document.fullscreenElement) {
                                document.documentElement.requestFullscreen().catch(() => {});
                            }
                            navigate('/tv');
                        }}
                        style={{
                            padding: '12px 24px',
                            background: 'var(--c-accent)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 16px var(--c-accent-glow)',
                            transition: 'transform 0.2s ease',
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Tv size={18} />
                        Launch TV Mode
                    </button>
                </div>
            </section>

            {/* Card Size Selection */}
            <section className="settings-group">
                <h3>Card Size</h3>
                <p>Choose how large movie cards appear in grids.</p>
                <div className="card-size-grid">
                    <div
                        className={`size-option-card ${cardSize === 'small' ? 'active' : ''}`}
                        onClick={() => setCardSize('small')}
                    >
                        <div className="size-preview-box size-small">
                            <div className="preview-inner"></div>
                        </div>
                        <div className="size-info">
                            <strong>Small</strong>
                            <span>Denser grids</span>
                        </div>
                        {cardSize === 'small' && <div className="check-badge"><Check size={12} /></div>}
                    </div>

                    <div
                        className={`size-option-card ${cardSize === 'medium' ? 'active' : ''}`}
                        onClick={() => setCardSize('medium')}
                    >
                        <div className="size-preview-box size-medium">
                            <div className="preview-inner"></div>
                        </div>
                        <div className="size-info">
                            <strong>Medium</strong>
                            <span>Balanced look</span>
                        </div>
                        {cardSize === 'medium' && <div className="check-badge"><Check size={12} /></div>}
                    </div>

                    <div
                        className={`size-option-card ${cardSize === 'large' ? 'active' : ''}`}
                        onClick={() => setCardSize('large')}
                    >
                        <div className="size-preview-box size-large">
                            <div className="preview-inner"></div>
                        </div>
                        <div className="size-info">
                            <strong>Large</strong>
                            <span>Visual focus</span>
                        </div>
                        {cardSize === 'large' && <div className="check-badge"><Check size={12} /></div>}
                    </div>
                </div>
            </section>

            {/* Glassmorphism Intensity */}
            <section className="settings-group">
                <h3>Glassmorphism</h3>
                <p>Adjust the intensity of the glass effect on UI elements.</p>
                <div className="glass-selector">
                    <button
                        className={`glass-option ${glassLevel === 'none' ? 'active' : ''}`}
                        onClick={() => setGlassLevel('none')}
                    >
                        None
                    </button>
                    <button
                        className={`glass-option ${glassLevel === 'subtle' ? 'active' : ''}`}
                        onClick={() => setGlassLevel('subtle')}
                    >
                        Subtle
                    </button>
                    <button
                        className={`glass-option ${glassLevel === 'glassy' ? 'active' : ''}`}
                        onClick={() => setGlassLevel('glassy')}
                    >
                        Glassy
                    </button>
                </div>
            </section>

            {/* Metadata Toggles */}
            <section className="settings-group">
                <h3>Card Content</h3>
                <p>Toggle which information is visible on movie cards.</p>
                <div className="metadata-toggle-grid">
                    <div
                        className={`toggle-item ${showMetadata.rating ? 'active' : ''}`}
                        onClick={() => toggleMetadata('rating')}
                    >
                        <div className="toggle-label">
                            <Star size={18} />
                            <span>Rating</span>
                        </div>
                        <div className="toggle-switch"></div>
                    </div>

                    <div
                        className={`toggle-item ${showMetadata.year ? 'active' : ''}`}
                        onClick={() => toggleMetadata('year')}
                    >
                        <div className="toggle-label">
                            <Calendar size={18} />
                            <span>Release Year</span>
                        </div>
                        <div className="toggle-switch"></div>
                    </div>

                    <div
                        className={`toggle-item ${showMetadata.category ? 'active' : ''}`}
                        onClick={() => toggleMetadata('category')}
                    >
                        <div className="toggle-label">
                            <Tag size={18} />
                            <span>Category</span>
                        </div>
                        <div className="toggle-switch"></div>
                    </div>

                    <div
                        className={`toggle-item ${showMetadata.duration ? 'active' : ''}`}
                        onClick={() => toggleMetadata('duration')}
                    >
                        <div className="toggle-label">
                            <Clock size={18} />
                            <span>Duration</span>
                        </div>
                        <div className="toggle-switch"></div>
                    </div>
                </div>
            </section>

            {/* Carousel Playback Settings */}
            <section className="settings-group">
                <h3>Carousel Playback</h3>
                <p>Configure how the hero spotlight behaves.</p>
                <div className="playback-settings">
                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Auto-Advance Slides</strong>
                            <span>Automatically move to the next slide</span>
                        </div>
                        <div
                            className={`toggle-item ${heroAutoNext ? 'active' : ''}`}
                            onClick={() => setHeroAutoNext(!heroAutoNext)}
                        >
                            <div className="toggle-switch"></div>
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Data Saver Mode</strong>
                            <span>Disable autoplay background videos to save bandwidth</span>
                        </div>
                        <div
                            className={`toggle-item ${dataSaverMode ? 'active' : ''}`}
                            onClick={() => setDataSaverMode(!dataSaverMode)}
                        >
                            <div className="toggle-switch"></div>
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Advance Interval</strong>
                            <span>How long each slide stays visible</span>
                        </div>
                        <div className="interval-selector">
                            {[5000, 8000, 12000, 15000].map(val => (
                                <button
                                    key={val}
                                    className={`interval-btn ${heroInterval === val ? 'active' : ''}`}
                                    onClick={() => setHeroInterval(val)}
                                >
                                    {val / 1000}s
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Playback Quality */}
            <section className="settings-group">
                <h3>Video Playback</h3>
                <p>Choose the default quality for carousel trailers.</p>
                <div className="quality-selector">
                    {[
                        { id: 'hd720', label: '720p', desc: 'Standard HD' },
                        { id: 'hd1080', label: '1080p', desc: 'Full HD' },
                        { id: 'hd1440', label: '1440p', desc: 'Quad HD' },
                        { id: 'hd2160', label: '2160p', desc: '4K Ultra HD' },
                        { id: 'highres', label: 'Max', desc: 'Highest available' }
                    ].map(q => (
                        <div
                            key={q.id}
                            className={`quality-option ${heroVideoQuality === q.id ? 'active' : ''}`}
                            onClick={() => setHeroVideoQuality(q.id)}
                        >
                            <div className="quality-info">
                                <strong>{q.label}</strong>
                                <span>{q.desc}</span>
                            </div>
                            {heroVideoQuality === q.id && <div className="check-badge"><Check size={12} /></div>}
                        </div>
                    ))}
                </div>
            </section>

            {/* Hero Carousel Source */}
            <section className="settings-group">
                <h3>Hero Carousel Source</h3>
                <p>Choose which content appears in the large spotlight banner.</p>
                <div className="hero-source-grid">
                    {[
                        { id: 'trending', label: 'Trending', desc: 'Current highlights', icon: <Star size={18} /> },
                        { id: 'nowPlaying', label: 'Now Playing', desc: 'In theaters now', icon: <Calendar size={18} /> },
                        { id: 'topRated', label: 'Top Rated', desc: 'All-time classics', icon: <Star size={18} /> },
                        { id: 'moodMatch', label: 'Personalized', desc: 'Based on your tastes', icon: <Layers size={18} /> },
                        { id: 'popular', label: 'Popular', desc: 'Popular worldwide', icon: <Maximize size={18} /> }
                    ].map(source => (
                        <div
                            key={source.id}
                            className={`source-item ${heroSource === source.id ? 'active' : ''}`}
                            onClick={() => setHeroSource(source.id)}
                        >
                            <span className="icon">{source.icon}</span>
                            <div className="source-info">
                                <strong>{source.label}</strong>
                                <span>{source.desc}</span>
                            </div>
                            {heroSource === source.id && (
                                <div className="check-badge">
                                    <Check size={12} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* General Preferences */}
            <section className="settings-group">
                <h3>General Preferences</h3>
                <p>Miscellaneous UI preferences.</p>
                <div className="playback-settings">
                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Show Vibey Chat</strong>
                            <span>Display the floating AI assistant globally</span>
                        </div>
                        <div
                            className={`toggle-item ${showVibeyChat ? 'active' : ''}`}
                            onClick={() => setShowVibeyChat(!showVibeyChat)}
                        >
                            <div className="toggle-switch"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LayoutSection;
