import React, { useState } from 'react';

const CommentThread = ({ 
    comment, 
    level = 0, 
    handleAnalyzeComment, 
    loadingCommentsState, 
    getScoreColor,
    setReplyingToState,
    setReplyModeState,
    setStrReplyContentState,
    replyingToState,
    replyModeState,
    strReplyContentState,
    handleReplySubmit,
    boolIsSubmittingReplyState
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = (e) => {
        e.stopPropagation();
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="verisphere-comment-thread" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            marginTop: level === 0 ? '1rem' : '0'
        }}>
            {/* Thread line container and content */}
            <div style={{ display: 'flex', position: 'relative' }}>
                
                {/* Clickable Thread Line */}
                <div 
                    onClick={toggleCollapse}
                    style={{
                        width: '24px',
                        minWidth: '24px',
                        display: 'flex',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        paddingTop: '8px',
                        opacity: isCollapsed ? 0.5 : 1,
                        transition: 'opacity 0.2s',
                        marginRight: '12px'
                    }}
                    className="thread-line-container"
                    title={isCollapsed ? "Expand thread" : "Collapse thread"}
                >
                    <div style={{
                        width: '2px',
                        height: '100%',
                        backgroundColor: 'var(--glass-border)',
                        transition: 'background-color 0.2s',
                    }} className="thread-line" />
                </div>

                {/* Comment Content */}
                <div style={{ 
                    flex: 1, 
                    padding: '0.5rem 0',
                    background: 'transparent',
                    opacity: isCollapsed ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                }}>
                    <div className="verisphere-comment-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {isCollapsed && (
                            <button 
                                onClick={toggleCollapse}
                                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--v2-text-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px', marginRight: '4px', fontFamily: 'monospace' }}
                            >
                                [+]
                            </button>
                        )}
                        <strong style={{ fontSize: '0.95rem', color: 'var(--v2-text-main)' }}>{comment.strAuthorUsername || 'user_' + comment.objAuthor}</strong>
                        <span className="verisphere-date" style={{ color: 'var(--v2-text-muted)', fontSize: '0.8rem' }}>• {new Date(comment.created_at).toLocaleDateString()}</span>

                    </div>
                    
                    {!isCollapsed && (
                        <div className="verisphere-comment-body" style={{
                            display: 'grid', 
                            gridTemplateRows: '1fr',
                            transition: 'grid-template-rows 0.3s ease-out'
                        }}>
                            <div style={{ overflow: 'hidden' }}>
                                {comment.dictAiMetrics && comment.dictAiMetrics.logical_errors && comment.dictAiMetrics.logical_errors.length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                        {comment.dictAiMetrics.logical_errors.map((error, idx) => (
                                            <span key={idx} style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', color: '#ff7b72', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', border: '1px solid rgba(248,81,73,0.3)' }}>⚠️ {error}</span>
                                        ))}
                                    </div>
                                )}
                                
                                <p className="verisphere-comment-text" style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--v2-text-main)', marginBottom: '0.8rem', marginTop: 0 }}>{comment.strContent}</p>
                                
                                <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '0.8rem' }}>
                                    {comment.strAnalysisReasoning && (
                                        <div className="verisphere-reasoning-box" style={{ background: 'rgba(0,0,0,0.03)', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                                            <strong style={{ fontSize: '0.7rem', color: 'var(--v2-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>🧠 Logical Foundation</strong>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--v2-text-main)' }}>{comment.strAnalysisReasoning}</p>
                                        </div>
                                    )}

                                    {comment.strReferences && (
                                        <div className="verisphere-reasoning-box" style={{ background: 'rgba(46, 160, 67, 0.05)', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                                            <strong style={{ fontSize: '0.7rem', color: 'var(--v2-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>📚 Citations</strong>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--v2-text-main)' }}>{comment.strReferences}</p>
                                        </div>
                                    )}
                                    
                                    {comment.strAiAnalysis ? (
                                        <div className="verisphere-ai-box comment-ai" style={{ background: 'rgba(88, 166, 255, 0.05)', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                                            <strong style={{ fontSize: '0.7rem', color: 'var(--v2-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>Analysis</strong>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--v2-text-main)' }}>{comment.strAiAnalysis}</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                                            <button 
                                                onClick={() => handleAnalyzeComment(comment.id)}
                                                disabled={loadingCommentsState[comment.id]}
                                                className="verisphere-btn-outline small"
                                                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px' }}
                                            >
                                                {loadingCommentsState[comment.id] ? 'Analyzing...' : 'Request Analysis'}
                                            </button>
                                            
                                            <button
                                                className="verisphere-btn-outline"
                                                onClick={() => {
                                                    setReplyingToState(comment.id);
                                                    setReplyModeState('premise');
                                                    setStrReplyContentState('');
                                                }}
                                                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px', border: 'none', background: 'transparent', color: 'var(--v2-text-muted)' }}
                                            >+ Reply</button>
                                        </div>
                                    )}
                                </div>

                                {replyingToState === comment.id && (
                                    <form
                                        onSubmit={(e) => handleReplySubmit(e, comment.id)}
                                        className="verisphere-comment-form"
                                        style={{ marginTop: '1rem', paddingLeft: '1rem', marginBottom: '1rem' }}
                                    >
                                        <textarea
                                            placeholder="Share your thoughts clearly..."
                                            value={strReplyContentState}
                                            onChange={(e) => setStrReplyContentState(e.target.value)}
                                            required
                                            className="verisphere-textarea"
                                            style={{ minHeight: '60px', marginBottom: '0.5rem', fontSize: '0.85rem' }}
                                        />
                                        <div className="verisphere-form-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                type="submit" 
                                                disabled={boolIsSubmittingReplyState} 
                                                className="verisphere-btn-outline" 
                                                style={{ 
                                                    padding: '4px 12px', 
                                                    fontSize: '0.8rem',
                                                    background: 'rgba(128, 128, 128, 0.15)',
                                                    color: 'var(--v2-text-main)',
                                                    borderColor: 'var(--glass-border)'
                                                }}
                                            >
                                                {boolIsSubmittingReplyState ? 'Submitting...' : 'Submit'}
                                            </button>
                                            <button type="button" onClick={() => { setReplyingToState(null); setReplyModeState(null); }} className="verisphere-btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Render Replies Recursively */}
            {!isCollapsed && comment.replies && comment.replies.length > 0 && (
                <div style={{ paddingLeft: '12px' }}>
                    {comment.replies.map(reply => (
                        <CommentThread 
                            key={reply.id} 
                            comment={reply} 
                            level={level + 1}
                            handleAnalyzeComment={handleAnalyzeComment}
                            loadingCommentsState={loadingCommentsState}
                            getScoreColor={getScoreColor}
                            setReplyingToState={setReplyingToState}
                            setReplyModeState={setReplyModeState}
                            setStrReplyContentState={setStrReplyContentState}
                            replyingToState={replyingToState}
                            replyModeState={replyModeState}
                            strReplyContentState={strReplyContentState}
                            handleReplySubmit={handleReplySubmit}
                            boolIsSubmittingReplyState={boolIsSubmittingReplyState}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentThread;
