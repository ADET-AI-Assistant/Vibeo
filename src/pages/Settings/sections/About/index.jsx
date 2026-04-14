import React from 'react';
import {
    Info, Star, Github, ExternalLink,
    MessageSquareWarning, ArrowUpRight,
    ListTree, Sparkles, Terminal
} from 'lucide-react';
import { useLayout } from '@/context/LayoutContext';
import './styles.css';

const AboutSection = () => {
    const { devMode, setDevMode } = useLayout();
    const [clicks, setClicks] = React.useState(0);
    const [showToast, setShowToast] = React.useState(false);

    const handleLogoClick = () => {
        const newClicks = clicks + 1;
        setClicks(newClicks);

        if (newClicks >= 5) {
            setDevMode(!devMode);
            setClicks(0);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    return (
        <div className="settings-section animate-fade-in about-section">
            {showToast && (
                <div className="dev-unlock-toast">
                    <Terminal size={18} />
                    <span>{devMode ? 'Developer mode enabled!' : 'Developer mode disabled!'}</span>
                </div>
            )}
            <h2><span className="icon"><Info size={20} /></span> About</h2>

            {/* Hero Card */}
            <div className="about-hero-card">
                <div className="about-logo-icon" onClick={handleLogoClick} title="Vibeo Logo">
                    <img src="/vibeo.png" alt="Vibeo Logo" className="vibeo-logo-img" />
                </div>
                <h3>Vibeo</h3>
                <span className="about-version">v1.0.0</span>

                <div className="tech-stack-pills">
                    <span className="tech-pill">React 18</span>
                    <span className="tech-pill">Vite</span>
                    <span className="tech-pill">Lucide Icons</span>
                    <span className="tech-pill">TMDB API</span>
                    <span className="tech-pill">VidSrc API</span>
                    <span className="tech-pill">Fanart.tv API</span>
                </div>

                <div className="hero-actions">
                    <a href="https://github.com/ADET-AI-Assistant/Vibeo" target="_blank" rel="noopener noreferrer" className="hero-btn btn-sponsor">
                        <Star size={16} className="btn-icon" /> Star Repo
                    </a>
                    <a href="https://github.com/ADET-AI-Assistant/Vibeo" target="_blank" rel="noopener noreferrer" className="hero-btn btn-github">
                        <Github size={16} className="btn-icon" /> GitHub
                    </a>
                </div>
            </div>

            {/* Action Cards Row */}
            <div className="about-action-cards">
                <a href="https://github.com/ADET-AI-Assistant/Vibeo/issues" target="_blank" rel="noopener noreferrer" className="action-card warning-card">
                    <div className="card-content">
                        <h4><MessageSquareWarning size={16} /> Report an Issue</h4>
                        <p>Found a bug? Let us know!</p>
                    </div>
                    <ArrowUpRight size={18} className="link-arrow" />
                </a>

                <a href="https://github.com/ADET-AI-Assistant/Vibeo/releases" target="_blank" rel="noopener noreferrer" className="action-card info-card">
                    <div className="card-content">
                        <h4><ListTree size={16} /> Changelog & Releases</h4>
                        <p>See what's new in v1.0.0</p>
                    </div>
                    <ArrowUpRight size={18} className="link-arrow" />
                </a>
            </div>

            {/* Footer / Credits Card */}
            <div className="about-footer-card">
                <div className="footer-section">
                    <h4>LINKS</h4>
                    <div className="social-links">
                        <a href="https://github.com/ADET-AI-Assistant/Vibeo" target="_blank" rel="noopener noreferrer" className="social-icon" title="GitHub">
                            <Github size={18} />
                        </a>
                    </div>
                </div>

                <div className="footer-section credits-section">
                    <h4>CREDITS</h4>
                    <p className="credits-label">Created & Developed by</p>
                    <ul className="credits-list">
                        <li>Daven Austhine Sumagang</li>
                        <li>James Christopher Tagupa</li>
                        <li>John Andre B. Gomez</li>
                        <li>John Lemar Gonzales <span className="dev-handle">@CyberSphinxxx</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AboutSection;
