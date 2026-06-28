import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ShopPage from './components/ShopPage';
import CredentialsPage from './components/CredentialsPage';
import AssessmentHub from './components/AssessmentHub';
import ContactModal from './components/ContactModal';
import AuthModal from './components/AuthModal';
import CheckoutPage from './pages/CheckoutPage';
import ScrollToTop from './components/ScrollToTop';
import SEO from './components/SEO';
import VeriSphereApp from './verisphere/VeriSphereApp';
import SLEApp from './pages/SLE/SLEApp';
import ThemeLayer from './components/ThemeLayer';
import { fetchSiteSettings } from './api/coreApi';
import { useAuth } from './hooks/useAuth';
import { usePageContext } from './hooks/usePageContext';
import Home from './pages/Home/Home';
import PageErrorBoundary from './errors/PageErrorBoundary';
import './App.css';

/**
 * App component functions as the root layout shell for the React application.
 * It mounts all the modular sections and handles routing.
 */
function App() {
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const authHook = useAuth();
  const pageContext = usePageContext();

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSiteSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  return (
    <div className="app-shell">
      {/* Global seasonal theme engine — particles, CSS vars, ambient overlays */}
      <ThemeLayer />

      <SEO />
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <PageErrorBoundary>
              <Home 
                onOpenContact={() => setContactModalOpen(true)} 
                onOpenLogin={() => setAuthModalOpen(true)}
                authHook={authHook}
                settings={settings}
              />
            </PageErrorBoundary>
          }
        />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/credentials" element={<CredentialsPage />} />
        <Route path="/assessment" element={<AssessmentHub />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/verisphere/*" element={<VeriSphereApp onOpenLogin={() => setAuthModalOpen(true)} authHook={authHook} />} />
        <Route path="/sle/*" element={<SLEApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setContactModalOpen(false)} 
        settings={settings}
      />

      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setAuthModalOpen(false)} 
          useAuthHook={authHook} 
        />
      )}
    </div>
  );
}

export default App;
