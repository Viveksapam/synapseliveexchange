import React from 'react';
import PropTypes from 'prop-types';

const HomeHero = ({ boolAnimationsReadyState }) => {
  return (
    <section className="ath-hero" id="home">
      <p className={`ath-hero-volume ${boolAnimationsReadyState ? 'ath-fade-in-up' : 'ath-pre-animate'}`}> SYNAPSE LIVE EXCHANGE — V4.02</p>
      <h1 className={`ath-hero-title ${boolAnimationsReadyState ? 'ath-fade-in-up' : 'ath-pre-animate'}`}>
        Designing virtual spaces for accessibility and shared discovery.
      </h1>
      
      <div className={`ath-hero-meta ${boolAnimationsReadyState ? 'ath-fade-in-up' : 'ath-pre-animate'}`}>
        <div className="ath-hero-meta-item">
          <span className="ath-meta-label">What It's For</span>
          <p className="ath-meta-desc">
            One accessible home for verifiable discussion, credentials and learning — grounded in research and sources you can audit.
          </p>
        </div>
        
        <div className="ath-divider-vertical"></div>

        <div className="ath-hero-meta-item">
          <a
            href="#footer"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('.ath-footer')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="ath-hero-cta-link"
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', fontSize: '1.1rem', fontWeight: '600', letterSpacing: '0.05em', cursor: 'pointer' }}
          >
            Get in Touch →
          </a>
        </div>
      </div>
    </section>
  );
};

HomeHero.propTypes = {
  boolAnimationsReadyState: PropTypes.bool.isRequired
};

export default HomeHero;
