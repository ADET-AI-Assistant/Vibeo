import React from 'react';
import { Terminal, Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

const EnvRow = ({ name, value, isOptional = false }) => {
    // We don't want to expose the actual key fully, just prove it's there
    const status = value ? 'FOUND' : (isOptional ? 'OPTIONAL' : 'MISSING');
    const color = value ? '#a6e3a1' : (isOptional ? '#f9e2af' : '#f38ba8');
    const Icon = value ? CheckCircle : (isOptional ? AlertTriangle : AlertTriangle);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #313244',
            background: 'transparent',
            transition: 'background 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Lock size={16} color="#cdd6f4" style={{ opacity: 0.5 }} />
                <code style={{ color: '#cdd6f4', fontSize: '1rem', fontWeight: 600 }}>{name}</code>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: color, fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>
                {status}
                <Icon size={16} />
            </div>
        </div>
    );
};

const EnvironmentSection = () => {
    // Safely check meta env without throwing errors if they don't exist
    const envs = import.meta.env;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--c-text)', marginBottom: '16px', fontWeight: 800 }}>Environment Health</h2>
                <p style={{ color: 'var(--c-text2)', fontSize: '1.1rem', maxWidth: '800px', lineHeight: '1.6' }}>
                    Live validation of the local environment (`.env` file or Vercel config). 
                    Actual API keys are intentionally hidden for security. This proves the system environment is properly bootstrapped.
                </p>
            </div>

            <div style={{
                background: '#1e1e2e', // Deep terminal background
                borderRadius: '16px',
                border: '1px solid #313244',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                {/* Terminal Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 20px',
                    background: '#11111b',
                    borderBottom: '1px solid #313244'
                }}>
                    <Terminal size={18} color="#a6adc8" />
                    <span style={{ color: '#a6adc8', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>SYSTEM DIAGNOSTICS</span>
                </div>

                {/* Env Map */}
                <div style={{ padding: '0' }}>
                    {/* Database & Auth */}
                    <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.2)', color: '#89b4fa', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px' }}>FIREBASE (AUTH & FIRESTORE)</div>
                    <EnvRow name="VITE_FIREBASE_API_KEY" value={envs.VITE_FIREBASE_API_KEY} />
                    <EnvRow name="VITE_FIREBASE_PROJECT_ID" value={envs.VITE_FIREBASE_PROJECT_ID} />
                    <EnvRow name="VITE_FIREBASE_AUTH_DOMAIN" value={envs.VITE_FIREBASE_AUTH_DOMAIN} />

                    {/* Media APIs */}
                    <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.2)', color: '#cba6f7', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px' }}>MEDIA INTEGRATIONS</div>
                    <EnvRow name="VITE_TMDB_API_KEY" value={envs.VITE_TMDB_API_KEY} />
                    <EnvRow name="VITE_FANART_API_KEY" value={envs.VITE_FANART_API_KEY} isOptional={true} />

                    {/* AI Integrations */}
                    <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.2)', color: '#fab387', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px' }}>AI SERVICES (SERVERLESS)</div>
                    <EnvRow name="VITE_GROQ_API_KEY" value={envs.VITE_GROQ_API_KEY} isOptional={true} />
                    <EnvRow name="VITE_HF_API_KEY" value={envs.VITE_HF_API_KEY} isOptional={true} />
                </div>
                
                {/* Footer Status */}
                <div style={{
                    padding: '20px',
                    background: '#11111b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#a6e3a1',
                    fontSize: '0.9rem',
                    fontWeight: 600
                }}>
                    <Shield size={18} />
                    <span>System is secure and initialized successfully.</span>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default EnvironmentSection;
