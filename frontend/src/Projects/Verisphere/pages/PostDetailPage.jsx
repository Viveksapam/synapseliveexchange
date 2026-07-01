import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useReactions } from '../hooks/useReactions';
import { usePostDetail } from '../hooks/usePostDetail';
import PostDetailHeader from '../components/PostDetailHeader';
import PostDetailSources from '../components/PostDetailSources';
import PostDetailContext from '../components/PostDetailContext';
import { countAllComments } from '../utils/commentCounter';
import '../styles/VeriSphere.css';

const PostDetailPage = ({ authHook }) => {
  const { id } = useParams();
  const fallbackAuth = useAuth();
  const { strTokenState, boolIsLoggedInState, objUserState } = authHook || fallbackAuth;
  const boolIsAdmin = !!(objUserState && (objUserState.is_superuser || objUserState.is_staff));
  const reactions = useReactions(id, boolIsLoggedInState);
  const post = usePostDetail(id, strTokenState, boolIsLoggedInState);
  const [numWindowWidth, setNumWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setNumWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [boolIsAddingSourceState, setBoolIsAddingSourceState] = useState(false);
  const [strNewSourceTitleState, setStrNewSourceTitleState] = useState('');
  const [strNewSourceUrlState, setStrNewSourceUrlState] = useState('');
  const [strNewSourceDescState, setStrNewSourceDescState] = useState('');
  const [boolIsSubmittingSourceState, setBoolIsSubmittingSourceState] = useState(false);

  const handleSourceSubmit = async (e) => {
    e.preventDefault();
    if (!strNewSourceTitleState.trim() || !strNewSourceUrlState.trim()) return;
    setBoolIsSubmittingSourceState(true);
    try {
      await post.submitSource({ strTitle: strNewSourceTitleState, strUrl: strNewSourceUrlState, strDescription: strNewSourceDescState, strAuthor: objUserState?.username });
      setStrNewSourceTitleState(''); setStrNewSourceUrlState(''); setStrNewSourceDescState('');
      setBoolIsAddingSourceState(false);
    } catch (objErr) { alert(objErr.message || 'Failed to submit source.'); }
    finally { setBoolIsSubmittingSourceState(false); }
  };

  if (post.boolIsLoadingState) return <div className="verisphere-loading">Analyzing arguments...</div>;
  if (!post.objPostState) return <div className="verisphere-empty-state">Post not found.</div>;

  return (
    <div className="verisphere-post-detail" style={{
      maxWidth: 'none', margin: '2rem auto', padding: '2rem 1rem',
      background: 'var(--glass-bg)', borderRadius: '16px',
      backdropFilter: 'blur(20px)',
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
        postId={id}
        post={post.objPostState}
        sourceForm={{
          boolIsAddingSourceState, strNewSourceTitleState, setStrNewSourceTitleState,
          strNewSourceUrlState, setStrNewSourceUrlState,
          strNewSourceDescState, setStrNewSourceDescState, boolIsSubmittingSourceState,
        }}
        onSourceSubmit={handleSourceSubmit}
        onToggleAdd={() => setBoolIsAddingSourceState(!boolIsAddingSourceState)}
        boolIsAdmin={boolIsAdmin}
        strToken={strTokenState}
        onSourceApproved={post.refetch}
      />

      <PostDetailContext
        strAiContextGuardrail={post.objPostState.ai_summary}
        post={post.objPostState}
        onAnalyze={() => post.analyzePost()}
        boolIsAnalyzing={post.boolIsAnalyzingPostState}
      />

      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
        <Link
          to={`/verisphere/post/${id}/comments`}
          className="verisphere-btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '10px 20px', fontSize: '0.95rem', textDecoration: 'none' }}
        >
          View Discussion ({countAllComments(post.objPostState.comments)} comments)
        </Link>
      </div>
    </div>
  );
};

export default PostDetailPage;
