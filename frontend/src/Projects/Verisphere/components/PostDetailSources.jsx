import React from 'react';
import PropTypes from 'prop-types';

const PostDetailSources = ({ post, sourceForm, onSourceSubmit, onToggleAdd }) => {
  const {
    boolIsAddingSourceState, strNewSourceUrlState, setStrNewSourceUrlState,
    strNewSourceDescState, setStrNewSourceDescState, boolIsSubmittingSourceState,
  } = sourceForm;

  const arrSources = post.sources || [];

  return (
    <div className="verisphere-community-sources" style={{
      marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem 0',
      borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: 'var(--v2-text-main)' }}>
          Community Sources
        </h4>
        <button onClick={onToggleAdd} className="verisphere-btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
          {boolIsAddingSourceState ? 'Cancel' : '+ Suggest Source'}
        </button>
      </div>

      {boolIsAddingSourceState && (
        <form onSubmit={onSourceSubmit} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--glass-bg)', borderRadius: '6px' }}>
          <input
            type="url"
            placeholder="https://..."
            value={strNewSourceUrlState}
            onChange={(e) => setStrNewSourceUrlState(e.target.value)}
            required
            className="verisphere-textarea"
            style={{ height: 'auto', padding: '8px', fontSize: '0.85rem', marginBottom: '0.5rem' }}
          />
          <textarea
            placeholder="Briefly describe what this source proves or refutes..."
            value={strNewSourceDescState}
            onChange={(e) => setStrNewSourceDescState(e.target.value)}
            className="verisphere-textarea"
            style={{ height: '60px', fontSize: '0.85rem', marginBottom: '0.5rem' }}
          />
          <button type="submit" disabled={boolIsSubmittingSourceState} className="verisphere-btn-outline" style={{ padding: '6px 16px', fontSize: '0.85rem', background: 'rgba(128, 128, 128, 0.15)', color: 'var(--v2-text-main)', borderColor: 'var(--glass-border)' }}>
            {boolIsSubmittingSourceState ? 'Submitting...' : 'Submit Source'}
          </button>
        </form>
      )}

      {arrSources.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {arrSources.map((objSource) => (
            <div key={objSource.id} style={{ padding: '0.8rem', backgroundColor: 'var(--glass-bg)', borderRadius: '6px', borderLeft: '3px solid #58a6ff' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{objSource.strDescription}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--v2-text-muted)' }}>
                <a href={objSource.strUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#58a6ff', textDecoration: 'none', wordBreak: 'break-all' }}>
                  🔗 {objSource.strUrl.length > 50 ? objSource.strUrl.substring(0, 50) + '...' : objSource.strUrl}
                </a>
                <span>Added by {objSource.strAuthorUsername || 'user_' + objSource.objAuthor}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '0.85rem', color: 'var(--v2-text-muted)', fontStyle: 'italic', margin: 0 }}>No community sources submitted yet.</p>
      )}
    </div>
  );
};

PostDetailSources.propTypes = {
  post: PropTypes.object.isRequired,
  sourceForm: PropTypes.object.isRequired,
  onSourceSubmit: PropTypes.func.isRequired,
  onToggleAdd: PropTypes.func.isRequired,
};

export default PostDetailSources;
