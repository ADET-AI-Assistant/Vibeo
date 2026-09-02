import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, Compass, Bookmark, Settings, Monitor, Volume2, VolumeX } from 'lucide-react';
import { useTVFocus, useTVFocusable } from '../context/TVFocusContext';

const NavItem = ({ id, label, icon: Icon, path, isActive }) => {
    const navigate = useNavigate();
    const { ref, isFocused } = useTVFocusable({
        id,
        zone: 'sidebar',
        onSelect: () => navigate(path),
    });

    return (
        <button
            ref={ref}
            className={`tv-sidebar__item tv-focusable ${isFocused ? 'tv-focused' : ''} ${isActive ? 'active' : ''}`}
            onClick={() => navigate(path)}
        >
            <div className="tv-sidebar__item-icon">
                <Icon size={22} strokeWidth={2.4} />
            </div>
            <span className="tv-sidebar__item-label">{label}</span>
        </button>
    );
};

const SoundToggleItem = () => {
    const { soundEnabled, setSoundEnabled } = useTVFocus();
    const { ref, isFocused } = useTVFocusable({
        id: 'sidebar-sound',
        zone: 'sidebar',
        onSelect: () => setSoundEnabled(prev => !prev),
    });

    const Icon = soundEnabled ? Volume2 : VolumeX;

    return (
        <button
            ref={ref}
            className={`tv-sidebar__item tv-focusable ${isFocused ? 'tv-focused' : ''}`}
            onClick={() => setSoundEnabled(prev => !prev)}
        >
            <div className="tv-sidebar__item-icon">
                <Icon size={22} strokeWidth={2.4} />
            </div>
            <span className="tv-sidebar__item-label">{soundEnabled ? 'Sound SFX: ON' : 'Sound SFX: OFF'}</span>
        </button>
    );
};

const ExitTVItem = () => {
    const navigate = useNavigate();
    const { ref, isFocused } = useTVFocusable({
        id: 'sidebar-exit',
        zone: 'sidebar',
        onSelect: () => {
            // Exit fullscreen if active
            if (typeof document !== 'undefined' && document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
            navigate('/');
        },
    });

    return (
        <button
            ref={ref}
            className={`tv-sidebar__item tv-focusable ${isFocused ? 'tv-focused' : ''}`}
            onClick={() => {
                if (typeof document !== 'undefined' && document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                }
                navigate('/');
            }}
        >
            <div className="tv-sidebar__item-icon">
                <Monitor size={22} strokeWidth={2.4} />
            </div>
            <span className="tv-sidebar__item-label">Exit TV Mode</span>
        </button>
    );
};

export const TVSidebar = () => {
    const location = useLocation();
    const { isSidebarOpen } = useTVFocus();

    const navItems = [
        { id: 'sidebar-search', label: 'Search', icon: Search, path: '/tv/search' },
        { id: 'sidebar-home', label: 'Home', icon: Home, path: '/tv' },
        { id: 'sidebar-discover', label: 'Discover', icon: Compass, path: '/tv/discover' },
        { id: 'sidebar-library', label: 'My Library', icon: Bookmark, path: '/tv/library' },
        { id: 'sidebar-settings', label: 'Settings', icon: Settings, path: '/tv/settings' },
    ];

    return (
        <aside className={`tv-sidebar ${isSidebarOpen ? 'tv-sidebar--expanded' : ''}`}>
            <div>
                <div className="tv-sidebar__logo">
                    <div className="tv-sidebar__logo-badge">V</div>
                    <span className="tv-sidebar__logo-title">Vibeo TV</span>
                </div>

                <nav className="tv-sidebar__nav">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            icon={item.icon}
                            path={item.path}
                            isActive={location.pathname === item.path}
                        />
                    ))}
                </nav>
            </div>

            <div className="tv-sidebar__footer">
                <SoundToggleItem />
                <ExitTVItem />
            </div>
        </aside>
    );
};

export default TVSidebar;
