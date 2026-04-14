import React, { useState } from 'react';
import { Palette, Layout, Database, Info, Terminal } from 'lucide-react';
import AppearanceSection from './sections/Appearance';
import LayoutSection from './sections/Layout';
import DataSection from './sections/Data';
import AboutSection from './sections/About';
import DevToolsSection from './sections/DevTools';
import { useLayout } from '@/context/LayoutContext';
import './styles.css';

const Settings = () => {
    const { devMode } = useLayout();
    const [activeTab, setActiveTab] = useState('appearance');

    const renderContent = () => {
        switch (activeTab) {
            case 'appearance': return <AppearanceSection />;
            case 'layout': return <LayoutSection />;
            case 'data': return <DataSection />;
            case 'about': return <AboutSection />;
            case 'dev': return <DevToolsSection />;
            default: return <AppearanceSection />;
        }
    };

    return (
        <div className="page-wrapper settings-wrapper">
            <div className="settings-page">
                <div className="settings-header-banner">
                    <button className="back-button" onClick={() => window.history.back()}>
                        &larr;
                    </button>
                    <div className="settings-title-group">
                        <h1>Settings</h1>
                        <p>Customize your experience</p>
                    </div>
                </div>

                <div className="settings-container">
                    <aside className="settings-sidebar desktop-sidebar">
                        <nav>
                            <TabItems activeTab={activeTab} setActiveTab={setActiveTab} />
                        </nav>
                    </aside>

                    <main className="settings-main">
                        {renderContent()}
                    </main>
                </div>
            </div>

            {/* Mobile Bottom Navigation (Outside the transformed settings-page container) */}
            <aside className="settings-sidebar mobile-sidebar">
                <nav>
                    <TabItems activeTab={activeTab} setActiveTab={setActiveTab} isMobile />
                </nav>
            </aside>
        </div>
    );
};

const TabItems = ({ activeTab, setActiveTab, isMobile }) => {
    const { devMode } = useLayout();
    const tabs = [
        { id: 'appearance', label: 'Appearance', sub: 'Theme & visual settings', icon: Palette },
        { id: 'layout', label: 'Layout', sub: 'Grid & card preferences', icon: Layout },
        { id: 'data', label: 'Data & Import', sub: 'Export, import, cleanup', icon: Database },
        { id: 'about', label: 'About', sub: 'Version & developer info', icon: Info },
        { id: 'dev', label: 'Dev Mode', sub: 'Testing utilities', icon: Terminal, color: '#ef4444' }
    ].filter(tab => tab.id !== 'dev' || devMode);

    return (
        <>
            {tabs.map((tab, index) => (
                <React.Fragment key={tab.id}>
                    {tab.id === 'dev' && !isMobile && (
                        <div className="nav-divider" style={{ height: '1px', background: 'var(--c-surface3)', margin: '1rem 0' }} />
                    )}
                    <button
                        className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={tab.color && !isMobile ? { borderLeftColor: tab.color } : {}}
                    >
                        <span className="icon" style={tab.color ? { color: tab.color } : {}}>
                            <tab.icon size={20} />
                        </span>
                        <div className="text-content">
                            <strong style={tab.color ? { color: tab.color } : {}}>{tab.label}</strong>
                            {!isMobile && <span>{tab.sub}</span>}
                        </div>
                    </button>
                </React.Fragment>
            ))}
        </>
    );
};

export default Settings;
