import React, { useState } from 'react';
import { useBrowseMovies } from '@/hooks/useBrowseMovies';
import TVMovieRow from '../components/TVMovieRow';
import { useTVFocus, useTVFocusable } from '../context/TVFocusContext';

const CategoryPill = ({ id, label, isSelected, onClick, autoFocus }) => {
    const { ref, isFocused } = useTVFocusable({
        id: `genre-${id}`,
        zone: 'discover-categories',
        onSelect: onClick,
        autoFocus,
    });

    return (
        <button
            ref={ref}
            className={`tv-btn tv-focusable ${isFocused ? 'tv-focused' : ''} ${isSelected ? 'tv-btn--primary' : ''}`}
            onClick={onClick}
            style={{ padding: '10px 22px', fontSize: '1.05rem', borderRadius: '24px' }}
        >
            {label}
        </button>
    );
};

export const TVDiscover = () => {
    const [selectedCategory, setSelectedCategory] = useState('popular');
    const { movies, loading } = useBrowseMovies(selectedCategory);
    const { setZoneConfig } = useTVFocus();

    React.useEffect(() => {
        setZoneConfig('discover-categories', {
            type: 'horizontal',
            orderIndex: 0,
        });
        setZoneConfig('row-discover-results', {
            type: 'horizontal',
            orderIndex: 1,
        });
    }, [setZoneConfig]);

    const categories = [
        { id: 'popular', label: 'Popular' },
        { id: 'top-rated', label: 'Top Rated' },
        { id: 'action', label: 'Action' },
        { id: 'comedy', label: 'Comedy' },
        { id: 'sci-fi', label: 'Sci-Fi' },
        { id: 'horror', label: 'Horror' },
        { id: 'animation', label: 'Animation' },
    ];

    return (
        <div className="tv-discover-page">
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '24px' }}>
                Discover Titles
            </h1>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '36px', overflowX: 'auto', padding: '6px' }}>
                {categories.map((cat, idx) => (
                    <CategoryPill
                        key={cat.id}
                        id={cat.id}
                        label={cat.label}
                        isSelected={selectedCategory === cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        autoFocus={idx === 0}
                    />
                ))}
            </div>

            {/* Results Row */}
            <TVMovieRow
                id="discover-results"
                title={`${categories.find(c => c.id === selectedCategory)?.label || 'Browse'} Movies`}
                movies={movies}
                loading={loading}
                orderIndex={1}
            />
        </div>
    );
};

export default TVDiscover;
