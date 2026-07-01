import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MediaEmbed from './MediaEmbed';
import PostDetailReactions from './PostDetailReactions';

const PostDetailHeader = ({ post, reactions }) => {
  const [boolIsExpandedState, setBoolIsExpandedState] = useState(false);
  const [numWindowWidth, setNumWindowWidth] = useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setNumWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const MAX_CHARS = numWindowWidth >= 768 ? 280 : 160;
  const boolNeedsCollapse = post.strContent && post.strContent.length > MAX_CHARS;
  const strDisplayContent = boolIsExpandedState ? post.strContent : post.strContent?.substring(0, MAX_CHARS);

  return (
    <div className="verisphere-detail-header" style={{ position: 'relative' }}>
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

export default PostDetailHeader;
