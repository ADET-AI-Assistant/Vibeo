import React, { useState, useEffect, useRef } from 'react';
import { User, Activity, PieChart, Edit3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import MovieCard from '@/components/common/MovieCard';
import ProfileStreak from '@/components/common/ProfileStreak';
import CinephileGrid from '@/components/common/CinephileGrid';
import { useUserMoviesContext } from '@/context/UserMoviesContext';
import { useNavigate } from 'react-router-dom';
import { formatWatchTime } from '@/utils/timeUtils';
import VibeStats from '@/components/common/VibeStats';
import EditProfileModal from '@/components/profile/EditProfileModal';
import './styles.css';

const Profile = () => {
    const { currentUser } = useAuth();
    const { watchlist, favoriteMovies, totalWatchTime, loading } = useUserMoviesContext();
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Get backdrop from the first watchlist item that has one
    const heroBackdrop = watchlist.find(m => m.backdrop_path)?.backdrop_path;

    if (loading) return <div className="profile-loading"><div className="loader"></div></div>;

    return (
        <div className="page-wrapper">
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
                                        <h1>Hi, <span className="hub-name">{currentUser?.displayName || 'User'}</span></h1>
                                        <button className="edit-profile-action-btn" onClick={() => setIsEditModalOpen(true)}>
                                            <Edit3 size={14} /> Edit Profile
                                        </button>
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

                            {/* Right Col: Vibe Stats & Activity */}
                            <div className="hub-stats-column">
                                <VibeStats
                                    watchlist={watchlist}
                                    favorites={favoriteMovies}
                                    totalWatchTime={totalWatchTime}
                                    isHeaderVariant={true}
                                />
                                <div className="hub-activity-row">
                                    <ProfileStreak className="hub-streak-card" />
                                    <CinephileGrid className="hub-activity-grid" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="profile-dashboard">
                </div>
            </main>

            <EditProfileModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
            />
        </div>
    );
};

export default Profile;
