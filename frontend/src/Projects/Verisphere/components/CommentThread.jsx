import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CommentBody from './CommentBody';
import CommentReplyForm from './CommentReplyForm';

const CommentThread = ({
  comment, level = 0, handleAnalyzeComment, loadingCommentsState,
  setReplyingToState, setReplyModeState, setStrReplyContentState,
  replyingToState, strReplyContentState, handleReplySubmit, boolIsSubmittingReplyState,
  handleDeleteComment, boolIsAdmin,
}) => {
  const [boolIsCollapsedState, setBoolIsCollapsedState] = useState(false);

  const handleStartReply = (numId) => {
    setReplyingToState(numId);
    setReplyModeState('premise');
    setStrReplyContentState('');
  };

  const handleCancelReply = () => {
    setReplyingToState(null);
    setReplyModeState(null);
  };

  return (
    <div className={`verisphere-comment-thread ${level === 0 ? 'is-root' : 'is-reply'}`} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {level > 0 && (
        <div
          onClick={(e) => { e.stopPropagation(); setBoolIsCollapsedState((p) => !p); }}
          style={{ position: 'absolute', left: 0, top: 0, width: '10px', minWidth: '10px', height: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer', opacity: boolIsCollapsedState ? 0.5 : 1, transition: 'opacity 0.2s' }}
          className="thread-line-container"
          title={boolIsCollapsedState ? 'Expand thread' : 'Collapse thread'}
        >
          <div className="thread-line" />
        </div>
      )}

      <div style={{ display: 'flex', paddingLeft: level === 0 ? 0 : '10px' }}>
        <div style={{ flex: 1, opacity: boolIsCollapsedState ? 0.7 : 1, transition: 'opacity 0.2s' }}>
          <div className="verisphere-comment-header" style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.35rem' }}>
            {boolIsCollapsedState && (
              <button
                onClick={(e) => { e.stopPropagation(); setBoolIsCollapsedState(false); }}
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--v2-text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 6px', marginRight: '4px', fontFamily: 'monospace' }}
              >
                [+]
              </button>
            )}
            <strong style={{ fontSize: '0.8125rem', color: 'var(--v2-text-main)' }}>
              {comment.strAuthorUsername || comment.strAuthor || 'Anonymous'}
            </strong>
            <span className="verisphere-date" style={{ color: 'var(--v2-text-muted)', fontSize: '0.75rem' }}>
              • {comment.datePosted ? new Date(comment.datePosted).toLocaleDateString() : 'Date unavailable'}
            </span>
          </div>

          {!boolIsCollapsedState && (
            <CommentBody
              comment={comment}
              loadingCommentsState={loadingCommentsState}
              onAnalyze={handleAnalyzeComment}
              onStartReply={handleStartReply}
              onDelete={handleDeleteComment}
              boolIsAdmin={boolIsAdmin}
            />
          )}

          {!boolIsCollapsedState && replyingToState === comment.id && (
            <CommentReplyForm
              commentId={comment.id}
              value={strReplyContentState}
              onChange={setStrReplyContentState}
              onSubmit={handleReplySubmit}
              onCancel={handleCancelReply}
              isSubmitting={boolIsSubmittingReplyState}
            />
          )}
        </div>
      </div>

      {!boolIsCollapsedState && comment.replies && comment.replies.length > 0 && (
        <div style={{ paddingLeft: '14px', marginTop: '0.6rem' }}>
          {comment.replies.map((objReply) => (
            <CommentThread
              key={objReply.id}
              comment={objReply}
              level={level + 1}
              handleAnalyzeComment={handleAnalyzeComment}
              loadingCommentsState={loadingCommentsState}
              setReplyingToState={setReplyingToState}
              setReplyModeState={setReplyModeState}
              setStrReplyContentState={setStrReplyContentState}
              replyingToState={replyingToState}
              strReplyContentState={strReplyContentState}
              handleReplySubmit={handleReplySubmit}
              boolIsSubmittingReplyState={boolIsSubmittingReplyState}
              handleDeleteComment={handleDeleteComment}
              boolIsAdmin={boolIsAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

CommentThread.propTypes = {
  comment: PropTypes.object.isRequired,
  level: PropTypes.number,
  handleAnalyzeComment: PropTypes.func.isRequired,
  loadingCommentsState: PropTypes.object.isRequired,
  setReplyingToState: PropTypes.func.isRequired,
  setReplyModeState: PropTypes.func.isRequired,
  setStrReplyContentState: PropTypes.func.isRequired,
  replyingToState: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  strReplyContentState: PropTypes.string.isRequired,
  handleReplySubmit: PropTypes.func.isRequired,
  boolIsSubmittingReplyState: PropTypes.bool.isRequired,
  boolIsAdmin: PropTypes.bool,
};

export default CommentThread;
