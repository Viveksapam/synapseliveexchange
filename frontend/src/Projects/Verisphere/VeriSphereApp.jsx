import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import CommunityPage from './pages/CommunityPage';
import PostDetailPage from './pages/PostDetailPage';
import ProfilePage from './pages/ProfilePage';
import './styles/VeriSphere.css';
import './styles/VeriSphereLayout.css';
import SEO from '../../components/SEO';

function VeriSphereApp({ onOpenLogin, authHook }) {
  const { boolIsLoggedInState, handleLogout } = authHook || { boolIsLoggedInState: false, handleLogout: () => {} };
  const location = useLocation();
  const scrollRef = useRef(null);

  // Default to dark mode for welcome screen, light mode for feed
  const isWelcomeScreen = location.pathname === '/verisphere' || location.pathname === '/verisphere/' || location.pathname === '/';
  const [isLightMode, setIsLightMode] = useState(!isWelcomeScreen);
  const [boolIsMobileMenuOpenState, setBoolIsMobileMenuOpen] = useState(false);

  // Update theme automatically when navigating between pages
  useEffect(() => {
    const isWelcome = location.pathname === '/verisphere' || location.pathname === '/verisphere/' || location.pathname === '/';
    const isFeed = location.pathname.includes('/feed');
    
    if (isWelcome) {
      setIsLightMode(false);
    } else if (isFeed) {
      setIsLightMode(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.add('v2-active');
    if (isLightMode) {
      document.body.classList.add('v2-light-mode');
    } else {
      document.body.classList.remove('v2-light-mode');
    }

    return () => {
      document.body.classList.remove('v2-active');
      document.body.classList.remove('v2-light-mode');
    };
  }, [isLightMode]);

  useEffect(() => {
    const handleOpenLogin = () => {
      if (onOpenLogin) onOpenLogin();
    };

    window.addEventListener('open-login', handleOpenLogin);
    return () => window.removeEventListener('open-login', handleOpenLogin);
  }, [onOpenLogin]);

  return (
    <div className="v2-wrapper">
      <SEO title="VeriSphere" icon="/verisphere.svg" />
      {/* Scrollable Content Overlay from V2 */}
      <div className="v2-content-scroll" key={location.pathname} ref={scrollRef}>
        
        {/* Navigation redesigned using V2 styles */}
        <nav className="v2-nav">
          <Link to="/verisphere/feed" className="v2-logo" style={{
              textDecoration: 'none',
              color: 'var(--v2-text-main)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.25rem',
              letterSpacing: '0.05em'
          }}>
            <span style={{ fontWeight: '600' }}>VERI</span>
            <span style={{ fontWeight: '300', opacity: 0.7 }}>SPHERE</span>
          </Link>
          <div className="v2-nav-links hidden-mobile" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
                onClick={() => setIsLightMode(!isLightMode)}
                className="v2-nav-btn secondary"
                style={{ padding: '8px', borderRadius: '50%', minWidth: 'auto', display: 'flex' }}
                title="Toggle Theme"
            >
                {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link to="/" className="v2-nav-btn secondary">Main Site</Link>
            {boolIsLoggedInState && (
                <Link to="/verisphere/profile" className="v2-nav-btn secondary">Profile</Link>
            )}
            {!boolIsLoggedInState ? (
                <button onClick={onOpenLogin} className="v2-nav-btn secondary" style={{ cursor: 'pointer' }}>Log In</button>
            ) : (
                <button onClick={handleLogout} className="v2-nav-btn secondary" style={{ cursor: 'pointer' }}>Log Out</button>
            )}
          </div>
          <div className="hidden-desktop" style={{ gap: '16px', alignItems: 'center' }}>
            <button
                onClick={() => setIsLightMode(!isLightMode)}
                className="v2-nav-btn secondary"
                style={{ padding: '8px', borderRadius: '50%', minWidth: 'auto', display: 'flex' }}
                title="Toggle Theme"
            >
                {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              className="ath-hamburger-menu"
              onClick={() => setBoolIsMobileMenuOpen(!boolIsMobileMenuOpenState)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>

        {/* Mobile Menu for Verisphere */}
        {boolIsMobileMenuOpenState && (
          <div className="v2-mobile-menu">
            <Link
              to="/"
              className="v2-mobile-menu-link"
              onClick={() => setBoolIsMobileMenuOpen(false)}
            >
              Main Site
            </Link>
            {boolIsLoggedInState && (
              <Link
                to="/verisphere/profile"
                className="v2-mobile-menu-link"
                onClick={() => setBoolIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
            )}
            <div className="ath-mobile-menu-divider"></div>
            {!boolIsLoggedInState ? (
              <button
                onClick={() => {
                  onOpenLogin();
                  setBoolIsMobileMenuOpen(false);
                }}
                className="v2-mobile-menu-link"
              >
                Log In
              </button>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setBoolIsMobileMenuOpen(false);
                }}
                className="v2-mobile-menu-link"
              >
                Log Out
              </button>
            )}
          </div>
        )}

        {/* The actual VeriSphere content routes */}
        <main className="verisphere-main" style={{ paddingTop: '100px', minHeight: 'calc(100vh - 100px)' }}>
          <Routes>
            <Route index element={<WelcomePage />} />
            <Route path="feed" element={<HomePage authHook={authHook} />} />
            <Route path="community/:id" element={<CommunityPage authHook={authHook} />} />
            <Route path="post/:id" element={<PostDetailPage authHook={authHook} />} />
            <Route path="profile" element={<ProfilePage authHook={authHook} />} />
          </Routes>
        </main>
        
        {/* Footer from V2 */}
        <footer className="v2-footer">
          <div className="v2-copyright">
            &copy; {new Date().getFullYear()} Synapse Nexus. All rights reserved.
          </div>
        </footer>

      </div>
    </div>
  );
}

export default VeriSphereApp;
