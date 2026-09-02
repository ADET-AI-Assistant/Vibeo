import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Maximize, Minimize, Monitor, Info } from 'lucide-react';
import { useTVFocus, useTVFocusable } from '../context/TVFocusContext';

const SettingCard = ({ id, title, description, icon: Icon, onClick, valueText, autoFocus }) => {
    const { ref, isFocused } = useTVFocusable({
        id,
        zone: 'settings-list',
        onSelect: onClick,
        autoFocus,
    });

    return (
        <div
            ref={ref}
            className={`tv-focusable ${isFocused ? 'tv-focused' : ''}`}
            onClick={onClick}
            style={{
                background: 'rgba(20, 20, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                cursor: 'pointer',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                    style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--c-accent)',
                    }}
                >
                    <Icon size={26} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>{title}</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--c-text2)' }}>{description}</p>
                </div>
            </div>

            {valueText && (
                <span
                    style={{
                        padding: '8px 18px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        fontWeight: 700,
                        fontSize: '1rem',
                    }}
                >
                    {valueText}
                </span>
            )}
        </div>
    );
};

export const TVSettings = () => {
    const navigate = useNavigate();
    const { soundEnabled, setSoundEnabled, setZoneConfig } = useTVFocus();
    const [isFullscreen, setIsFullscreen] = React.useState(
        typeof document !== 'undefined' ? !!document.fullscreenElement : false
    );

    React.useEffect(() => {
        setZoneConfig('settings-list', {
            type: 'vertical',
            orderIndex: 0,
        });

        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, [setZoneConfig]);

    const handleToggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    const handleExitTV = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        navigate('/');
    };

    return (
        <div className="tv-settings-page" style={{ maxWidth: '850px' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '32px' }}>
                TV Settings
            </h1>

            <SettingCard
                id="setting-sound"
                title="Navigation Sound Effects (SFX)"
                description="Auditory feedback clicks when navigating via D-Pad remote."
                icon={soundEnabled ? Volume2 : VolumeX}
                valueText={soundEnabled ? 'Enabled' : 'Disabled'}
                onClick={() => setSoundEnabled(prev => !prev)}
                autoFocus={true}
            />

            <SettingCard
                id="setting-fullscreen"
                title="Toggle Fullscreen"
                description="Fit the display edge-to-edge for genuine TV immersion."
                icon={isFullscreen ? Minimize : Maximize}
                valueText={isFullscreen ? 'Fullscreen ON' : 'Windowed'}
                onClick={handleToggleFullscreen}
            />

            <SettingCard
                id="setting-exit"
                title="Exit TV Mode"
                description="Return to the desktop/mobile browser interface."
                icon={Monitor}
                valueText="Exit"
                onClick={handleExitTV}
            />

            <div
                style={{
                    marginTop: '36px',
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    color: 'var(--c-text2)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                    <Info size={16} />
                    <span>Remote Control & Gamepad Guide</span>
                </div>
                Use <strong>Arrow Keys</strong> or <strong>D-Pad</strong> to navigate. Press <strong>Enter</strong> or <strong>Controller (A)</strong> to select. Press <strong>Escape / Back</strong> or <strong>Controller (B)</strong> to go back or open the sidebar.
            </div>
        </div>
    );
};

export default TVSettings;
