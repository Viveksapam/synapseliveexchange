import React from 'react';
import PropTypes from 'prop-types';

const reasoningBox = (strBg) => ({ background: strBg, padding: '0.6rem 0.8rem', borderRadius: '6px' });
const labelStyle = { fontSize: '0.7rem', color: 'var(--v2-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '1px' };

const CommentBody = ({ comment, loadingCommentsState, onAnalyze, onStartReply, onDelete }) => {
  const objMetrics = comment.dictAiMetrics;
  const arrFallacies = objMetrics?.logical_errors || [];

  return (
    <>
      {arrFallacies.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {arrFallacies.map((strErr, numIdx) => (
            <span key={numIdx} style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', color: '#ff7b72', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', border: '1px solid rgba(248,81,73,0.3)' }}>
              ⚠️ {strErr}
            </span>
          ))}
        </div>
      )}

      <p className="verisphere-comment-text" style={{ fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--v2-text-main)', marginBottom: '0.6rem', marginTop: 0 }}>
        {comment.strContent}
      </p>

      <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '0.8rem' }}>
        {comment.strAnalysisReasoning && (
          <div className="verisphere-reasoning-box" style={reasoningBox('rgba(0,0,0,0.03)')}>
            <strong style={labelStyle}>🧠 Logical Foundation</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--v2-text-main)' }}>{comment.strAnalysisReasoning}</p>
          </div>
        )}
        {comment.strReferences && (
          <div className="verisphere-reasoning-box" style={reasoningBox('rgba(46, 160, 67, 0.05)')}>
            <strong style={labelStyle}>📚 Citations</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--v2-text-main)' }}>{comment.strReferences}</p>
          </div>
        )}
        {comment.strAiAnalysis && (
          <div className="verisphere-ai-box comment-ai" style={reasoningBox('rgba(88, 166, 255, 0.05)')}>
            <strong style={labelStyle}>Analysis</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--v2-text-main)' }}>{comment.strAiAnalysis}</p>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
          {!comment.strAiAnalysis && (
            <button
              onClick={() => onAnalyze(comment.id)}
              disabled={loadingCommentsState[comment.id]}
              className="verisphere-btn-outline small"
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px' }}
            >
              {loadingCommentsState[comment.id] ? 'Analyzing...' : 'Request Analysis'}
            </button>
          )}
          <button
            className="verisphere-btn-outline"
            onClick={() => onStartReply(comment.id)}
            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px', border: 'none', background: 'transparent', color: 'var(--v2-text-muted)' }}
          >
            + Reply
          </button>
          {onDelete && (
            <button
              className="verisphere-btn-outline"
              onClick={() => onDelete(comment.id)}
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px', border: 'none', background: 'transparent', color: 'var(--v2-text-muted)' }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
};

CommentBody.propTypes = {
  comment: PropTypes.object.isRequired,
  loadingCommentsState: PropTypes.object.isRequired,
  onAnalyze: PropTypes.func.isRequired,
  onStartReply: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};

export default CommentBody;
