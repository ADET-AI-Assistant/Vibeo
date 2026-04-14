/**
 * Django API Client for Vibeo
 * Handles connection to the local Django backend for leaderboard and compliance features.
 */

const BASE_URL = '/api/v1';

/**
 * Sync user stats to the Django backend
 * @param {Object} stats - User stats object
 * @returns {Promise<Object>} - Response from the server
 */
export const syncUserStats = async (stats) => {
    try {
        const response = await fetch(`${BASE_URL}/sync-stats/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firebase_uid: stats.uid,
                username: stats.displayName || stats.email?.split('@')[0] || 'User',
                avatar_url: stats.photoURL || '',
                total_watch_time: stats.totalWatchTime || 0,
                current_streak: stats.streakData?.current || 0,
                highest_streak: stats.streakData?.highest || 0,
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Sync failed: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Django Sync Error:', error);
        return null;
    }
};

/**
 * Fetch the leaderboard from the Django backend
 * @returns {Promise<Array>} - List of ranked users
 */
export const fetchLeaderboard = async () => {
    try {
        const response = await fetch(`${BASE_URL}/leaderboard/`);
        
        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Leaderboard Fetch Error:', error);
        return [];
    }
};
