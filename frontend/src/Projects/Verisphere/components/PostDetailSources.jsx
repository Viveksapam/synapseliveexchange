import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SourceReviewTable from './SourceReviewTable';

const ROLE_LABELS = { admin: 'Admin', moderator: 'Moderator', ai: 'AI' };

const PostDetailSources = ({ postId, post, sourceForm, onSourceSubmit, onToggleAdd, boolIsAdmin, strToken, onSourceApproved }) => {
  const {
    boolIsAddingSourceState, strNewSourceTitleState, setStrNewSourceTitleState,
    strNewSourceUrlState, setStrNewSourceUrlState,
    strNewSourceDescState, setStrNewSourceDescState, boolIsSubmittingSourceState,
  } = sourceForm;

  const [boolShowReviewState, setBoolShowReviewState] = useState(false);
  const [boolIsCollapsedState, setBoolIsCollapsedState] = useState(false);

  const arrSources = post.sources || [];

  return (
    <div className="verisphere-community-sources" style={{
      marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem 0',
      borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: boolIsCollapsedState ? 0 : '1rem', gap: '0.8rem' }}>
        <button
          type="button"
          onClick={() => setBoolIsCollapsedState(!boolIsCollapsedState)}
          aria-expanded={!boolIsCollapsedState}
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, textAlign: 'left' }}
        >
          <span style={{ fontSize: '0.9rem', color: 'var(--v2-text-muted)', minWidth: '0.9rem' }}>
            {boolIsCollapsedState ? '▶' : '▼'}
          </span>
          <h4 style={{ margin: 0, color: 'var(--v2-text-main)' }}>
            Community Sources
          </h4>
          {arrSources.length > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--v2-text-muted)' }}>({arrSources.length})</span>
          )}
        </button>
        {!boolIsCollapsedState && (
          <button onClick={onToggleAdd} className="verisphere-btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
            {boolIsAddingSourceState ? 'Cancel' : '+ Suggest Source'}
          </button>
        )}
      </div>

      {!boolIsCollapsedState && (<>
      {boolIsAddingSourceState && (
        <form onSubmit={onSourceSubmit} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--glass-bg)', borderRadius: '6px' }}>
          <input
            type="text"
            placeholder="Article name"
            value={strNewSourceTitleState}
            onChange={(e) => setStrNewSourceTitleState(e.target.value)}
            required
            className="verisphere-textarea"
            style={{ height: 'auto', padding: '8px', fontSize: '0.85rem', marginBottom: '0.5rem' }}
          />
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
          <p style={{ fontSize: '0.75rem', color: 'var(--v2-text-muted)', margin: '0.5rem 0 0' }}>
            Submitted sources are reviewed before appearing in the list below.
          </p>
        </form>
      )}

      {arrSources.length > 0 ? (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {arrSources.map((objSource) => (
            <li key={objSource.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <a href={objSource.strUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--v2-text-main)', textDecoration: 'none' }}>
                {objSource.strTitle}
              </a>
              {objSource.approved_by && objSource.approver_name && (
                <span style={{ fontSize: '0.7rem', color: 'var(--v2-text-muted)' }}>
                  Approved by {objSource.approver_name}
                  {ROLE_LABELS[objSource.approved_by] && (
                    <span style={{ marginLeft: '0.3rem', padding: '1px 5px', borderRadius: '3px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                      {ROLE_LABELS[objSource.approved_by]}
                    </span>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '0.85rem', color: 'var(--v2-text-muted)', fontStyle: 'italic', margin: 0 }}>No community sources submitted yet.</p>
      )}

      <button
        onClick={() => setBoolShowReviewState(!boolShowReviewState)}
        className="verisphere-btn-outline"
        style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: '0.75rem', border: 'none', background: 'transparent', color: 'var(--v2-text-muted)' }}
      >
        {boolShowReviewState ? '- Hide In Review' : '+ In Review'}
      </button>

      {boolShowReviewState && (
        <div style={{ marginTop: '0.75rem' }}>
          <SourceReviewTable postId={postId} boolIsAdmin={boolIsAdmin} strToken={strToken} onApproved={onSourceApproved} />
        </div>
      )}
      </>)}
    </div>
  );
};

PostDetailSources.propTypes = {
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  post: PropTypes.object.isRequired,
  sourceForm: PropTypes.object.isRequired,
  onSourceSubmit: PropTypes.func.isRequired,
  onToggleAdd: PropTypes.func.isRequired,
  boolIsAdmin: PropTypes.bool,
  strToken: PropTypes.string,
  onSourceApproved: PropTypes.func,
};

export default PostDetailSources;
