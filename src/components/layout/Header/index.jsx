import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ThemeSelector from '@/components/common/ThemeSelector';
import { fetchTMDB } from '@/api/tmdbClient';
import { TMDB_IMAGE_BASE } from '@/config/constants';
import './styles.css';

const PREVIEW_COUNT = 5;

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, loginWithGoogle, logout } = useAuth();
    const [search, setSearch] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Search dropdown state
    const [suggestions, setSuggestions] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const debounceTimer = useRef(null);
    const wrapperRef = useRef(null);

    const isOnboardingPage = location.pathname === '/onboarding';

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
            navigate(`/search?q=${encodeURIComponent(search.trim())}`);
            setDropdownOpen(false);
            setIsMobileMenuOpen(false);
        }
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
            <ThemeSelector />

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
                            <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Profile
                            </button>
                            <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                Continue Watching
                            </button>
                            <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                Watch List
                            </button>
                        </div>

                        <div className="dropdown-actions">
                            <button className="dropdown-logout" onClick={logout}>
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
                                    { label: 'Home', hash: '' },
                                    { label: 'Trending', hash: 'trending' },
                                    { label: 'Top Rated', hash: 'top-rated' },
                                    { label: 'Mood Match', hash: 'mood-match' },
                                    { label: 'Action & Adventure', hash: 'action' },
                                    { label: 'Drama', hash: 'drama' },
                                    { label: 'New Release', hash: 'new-release' },
                                ].map(link => {
                                    const isHomeActive = location.pathname === '/' && !location.hash && !link.hash;
                                    const isHashActive = location.pathname === '/' && location.hash === `#${link.hash}`;
                                    const isActive = isHomeActive || isHashActive;

                                    return (
                                        <button
                                            key={link.label}
                                            className={`topbar__nav-link ${isActive ? 'active' : ''}`}
                                            onClick={() => {
                                                if (location.pathname !== '/') {
                                                    navigate(link.hash ? `/#${link.hash}` : '/');
                                                } else {
                                                    if (!link.hash) {
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        navigate('/');
                                                    } else {
                                                        const element = document.getElementById(link.hash);
                                                        if (element) {
                                                            const y = element.getBoundingClientRect().top + window.scrollY - 80;
                                                            window.scrollTo({ top: y, behavior: 'smooth' });
                                                        }
                                                        navigate(`/#${link.hash}`);
                                                    }
                                                }
                                                setIsMobileMenuOpen(false); // Close menu on click
                                            }}
                                        >
                                            {link.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Mobile Drawer Actions (Theme & Auth) */}
                            {renderActions("topbar__mobile-actions")}
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
                                        {/* Search icon / spinner */}
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
                                        <input
                                            id="mobile-search-input"
                                            type="text"
                                            placeholder="Search titles…"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            onFocus={() => search.trim() && suggestions.length > 0 && setDropdownOpen(true)}
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
