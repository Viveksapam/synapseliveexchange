import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import EmojiPicker from './EmojiPicker';

const reactionButtonStyle = (boolActive) => ({
  background: boolActive ? 'rgba(88, 166, 255, 0.15)' : 'var(--glass-bg)',
  border: boolActive ? '1px solid #58a6ff' : '1px solid var(--glass-border)',
  borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 8px',
  display: 'flex', alignItems: 'center', gap: '4px',
  color: boolActive ? '#58a6ff' : 'var(--v2-text-muted)',
  transition: 'all 0.2s', fontWeight: 'bold',
});

const PostCardReactions = ({ reactions, commentsCount, postId }) => {
  const { arrTopReactions, objUserReactedState, boolShowPickerState, setShowPicker, handleReact } = reactions;

  return (
    <div className="vs-post-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'nowrap', position: 'relative' }}>
      <div className="verisphere-reacts" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', position: 'relative' }}>
        {arrTopReactions.slice(0, window.innerWidth < 768 ? 2 : 5).map(([strEmoji, numCount]) => (
          <button
            key={strEmoji}
            className="vs-react-btn"
            onClick={(e) => { e.stopPropagation(); handleReact(strEmoji); }}
            style={reactionButtonStyle(objUserReactedState[strEmoji])}
          >
            <span>{strEmoji}</span> <span>{numCount}</span>
          </button>
        ))}
        <button
          onClick={(e) => { e.stopPropagation(); setShowPicker(!boolShowPickerState); }}
          style={{
            background: 'transparent', border: '1px dashed var(--glass-border)', borderRadius: '12px',
            cursor: 'pointer', fontSize: '0.9rem', padding: '2px 8px',
            color: 'var(--v2-text-muted)', display: 'flex', alignItems: 'center', transition: 'all 0.2s', position: 'relative',
          }}
        >
          {boolShowPickerState ? '-' : '+'}
          {boolShowPickerState && (
            <EmojiPicker
              arrTopReactions={arrTopReactions}
              objUserReacted={objUserReactedState}
              onReact={handleReact}
            />
          )}
        </button>
      </div>

      <Link
        to={`/verisphere/post/${postId}`}
        className="verisphere-action-link"
        style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
      >
        Enter Dialogue ({commentsCount})
      </Link>
    </div>
  );
};

PostCardReactions.propTypes = {
  reactions: PropTypes.object.isRequired,
  commentsCount: PropTypes.number.isRequired,
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default PostCardReactions;
