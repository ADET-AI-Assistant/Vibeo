import React, { useState } from 'react';
import { Layers, MousePointer2 } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

// Demo components strictly for showcasing the UI library
const DemoButton = ({ text, primary }) => (
    <button style={{
        background: primary ? 'var(--c-accent)' : 'transparent',
        color: primary ? 'white' : 'var(--c-text)',
        border: primary ? 'none' : '1px solid var(--c-surface2)',
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        {text}
    </button>
);

const DemoMovieCard = () => (
    <div style={{
        width: '150px',
        aspectRatio: '2/3',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.8) 100%)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '12px',
        border: '1px solid var(--c-surface2)',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        fontWeight: 700,
        fontSize: '0.9rem',
        textShadow: '0 2px 4px rgba(0,0,0,0.8)'
    }}>
        <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'var(--c-accent)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem'
        }}>
            8.4
        </div>
        Interstellar
    </div>
);

const ComponentShower = ({ title, description, code, children }) => (
    <div style={{
        background: 'var(--c-bg)',
        borderRadius: '16px',
        border: '1px solid var(--c-surface2)',
        overflow: 'hidden',
        marginBottom: '40px'
    }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--c-surface2)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--c-text)' }}>{title}</h3>
            <p style={{ margin: 0, color: 'var(--c-text2)', fontSize: '0.9rem' }}>{description}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1.5fr', minHeight: '200px' }}>
            {/* Live Preview Pane */}
            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.2)',
                padding: '32px',
                borderRight: '1px solid var(--c-surface2)'
            }}>
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--c-text2)', fontWeight: 600 }}>
                    <MousePointer2 size={12} /> Live Preview
                </div>
                {children}
            </div>

            {/* Code Implementation Pane */}
            <div style={{ padding: '0 24px', background: '#1e1e2e' }}>
                <CodeBlock code={code} language="jsx" />
            </div>
        </div>
    </div>
);

const ComponentsSection = () => {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--c-text)', marginBottom: '16px', fontWeight: 800 }}>Component Library</h2>
                <p style={{ color: 'var(--c-text2)', fontSize: '1.1rem', maxWidth: '800px', lineHeight: '1.6' }}>
                    Vibeo utilizes a custom, scalable <strong>React Design System</strong>. Instead of hardcoding HTML
                    repeatedly, we built modular, reusable UI components mapped to our custom CSS design tokens.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#cba6f7', fontSize: '0.9rem', fontWeight: 600, background: 'rgba(203, 166, 247, 0.1)', padding: '8px 16px', borderRadius: '20px', marginTop: '16px' }}>
                    <Layers size={16} /> Component Driven Architecture
                </div>
            </div>

            <ComponentShower
                title="Primary Interaction Buttons"
                description="Standardized action buttons adapting to our global theme styling."
                code={`<div className="flex gap-4">
    <Button primary onClick={handlePlay}>
        <Play size={18} /> Watch Now
    </Button>

    <Button onClick={openDetails}>
        View Info
    </Button>
</div>`}
            >
                <div style={{ display: 'flex', gap: '16px' }}>
                    <DemoButton text="Watch Now" primary={true} />
                    <DemoButton text="More Info" primary={false} />
                </div>
            </ComponentShower>

            <ComponentShower
                title="TMDB Media Cards"
                description="Reusable smart-cards that display movie posters, standardize aspect ratios, and format the vote-average."
                code={`<MovieCard 
    movie={interstellarDetails} 
    onAddWatchlist={addToFirebase}
    showRatingBadge={true}
/>`}
            >
                <div>
                    <DemoMovieCard />
                </div>
            </ComponentShower>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ComponentsSection;
