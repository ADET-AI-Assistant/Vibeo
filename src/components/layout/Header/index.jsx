import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchTMDB } from '@/api/tmdbClient';
import { getUserSearchHistory, saveUserSearchHistory, removeUserSearchHistory } from '@/api/geminiClient';
import { TMDB_IMAGE_BASE } from '@/config/constants';
import './styles.css';

const PREVIEW_COUNT = 5;

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, loginWithGoogle, logout } = useAuth();
    const [search, setSearch] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Search dropdown & History state
    const [suggestions, setSuggestions] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const debounceTimer = useRef(null);
    const wrapperRef = useRef(null);

    const isOnboardingPage = location.pathname === '/onboarding';

    /* ── Load Search History on Mount ── */
    useEffect(() => {
        if (currentUser) {
            getUserSearchHistory(currentUser.uid).then(history => {
                setSearchHistory(history);
            });
        } else {
            setSearchHistory([]);
        }
    }, [currentUser]);

    /* ── Live search (debounced) ── */
    useEffect(() => {
        if (!search.trim()) {
            setSuggestions([]);
            setDropdownOpen(false);
            setSearching(false);
            return;
        }

        setSearching(true);
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            const data = await fetchTMDB('/search/multi', {
                query: encodeURIComponent(search.trim()),
                include_adult: false,
                page: 1,
            });

            if (data && data.results) {
                const filtered = data.results
                    .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
                    .slice(0, PREVIEW_COUNT);
                setSuggestions(filtered);
                setDropdownOpen(true);
            }
            setSearching(false);
        }, 300);

        return () => clearTimeout(debounceTimer.current);
    }, [search]);

    /* ── Close dropdown when clicking outside ── */
    useEffect(() => {
        const handleOutsideClick = e => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    /* ── Close dropdown on route change ── */
    useEffect(() => {
        setDropdownOpen(false);
        setSearch('');
    }, [location.pathname, location.search]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            // Save to Firebase history asynchronously (fire and forget)
            if (currentUser) {
                saveUserSearchHistory(currentUser.uid, search.trim());
                // Optimistically update local state so they see it right away next time
                setSearchHistory(prev => {
                    const filtered = prev.filter(item => item.query !== search.trim().toLowerCase());
                    return [{ id: 'temp-' + Date.now(), query: search.trim().toLowerCase() }, ...filtered].slice(0, 10);
                });
            }

            navigate(`/search?q=${encodeURIComponent(search.trim())}`);
            setDropdownOpen(false);
            setIsMobileMenuOpen(false);
        }
    };

    const handleHistoryClick = (queryText) => {
        setSearch(queryText);
        if (currentUser) saveUserSearchHistory(currentUser.uid, queryText); // bump timestamp
        navigate(`/search?q=${encodeURIComponent(queryText)}`);
        setDropdownOpen(false);
        setIsMobileMenuOpen(false);
    };

    const handleRemoveHistory = async (e, docId) => {
        e.stopPropagation();
        if (currentUser && docId && !docId.startsWith('temp-')) {
            await removeUserSearchHistory(currentUser.uid, docId);
        }
        setSearchHistory(prev => prev.filter(item => item.id !== docId));
    };

    const goToItem = (item) => {
        const type = item.media_type === 'tv' ? 'tv' : 'movie';
        navigate(`/watch/${item.id}?type=${type}`);
        setDropdownOpen(false);
    };

    const viewAllResults = () => {
        if (search.trim()) {
            navigate(`/search?q=${encodeURIComponent(search.trim())}`);
            setDropdownOpen(false);
        }
    };

    /* ── Helper: year from date string ── */
    const getYear = (item) => {
        const date = item.release_date || item.first_air_date || '';
        return date ? date.slice(0, 4) : '';
    };

    const getTypeLabel = (item) => {
        if (item.media_type === 'tv') return 'TV';
        return 'Movie';
    };

    const renderActions = (className) => (
        <div className={className}>
            {/* Authentication Section */}
            {currentUser ? (
                <div className="topbar__user-container">
                    <img
                        src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=random`}
                        alt={currentUser.displayName || 'User Profile'}
                        className="topbar__user-avatar"
                        referrerPolicy="no-referrer"
                    />

                    <div className="topbar__user-dropdown">
                        <div className="dropdown-header">
                            <div className="dropdown-name">{currentUser.displayName || 'User'}</div>
                            <div className="dropdown-email">{currentUser.email}</div>
                        </div>

                        <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={() => { setIsMobileMenuOpen(false); navigate('/profile'); setTimeout(() => window.scrollTo(0, 0), 0); }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Profile
                            </button>
                            <button className="dropdown-item" onClick={() => { setIsMobileMenuOpen(false); navigate('/settings'); }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                Settings
                            </button>
                        </div>

                        <div className="dropdown-actions">
                            <button className="dropdown-logout" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                                Logout
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    className="topbar__login-btn"
                    onClick={loginWithGoogle}
                >
                    Login
                </button>
            )}
        </div>
    );

    return (
        <header className="topbar" role="banner">
            <div className="topbar__inner">

                {/* ── Logo ── */}
                <button className="topbar__logo" onClick={() => navigate('/')} aria-label="Vibeo Home">
                    <img src="/vibeo.png" alt="Vibeo" className="topbar__logo-img" />
                    <span className="topbar__logo-text">
                        <span className="topbar__logo-vibe">Vibe</span>
                        <span className="topbar__logo-reel">o</span>
                    </span>
                </button>

                {/* ── Nav links & Mobile Drawer ── */}
                {!isOnboardingPage && (
                    <>
                        <nav className={`topbar__nav ${isMobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Site Navigation">
                            <div className="topbar__nav-links">
                                {[
                                    { label: 'Discover', path: '/browse/trending' },
                                    { label: 'Smart Search', path: '/smart-search' },
                                    { label: 'Vibey', path: '/vibey' },
                                    { label: 'Taste Matcher', path: '/ai-match' },
                                ].map(link => {
                                    const isActive = location.pathname === link.path || (link.path.startsWith('/browse') && location.pathname.startsWith('/browse'));

                                    return (
                                        <button
                                            key={link.label}
                                            className={`topbar__nav-link ${isActive ? 'active' : ''}`}
                                            onClick={() => {
                                                navigate(link.path);
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            {link.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Mobile Drawer Actions (Auth only, no Theme) */}
                            {renderActions("topbar__mobile-actions", true)}
                        </nav>

                        {/* ── Right side: search + actions + toggle ── */}
                        <div className="topbar__right">
                            {/* Search box with dropdown */}
                            {!isOnboardingPage && (
                                <div className="topbar__search-wrapper" ref={wrapperRef}>
                                    <form
                                        className={`topbar__search ${dropdownOpen ? 'dropdown-active' : ''}`}
                                        onSubmit={handleSearch}
                                    >
                                        {/* Search icon / spinner wrapped in label for focus toggle */}
                                        <label htmlFor="mobile-search-input" className="topbar__search-icon-label">
                                            {searching ? (
                                                <svg className="search-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                                                </svg>
                                            ) : (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                    <circle cx="11" cy="11" r="8" />
                                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                                </svg>
                                            )}
                                        </label>
                                        <input
                                            id="mobile-search-input"
                                            type="text"
                                            placeholder="Search titles…"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            onFocus={() => {
                                                if (search.trim() && suggestions.length > 0) setDropdownOpen(true);
                                                if (!search.trim() && searchHistory.length > 0) setDropdownOpen(true);
                                            }}
                                            aria-label="Search movies"
                                            autoComplete="off"
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                className="search-clear-btn"
                                                onClick={() => { setSearch(''); setSuggestions([]); setDropdownOpen(false); }}
                                                aria-label="Clear search"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        )}
                                    </form>

                                    {/* ── Dropdown ── */}
                                    {dropdownOpen && (
                                        <div className="search-dropdown">
                                            {/* Show Recent Searches if input is empty */}
                                            {!search.trim() && searchHistory.length > 0 ? (
                                                <div className="search-dropdown__history">
                                                    <div className="search-dropdown__history-header">
                                                        <span>Recent Searches</span>
                                                    </div>
                                                    <ul className="search-dropdown__list">
                                                        {searchHistory.map(item => (
                                                            <li key={item.id} className="search-history-item-wrap">
                                                                <button
                                                                    className="search-dropdown__item search-dropdown__history-item"
                                                                    onClick={() => handleHistoryClick(item.query)}
                                                                    type="button"
                                                                >
                                                                    <svg className="history-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                                        <circle cx="12" cy="12" r="10" />
                                                                        <polyline points="12 6 12 12 16 14" />
                                                                    </svg>
                                                                    <span className="search-dropdown__title">{item.query}</span>
                                                                </button>
                                                                <button
                                                                    className="history-remove-btn"
                                                                    onClick={(e) => handleRemoveHistory(e, item.id)}
                                                                    title="Remove from history"
                                                                >
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                                    </svg>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                /* Show TMDB Live Suggestions if they typed something */
                                                <>
                                                    {suggestions.length === 0 && !searching ? (
                                                        <div className="search-dropdown__empty">No results found</div>
                                                    ) : (
                                                        <>
                                                            <ul className="search-dropdown__list">
                                                                {suggestions.map(item => (
                                                                    <li key={item.id}>
                                                                        <button
                                                                            className="search-dropdown__item"
                                                                            onClick={() => goToItem(item)}
                                                                            type="button"
                                                                        >
                                                                            {item.poster_path ? (
                                                                                <img
                                                                                    src={`${TMDB_IMAGE_BASE}${item.poster_path}`}
                                                                                    alt={item.title || item.name}
                                                                                    className="search-dropdown__poster"
                                                                                />
                                                                            ) : (
                                                                                <div className="search-dropdown__poster search-dropdown__poster--placeholder">
                                                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                                                        <rect x="2" y="3" width="20" height="14" rx="2" />
                                                                                        <polyline points="8 21 12 17 16 21" />
                                                                                        <line x1="12" y1="17" x2="12" y2="21" />
                                                                                    </svg>
                                                                                </div>
                                                                            )}
                                                                            <div className="search-dropdown__info">
                                                                                <span className="search-dropdown__title">{item.title || item.name}</span>
                                                                                <span className="search-dropdown__meta">
                                                                                    {getYear(item) && <span>{getYear(item)}</span>}
                                                                                    <span className="search-dropdown__type">{getTypeLabel(item)}</span>
                                                                                </span>
                                                                            </div>
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            <button
                                                                className="search-dropdown__view-all"
                                                                onClick={viewAllResults}
                                                                type="button"
                                                            >
                                                                View All Results
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="9 18 15 12 9 6" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Desktop Actions (Theme & Auth) */}
                            {renderActions("topbar__desktop-actions")}

                            <button
                                className={`topbar__mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle mobile menu"
                            >
                                <span className="hamburger-line"></span>
                                <span className="hamburger-line"></span>
                                <span className="hamburger-line"></span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
