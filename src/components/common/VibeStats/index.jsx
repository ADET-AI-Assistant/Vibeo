import React, { useMemo } from 'react';
import { formatWatchTime } from '@/utils/timeUtils';
import './styles.css';

const VibeStats = ({ watchlist = [], favorites = [], totalWatchTime, isHeaderVariant = false }) => {
    // 1. Define Taste Dimensions and Map Genres
    const dimensions = useMemo(() => [
        {
            key: 'adrenaline',
            label: 'Adrenaline',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
            genres: [28, 12, 53, 37]
        },
        {
            key: 'heart',
            label: 'Heart',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
            genres: [18, 10749, 10751, 10402]
        },
        {
            key: 'imagination',
            label: 'Imagination',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>,
            genres: [878, 14, 16]
        },
        {
            key: 'reality',
            label: 'Reality',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>,
            genres: [99, 36, 80, 9648, 10752]
        },
        {
            key: 'vibe',
            label: 'Vibe',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
            genres: [35, 10770]
        },
    ], []);

    // 2. Calculate Dimension Scores
    const stats = useMemo(() => {
        const completedMovies = watchlist.filter(m => m.status === 'completed');
        // Merge completed movies with initial onboarding favorites for better DNA representation
        const analyzedMovies = [...favorites, ...completedMovies];

        const scores = { adrenaline: 0, heart: 0, imagination: 0, reality: 0, vibe: 0 };
        let maxCount = 0;

        analyzedMovies.forEach(movie => {
            if (movie.genre_ids) {
                movie.genre_ids.forEach(genreId => {
                    dimensions.forEach(dim => {
                        if (dim.genres.includes(genreId)) {
                            scores[dim.key]++;
                        }
                    });
                });
            }
        });

        // Find max for scaling
        Object.values(scores).forEach(val => { if (val > maxCount) maxCount = val; });

        // Normalize to 0-100 range for the chart (min 15% for visibility)
        return dimensions.map(dim => ({
            ...dim,
            value: maxCount > 0 ? Math.max(15, (scores[dim.key] / maxCount) * 100) : 20,
            raw: scores[dim.key]
        }));
    }, [watchlist, favorites, dimensions]);

    // 3. SVG Radar Chart Points Calculation
    const size = 280;
    const center = size / 2;
    const radius = size * 0.38;

    const getPoint = (index, total, value) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const x = center + (radius * (value / 100)) * Math.cos(angle);
        const y = center + (radius * (value / 100)) * Math.sin(angle);
        return { x, y };
    };

    const polygonPoints = stats.map((s, i) => {
        const { x, y } = getPoint(i, stats.length, s.value);
        return `${x},${y}`;
    }).join(' ');

    const watchTimeMinutes = (totalWatchTime || 0) / 60;

    return (
        <div className={`vibe-stats card-glow ${isHeaderVariant ? 'vibe-stats--header' : ''}`}>
            <div className="vibe-stats__header">
                <div className="vibe-stats__title-group">
                    <h3>Taste Visualization</h3>
                    <p className="vibe-stats__subtitle">Real-time cinematic profile</p>
                </div>
                <div className="vibe-stats__total">
                    <span className="total-label">Total Immersion</span>
                    <span className="total-value">{formatWatchTime(watchTimeMinutes)}</span>
                </div>
            </div>

            <div className="vibe-stats__content">
                {/* Radar Chart Container */}
                <div className="radar-container">
                    <svg viewBox={`0 0 ${size} ${size}`} className="radar-svg">
                        {/* Background Circles (Grid) */}
                        {[0.2, 0.4, 0.6, 0.8, 1.0].map((r, i) => (
                            <circle
                                key={i}
                                cx={center}
                                cy={center}
                                r={radius * r}
                                className="radar-grid-circle"
                            />
                        ))}

                        {/* Axis Lines */}
                        {stats.map((_, i) => {
                            const { x, y } = getPoint(i, stats.length, 100);
                            return (
                                <line
                                    key={i}
                                    x1={center} y1={center}
                                    x2={x} y2={y}
                                    className="radar-axis-line"
                                />
                            );
                        })}

                        {/* The Data Polygon */}
                        <polygon points={polygonPoints} className="radar-polygon" />

                        {/* Data Points */}
                        {stats.map((s, i) => {
                            const { x, y } = getPoint(i, stats.length, s.value);
                            return <circle key={i} cx={x} cy={y} r="3" className="radar-point" />;
                        })}
                    </svg>

                    {/* Labels Positioning (Absolute Overlay) */}
                    {stats.map((s, i) => {
                        const { x, y } = getPoint(i, stats.length, 125); // Push labels further out
                        return (
                            <div
                                key={s.key}
                                className="radar-label"
                                style={{
                                    left: `${(x / size) * 100}%`,
                                    top: `${(y / size) * 100}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <span className="label-icon">{s.icon}</span>
                                <span className="label-text">{s.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Info / Insights */}
                <div className="vibe-insights">
                    <div className="insight-card">
                        <h4>Completed Journey</h4>
                        <div className="insight-grid">
                            <div className="insight-item">
                                <span className="val">{watchlist.filter(m => m.status === 'completed').length}</span>
                                <span className="lab">Titles</span>
                            </div>
                            <div className="insight-item">
                                <span className="val">{Math.round(watchTimeMinutes / 60)}</span>
                                <span className="lab">Hours</span>
                            </div>
                        </div>
                    </div>

                    <div className="top-dimension">
                        <span className="top-dim-label">Dominant Trait</span>
                        <div className="top-dim-value">
                            {stats.sort((a, b) => b.raw - a.raw)[0]?.label || 'Exploring'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VibeStats;
