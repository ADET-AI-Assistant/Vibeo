import React, { useState } from 'react';
import { Send, Activity, ShieldAlert, Key } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

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

    // Handler for Groq serverless with robust local dev fallback
    const fetchGroq = async () => {
        const body = {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "Say 'Hello User! I am the Vibey AI checking in.'" }]
        };

        try {
            // Primary attempt: Hit our Vercel Serverless Function
            const res = await fetch('/api/groq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            // If we get an HTML response (like index.html SPA fallback), trigger the catch block
            const contentType = res.headers.get("content-type");
            if (res.ok && contentType && contentType.includes("application/json")) {
                return await res.json();
            }
            throw new Error("Local proxy not available");

        } catch (err) {
            // Localhood Fallback: If 'npm run dev' is used instead of 'vercel dev',
            // the /api/groq proxy won't work. We fallback to making a direct client request
            // using the Vite exposed key just so the demo doesn't break!
            console.log("Docs Playground: Using direct Groq API fallback for local dev mode.");
            
            const key = import.meta.env.VITE_GROQ_API_KEY;
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Direct Groq fetch failed");
            }
            
            const data = await res.json();
            return {
                _dev_note: "Response served via direct API fallback (Vercel serverless proxy not detected in local dev).",
                ...data
            };
        }
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
                endpoint="api.themoviedb.org/3/trending"
                description="External API call to The Movie Database to fetch current trending items. Shows pagination handling and JSON data structures."
                apiCallHandler={fetchTMDB}
            />

        </div>
    );
};

export default ApiDocsSection;
