import React, { useEffect, useState } from 'react';
import { Database, Layout, Server, Cpu, Globe, ArrowRight, ShieldCheck, Network } from 'lucide-react';

const FlowNode = ({ icon: Icon, title, desc, color, pulse = false, delay = 0 }) => (
    <div style={{
        padding: '24px',
        background: `rgba(${color}, 0.05)`,
        border: `1px solid rgba(${color}, 0.2)`,
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '200px',
        position: 'relative',
        boxShadow: pulse ? `0 0 30px rgba(${color}, 0.15)` : 'none',
        animation: `nodePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
        animationDelay: `${delay}s`,
        opacity: 0,
        transform: 'scale(0.8)'
    }}>
        <div style={{
            background: `rgba(${color}, 0.15)`,
            color: `rgb(${color})`,
            padding: '16px',
            borderRadius: '16px',
            marginBottom: '16px',
            position: 'relative'
        }}>
            <Icon size={32} />
            {pulse && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '16px',
                    border: `2px solid rgb(${color})`,
                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                }} />
            )}
        </div>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--c-text)', fontSize: '1.1rem' }}>{title}</h4>
        <p style={{ margin: 0, color: 'var(--c-text2)', fontSize: '0.85rem', lineHeight: '1.4' }}>{desc}</p>
    </div>
);

const FlowPath = ({ color, active, delay }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        minWidth: '50px',
        position: 'relative',
        height: '40px',
        opacity: 0,
        animation: `fadeInPath 0.3s ease-out forwards`,
        animationDelay: `${delay}s`
    }}>
        <div style={{
            height: '2px',
            width: '100%',
            background: `rgba(${color}, 0.2)`,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {active && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '30%',
                    background: `rgb(${color})`,
                    boxShadow: `0 0 10px rgb(${color})`,
                    animation: 'flowPacket 1.5s infinite linear'
                }} />
            )}
        </div>
        <ArrowRight size={20} color={`rgb(${color})`} style={{ position: 'absolute', right: '-10px', background: 'var(--c-surface)' }} />
    </div>
);

const ArchitectureSection = () => {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{
                fontSize: '2.5rem',
                color: 'var(--c-text)',
                marginBottom: '16px',
                fontWeight: 800
            }}>Architecture Flow</h2>
            
            <p style={{ color: 'var(--c-text2)', fontSize: '1.1rem', marginBottom: '48px', maxWidth: '800px' }}>
                Visual map of how data moves from the frontend to the various services and databases.
            </p>

            {/* FLOW 1: Serverless AI */}
            <div style={{
                background: 'var(--c-bg)',
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid var(--c-surface2)',
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <h3 style={{ color: 'var(--c-text)', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Server size={24} color="#f5a97f" />
                    AI Serverless Flow (POST Requests)
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    <FlowNode icon={Layout} title="Vibeo Client" desc="React frontend sending POST request" color="137, 180, 250" delay={0.1} />
                    <FlowPath color="137, 180, 250" active={true} delay={0.3} />
                    
                    <FlowNode icon={Globe} title="Vercel Edge" desc="/api/groq (Serverless Auth Proxy)" color="249, 226, 175" delay={0.5} />
                    <FlowPath color="245, 169, 127" active={true} delay={0.7} />
                    
                    <FlowNode icon={Cpu} title="Groq API" desc="Llama 3 inference processing" color="245, 169, 127" pulse={true} delay={0.9} />
                </div>
            </div>

            {/* FLOW 2: Database Auth */}
            <div style={{
                background: 'var(--c-bg)',
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid var(--c-surface2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <h3 style={{ color: 'var(--c-text)', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldCheck size={24} color="#a6e3a1" />
                    Auth & Database Flow (Realtime)
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    <FlowNode icon={Layout} title="Vibeo Client" desc="User signs in via Google" color="137, 180, 250" delay={0.1} />
                    <FlowPath color="166, 227, 161" active={true} delay={0.3} />
                    
                    <FlowNode icon={ShieldCheck} title="Firebase Auth" desc="Validates Identity & Tokens" color="166, 227, 161" delay={0.5} />
                    <FlowPath color="137, 220, 235" active={true} delay={0.7} />
                    
                    <FlowNode icon={Database} title="Firestore DB" desc="Scoped CRUD operations" color="137, 220, 235" pulse={true} delay={0.9} />
                </div>
            </div>

            {/* FLOW 3: React Context State */}
            <div style={{
                background: 'var(--c-bg)',
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid var(--c-surface2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <h3 style={{ color: 'var(--c-text)', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Layout size={24} color="#cba6f7" />
                    React Context (Frontend Data Flow)
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    <FlowNode icon={Database} title="Auth Resolved" desc="User signs in, triggers AuthContext" color="137, 220, 235" delay={0.1} />
                    <FlowPath color="203, 166, 247" active={true} delay={0.3} />
                    
                    <FlowNode icon={Layout} title="UserContext" desc="Fetches specific watchlist & preferences" color="203, 166, 247" pulse={true} delay={0.5} />
                    <FlowPath color="166, 227, 161" active={true} delay={0.7} />
                    
                    <FlowNode icon={Layout} title="App UI Render" desc="Hydrates Dashboard with personalized data" color="166, 227, 161" delay={0.9} />
                </div>
            </div>

            {/* FLOW 4: Onboarding Flow */}
            <div style={{
                background: 'var(--c-bg)',
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid var(--c-surface2)',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '24px'
            }}>
                <h3 style={{ color: 'var(--c-text)', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Network size={24} color="#f9e2af" />
                    Onboarding Routing Intercepts
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <FlowNode icon={Layout} title="App.jsx" desc="Root Router evaluates user auth" color="203, 166, 247" delay={0.1} />
                    <FlowPath color="137, 180, 250" active={true} delay={0.3} />
                    
                    <FlowNode icon={Network} title="Is Logged In?" desc="Checks currentUser via AuthContext" color="137, 180, 250" pulse={true} delay={0.5} />
                    <FlowPath color="249, 226, 175" active={true} delay={0.7} />
                    
                    <FlowNode icon={Database} title="Is isOnboarded true?" desc="Checks Firestore User document" color="249, 226, 175" pulse={true} delay={0.9} />
                    <FlowPath color="166, 227, 161" active={true} delay={1.1} />
                    
                    <FlowNode icon={Layout} title="Allow Access" desc="Renders Home Dashboard (/)" color="166, 227, 161" delay={1.3} />
                </div>
            </div>

            {/* FLOW 5: Hybrid SQL Sync */}
            <div style={{
                background: 'var(--c-bg)',
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid var(--c-surface2)',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '24px'
            }}>
                <h3 style={{ color: 'var(--c-text)', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Database size={24} color="#f38ba8" />
                    Hybrid SQL Sync Flow (Compliance & Leaderboard)
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <FlowNode icon={Layout} title="Vibeo Client" desc="Local User Progress (Streaks/Watch Time)" color="137, 180, 250" delay={0.1} pulse={true} />
                    <FlowPath color="203, 166, 247" active={true} delay={0.3} />
                    
                    <FlowNode icon={Server} title="Django API" desc="Debounced Sync (3s) to Vercel/Python" color="203, 166, 247" delay={0.5} />
                    <FlowPath color="243, 139, 168" active={true} delay={0.7} />
                    
                    <FlowNode icon={Database} title="Neon Postgres" desc="Relational DB for Global Rankings" color="243, 139, 168" pulse={true} delay={0.9} />
                    <FlowPath color="166, 227, 161" active={true} delay={1.1} />
                    
                    <FlowNode icon={Layout} title="Leaderboard" desc="Global Ranked UI fetched via SQL" color="166, 227, 161" delay={1.3} />
                </div>
            </div>

            <style>{`
                @keyframes nodePop {
                    0% { opacity: 0; transform: scale(0.8); }
                    70% { transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes flowPacket {
                    0% { transform: translateX(-100%); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(350%); opacity: 0; }
                }
                @keyframes fadeInPath {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes ping {
                    75%, 100% { transform: scale(1.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default ArchitectureSection;
