import React, { useState, useEffect } from 'react';
import { fetchLeaderboard } from '@/api/djangoClient';
import { Trophy, Flame, Play, ArrowLeft, RefreshCcw, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserMoviesContext } from '@/context/UserMoviesContext';
import './styles.css';

const Leaderboard = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [view, setView] = useState('streak'); // 'streak' or 'watchtime'
    const navigate = useNavigate();
    const { syncToBackend } = useUserMoviesContext();

    const loadLeaderboard = async () => {
        setLoading(true);
        const data = await fetchLeaderboard();
        setStats(data);
        setLoading(false);
    };

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const handleManualSync = async () => {
        setSyncing(true);
        setSyncSuccess(false);
        try {
            await syncToBackend();
            setSyncSuccess(true);
            // Refresh the data after sync
            await loadLeaderboard();
            setTimeout(() => setSyncSuccess(false), 3000);
        } catch (err) {
            console.error('Manual sync failed:', err);
        } finally {
            setSyncing(false);
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    const sortedStats = [...stats].sort((a, b) => {
        if (view === 'streak') return b.current_streak - a.current_streak;
        return b.total_watch_time - a.total_watch_time;
    });

    const podiums = sortedStats.slice(0, 3);
    const list = sortedStats.slice(3);

    return (
        <div className="leaderboard-page">
            <header className="leaderboard-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div className="title-section">
                    <Trophy className="trophy-icon" size={32} />
                    <h1>Global Hall of Vibe</h1>
                    <p>The top 50 most active Vibeo viewers</p>
                </div>
            </header>

            <div className="leaderboard-controls">
                <div className="tab-controls">
                    <button 
                        className={`control-btn ${view === 'streak' ? 'active' : ''}`}
                        onClick={() => setView('streak')}
                    >
                        <Flame size={18} />
                        Top Streaks
                    </button>
                    <button 
                        className={`control-btn ${view === 'watchtime' ? 'active' : ''}`}
                        onClick={() => setView('watchtime')}
                    >
                        <Play size={18} />
                        Watch Time
                    </button>
                </div>

                <button 
                    className={`sync-btn ${syncing ? 'syncing' : ''} ${syncSuccess ? 'success' : ''}`}
                    onClick={handleManualSync}
                    disabled={syncing}
                >
                    {syncing ? <RefreshCcw size={18} className="spin" /> : 
                     syncSuccess ? <CheckCircle size={18} /> : 
                     <RefreshCcw size={18} />}
                    {syncing ? 'Syncing...' : syncSuccess ? 'Synced!' : 'Sync My Stats'}
                </button>
            </div>

            {loading ? (
                <div className="leaderboard-loading">
                    <div className="spinner"></div>
                    <p>Calculating rankings...</p>
                </div>
            ) : stats.length === 0 ? (
                <div className="leaderboard-empty">
                    <div className="empty-content">
                        <Flame size={48} color="var(--c-surface2)" />
                        <p>No active users yet. Be the first to bridge your stats!</p>
                        <button className="empty-sync-btn" onClick={handleManualSync}>
                            Initialize My Stats
                        </button>
                    </div>
                </div>
            ) : (
                <div className="leaderboard-content">
                    {/* Podium Section */}
                    <div className="podium-section">
                        {/* 2nd Place */}
                        {podiums[1] && (
                            <div className="podium-item second">
                                <div className="avatar-wrapper">
                                    <img src={podiums[1].avatar_url || `https://ui-avatars.com/api/?name=${podiums[1].username}&background=random`} alt={podiums[1].username} />
                                    <div className="rank-badge">2</div>
                                </div>
                                <div className="user-info">
                                    <span className="username">{podiums[1].username}</span>
                                    <span className="stat">
                                        {view === 'streak' ? `${podiums[1].current_streak} days` : formatTime(podiums[1].total_watch_time)}
                                    </span>
                                </div>
                                <div className="pillar silver"></div>
                            </div>
                        )}
                        {/* 1st Place */}
                        {podiums[0] && (
                            <div className="podium-item first">
                                <div className="avatar-wrapper">
                                    <img src={podiums[0].avatar_url || `https://ui-avatars.com/api/?name=${podiums[0].username}&background=random`} alt={podiums[0].username} />
                                    <div className="crown">👑</div>
                                    <div className="rank-badge">1</div>
                                </div>
                                <div className="user-info">
                                    <span className="username">{podiums[0].username}</span>
                                    <span className="stat highlight">
                                        {view === 'streak' ? `${podiums[0].current_streak} days` : formatTime(podiums[0].total_watch_time)}
                                    </span>
                                </div>
                                <div className="pillar gold"></div>
                            </div>
                        )}
                        {/* 3rd Place */}
                        {podiums[2] && (
                            <div className="podium-item third">
                                <div className="avatar-wrapper">
                                    <img src={podiums[2].avatar_url || `https://ui-avatars.com/api/?name=${podiums[2].username}&background=random`} alt={podiums[2].username} />
                                    <div className="rank-badge">3</div>
                                </div>
                                <div className="user-info">
                                    <span className="username">{podiums[2].username}</span>
                                    <span className="stat">
                                        {view === 'streak' ? `${podiums[2].current_streak} days` : formatTime(podiums[2].total_watch_time)}
                                    </span>
                                </div>
                                <div className="pillar bronze"></div>
                            </div>
                        )}
                    </div>

                    {/* Rest of the List */}
                    {list.length > 0 && (
                        <div className="leaderboard-list">
                            {list.map((user, index) => (
                                <div key={user.firebase_uid} className="list-item">
                                    <span className="rank-num">{index + 4}</span>
                                    <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`} alt={user.username} className="user-avatar" />
                                    <span className="username">{user.username}</span>
                                    <span className="user-stat-value">
                                        {view === 'streak' ? (
                                            <><Flame size={14} className="streak-icon" /> {user.current_streak}</>
                                        ) : (
                                            <><Play size={14} className="play-icon" /> {formatTime(user.total_watch_time)}</>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
