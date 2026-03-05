import React, { useState, useRef, useEffect } from 'react';
import { useUserMovies } from '@/hooks/useUserMovies';
import './styles.css';

const OPTIONS = [
    {
        id: 'planning',
        label: 'Planning to Watch',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
    },
    {
        id: 'watching',
        label: 'Watching',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
    },
    {
        id: 'completed',
        label: 'Completed',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    },
    {
        id: 'on_hold',
        label: 'On Hold',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
    },
];

const WatchlistDropdown = ({ movie, customClass = '' }) => {
    const { getWatchlistStatus, updateWatchlistStatus, isWatchlisted, toggleWatchlist } = useUserMovies();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isListed = isWatchlisted(movie.id);
    const currentStatus = getWatchlistStatus(movie.id) || 'planning';

    const activeOption = OPTIONS.find(opt => opt.id === currentStatus);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = async (statusId) => {
        setIsOpen(false);
        await updateWatchlistStatus(movie, statusId);
    };

    const handleToggleRemove = async (e) => {
        e.stopPropagation();
        await toggleWatchlist(movie); // This removes it since it's already listed
        setIsOpen(false);
    };

    return (
        <div className={`watchlist-dropdown-container ${customClass}`} ref={dropdownRef}>
            {isListed ? (
                <button
                    className="watchlist-btn active"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="btn-icon">{activeOption?.icon}</span>
                    {activeOption?.label}
                    <svg className={`chevron ${isOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </button>
            ) : (
                <button
                    className="watchlist-btn"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    Add to List
                </button>
            )}

            {isOpen && (
                <div className="watchlist-dropdown-menu">
                    <div className="menu-group">
                        {OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                className={`menu-item ${isListed && currentStatus === opt.id ? 'selected' : ''}`}
                                onClick={() => handleSelect(opt.id)}
                            >
                                <span className="menu-item-icon">{opt.icon}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {isListed && (
                        <div className="menu-group border-top">
                            <button className="menu-item remove" onClick={handleToggleRemove}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                Remove from List
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WatchlistDropdown;
