import React from 'react'

export default function Footer({ children }) {
    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <span className="site-footer__logo">VibeReel</span>
                <p>
                    {children || (
                        <>
                            Powered by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a> &amp; <a href="https://videasy.net/" target="_blank" rel="noopener noreferrer">Videasy</a>
                        </>
                    )}
                </p>
                <p>© 2026 VibeReel</p>
            </div>
        </footer>
    )
}
