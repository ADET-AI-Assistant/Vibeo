import React, { useState, useEffect } from 'react';
import { Book, Network, Server, Shield, ChevronRight } from 'lucide-react';
import OverviewSection from './sections/OverviewSection';
import ArchitectureSection from './sections/ArchitectureSection';
import DatabaseSection from './sections/DatabaseSection';
import ApiDocsSection from './sections/ApiDocsSection';
import EnvironmentSection from './sections/EnvironmentSection';
import ComponentsSection from './sections/ComponentsSection';
import './docs.css';

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
    <div className="docs-page-wrapper">
      <div className="docs-inner-container">
        {/* Sidebar */}
        <nav className="docs-sidebar">
          <h2 className="docs-nav-title">
            Developer Docs
          </h2>

          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`docs-tab-btn ${isActive ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
                  {tab.label}
                </div>
                <ChevronRight size={16} className="chevron" style={{ opacity: isActive ? 1 : 0, transition: 'opacity 0.2s' }} />
              </button>
            );
          })}
        </nav>

        {/* Main Content Area */}
        <main className="docs-content-main">
          <div className="docs-section-card">
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
