import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CommentBody from './CommentBody';
import CommentReplyForm from './CommentReplyForm';

const CommentThread = ({
  comment, level = 0, handleAnalyzeComment, loadingCommentsState,
  setReplyingToState, setReplyModeState, setStrReplyContentState,
  replyingToState, strReplyContentState, handleReplySubmit, boolIsSubmittingReplyState,
  handleDeleteComment,
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
    <div className="verisphere-comment-thread" style={{ display: 'flex', flexDirection: 'column', marginTop: level === 0 ? '1rem' : '0', position: 'relative', overflow: 'hidden' }}>
      <div
        onClick={(e) => { e.stopPropagation(); setBoolIsCollapsedState((p) => !p); }}
        style={{ position: 'absolute', left: 0, top: '-0.5rem', width: '3px', minWidth: '3px', height: 'calc(100% + 0.5rem)', display: 'flex', justifyContent: 'center', cursor: 'pointer', opacity: boolIsCollapsedState ? 0.5 : 1, transition: 'opacity 0.2s' }}
        className="thread-line-container"
        title={boolIsCollapsedState ? 'Expand thread' : 'Collapse thread'}
      >
        <div style={{ width: '1px', height: '100%', backgroundColor: 'var(--glass-border)', borderRadius: '1px 1px 0 0' }} className="thread-line" />
      </div>

      <div style={{ display: 'flex', paddingLeft: '7px' }}>
        <div style={{ flex: 1, padding: '0.5rem 0', background: 'transparent', opacity: boolIsCollapsedState ? 0.7 : 1, transition: 'opacity 0.2s' }}>
          <div className="verisphere-comment-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            {boolIsCollapsedState && (
              <button
                onClick={(e) => { e.stopPropagation(); setBoolIsCollapsedState(false); }}
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--v2-text-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px', marginRight: '4px', fontFamily: 'monospace' }}
              >
                [+]
              </button>
            )}
            <strong style={{ fontSize: '0.95rem', color: 'var(--v2-text-main)' }}>
              {comment.strAuthorUsername || comment.strAuthor || 'Anonymous'}
            </strong>
            <span className="verisphere-date" style={{ color: 'var(--v2-text-muted)', fontSize: '0.8rem' }}>
              • {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Date unavailable'}
            </span>
          </div>

          {!boolIsCollapsedState && (
            <CommentBody
              comment={comment}
              loadingCommentsState={loadingCommentsState}
              onAnalyze={handleAnalyzeComment}
              onStartReply={handleStartReply}
              onDelete={handleDeleteComment}
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
        <div style={{ paddingLeft: '12px' }}>
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
};

export default CommentThread;
