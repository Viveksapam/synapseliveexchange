import React from 'react';
import PropTypes from 'prop-types';
import CommentThread from './CommentThread';

const PostDetailComments = ({
  post, boolIsLoggedIn, boolIsAdmin, commentForm, replyState, onAnalyzeComment, loadingComments,
  onAnalyzeAllComments, boolIsAnalyzingComments,
}) => {
  const {
    strNewCommentState, setStrNewCommentState,
    boolIsSubmittingState, onCommentSubmit,
  } = commentForm;

  const arrComments = post.comments || [];

  return (
    <div className="verisphere-comments-section" style={{ marginTop: '1.5rem' }}>
      {arrComments.length === 0 ? (
        <p className="verisphere-empty-comments">No arguments presented yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {arrComments.map((objComment) => (
            <CommentThread
              key={objComment.id}
              comment={objComment}
              level={0}
              handleAnalyzeComment={onAnalyzeComment}
              loadingCommentsState={loadingComments}
              boolIsAdmin={boolIsAdmin}
              {...replyState}
            />
          ))}
        </div>
      )}

      {boolIsAdmin && arrComments.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            onClick={onAnalyzeAllComments}
            disabled={boolIsAnalyzingComments}
            className="verisphere-btn-primary"
            style={{
              fontSize: '0.85rem', padding: '6px 10px', background: 'rgba(79, 163, 255, 0.1)',
              color: boolIsAnalyzingComments ? 'var(--v2-text-muted)' : 'var(--v2-accent-secondary)',
              border: `1.5px solid ${boolIsAnalyzingComments ? 'var(--glass-border)' : 'var(--v2-accent-secondary)'}`,
              borderRadius: '6px', cursor: boolIsAnalyzingComments ? 'not-allowed' : 'pointer',
              opacity: boolIsAnalyzingComments ? 0.6 : 1,
            }}
          >
            {boolIsAnalyzingComments ? '⊙ Analyzing comments...' : 'Analyze All Comments'}
          </button>
        </div>
      )}

      <div className="verisphere-add-comment">
        <form onSubmit={onCommentSubmit} className="verisphere-comment-form">
          <textarea
            placeholder="Disagree and support with grace."
            value={strNewCommentState}
            onChange={(e) => setStrNewCommentState(e.target.value)}
            onFocus={() => !boolIsLoggedIn && window.dispatchEvent(new CustomEvent('open-login'))}
            required
            className="verisphere-textarea"
          />
          <div className="verisphere-form-actions">
            {boolIsLoggedIn && (
              <button
                type="submit"
                disabled={boolIsSubmittingState}
                className="verisphere-btn-outline"
                style={{
                  background: 'rgba(128, 128, 128, 0.15)', color: 'var(--v2-text-main)',
                  borderColor: 'var(--glass-border)', padding: '8px 20px', fontSize: '0.9rem', marginLeft: '16px',
                }}
              >
                {boolIsSubmittingState ? 'Submitting...' : 'Submit Argument'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

PostDetailComments.propTypes = {
  post: PropTypes.object.isRequired,
  boolIsLoggedIn: PropTypes.bool.isRequired,
  boolIsAdmin: PropTypes.bool,
  commentForm: PropTypes.object.isRequired,
  replyState: PropTypes.object.isRequired,
  onAnalyzeComment: PropTypes.func.isRequired,
  loadingComments: PropTypes.object.isRequired,
  onAnalyzeAllComments: PropTypes.func,
  boolIsAnalyzingComments: PropTypes.bool,
};

export default PostDetailComments;
