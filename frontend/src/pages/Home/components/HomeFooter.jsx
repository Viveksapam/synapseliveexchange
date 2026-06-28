import React from 'react';
import { Link } from 'react-router-dom';

const HomeFooter = () => {
  return (
    <footer className="ath-footer">
      <div className="ath-footer-nav">
        <div className="ath-footer-brand-box">
          <span className="ath-footer-brand">Synapse LE</span>
          <p className="ath-footer-copyright">
            © {new Date().getFullYear()} Synapse Editorial. Technical Rigor. Historical Weight.
          </p>
        </div>
        
        <div className="ath-footer-links">
          <a className="ath-footer-link" href="#home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Ethics Protocol
          </a>
          <Link className="ath-footer-link" to="/credentials">
            Assessments
          </Link>
          <Link className="ath-footer-link" to="/sle">
            Classroom Map
          </Link>
        </div>

        <div className="ath-footer-lang">
          <span className="material-symbols-outlined text-outline">language</span>
          <span className="text-on-surface font-bold">EN / SYS</span>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
