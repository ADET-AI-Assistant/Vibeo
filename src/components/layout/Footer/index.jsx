import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './styles.css';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const Footer = () => {
    const navigate = useNavigate();

    const handleLetterClick = (letter) => {
        navigate(`/az-list?letter=${letter}`);
    };

    return (
        <footer className="site-footer">
            <div className="site-footer__inner">

                {/* ── Top row: logo + socials ── */}
                <div className="footer-top">
                    <button className="footer-logo" onClick={() => navigate('/')} aria-label="Vibeo Home">
                        <img src="/vibeo.png" alt="Vibeo" className="footer-logo__img" />
                        <span className="footer-logo__text">
                            <span className="footer-logo__vibe">VIBE</span>
                            <span className="footer-logo__o">O</span>
                        </span>
                    </button>

                    <span className="footer-divider" />

                    <div className="footer-socials">
                        {/* GitHub */}
                        <a href="https://github.com/ADET-AI-Assistant/Vibeo" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="GitHub">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                        </a>
                        {/* Globe / Website */}
                        <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="TMDB">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* ── A-Z Browse ── */}
                <div className="footer-az">
                    <div className="footer-az__header">
                        <h3 className="footer-az__title">A-Z LIST</h3>
                        <span className="footer-az__desc">Searching movie order by alphabet name A to Z.</span>
                    </div>
                    <div className="footer-az__grid">
                        <button className="footer-az__btn" onClick={() => handleLetterClick('all')}>All</button>
                        <button className="footer-az__btn" onClick={() => handleLetterClick('#')}>#</button>
                        <button className="footer-az__btn" onClick={() => handleLetterClick('0-9')}>0-9</button>
                        {ALPHABET.map(letter => (
                            <button key={letter} className="footer-az__btn" onClick={() => handleLetterClick(letter)}>
                                {letter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Links row ── */}
                <div className="footer-links">
                    <Link to="/terms">Terms of Service</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/cookies">Cookie Preferences</Link>
                    <Link to="/docs">Developer Docs</Link>
                    <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>
                </div>

                {/* ── Disclaimer + Copyright ── */}
                <div className="footer-bottom">
                    <p className="footer-disclaimer">
                        Vibeo does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
                    </p>
                    <p className="footer-copyright">© {new Date().getFullYear()} vibeo. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
