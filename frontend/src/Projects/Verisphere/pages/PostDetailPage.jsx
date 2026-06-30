import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useReactions } from '../hooks/useReactions';
import { usePostDetail } from '../hooks/usePostDetail';
import PostDetailHeader from '../components/PostDetailHeader';
import PostDetailSources from '../components/PostDetailSources';
import PostDetailContext from '../components/PostDetailContext';
import PostDetailComments from '../components/PostDetailComments';
import '../styles/VeriSphere.css';

const PostDetailPage = () => {
  const { id } = useParams();
  const { strTokenState, boolIsLoggedInState } = useAuth();
  const reactions = useReactions(id);
  const post = usePostDetail(id, strTokenState, boolIsLoggedInState);
  const [numWindowWidth, setNumWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => window.scrollTo(0, 0), 0);
    return () => clearTimeout(timer);
  }, [id]);

  React.useEffect(() => {
    const handleResize = () => setNumWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [strNewCommentState, setStrNewCommentState] = useState('');
  const [boolIsSubmittingState, setBoolIsSubmittingState] = useState(false);
  const [boolIsAddingSourceState, setBoolIsAddingSourceState] = useState(false);
  const [strNewSourceUrlState, setStrNewSourceUrlState] = useState('');
  const [strNewSourceDescState, setStrNewSourceDescState] = useState('');
  const [boolIsSubmittingSourceState, setBoolIsSubmittingSourceState] = useState(false);
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

  const handleSourceSubmit = async (e) => {
    e.preventDefault();
    if (!strNewSourceUrlState.trim()) return;
    setBoolIsSubmittingSourceState(true);
    try {
      await post.submitSource({ strUrl: strNewSourceUrlState, strDescription: strNewSourceDescState });
      setStrNewSourceUrlState(''); setStrNewSourceDescState('');
      setBoolIsAddingSourceState(false);
    } catch { alert('Failed to submit source. Please ensure you are logged in.'); }
    finally { setBoolIsSubmittingSourceState(false); }
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

  if (post.boolIsLoadingState) return <div className="verisphere-loading">Analyzing arguments...</div>;
  if (!post.objPostState) return <div className="verisphere-empty-state">Post not found.</div>;

  return (
    <div className="verisphere-post-detail" style={{
      maxWidth: 'none', margin: '2rem auto -1px auto', padding: '2.5rem 1.5rem 2rem 1.5rem',
      background: 'var(--glass-bg)', borderRadius: '24px 24px 0 0',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
      border: '1px solid var(--glass-border)', borderBottom: 'none', backdropFilter: 'blur(20px)',
      fontSize: '0.95rem',
      lineHeight: '1.6',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <Link to="/verisphere/feed" className="verisphere-back-link inline-block" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--v2-text-main)', transition: 'transform 0.2s' }}>
          ←
        </Link>
      </div>

      <PostDetailHeader post={post.objPostState} reactions={reactions} />

      <PostDetailSources
        post={post.objPostState}
        sourceForm={{
          boolIsAddingSourceState, strNewSourceUrlState, setStrNewSourceUrlState,
          strNewSourceDescState, setStrNewSourceDescState, boolIsSubmittingSourceState,
        }}
        onSourceSubmit={handleSourceSubmit}
        onToggleAdd={() => setBoolIsAddingSourceState(!boolIsAddingSourceState)}
      />

      <PostDetailContext strAiContextGuardrail={post.objPostState.strAiContextGuardrail} />

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
        }}
        onAnalyzeComment={post.analyzeComment}
        loadingComments={post.loadingCommentsState}
      />
    </div>
  );
};

export default PostDetailPage;
