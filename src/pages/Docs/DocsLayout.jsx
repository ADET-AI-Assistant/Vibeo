import React, { useState, useEffect } from 'react';
import { Book, Server, Network, Shield, ChevronRight } from 'lucide-react';
import OverviewSection from './sections/OverviewSection';
import ArchitectureSection from './sections/ArchitectureSection';
import ApiDocsSection from './sections/ApiDocsSection';
import DatabaseSection from './sections/DatabaseSection';
import EnvironmentSection from './sections/EnvironmentSection';
import ComponentsSection from './sections/ComponentsSection';

const DocsLayout = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Disable global scrollbar styles if needed
  useEffect(() => {
    document.documentElement.classList.add('no-scrollbar');
    return () => document.documentElement.classList.remove('no-scrollbar');
  }, []);

  const tabs = [
    { id: 'overview', label: 'Project Overview', icon: Book },
    { id: 'architecture', label: 'Architecture & Flow', icon: Network },
    { id: 'database', label: 'Database Schema', icon: Server },
    { id: 'api', label: 'Live APIs & Features', icon: Server },
    { id: 'environment', label: 'Environment Status', icon: Shield },
    { id: 'components', label: 'Component Library', icon: Book },
  ];

  return (
    <div className="docs-container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--c-text)',
      paddingTop: '80px', // header offset
      background: 'var(--c-bg)'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        padding: '0 20px',
        gap: '40px'
      }}>
        {/* Sidebar */}
        <nav style={{
          width: '280px',
          flexShrink: 0,
          borderRight: '1px solid var(--c-surface2)',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          position: 'sticky',
          top: '100px',
          height: 'fit-content'
        }}>
          <h2 style={{
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--c-text2)',
            marginBottom: '10px',
            fontWeight: 700,
            paddingLeft: '12px'
          }}>
            Developer Docs
          </h2>

          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '12px',
                  background: isActive ? 'var(--c-accent)' : 'transparent',
                  color: isActive ? 'white' : 'var(--c-text)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
                  {tab.label}
                </div>
                {isActive && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          paddingTop: '20px',
          paddingBottom: '100px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'var(--c-surface)',
            borderRadius: '24px',
            padding: '40px',
            minHeight: '80vh',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            border: '1px solid var(--c-surface2)'
          }}>
            {activeTab === 'overview' && <OverviewSection />}
            {activeTab === 'architecture' && <ArchitectureSection />}
            {activeTab === 'database' && <DatabaseSection />}
            {activeTab === 'api' && <ApiDocsSection />}
            {activeTab === 'environment' && <EnvironmentSection />}
            {activeTab === 'components' && <ComponentsSection />}
          </div>
        </main>
      </div>

    </div>
  );
};

export default DocsLayout;
