import React from 'react';
import { Database, Key, LayoutList, Fingerprint, History, Palette } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const SchemaCard = ({ title, icon: Icon, description, documentShape }) => (
    <div style={{
        background: 'var(--c-bg)',
        borderRadius: '16px',
        border: '1px solid var(--c-surface2)',
        overflow: 'hidden',
        marginBottom: '40px',
        animation: 'fadeIn 0.5s ease-out'
    }}>
        <div style={{
            padding: '24px',
            borderBottom: '1px solid var(--c-surface2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        }}>
            <div style={{
                background: 'rgba(166, 227, 161, 0.1)',
                padding: '12px',
                borderRadius: '12px',
                color: '#a6e3a1'
            }}>
                <Icon size={24} />
            </div>
            <div>
                <h3 style={{ margin: '0 0 4px 0', color: 'var(--c-text)', fontSize: '1.2rem' }}>{title}</h3>
                <p style={{ margin: 0, color: 'var(--c-text2)', fontSize: '0.9rem' }}>{description}</p>
            </div>
        </div>
        <div style={{ padding: '0 24px' }}>
            <CodeBlock code={documentShape} language="json" />
        </div>
    </div>
);

const DatabaseSection = () => {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2 className="docs-heading">Database Schema</h2>
                <p className="docs-subheading">
                    Vibeo utilizes a NoSQL document database Architecture via <strong>Firebase Firestore</strong>. Instead of rigid SQL tables, data is stored in flexible Collections and Documents.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#89b4fa', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(137, 180, 250, 0.1)', padding: '8px 16px', borderRadius: '20px' }}>
                        <Database size={16} /> NoSQL Structure
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f9e2af', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(249, 226, 175, 0.1)', padding: '8px 16px', borderRadius: '20px' }}>
                        <Fingerprint size={16} /> Data Scoped via Auth UID
                    </div>
                </div>
            </div>

            <SchemaCard
                title="Users Collection"
                icon={Database}
                description="Root collection: /users/{uid}. Stores individual user profiles, preferences, and lists."
                documentShape={JSON.stringify({
                    "uid": "1A2B3C4D5E6F_firebase_auth_id",
                    "email": "lemar@example.com",
                    "displayName": "Lemar",
                    "photoURL": "https://lh3.googleusercontent.com/...",
                    "createdAt": "Timestamp(January 1, 2026 at 12:00:00 PM UTC+8)",
                    "lastLoginAt": "Timestamp(March 31, 2026 at 12:30:00 PM UTC+8)",
                    "themePreference": "dark",
                    "isOnboarded": true,
                    "tastePreferences": ["Action", "Sci-Fi", "Anime"]
                }, null, 2)}
            />

            <SchemaCard
                title="Watchlist Sub-collection"
                icon={LayoutList}
                description="Scoped underneath the user: /users/{uid}/watchlist/{movieId}. Allows O(1) reads for specific movies."
                documentShape={JSON.stringify({
                    "id": 550,
                    "title": "Fight Club",
                    "media_type": "movie",
                    "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                    "vote_average": 8.4,
                    "addedAt": "Timestamp(March 31, 2026 at 1:15:00 PM UTC+8)",
                    "bookmarked": true,
                    "rating": null
                }, null, 2)}
            />

            <SchemaCard
                title="Recently Watched Sub-collection"
                icon={History}
                description="Tracks user playback history: /users/{uid}/history/{movieId}."
                documentShape={JSON.stringify({
                    "id": 111161,
                    "title": "Solo Leveling",
                    "media_type": "tv",
                    "poster_path": "/b4iI2NogZ2rDtsZ7L1j9m7G1oM8.jpg",
                    "lastWatchedAt": "Timestamp(March 31, 2026 at 2:00:00 PM UTC+8)",
                    "progress": 0.55 // Percentage
                }, null, 2)}
            />

            <SchemaCard
                icon={Palette}
                title="Theme Settings Sub-collection"
                description="Persists user UI preferences globally: /users/{uid}/settings/theme."
                documentShape={JSON.stringify({
                    "mode": "dark",
                    "accentColor": "#cba6f7",
                    "reducedMotion": false,
                    "updatedAt": "Timestamp(March 31, 2026 at 2:15:00 PM UTC+8)"
                }, null, 2)}
            />

            <div style={{ marginTop: '80px', marginBottom: '40px' }}>
                <h2 className="docs-heading">Relational Data (SQL)</h2>
                <p className="docs-subheading">
                    For global features like the <strong>Leaderboard</strong> and <strong>Compliance Tracking</strong>, Vibeo uses a relational <strong>PostgreSQL</strong> database hosted on Neon. This allows for complex aggregations and cross-user queries that are inefficient in NoSQL.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f38ba8', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(243, 139, 168, 0.1)', padding: '8px 16px', borderRadius: '20px' }}>
                        <Database size={16} /> PostgreSQL / Neon
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cba6f7', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(203, 166, 247, 0.1)', padding: '8px 16px', borderRadius: '20px' }}>
                        <LayoutList size={16} /> Relational Schema
                    </div>
                </div>
            </div>

            <SchemaCard
                title="UserStat Table"
                icon={Database}
                description="Stores aggregated user progress for global rankings. Synced from Firebase."
                documentShape={JSON.stringify({
                    "id": 1,
                    "firebase_uid": "Pm1WLcJLZ3aHkXO53BefELh3YAB3",
                    "username": "John Lemar Gonzales",
                    "avatar_url": "https://lh3.googleusercontent.com/...",
                    "total_watch_time": 93570,
                    "current_streak": 5,
                    "highest_streak": 12,
                    "last_synced": "2026-04-07T09:44:30Z"
                }, null, 2)}
            />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default DatabaseSection;
