import React from 'react';
import PropTypes from 'prop-types';

const HomeHero = ({ boolAnimationsReadyState }) => {
  return (
    <section className="ath-hero" id="home">
      <p className={`ath-hero-volume ${boolAnimationsReadyState ? 'ath-fade-in-up' : 'ath-pre-animate'}`}> RELEASE .v4.02 — Scholarly Home</p>
      <h1 className={`ath-hero-title ${boolAnimationsReadyState ? 'ath-fade-in-up' : 'ath-pre-animate'}`}>
        Designing virtual spaces for accessibility and shared discovery.
      </h1>
      
      <div className={`ath-hero-meta ${boolAnimationsReadyState ? 'ath-fade-in-up' : 'ath-pre-animate'}`}>
        <div className="ath-hero-meta-item">
          <span className="ath-meta-label">Primary Objective</span>
          <p className="ath-meta-desc">
            To synthesize physical architectural principles with the fluid dynamics of digital scholarly environments.
          </p>
        </div>
        
        <div className="ath-divider-vertical"></div>
        
        <div className="ath-hero-meta-item">
          <span className="ath-meta-label">Protocol Status</span>
          <p className="ath-meta-mono">ACTIVE_STREAM_V4.02</p>
        </div>
      </div>
    </section>
  );
};

HomeHero.propTypes = {
  boolAnimationsReadyState: PropTypes.bool.isRequired
};

export default HomeHero;
