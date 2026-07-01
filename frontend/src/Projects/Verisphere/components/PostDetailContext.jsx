import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const PostDetailContext = ({ strAiContextGuardrail, post, onAnalyze, boolIsAnalyzing }) => {
  const [boolIsMobileState, setBoolIsMobileState] = useState(window.innerWidth < 768);
  const [boolIsPostAnalysisExpandedState, setBoolIsPostAnalysisExpandedState] = useState(false);

  useEffect(() => {
    const handleResize = () => setBoolIsMobileState(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const boolHasPostAnalysis = post?.ai_summary;

  return (
    <div className="verisphere-context-guardrail" style={{ marginTop: '2rem' }}>
      {boolHasPostAnalysis && (
        <div className="verisphere-ai-box" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: '8px', backgroundColor: 'var(--glass-bg)' }}>
          <button
            onClick={() => setBoolIsPostAnalysisExpandedState(!boolIsPostAnalysisExpandedState)}
            style={{
              background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0, marginBottom: boolIsPostAnalysisExpandedState ? '0.8rem' : 0,
            }}
          >
            <h4 style={{ margin: 0, color: 'var(--v2-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📋</span> Post Analysis
            </h4>
            <span style={{ fontSize: '1.2rem', color: 'var(--v2-text-muted)' }}>
              {boolIsPostAnalysisExpandedState ? '▼' : '▶'}
            </span>
          </button>
          {!boolIsPostAnalysisExpandedState && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--v2-text-muted)' }}>
              {post.ai_summary?.substring(0, 80)}...
            </p>
          )}
          {boolIsPostAnalysisExpandedState && (
            <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0.3rem 0', fontSize: '0.85rem', color: 'var(--v2-text-muted)', fontWeight: '500' }}>AI Assessment</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--v2-text-main)', lineHeight: '1.5' }}>{post.ai_summary}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--v2-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Logical Soundness</span>
                  <span style={{ color: 'var(--v2-text-main)', fontWeight: 'bold', fontSize: '1rem' }}>
                    {(post.logical_soundness * 100).toFixed(0)}/100
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--v2-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Verifiable</span>
                  <span style={{ color: 'var(--v2-text-main)', fontWeight: 'bold', fontSize: '1rem', textTransform: 'capitalize' }}>
                    {post.verifiable}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="verisphere-ai-box" style={{ padding: '1.5rem 0', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.8rem', flexWrap: 'wrap' }}>
          <h4 style={{ margin: 0, color: 'var(--v2-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="icon" style={{ fontSize: '1.2rem' }}>🛡️</span> Context Guardrails
          </h4>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button className="verisphere-btn-outline" style={{ fontSize: '0.85rem', padding: '6px 10px' }}>Set Context</button>
            <button
              onClick={onAnalyze}
              disabled={boolIsAnalyzing}
              className="verisphere-btn-primary"
              style={{
                fontSize: '0.85rem', padding: '6px 10px', background: 'rgba(79, 163, 255, 0.1)',
                color: boolIsAnalyzing ? 'var(--v2-text-muted)' : 'var(--v2-accent-secondary)',
                border: `1.5px solid ${boolIsAnalyzing ? 'var(--glass-border)' : 'var(--v2-accent-secondary)'}`,
                borderRadius: '6px', cursor: boolIsAnalyzing ? 'not-allowed' : 'pointer',
                opacity: boolIsAnalyzing ? 0.6 : 1,
              }}
            >
              {boolIsAnalyzing ? '⊙ Analyzing...' : 'Analyze Post & Discussion'}
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
  post: PropTypes.object,
  onAnalyze: PropTypes.func,
  boolIsAnalyzing: PropTypes.bool,
};

export default PostDetailContext;
