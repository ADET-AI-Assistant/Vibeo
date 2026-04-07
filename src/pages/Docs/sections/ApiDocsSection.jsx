import React, { useState } from 'react';
import { Send, Activity, ShieldAlert, Key, UserCheck, ShieldOff } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { useAuth } from '../../../context/AuthContext';

const ApiTesterCard = ({ title, method, endpoint, description, demoBody, apiCallHandler }) => {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleTest = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await apiCallHandler();
            setResponse(JSON.stringify(res, null, 2));
        } catch (err) {
            setError(true);
            setResponse(JSON.stringify({ error: err.message }, null, 2));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: 'var(--c-bg)',
            borderRadius: '16px',
            border: `1px solid ${error ? '#f38ba8' : 'var(--c-surface2)'}`,
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid var(--c-surface2)',
                background: 'rgba(255,255,255,0.02)'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{
                            background: method === 'GET' ? 'rgba(137, 180, 250, 0.2)' : 'rgba(166, 227, 161, 0.2)',
                            color: method === 'GET' ? '#89b4fa' : '#a6e3a1',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            letterSpacing: '1px'
                        }}>{method}</span>
                        <code style={{ color: 'var(--c-text)', fontSize: '1rem', fontWeight: 600 }}>{endpoint}</code>
                    </div>
                    <p style={{ margin: 0, color: 'var(--c-text2)', fontSize: '0.9rem' }}>{title}</p>
                </div>
                <button 
                    onClick={handleTest}
                    disabled={loading}
                    style={{
                        background: 'var(--c-text)',
                        color: 'var(--c-bg)',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'transform 0.2s',
                        opacity: loading ? 0.7 : 1
                    }}
                    onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {loading ? <Activity size={18} className="animate-spin" /> : <Send size={18} />}
                    {loading ? 'Sending...' : 'Test Endpoint'}
                </button>
            </div>

            {/* Description */}
            <div style={{ padding: '24px' }}>
                <p style={{ color: 'var(--c-text2)', marginBottom: '16px', lineHeight: '1.5' }}>{description}</p>
                
                {demoBody && (
                    <div>
                        <h5 style={{ color: '#cdd6f4', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Request Body</h5>
                        <CodeBlock code={demoBody} />
                    </div>
                )}

                {response && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <h5 style={{ 
                            color: error ? '#f38ba8' : '#a6e3a1', 
                            fontSize: '0.85rem', 
                            marginBottom: '8px', 
                            marginTop: '24px',
                            textTransform: 'uppercase', 
                            letterSpacing: '1px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            Response Data
                            {error ? <ShieldAlert size={14} /> : <span style={{ padding: '2px 8px', background: 'rgba(166, 227, 161, 0.2)', borderRadius: '10px' }}>200 OK</span>}
                        </h5>
                        <CodeBlock code={response} language="json" />
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const AuthStatusCard = () => {
    const { currentUser } = useAuth();
    
    return (
        <div style={{
            background: 'var(--c-bg)',
            borderRadius: '16px',
            border: `1px solid ${currentUser ? '#a6e3a1' : '#f38ba8'}`,
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px', borderBottom: '1px solid var(--c-surface2)',
                background: currentUser ? 'rgba(166, 227, 161, 0.05)' : 'rgba(243, 139, 168, 0.05)'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{
                            background: 'rgba(203, 166, 247, 0.2)', color: '#cba6f7',
                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px'
                        }}>AUTH</span>
                        <code style={{ color: 'var(--c-text)', fontSize: '1rem', fontWeight: 600 }}>SDK: Firebase/Auth</code>
                    </div>
                    <p style={{ margin: 0, color: 'var(--c-text2)', fontSize: '0.9rem' }}>Live Session Validation</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: currentUser ? '#a6e3a1' : '#f38ba8', fontWeight: 700 }}>
                    {currentUser ? <UserCheck size={20} /> : <ShieldOff size={20} />}
                    {currentUser ? 'AUTHENTICATED' : 'ANONYMOUS'}
                </div>
            </div>
            
            <div style={{ padding: '24px' }}>
                <p style={{ color: 'var(--c-text2)', marginBottom: '16px', lineHeight: '1.5' }}>
                    Unlike static REST endpoints, Authentication uses an active listener via React Context. 
                    This verifies if the Firebase JWT is valid and stored in the browser.
                </p>
                
                <h5 style={{ color: currentUser ? '#a6e3a1' : '#f38ba8', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Current User object
                </h5>
                <CodeBlock 
                    code={JSON.stringify(currentUser ? {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        emailVerified: currentUser.emailVerified,
                        isAnonymous: currentUser.isAnonymous,
                        providerId: currentUser.providerData[0]?.providerId
                    } : { error: "No active session. Please log in to view Auth data." }, null, 2)} 
                    language="json" 
                />
            </div>
        </div>
    );
};

const ApiDocsSection = () => {

    // Dummy handler for demo purposes - hits real TMDB API but just trending
    const fetchTMDB = async () => {
        // We use the app's env var directly for the playground
        const key = import.meta.env.VITE_TMDB_API_KEY;
        const res = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${key}`);
        if (!res.ok) throw new Error("TMDB fetch failed");
        const data = await res.json();
        return { page: data.page, results: data.results.slice(0, 2), total_pages: data.total_pages }; // truncate for display
    };

    // Handler to show specific URL parameter fetching (Movie Credits)
    const fetchCredits = async () => {
        const key = import.meta.env.VITE_TMDB_API_KEY;
        const movieId = 157336; // Interstellar
        const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${key}`);
        if (!res.ok) throw new Error("TMDB fetch failed");
        const data = await res.json();
        return { id: data.id, cast: data.cast.slice(0, 3), crew: data.crew.slice(0, 1) }; // truncate
    };

    // Handler for Groq serverless with robust local dev fallback
    const fetchGroq = async () => {
        const body = {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "Say 'Hello User! I am the Vibey AI checking in.'" }]
        };

        try {
            const res = await fetch('/api/groq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const contentType = res.headers.get("content-type");
            if (res.ok && contentType && contentType.includes("application/json")) {
                return await res.json();
            }
            throw new Error("Local proxy not available");
        } catch (err) {
            const key = import.meta.env.VITE_GROQ_API_KEY;
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error("Direct Groq fetch failed");
            const data = await res.json();
            return { _dev_note: "Response served via direct API fallback", ...data };
        }
    };

    // Handler for HuggingFace serverless with robust local dev fallback
    const fetchHF = async () => {
        const body = {
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            messages: [{ role: "user", content: "Tell me a short 1 sentence movie quote." }]
        };

        try {
            const res = await fetch('/api/huggingface', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const contentType = res.headers.get("content-type");
            if (res.ok && contentType && contentType.includes("application/json")) {
                return await res.json();
            }
            throw new Error("Local proxy not available");
        } catch (err) {
            const key = import.meta.env.VITE_HF_API_KEY || import.meta.env.HUGGING_FACE_API;
            const res = await fetch(`https://api-inference.huggingface.co/models/${body.model}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error("Direct HF fetch failed");
            const data = await res.json();
            return { _dev_note: "Response served via direct API fallback", ...data };
        }
    };

    // Handler for Django Leaderboard
    const fetchLeaderboard = async () => {
        const res = await fetch('/api/leaderboard/');
        if (!res.ok) throw new Error("Leaderboard fetch failed");
        return await res.json();
    };

    // Handler for Django Sync Stats
    const syncStats = async () => {
        const body = {
            firebase_uid: "test_uid_docs",
            username: "Docs Tester",
            avatar_url: "https://lh3.googleusercontent.com/...",
            total_watch_time: 12345,
            current_streak: 3,
            highest_streak: 5
        };
        const res = await fetch('/api/sync-stats/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error("Sync failed");
        return await res.json();
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--c-text)', marginBottom: '8px', fontWeight: 800 }}>Live Endpoints</h2>
                    <p style={{ color: 'var(--c-text2)', fontSize: '1.1rem', margin: 0 }}>Interactive playground mirroring Postman functionality.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(249, 226, 175, 0.1)', color: '#f9e2af', padding: '10px 16px', borderRadius: '12px' }}>
                    <Key size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>API Keys Loaded securely</span>
                </div>
            </div>

            <AuthStatusCard />

            <ApiTesterCard 
                title="Global Leaderboard — SQL Aggregate"
                method="GET"
                endpoint="/api/leaderboard"
                description="Fetches the top 50 users ranked by watch time or streaks. This hits the Django backend which queries the Neon PostgreSQL database."
                apiCallHandler={fetchLeaderboard}
            />

            <ApiTesterCard 
                title="User Stats Sync — Hybrid Bridge"
                method="POST"
                endpoint="/api/sync-stats"
                description="Synchronizes local Firebase state to the relational database. This is used to build the global leaderboard without querying Firestore directly for every ranking."
                demoBody={JSON.stringify({
                    firebase_uid: "Pm1WLcJLZ3aHkXO53BefELh3YAB3",
                    username: "John Lemar",
                    total_watch_time: 95000,
                    current_streak: 5,
                    highest_streak: 10
                }, null, 2)}
                apiCallHandler={syncStats}
            />

            <ApiTesterCard 
                title="Vercel Serverless Function — Groq Integration"
                method="POST"
                endpoint="/api/groq"
                description="Our secure backend proxy. It takes the request from the browser, attaches the secret GROQ_API key securely hidden in Vercel, and forwards it to Groq for LLM inference."
                demoBody={JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: "Say 'Hello User! I am the Vibey AI checking in.'" }]
                }, null, 2)}
                apiCallHandler={fetchGroq}
            />

            <ApiTesterCard 
                title="TMDB API Fetch — Movies Data"
                method="GET"
                endpoint="https://api.themoviedb.org/3/trending/movie/day"
                description="External API call to The Movie Database to fetch current trending items. Shows pagination handling and JSON array structures."
                apiCallHandler={fetchTMDB}
            />

            <ApiTesterCard 
                title="TMDB API Fetch — Movie Credits"
                method="GET"
                endpoint="https://api.themoviedb.org/3/movie/{movieId}/credits"
                description="Fetches the cast and crew for a specific movie (Interstellar). Demonstrates passing dynamic URL parameters to an external API."
                apiCallHandler={fetchCredits}
            />

            <ApiTesterCard 
                title="Vercel Serverless Function — HuggingFace Integration"
                method="POST"
                endpoint="/api/huggingface"
                description="Backup AI provider. If Groq fails, this proxy sends the chat payload to HuggingFace Inference Endpoints running Mistral 7B."
                demoBody={JSON.stringify({
                    model: "mistralai/Mistral-7B-Instruct-v0.3",
                    messages: [{ role: "user", content: "Tell me a short 1 sentence movie quote." }]
                }, null, 2)}
                apiCallHandler={fetchHF}
            />

        </div>
    );
};

export default ApiDocsSection;
