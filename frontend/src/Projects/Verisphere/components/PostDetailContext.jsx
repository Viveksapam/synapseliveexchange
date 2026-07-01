import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatAnalyzedAt } from '../utils/formatAnalyzedAt';

const SUB_SCORE_LABELS = {
  clarity_falsifiability: 'Clarity & Falsifiability',
  premise_support: 'Premise Support',
  inferential_validity: 'Inferential Validity',
  source_reliability: 'Source Reliability',
  fallacy_bias_freedom: 'Fallacy & Bias Freedom',
};

const scoreColor = (score) => {
  if (score <= 20) return '#ef4444';
  if (score <= 40) return '#f59e0b';
  if (score <= 60) return '#eab308';
  if (score <= 80) return '#84cc16';
  return '#22c55e';
};

const SubScoreBar = ({ label, score, rationale }) => (
  <div style={{ marginBottom: '0.7rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
      <span style={{ color: 'var(--v2-text-main)' }}>{label}</span>
      <span style={{ color: scoreColor(score), fontWeight: 'bold' }}>{score}/100</span>
    </div>
    <div style={{ height: '5px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(0, Math.min(100, score))}%`, height: '100%', background: scoreColor(score) }} />
    </div>
    {rationale && (
      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--v2-text-muted)', lineHeight: '1.4' }}>{rationale}</p>
    )}
  </div>
);

SubScoreBar.propTypes = {
  label: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  rationale: PropTypes.string,
};

const PostDetailContext = ({ strAiContextGuardrail, post, onAnalyze, boolIsAnalyzing, boolIsAdmin }) => {
  const [boolIsMobileState, setBoolIsMobileState] = useState(window.innerWidth < 768);
  const [boolIsPostAnalysisExpandedState, setBoolIsPostAnalysisExpandedState] = useState(false);

  useEffect(() => {
    const handleResize = () => setBoolIsMobileState(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const boolHasPostAnalysis = post?.ai_summary;
  const objDetail = post?.analysis_detail || null;
  const arrSubScores = objDetail?.sub_scores ? Object.entries(objDetail.sub_scores) : [];
  const arrFallacies = objDetail?.detected_fallacies || [];
  const strAnalyzedAt = formatAnalyzedAt(post?.analyzed_at);

  return (
    <div className="verisphere-context-guardrail" style={{ marginTop: '2rem' }}>
      {boolHasPostAnalysis && (
        <div className="verisphere-ai-box" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: '8px', backgroundColor: 'var(--glass-bg)' }}>
          <button
            onClick={() => setBoolIsPostAnalysisExpandedState(!boolIsPostAnalysisExpandedState)}
            style={{
              background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0, marginBottom: boolIsPostAnalysisExpandedState ? '0.8rem' : 0,
            }}
          >
            <span style={{ fontSize: '1.2rem', color: 'var(--v2-text-muted)', minWidth: '1.2rem' }}>
              {boolIsPostAnalysisExpandedState ? '▼' : '▶'}
            </span>
            <h4 style={{ margin: 0, color: 'var(--v2-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📋</span> Post Analysis
            </h4>
          </button>
          {!boolIsPostAnalysisExpandedState && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--v2-text-muted)' }}>
              {post.ai_summary?.substring(0, 80)}...
            </p>
          )}
          {boolIsPostAnalysisExpandedState && (
            <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)' }}>
              {strAnalyzedAt && (
                <p style={{ margin: '0 0 0.8rem', fontSize: '0.75rem', color: 'var(--v2-text-muted)' }}>
                  Analyzed {strAnalyzedAt}
                </p>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0.3rem 0', fontSize: '0.85rem', color: 'var(--v2-text-muted)', fontWeight: '500' }}>AI Assessment</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--v2-text-main)', lineHeight: '1.5' }}>{post.ai_summary}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: arrSubScores.length ? '1.2rem' : 0 }}>
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

              {arrSubScores.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <p style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', color: 'var(--v2-text-muted)', fontWeight: '500' }}>Rubric Breakdown</p>
                  {arrSubScores.map(([strKey, objVal]) => (
                    <SubScoreBar
                      key={strKey}
                      label={SUB_SCORE_LABELS[strKey] || strKey}
                      score={Number(objVal?.score) || 0}
                      rationale={objVal?.rationale}
                    />
                  ))}
                </div>
              )}

              {arrFallacies.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--v2-text-muted)', fontWeight: '500' }}>Detected Fallacies</p>
                  {arrFallacies.map((objF, numIdx) => (
                    <div key={numIdx} style={{ marginBottom: '0.6rem', paddingLeft: '0.6rem', borderLeft: '2px solid #ef4444' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--v2-text-main)', fontWeight: '600' }}>{objF.name}</p>
                      {objF.quote && (
                        <p style={{ margin: '0.2rem 0', fontSize: '0.78rem', color: 'var(--v2-text-muted)', fontStyle: 'italic' }}>{objF.quote}</p>
                      )}
                      {objF.explanation && (
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--v2-text-muted)', lineHeight: '1.4' }}>{objF.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {objDetail?.steelman && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.3rem', fontSize: '0.85rem', color: 'var(--v2-text-muted)', fontWeight: '500' }}>Steelman</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--v2-text-main)', lineHeight: '1.5' }}>{objDetail.steelman}</p>
                </div>
              )}

              {objDetail?.verification_pathway && (
                <div>
                  <p style={{ margin: '0 0 0.3rem', fontSize: '0.85rem', color: 'var(--v2-text-muted)', fontWeight: '500' }}>Verification Pathway</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--v2-text-main)', lineHeight: '1.5' }}>{objDetail.verification_pathway}</p>
                </div>
              )}
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
            {boolIsAdmin && (
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
            )}
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
  boolIsAdmin: PropTypes.bool,
};

export default PostDetailContext;
