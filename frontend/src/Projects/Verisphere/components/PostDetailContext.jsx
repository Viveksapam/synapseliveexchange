import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const PostDetailContext = ({ strAiContextGuardrail }) => {
  const [boolIsMobileState, setBoolIsMobileState] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setBoolIsMobileState(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
  <div className="verisphere-context-guardrail" style={{ marginTop: '2rem' }}>
    <div className="verisphere-ai-box" style={{ padding: '1.5rem 0', borderTop: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.8rem', flexWrap: 'wrap' }}>
        <h4 style={{ margin: 0, color: 'var(--v2-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="icon" style={{ fontSize: '1.2rem' }}>🛡️</span> Context Guardrails
        </h4>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button className="verisphere-btn-outline" style={{ fontSize: '0.85rem', padding: '6px 10px' }}>Discuss Contexts</button>
          <button className="verisphere-btn-primary" style={{ fontSize: '0.85rem', padding: '6px 10px', background: 'rgba(79, 163, 255, 0.1)', color: 'var(--v2-accent-secondary)', border: '1.5px solid var(--v2-accent-secondary)', borderRadius: '6px' }}>
            Analyse
          </button>
        </div>
      </div>
      <p style={{ color: 'var(--v2-text-main)', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>
        {strAiContextGuardrail || 'This discussion operates within objectively verified context parameters. Factual baseline and historical precedents are being actively monitored to prevent conversational drift and fallacious premises.'}
      </p>
    </div>
  </div>
  );
};

PostDetailContext.propTypes = {
  strAiContextGuardrail: PropTypes.string,
};

export default PostDetailContext;
