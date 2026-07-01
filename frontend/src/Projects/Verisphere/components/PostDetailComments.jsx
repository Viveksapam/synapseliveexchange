import React from 'react';
import PropTypes from 'prop-types';
import CommentThread from './CommentThread';
import { getScoreColor } from './PostDetailHeader';

const PostDetailComments = ({ post, boolIsLoggedIn, commentForm, replyState, onAnalyzeComment, loadingComments }) => {
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
              getScoreColor={getScoreColor}
              {...replyState}
            />
          ))}
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
  commentForm: PropTypes.object.isRequired,
  replyState: PropTypes.object.isRequired,
  onAnalyzeComment: PropTypes.func.isRequired,
  loadingComments: PropTypes.object.isRequired,
};

export default PostDetailComments;
