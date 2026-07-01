import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MediaEmbed from './MediaEmbed';
import PostDetailReactions from './PostDetailReactions';

const getScoreColor = (numScore) => {
  if (numScore === null || numScore === undefined) return '#30363d';
  if (numScore >= 80) return '#2ea043';
  if (numScore >= 50) return '#d29922';
  return '#f85149';
};

const PostDetailHeader = ({ post, reactions }) => {
  const [boolIsExpandedState, setBoolIsExpandedState] = useState(false);
  const [numWindowWidth, setNumWindowWidth] = useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setNumWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const objMetrics = post.dictAiMetrics;
  const boolIsAnalyzed = objMetrics && objMetrics.logical_soundness !== undefined;
  // logical_soundness is stored 0-1; display and color use a 0-100 scale.
  const numSoundness = boolIsAnalyzed ? Math.round(objMetrics.logical_soundness * 100) : null;

  const MAX_CHARS = numWindowWidth >= 768 ? 280 : 160;
  const boolNeedsCollapse = post.strContent && post.strContent.length > MAX_CHARS;
  const strDisplayContent = boolIsExpandedState ? post.strContent : post.strContent?.substring(0, MAX_CHARS);

  return (
    <div className="verisphere-detail-header" style={{ position: 'relative' }}>
      {boolIsAnalyzed && (
        <div className="verisphere-logic-matrix" style={{
          backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px',
          padding: '1rem', marginTop: '1rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--v2-text-muted)', display: 'block' }}>Soundness</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: getScoreColor(numSoundness) }}>
              {numSoundness}/100
            </span>
          </div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--v2-text-muted)', display: 'block' }}>Verifiable</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--v2-text-main)' }}>{objMetrics.verifiable}</span>
          </div>
          {objMetrics.logical_errors && objMetrics.logical_errors.length > 0 && (
            <div style={{ width: '100%', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#f85149', display: 'block', fontWeight: 'bold' }}>⚠️ Fallacies Detected</span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                {objMetrics.logical_errors.map((strError, numIdx) => (
                  <span key={numIdx} style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', color: '#ff7b72', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid rgba(248,81,73,0.3)' }}>
                    {strError}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <h1 style={{
        fontSize: 'clamp(1.4rem, 3vw, 2.8rem)', lineHeight: '1.25', marginBottom: '0.6rem', marginTop: 0,
        fontFamily: "'Space Grotesk', sans-serif", color: 'var(--v2-text-main)',
        letterSpacing: '-0.01em',
      }}>
        {post.strTitle}
      </h1>

      <div className="verisphere-post-meta" style={{ marginBottom: '1rem' }}>
        <span className="verisphere-community-badge">{post.strCommunityName || 'General'}</span>
        <span className="verisphere-author-badge">{post.strAuthorUsername || 'user_' + post.objAuthor}</span>
      </div>

      <p className="verisphere-detail-content" style={{ marginBottom: boolNeedsCollapse ? '0.4rem' : undefined }}>{strDisplayContent}{boolNeedsCollapse && !boolIsExpandedState && '...'}</p>
      {boolNeedsCollapse && (
        <button
          onClick={() => setBoolIsExpandedState(!boolIsExpandedState)}
          style={{ background: 'transparent', border: 'none', color: 'var(--v2-accent-secondary)', cursor: 'pointer', padding: 0, fontSize: '0.9rem', fontWeight: 'bold', display: 'block' }}
        >
          {boolIsExpandedState ? 'Read less' : 'Read more'}
        </button>
      )}

      <PostDetailReactions reactions={reactions} />

      {post.strReferences && (
        <div className="verisphere-reasoning-box" style={{ backgroundColor: 'rgba(46, 160, 67, 0.05)', borderLeftColor: '#2ea043', marginTop: '1rem', marginBottom: '1rem' }}>
          <h4><span className="icon">📚</span> Topic Citations & Sources</h4>
          <p className="reasoning-text">{post.strReferences}</p>
        </div>
      )}
    </div>
  );
};

PostDetailHeader.propTypes = {
  post: PropTypes.object.isRequired,
  reactions: PropTypes.object.isRequired,
};

export { getScoreColor };
export default PostDetailHeader;
