import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const SAMPLE_IMAGES = [
  "/blog-images/trust-digital-discourse.svg",
  "/blog-images/verifiability-design.svg",
  "/blog-images/verifiable-discourse.svg",
  "/blog-images/algorithmic-curation.svg",
  "/blog-images/credential-portability.svg",
  "/blog-images/source-attachment.svg"
];

const ContributionsSection = ({ arrBlogsState }) => {
  const navigate = useNavigate();

  const renderCard = (post, idx, keyPrefix) => {
    const category = post.strThemeColor === '#10b981' ? 'Ethics' : 'Discovery';
    const readTime  = post.strThemeColor === '#10b981' ? '08' : '12';
    const num       = String(idx + 1).padStart(2, '0');
    return (
      <div
        key={`${keyPrefix}-${idx}`}
        className="ath-blog-card"
        onClick={() => navigate(`/verisphere/post/blog_${post.id}`)}
      >
        <div className="ath-blog-img-wrapper">
          <img
            src={post.strMediaUrl || SAMPLE_IMAGES[idx % SAMPLE_IMAGES.length]}
            alt={post.strTitle}
            className="ath-blog-img"
          />
          <span className="ath-blog-card-num">{num}</span>
        </div>
        <span className="ath-blog-category">{category} // {readTime} Min Read</span>
        <h3 className="ath-blog-title">{post.strTitle}</h3>
        <p className="ath-blog-summary">{post.strSummary}</p>
      </div>
    );
  };

  return (
    <section className="ath-blog-section ath-reveal" id="blog">
      <div className="ath-blog-container">

        {/* Section header */}
        <div className="ath-blog-header">
          <h2 className="ath-section-title">Recent Contributions</h2>
          <p className="ath-blog-desc">Selected writing from Verisphere community</p>
        </div>

        <div className="ath-blog-divider" />

        {/* Cards */}
        <div className="ath-blog-grid-static">
          {arrBlogsState.slice(0, 3).map((post, idx) => renderCard(post, idx, 'static'))}
        </div>

        {/* Footer bar */}
        <div className="ath-blog-footer-bar">
          <span className="ath-blog-footer-count">featured articles</span>
          <a
            className="ath-blog-footer-link"
            onClick={() => navigate('/verisphere')}
            style={{ cursor: 'pointer' }}
          >
            View all in Verisphere
            <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginLeft: '4px' }}>arrow_forward</span>
          </a>
        </div>

      </div>
    </section>
  );
};

ContributionsSection.propTypes = {
  arrBlogsState: PropTypes.array.isRequired
};

export default ContributionsSection;
