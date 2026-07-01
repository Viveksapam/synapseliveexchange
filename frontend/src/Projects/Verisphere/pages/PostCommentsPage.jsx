import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { usePostDetail } from '../hooks/usePostDetail';
import PostDetailComments from '../components/PostDetailComments';
import '../styles/VeriSphere.css';

const PostCommentsPage = ({ authHook }) => {
  const { id } = useParams();
  const fallbackAuth = useAuth();
  const { strTokenState, boolIsLoggedInState, objUserState } = authHook || fallbackAuth;
  const boolIsAdmin = !!(objUserState && (objUserState.is_superuser || objUserState.is_staff));
  const post = usePostDetail(id, strTokenState, boolIsLoggedInState);

  const [strNewCommentState, setStrNewCommentState] = useState('');
  const [boolIsSubmittingState, setBoolIsSubmittingState] = useState(false);
  const [replyingToState, setReplyingToState] = useState(null);
  const [replyModeState, setReplyModeState] = useState(null);
  const [strReplyContentState, setStrReplyContentState] = useState('');
  const [boolIsSubmittingReplyState, setBoolIsSubmittingReplyState] = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!strNewCommentState.trim()) return;
    setBoolIsSubmittingState(true);
    try {
      await post.submitComment({ strContent: strNewCommentState });
      setStrNewCommentState('');
    } catch { alert('Failed to submit comment. Please ensure you are logged in.'); }
    finally { setBoolIsSubmittingState(false); }
  };

  const handleReplySubmit = async (e, numParentId) => {
    e.preventDefault();
    if (!strReplyContentState.trim()) return;
    setBoolIsSubmittingReplyState(true);
    try {
      await post.submitComment({ strContent: strReplyContentState, objParent: numParentId });
      setStrReplyContentState('');
      setReplyingToState(null); setReplyModeState(null);
    } catch { alert('Failed to submit reply. Please ensure you are logged in.'); }
    finally { setBoolIsSubmittingReplyState(false); }
  };

  if (post.boolIsLoadingState) return <div className="verisphere-loading">Loading discussion...</div>;
  if (!post.objPostState) return <div className="verisphere-empty-state">Post not found.</div>;

  return (
    <div className="verisphere-post-detail" style={{
      maxWidth: 'none', margin: '2rem auto', padding: '2rem 1rem',
      background: 'var(--glass-bg)', borderRadius: '16px',
      backdropFilter: 'blur(20px)',
      fontSize: '0.95rem', lineHeight: '1.6',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <Link
          to={`/verisphere/post/${id}`}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--v2-text-main)' }}
        >
          ←
        </Link>
        {boolIsAdmin && (
          <button
            onClick={post.analyzeAllComments}
            disabled={post.boolIsAnalyzingCommentsState}
            className="verisphere-btn-primary"
            style={{
              fontSize: '0.85rem', padding: '6px 10px', background: 'rgba(79, 163, 255, 0.1)',
              color: post.boolIsAnalyzingCommentsState ? 'var(--v2-text-muted)' : 'var(--v2-accent-secondary)',
              border: `1.5px solid ${post.boolIsAnalyzingCommentsState ? 'var(--glass-border)' : 'var(--v2-accent-secondary)'}`,
              borderRadius: '6px', cursor: post.boolIsAnalyzingCommentsState ? 'not-allowed' : 'pointer',
              opacity: post.boolIsAnalyzingCommentsState ? 0.6 : 1,
            }}
          >
            {post.boolIsAnalyzingCommentsState ? '⊙ Analyzing comments...' : 'Analyze All Comments'}
          </button>
        )}
      </div>

      <PostDetailComments
        post={post.objPostState}
        boolIsLoggedIn={boolIsLoggedInState}
        commentForm={{
          strNewCommentState, setStrNewCommentState,
          boolIsSubmittingState, onCommentSubmit: handleCommentSubmit,
        }}
        replyState={{
          setReplyingToState, setReplyModeState, setStrReplyContentState,
          replyingToState, replyModeState, strReplyContentState,
          handleReplySubmit, boolIsSubmittingReplyState,
          handleDeleteComment: post.handleDeleteComment,
        }}
        onAnalyzeComment={post.analyzeComment}
        loadingComments={post.loadingCommentsState}
      />
    </div>
  );
};

export default PostCommentsPage;
