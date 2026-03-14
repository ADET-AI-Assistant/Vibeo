import React from 'react';
import { Flame, CheckCircle2 } from 'lucide-react';
import { useUserMoviesContext, getLocalISOString } from '@/context/UserMoviesContext';
import './styles.css';

const ProfileStreak = ({ className = "" }) => {
    const { streakData, loading } = useUserMoviesContext();

    if (loading || !streakData.current) return null;

    const currentStreak = streakData.current;
    const isElite = currentStreak >= 7;
    const isMaster = currentStreak >= 30;

    // Weekly progress logic (Sunday to Saturday) based on local time
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    const todayStr = getLocalISOString(today);
    const currentDayIndex = today.getDay(); // 0 = Sun, 1 = Mon, etc.

    // Calculate which days are part of the streak
    // We assume the streak ends today or yesterday (if they haven't checked in yet, but the calculation logic handles that)
    // Actually our UserMoviesContext updates the streak as soon as they load the page, so lastActiveDate is likely today.
    const activeDays = new Array(7).fill(false);

    // Simple inference: highlight the last 'currentStreak' days leading up to the last active date
    const lastActive = streakData.lastActiveDate;
    if (lastActive) {
        // If they checked in today or yesterday, the streak is alive
        const lastActiveDateObj = new Date(lastActive + 'T00:00:00');
        const lastActiveDayIdx = lastActiveDateObj.getDay();

        for (let i = 0; i < currentStreak; i++) {
            const dayIdx = (lastActiveDayIdx - i + 7) % 7;
            activeDays[dayIdx] = true;
            if (i >= 6) break;
        }
    }

    return (
        <div className={`profile-streak-card ${isMaster ? 'tier-master' : isElite ? 'tier-elite' : 'tier-basic'} ${className}`}>
            <div className="streak-main-display">
                <div className="streak-fire-platform">
                    <div className="fire-container">
                        <div className="fire-glow"></div>
                        <div className="fire-particles"></div>
                        <Flame
                            className="main-flame-icon"
                            fill="currentColor"
                        />
                    </div>
                </div>

                <div className="streak-stats-info">
                    <div className="streak-count-wrapper">
                        <span className="count-number">{currentStreak}</span>
                        <div className="count-label">
                            <h3>Day Streak</h3>
                            <p>{isMaster ? 'Master Tier' : isElite ? 'Elite Tier' : 'Active'}</p>
                        </div>
                    </div>

                    {!isElite && (
                        <div className="streak-milestone-hint">
                            <div className="hint-progress-bar">
                                <div className="hint-progress-fill" style={{ width: `${(currentStreak / 7) * 100}%` }}></div>
                            </div>
                            <span>{7 - currentStreak} days to Purple Fire</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="streak-weekly-map">
                {daysOfWeek.map((day, idx) => {
                    const isToday = idx === currentDayIndex;
                    const isHit = activeDays[idx];

                    return (
                        <div key={idx} className={`day-node ${isHit ? 'node-hit' : ''} ${isToday ? 'node-today' : ''}`}>
                            <div className="node-circle">
                                {isHit && <CheckCircle2 size={16} />}
                            </div>
                            <span className="day-label">{day}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProfileStreak;
