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
            One accessible home for verifiable discussion, credentials and spatial learning — grounded in real research and real sources you can check.
          </p>
        </div>
        
        <div className="ath-divider-vertical"></div>
        
        <div className="ath-hero-meta-item">
          <span className="ath-meta-label">At A Glance</span>
          <p className="ath-meta-mono">04 LIVE APPS · WCAG 2.1 AA</p>
        </div>
      </div>
    </section>
  );
};

HomeHero.propTypes = {
  boolAnimationsReadyState: PropTypes.bool.isRequired
};

export default HomeHero;
