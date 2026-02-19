/**
 * Header.jsx  ─ Lab 3, Task 1: Reusable Component #2
 * ─────────────────────────────────────────────────────
 * A sticky site header that accepts props so it can be
 * reused on any page with different subtitle text.
 *
 * Props:
 *   subtitle  {string}  – small tagline shown below logo
 * ─────────────────────────────────────────────────────
 */

import React from 'react';

const Header = ({ subtitle = "Your personal cinema, powered by AI mood-matching." }) => {
    return (
        /* <header> is a semantic HTML5 landmark element */
        <header className="site-header">
            <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">

                {/* ── Brand / Logo ── */}
                <div className="flex items-center gap-3">
                    {/* Animated icon badge */}
                    <div
                        className="pulse-glow"
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem',
                        }}
                    >
                        🎬
                    </div>

                    {/* Logo text */}
                    <div>
                        <span
                            style={{
                                fontSize: '1.35rem',
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #a855f7, #c084fc)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            VibeReel
                        </span>
                        {/* Dynamically renders the subtitle prop */}
                        <p style={{ fontSize: '0.68rem', color: 'var(--vr-muted)', marginTop: 1 }}>
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* ── Nav pills ── */}
                <nav className="flex items-center gap-2" aria-label="Primary Navigation">
                    <span
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--vr-muted)',
                            background: 'var(--vr-surface2)',
                            border: '1px solid var(--vr-border)',
                            borderRadius: 999,
                            padding: '5px 14px',
                            fontWeight: 500,
                        }}
                    >
                        🌐 TMDB Live
                    </span>
                    <span
                        style={{
                            fontSize: '0.75rem',
                            color: '#a855f7',
                            background: 'rgba(168,85,247,0.12)',
                            border: '1px solid rgba(168,85,247,0.3)',
                            borderRadius: 999,
                            padding: '5px 14px',
                            fontWeight: 600,
                        }}
                    >
                        🤖 AI Mood Engine
                    </span>
                </nav>
            </div>
        </header>
    );
};

export default Header;
