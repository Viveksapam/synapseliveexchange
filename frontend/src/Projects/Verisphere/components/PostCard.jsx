import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { postToggleFeatured } from '../api/verisphereApi';
import { useReactions } from '../hooks/useReactions';
import MediaEmbed from './MediaEmbed';
import PostCardReactions from './PostCardReactions';

const getVerifiableColor = (strVerifiable) => {
  if (!strVerifiable) return '#30363d';
  const v = strVerifiable.toLowerCase();
  if (v === 'yes') return '#2ea043';
  if (v === 'partial') return '#d29922';
  if (v === 'no') return '#f85149';
  return '#8b949e';
};

const PostCard = ({ objPost, authHook }) => {
  const navigate = useNavigate();
  const objMetrics = objPost.dictAiMetrics;
  const boolIsAnalyzed = objMetrics && objMetrics.logical_soundness !== undefined;
  const { objUserState, strTokenState } = authHook || {};
  const boolIsAdmin = !!(objUserState && (objUserState.is_superuser || objUserState.is_staff));
  const [boolIsFeaturedState, setBoolIsFeaturedState] = useState(objPost.boolIsFeatured);
  const reactions = useReactions(objPost.id);

  const strScoreColor = getVerifiableColor(boolIsAnalyzed ? objMetrics.verifiable : null);

  const scrollToTop = () => {
    const el = document.querySelector('.v2-content-scroll');
    if (el) el.scrollTop = 0;
    window.scrollTo(0, 0);
  };

  const handleCardClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button') || e.target.closest('iframe')) return;
    scrollToTop();
    navigate(`/verisphere/post/${objPost.id}`);
  };

  const handleToggleFeatured = async (e) => {
    e.stopPropagation();
    if (!boolIsAdmin) return;
    const boolSuccess = await postToggleFeatured(objPost.id, boolIsFeaturedState, strTokenState);
    if (boolSuccess) {
      setBoolIsFeaturedState((prev) => !prev);
      alert(boolIsFeaturedState ? 'Post removed from featured list.' : 'Post featured successfully!');
    } else {
      alert('Failed to toggle featured status. Please check your permissions.');
    }
  };

  return (
    <div className="verisphere-post-card" onClick={handleCardClick} style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
      <div className="vs-post-votes" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '0.5rem', gap: '1rem', minWidth: '70px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} title="Engagement (Views)">
          <span className="verisphere-vote-count" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{objPost.numUpvotes}</span>
          <span className="verisphere-vote-label" style={{ fontSize: '0.65rem', color: 'var(--v2-text-muted)', display: 'block', textAlign: 'center', marginTop: '2px' }}>Engagement</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', width: '100%' }}>
          <div className="ai-score-badge" style={{ minWidth: '40px', height: '40px', padding: '0 8px', borderRadius: '4px', border: `1px solid ${strScoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: boolIsAnalyzed ? 'var(--v2-text-main)' : 'var(--v2-text-muted)', backgroundColor: boolIsAnalyzed ? `${strScoreColor}20` : 'var(--glass-bg)' }}>
            {boolIsAnalyzed ? (objMetrics.verifiable ? objMetrics.verifiable.toUpperCase() : '?') : '?'}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--v2-text-muted)', display: 'block', textAlign: 'center', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Verifiable</span>
        </div>
      </div>

      <div className="verisphere-post-content">
        <div className="verisphere-post-meta">
          <Link to={`/verisphere/community/${objPost.objCommunity || 'general'}`} className="verisphere-community-badge">{objPost.strCommunityName || 'General'}</Link>
          <span className="verisphere-author-badge">Posted by {objPost.strAuthorUsername || 'user_' + objPost.objAuthor}</span>
          <span className="verisphere-date">{new Date(objPost.created_at).toLocaleDateString()}</span>
          {boolIsAdmin && (
            <button onClick={handleToggleFeatured} style={{ marginLeft: 'auto', background: boolIsFeaturedState ? '#d29922' : 'transparent', color: boolIsFeaturedState ? '#161b22' : 'var(--v2-text-muted)', border: `1px solid ${boolIsFeaturedState ? '#d29922' : 'var(--glass-border)'}`, borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
              {boolIsFeaturedState ? '⭐ Featured' : '☆ Feature'}
            </button>
          )}
        </div>

        <Link to={`/verisphere/post/${objPost.id}`} className="verisphere-post-title-link" onClick={scrollToTop}>
          <h3 className="verisphere-post-title">{objPost.strTitle}</h3>
        </Link>

        <MediaEmbed strMediaUrl={objPost.strMediaUrl} numMaxImageHeight={315} numIframeHeight={350} />

        <p className="verisphere-post-preview">
          {objPost.strContent.length > 200 ? objPost.strContent.substring(0, 200) + '...' : objPost.strContent}
        </p>

        <PostCardReactions reactions={reactions} commentsCount={objPost.comments_count || 0} postId={objPost.id} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--v2-text-muted)', whiteSpace: 'nowrap' }}>
            📚 {objPost.sources ? objPost.sources.length : 0} Sources
          </span>
          <Link to={`/verisphere/post/${objPost.id}`} className="verisphere-btn-outline" style={{ padding: '2px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap' }} onClick={scrollToTop}>
            + Add Source
          </Link>
        </div>
      </div>
    </div>
  );
};

PostCard.propTypes = {
  objPost: PropTypes.object.isRequired,
  authHook: PropTypes.object,
};

export default PostCard;
