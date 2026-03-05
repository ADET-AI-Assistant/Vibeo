import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MovieCard from '@/components/common/MovieCard';
import { useUserMovies } from '@/hooks/useUserMovies';
import { useNavigate } from 'react-router-dom';
import { formatWatchTime } from '@/utils/timeUtils';
import VibeStats from '@/components/common/VibeStats';
import './styles.css';

const Profile = () => {
    const { currentUser } = useAuth();
    const { watchlist, continueWatching, totalWatchTime, removeFromContinueWatching, updateWatchlistStatus, removeFromWatchlist } = useUserMovies();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [managingId, setManagingId] = useState(null); // ID of the movie currently being "managed" (dropdown open)

    // Get backdrop from the first watchlist item that has one
    const heroBackdrop = watchlist.find(m => m.backdrop_path)?.backdrop_path;

    // Filter watchlist based on active tab
    const displayedWatchlist = watchlist.filter(movie => {
        if (activeTab === 'all') return true;
        const status = movie.status || 'planning'; // Legacy movies default to planning
        return status === activeTab;
    });

    return (
        <div className="page-wrapper">
            <Header />

            <main className="profile-main fade-in-up">
                {/* Hero section */}
                <div className="profile-hero">
                    <div
                        className="profile-hero-bg"
                        style={heroBackdrop ? { backgroundImage: `url(https://image.tmdb.org/t/p/original${heroBackdrop})` } : {}}
                    >
                        <div className="profile-hero-overlay"></div>
                    </div>

                    <div className="profile-hero-content">
                        <div className="hub-dashboard-header">
                            {/* Left Col: Account Info */}
                            <div className="hub-account-column">
                                <div className="hub-account-card">
                                    <div className="hub-avatar-wrapper">
                                        <img
                                            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.email}&background=random`}
                                            alt="Profile"
                                            className="hub-avatar"
                                        />
                                    </div>
                                    <div className="hub-greeting">
                                        <h1>Hi, <span className="hub-name">{currentUser?.displayName?.split(' ')[0] || 'User'}</span></h1>
                                        <p>Welcome back to your hub</p>
                                    </div>

                                    <div className="hub-quick-stats">
                                        <div className="hub-stat-mini">
                                            <span className="mini-label">Time Watched</span>
                                            <span className="mini-value">{formatWatchTime((totalWatchTime || 0) / 60)}</span>
                                        </div>
                                        <div className="hub-stat-mini">
                                            <span className="mini-label">Joined</span>
                                            <span className="mini-value">
                                                {currentUser?.metadata?.creationTime
                                                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                                    : 'Feb 2026'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Vibe Stats */}
                            <div className="hub-stats-column">
                                <VibeStats
                                    watchlist={watchlist}
                                    favorites={favoriteMovies}
                                    totalWatchTime={totalWatchTime}
                                    isHeaderVariant={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="profile-dashboard">
                    {/* Continue Watching Section - Now a Scroller */}
                    {continueWatching.length > 0 && (
                        <section id="continue-watching" className="dashboard-section scroller-section">
                            <div className="dashboard-header">
                                <h2>Continue Watching</h2>
                            </div>
                            <div className="dashboard-scroller">
                                {continueWatching.map((movie, index) => (
                                    <div key={`cw-wrapper-${movie.id}`} className="card-manage-wrapper">
                                        <button
                                            className="card-remove-btn"
                                            onClick={(e) => { e.stopPropagation(); removeFromContinueWatching(movie.id); }}
                                            title="Remove from history"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                        <MovieCard
                                            movie={movie}
                                            onClick={(m) => navigate(`/watch/${m.id}`)}
                                            animationDelay={`${index * 40}ms`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Watchlist Section */}
                    <section id="watchlist" className="dashboard-section">
                        <div className="dashboard-header watchlist-header">
                            <div>
                                <h2>My Library</h2>
                                <span className="dashboard-count">{watchlist.length} ITEMS</span>
                            </div>
                        </div>

                        {/* Status Tabs */}
                        {watchlist.length > 0 && (
                            <div className="watchlist-tabs">
                                {[
                                    { id: 'all', label: 'All', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> },
                                    { id: 'watching', label: 'Watching', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> },
                                    { id: 'planning', label: 'Planning to Watch', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
                                    { id: 'completed', label: 'Completed', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> },
                                    { id: 'on_hold', label: 'On Hold', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> },
                                ].map(tab => {
                                    const count = tab.id === 'all'
                                        ? watchlist.length
                                        : watchlist.filter(m => (m.status || 'planning') === tab.id).length;

                                    return (
                                        <button
                                            key={tab.id}
                                            className={`watchlist-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            <span className="tab-icon">{tab.icon}</span>
                                            <span className="tab-label">{tab.label}</span>
                                            <span className="tab-count">{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {displayedWatchlist.length === 0 ? (
                            <div className="dashboard-empty fade-in">
                                <div className="empty-icon-wrapper">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </div>
                                <h3>Your {activeTab === 'all' ? 'library' : activeTab.replace('_', ' ')} is empty</h3>
                                <p>Start adding movies to build your cinematic DNA.</p>
                                <button className="empty-cta-btn" onClick={() => navigate('/discover')}>
                                    Start Exploring
                                </button>
                            </div>
                        ) : (
                            <div className="dashboard-grid">
                                {displayedWatchlist.map((movie, index) => (
                                    <div key={`wl-wrapper-${movie.id}`} className="card-manage-wrapper">
                                        <div className={`card-actions-dropdown ${managingId === movie.id ? 'active' : ''}`}>
                                            <button
                                                className="card-manage-trigger"
                                                onClick={(e) => { e.stopPropagation(); setManagingId(managingId === movie.id ? null : movie.id); }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </button>

                                            {managingId === movie.id && (
                                                <div className="manage-menu fade-in">
                                                    <div className="manage-menu-section">
                                                        <span className="manage-menu-label">Move to</span>
                                                        <button onClick={() => { updateWatchlistStatus(movie, 'watching'); setManagingId(null); }}>Watching</button>
                                                        <button onClick={() => { updateWatchlistStatus(movie, 'planning'); setManagingId(null); }}>Planning</button>
                                                        <button onClick={() => { updateWatchlistStatus(movie, 'completed'); setManagingId(null); }}>Completed</button>
                                                        <button onClick={() => { updateWatchlistStatus(movie, 'on_hold'); setManagingId(null); }}>On Hold</button>
                                                    </div>
                                                    <div className="manage-menu-divider"></div>
                                                    <button className="manage-menu-remove" onClick={() => { removeFromWatchlist(movie); setManagingId(null); }}>
                                                        Remove from Library
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <MovieCard
                                            movie={movie}
                                            onClick={(m) => navigate(`/watch/${m.id}`)}
                                            animationDelay={`${index * 40}ms`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
