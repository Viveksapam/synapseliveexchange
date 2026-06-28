import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPostDetail, postCreateSource, postCreateComment, fetchPostReactions, postToggleReaction } from '../api/verisphereApi';
import { useAuth } from '../../hooks/useAuth';
import CommentThread from '../components/CommentThread';
import '../styles/VeriSphere.css';

const normalizeEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/embed/')) return url;
    
    // Instagram handling
    if (url.includes('instagram.com/')) {
        if (url.includes('/embed')) return url;
        return url.replace(/\/$/, '') + '/embed/';
    }

    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    return url;
};

function PostDetailPage() {
    const { id } = useParams();
    const { strTokenState, boolIsLoggedInState } = useAuth();
    
    const [objPostState, setObjPostState] = useState(null);
    const [boolIsLoadingState, setBoolIsLoadingState] = useState(true);
    
    const [strNewCommentState, setStrNewCommentState] = useState('');
    const [strNewReasoningState, setStrNewReasoningState] = useState('');
    const [strNewReferencesState, setStrNewReferencesState] = useState('');
    const [boolIsSubmittingState, setBoolIsSubmittingState] = useState(false);
    
    // Community Sources state
    const [boolIsAddingSourceState, setBoolIsAddingSourceState] = useState(false);
    const [strNewSourceUrlState, setStrNewSourceUrlState] = useState('');
    const [strNewSourceDescState, setStrNewSourceDescState] = useState('');
    const [boolIsSubmittingSourceState, setBoolIsSubmittingSourceState] = useState(false);

    // AI Loading states
    const [boolIsLoadingContextState, setBoolIsLoadingContextState] = useState(false);
    const [loadingCommentsState, setLoadingCommentsState] = useState({});

    // Reply states
    const [replyingToState, setReplyingToState] = useState(null);
    const [replyModeState, setReplyModeState] = useState(null);
    const [strReplyContentState, setStrReplyContentState] = useState('');
    const [strReplyReasoningState, setStrReplyReasoningState] = useState('');
    const [boolIsSubmittingReplyState, setBoolIsSubmittingReplyState] = useState(false);

    // Collapsible comments state
    const [collapsedCommentsState, setCollapsedCommentsState] = useState({});

    const toggleComment = (commentId) => {
        setCollapsedCommentsState(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    // Generate some mock initial reactions based on the post ID to make them varied
    const initialReactions = {};
    if (id === '1004' || id === 'blog_1004') {
        initialReactions['❤️'] = 45;
        initialReactions['👽'] = 12;
        initialReactions['😂'] = 95;
        initialReactions['🤗'] = 18;
        initialReactions['👏'] = 27;
    } else if (id === '1002' || id === 'blog_1002') {
        initialReactions['❤️'] = 89;
        initialReactions['😂'] = 12;
        initialReactions['🥺'] = 34;
        initialReactions['🖕'] = 5;
        initialReactions['🤬'] = 3;
    } else {
        initialReactions['❤️'] = 15;
        initialReactions['🛡️'] = 6;
        initialReactions['😂'] = 8;
        initialReactions['😞'] = 4;
    }

    const [reactions, setReactions] = useState(initialReactions);
    const [showPicker, setShowPicker] = useState(false);
    const [userReacted, setUserReacted] = useState({});

    useEffect(() => {
        const loadReactions = async () => {
            const data = await fetchPostReactions(id);
            const combined = { ...initialReactions };
            for (const [emoji, count] of Object.entries(data.reactions)) {
                combined[emoji] = (combined[emoji] || 0) + count;
            }
            setReactions(combined);
            setUserReacted(data.user_reacted);
        };
        loadReactions();
    }, [id]);

    useEffect(() => {
        if (!showPicker) return;
        const handleOutsideClick = () => {
            setShowPicker(false);
        };
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [showPicker]);

    const extendedEmojis = ['❤️', '👏', '🤗', '😂', '👽', '🛡️', '🥺', '😞', '🖕', '🤬'];

    const handleReact = async (emoji) => {
        const hasReacted = userReacted[emoji];
        const currentReactionCount = Object.values(userReacted).filter(v => v).length;
        
        if (!hasReacted && currentReactionCount >= 3) {
            alert('You can only give a maximum of 3 reactions per post.');
            setShowPicker(false);
            return;
        }

        // Optimistic UI update
        setReactions(prev => {
            const currentCount = prev[emoji] || 0;
            return {
                ...prev,
                [emoji]: hasReacted ? currentCount - 1 : currentCount + 1
            };
        });
        
        setUserReacted(prev => ({
            ...prev,
            [emoji]: !prev[emoji]
        }));
        
        setShowPicker(false);
        
        // API call
        const res = await postToggleReaction(id, emoji);
        if (res.status === 'error') {
            // Revert if error
            alert(res.message || 'Failed to record reaction.');
            setReactions(prev => {
                const currentCount = prev[emoji] || 0;
                return {
                    ...prev,
                    [emoji]: hasReacted ? currentCount + 1 : currentCount - 1
                };
            });
            setUserReacted(prev => ({
                ...prev,
                [emoji]: hasReacted
            }));
        }
    };

    // Sort reactions to show top ones
    const topReactions = Object.entries(reactions)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);

    useEffect(() => {
        loadPost();
    }, [id]);

    const loadPost = async () => {
        try {
            const data = await fetchPostDetail(id);
            setObjPostState(data);
        } catch (error) {
            console.error("Error fetching post detail:", error);
        } finally {
            setBoolIsLoadingState(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!boolIsLoggedInState || !strNewCommentState.trim()) return;
        
        setBoolIsSubmittingState(true);
        try {
            await postCreateComment(id, {
                strContent: strNewCommentState,
                strAnalysisReasoning: strNewReasoningState,
                strReferences: strNewReferencesState
            }, strTokenState);
            
            // Reload post to show new comment
            setStrNewCommentState('');
            setStrNewReasoningState('');
            setStrNewReferencesState('');
            await loadPost();
        } catch (error) {
            console.error("Failed to submit comment", error);
            alert("Failed to submit comment. Please ensure you are logged in.");
        } finally {
            setBoolIsSubmittingState(false);
        }
    };

    const handleSourceSubmit = async (e) => {
        e.preventDefault();
        if (!boolIsLoggedInState || !strNewSourceUrlState.trim()) return;
        
        setBoolIsSubmittingSourceState(true);
        try {
            await postCreateSource(id, {
                strUrl: strNewSourceUrlState,
                strDescription: strNewSourceDescState
            }, strTokenState);
            
            setStrNewSourceUrlState('');
            setStrNewSourceDescState('');
            setBoolIsAddingSourceState(false);
            await loadPost();
        } catch (error) {
            console.error("Failed to submit source", error);
            alert("Failed to submit source. Please ensure you are logged in.");
        } finally {
            setBoolIsSubmittingSourceState(false);
        }
    };

    const handleAnalyzeContext = async () => {
        setBoolIsLoadingContextState(true);
        try {
            const data = await postAnalyzeContext(id);
            setObjPostState(prev => ({ 
                ...prev, 
                strAiContextGuardrail: data.strAiContextGuardrail,
                dictAiMetrics: data.dictAiMetrics
            }));
        } catch (error) {
            console.error("Failed to analyze context", error);
        } finally {
            setBoolIsLoadingContextState(false);
        }
    };

    const handleReplySubmit = async (e, parentCommentId) => {
        e.preventDefault();
        if (!boolIsLoggedInState || !strReplyContentState.trim()) return;
        setBoolIsSubmittingReplyState(true);
        try {
            await postCreateComment(id, {
                strContent: strReplyContentState,
                strAnalysisReasoning: strReplyReasoningState,
                objParent: parentCommentId
            }, strTokenState);
            setStrReplyContentState('');
            setStrReplyReasoningState('');
            setReplyingToState(null);
            setReplyModeState(null);
            await loadPost();
        } catch (error) {
            console.error('Failed to submit reply', error);
            alert('Failed to submit reply. Please ensure you are logged in.');
        } finally {
            setBoolIsSubmittingReplyState(false);
        }
    };

    const handleAnalyzeComment = async (commentId) => {
        setLoadingCommentsState(prev => ({ ...prev, [commentId]: true }));
        try {
            const data = await postAnalyzeComment(commentId);
            setObjPostState(prev => ({
                ...prev,
                comments: prev.comments.map(c => 
                    c.id === commentId ? { ...c, strAiAnalysis: data.strAiAnalysis, dictAiMetrics: data.dictAiMetrics } : c
                )
            }));
        } catch (error) {
            console.error("Failed to analyze comment", error);
        } finally {
            setLoadingCommentsState(prev => ({ ...prev, [commentId]: false }));
        }
    };

    if (boolIsLoadingState) return <div className="verisphere-loading">Analyzing arguments...</div>;
    if (!objPostState) return <div className="verisphere-empty-state">Post not found.</div>;

    // Helper function for score color
    const getScoreColor = (score) => {
        if (score === null || score === undefined) return '#30363d'; // Unanalyzed
        if (score >= 80) return '#2ea043'; // Strong
        if (score >= 50) return '#d29922'; // Flawed
        return '#f85149'; // Weak
    };

    const postMetrics = objPostState.dictAiMetrics;
    const isAnalyzed = postMetrics && postMetrics.logical_soundness !== undefined;

    return (
        <div className="verisphere-post-detail" style={{ 
            maxWidth: '1200px', 
            margin: '2rem auto', 
            padding: '3rem', 
            background: 'var(--glass-bg)', 
            borderRadius: '24px', 
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(20px)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Link to="/verisphere/feed" className="verisphere-back-link inline-block" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--v2-text-muted)', transition: 'color 0.2s' }}>
                    <span>←</span> Back
                </Link>
                <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--v2-text-muted)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                }}>
                    Dialogue Arena
                </div>
            </div>
            
            <div className="verisphere-detail-header" style={{ position: 'relative' }}>
                {isAnalyzed && (
                    <div className="verisphere-logic-matrix" style={{
                        backgroundColor: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginTop: '1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <div style={{ flex: '1', minWidth: '120px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--v2-text-muted)', display: 'block' }}>Soundness</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: getScoreColor(postMetrics.logical_soundness) }}>{postMetrics.logical_soundness}/100</span>
                        </div>
                        <div style={{ flex: '1', minWidth: '120px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--v2-text-muted)', display: 'block' }}>Relevance</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--v2-text-main)' }}>{postMetrics.relevance}</span>
                        </div>
                        <div style={{ flex: '1', minWidth: '120px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--v2-text-muted)', display: 'block' }}>Verifiable</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--v2-text-main)' }}>{postMetrics.verifiable}</span>
                        </div>
                        {postMetrics.logical_errors && postMetrics.logical_errors.length > 0 && (
                            <div style={{ width: '100%', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#f85149', display: 'block', fontWeight: 'bold' }}>⚠️ Fallacies Detected</span>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                                    {postMetrics.logical_errors.map((error, idx) => (
                                        <span key={idx} style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', color: '#ff7b72', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid rgba(248,81,73,0.3)' }}>{error}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                <h1 style={{ 
                    fontSize: 'clamp(2rem, 4vw, 3.5rem)', 
                    lineHeight: '1.2', 
                    marginBottom: '1rem', 
                    fontFamily: "'Space Grotesk', sans-serif", 
                    color: 'var(--v2-text-main)',
                    letterSpacing: '-0.02em',
                    paddingRight: '80px'
                }}>{objPostState.strTitle}</h1>
                <div className="verisphere-post-meta">
                    <span className="verisphere-community-badge">{objPostState.strCommunityName || 'General'}</span>
                    <span className="verisphere-author-badge">{objPostState.strAuthorUsername || 'user_' + objPostState.objAuthor}</span>
                </div>
                
                {objPostState.strMediaUrl && (
                    <div className="verisphere-media-container mb-2" style={{ marginTop: '1rem', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        {(objPostState.strMediaUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) || objPostState.strMediaUrl.includes('images.unsplash.com')) ? (
                            <img 
                                src={objPostState.strMediaUrl} 
                                alt="Post media" 
                                style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', display: 'block' }} 
                            />
                        ) : (
                            <iframe 
                                width="100%" 
                                src={normalizeEmbedUrl(objPostState.strMediaUrl)} 
                                title="Media player" 
                                frameBorder="0" 
                                scrolling="no"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                style={{ 
                                    display: 'block', 
                                    overflow: 'hidden',
                                    ...(objPostState.strMediaUrl.includes('instagram.com') 
                                        ? { maxWidth: '400px', margin: '0 auto', height: '600px' } 
                                        : { height: '450px' })
                                }}
                            ></iframe>
                        )}
                    </div>
                )}
                
                <p className="verisphere-detail-content">{objPostState.strContent}</p>
                
                <div className="verisphere-post-reacts-detail" style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    flexWrap: 'wrap',
                    marginTop: '1.5rem',
                    marginBottom: '1rem',
                    position: 'relative'
                }}>
                    {topReactions.map(([emoji, count]) => (
                        <button 
                            key={emoji} 
                            onClick={() => handleReact(emoji)}
                            style={{
                                background: userReacted[emoji] ? 'rgba(88, 166, 255, 0.15)' : 'var(--glass-bg)',
                                border: userReacted[emoji] ? '1px solid #58a6ff' : '1px solid var(--glass-border)',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                padding: '4px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: userReacted[emoji] ? '#58a6ff' : 'var(--v2-text-muted)',
                                transition: 'all 0.2s',
                                fontWeight: 'bold'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{emoji}</span> <span>{count}</span>
                        </button>
                    ))}
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }}
                        style={{
                            background: 'transparent',
                            border: '1px dashed var(--glass-border)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            padding: '4px 12px',
                            color: 'var(--v2-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        {showPicker ? '- React' : '+ React'}
                    </button>

                    {showPicker && (
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className="verisphere-emoji-picker-grid"
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '0',
                                marginBottom: '8px',
                                backgroundColor: 'var(--glass-bg)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                zIndex: 10,
                                minWidth: '180px'
                            }}
                        >
                            {topReactions.length > 0 && (
                                <>
                                    <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', color: 'var(--v2-text-muted)', marginBottom: '4px', textAlign: 'left' }}>Top in post</div>
                                    {topReactions.slice(0, 4).map(([emoji]) => (
                                        <button
                                            key={`top-${emoji}`}
                                            onClick={() => handleReact(emoji)}
                                            style={{
                                                background: userReacted[emoji] ? 'rgba(88, 166, 255, 0.2)' : 'transparent',
                                                border: 'none',
                                                fontSize: '1.5rem',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                borderRadius: '8px'
                                            }}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                    <div style={{ gridColumn: '1 / -1', height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />
                                </>
                            )}
                            {extendedEmojis.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReact(emoji)}
                                    style={{
                                        background: userReacted[emoji] ? 'rgba(88, 166, 255, 0.2)' : 'transparent',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '8px'
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    alert('Unlock custom emojis for 5 Diamonds! Support creators by unlocking a unique reaction.');
                                    setShowPicker(false);
                                }}
                                style={{
                                    gridColumn: '1 / -1',
                                    background: 'linear-gradient(135deg, #d29922, #e3b341)',
                                    color: '#161b22',
                                    border: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    marginTop: '4px'
                                }}
                            >
                                Custom Emoji
                            </button>
                        </div>
                    )}
                </div>
                
                {objPostState.strReferences && (
                    <div className="verisphere-reasoning-box" style={{ backgroundColor: 'rgba(46, 160, 67, 0.05)', borderLeftColor: '#2ea043', marginTop: '1rem', marginBottom: '1rem' }}>
                        <h4><span className="icon">📚</span> Topic Citations & Sources</h4>
                        <p className="reasoning-text">{objPostState.strReferences}</p>
                    </div>
                )}
                
                <div className="verisphere-community-sources" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '8px', backgroundColor: 'var(--glass-bg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="icon">📚</span> Community Sources ({objPostState.sources ? objPostState.sources.length : 0})
                        </h4>
                        <button 
                            onClick={() => setBoolIsAddingSourceState(!boolIsAddingSourceState)}
                            className="verisphere-btn-outline"
                            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                        >
                            {boolIsAddingSourceState ? 'Cancel' : '+ Suggest Source'}
                        </button>
                    </div>

                    {boolIsAddingSourceState && (
                        <form onSubmit={handleSourceSubmit} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--glass-bg)', borderRadius: '6px' }}>
                            <input 
                                type="url" 
                                placeholder="https://..." 
                                value={strNewSourceUrlState}
                                onChange={(e) => setStrNewSourceUrlState(e.target.value)}
                                required
                                className="verisphere-textarea"
                                style={{ height: 'auto', padding: '8px', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                            />
                            <textarea 
                                placeholder="Briefly describe what this source proves or refutes..." 
                                value={strNewSourceDescState}
                                onChange={(e) => setStrNewSourceDescState(e.target.value)}
                                className="verisphere-textarea"
                                style={{ height: '60px', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                            />
                            <button type="submit" disabled={boolIsSubmittingSourceState} className="verisphere-btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                                {boolIsSubmittingSourceState ? 'Submitting...' : 'Submit Source'}
                            </button>
                        </form>
                    )}

                    {objPostState.sources && objPostState.sources.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {objPostState.sources.map(source => (
                                <div key={source.id} style={{ padding: '0.8rem', backgroundColor: 'var(--glass-bg)', borderRadius: '6px', borderLeft: '3px solid #58a6ff' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{source.strDescription}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--v2-text-muted)' }}>
                                        <a href={source.strUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#58a6ff', textDecoration: 'none', wordBreak: 'break-all' }}>
                                            🔗 {source.strUrl.length > 50 ? source.strUrl.substring(0, 50) + '...' : source.strUrl}
                                        </a>
                                        <span>Added by {source.strAuthorUsername || 'user_' + source.objAuthor}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--v2-text-muted)', fontStyle: 'italic', margin: 0 }}>No community sources submitted yet.</p>
                    )}
                </div>
                
                <div className="verisphere-context-guardrail" style={{ marginTop: '2rem' }}>
                    <div className="verisphere-ai-box" style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h4 style={{ margin: 0, color: 'var(--v2-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="icon" style={{ fontSize: '1.2rem' }}>🛡️</span> Context Guardrails
                            </h4>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button className="verisphere-btn-outline" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Discuss Contexts</button>
                                <button className="verisphere-btn-primary" style={{ fontSize: '0.85rem', padding: '6px 14px', background: 'linear-gradient(135deg, #d29922, #e3b341)', color: '#161b22', border: 'none', fontWeight: 'bold' }}>✨ Paid Analysis</button>
                            </div>
                        </div>
                        <p style={{ color: 'var(--v2-text-main)', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>
                            {objPostState.strAiContextGuardrail || "This discussion operates within objectively verified context parameters. Factual baseline and historical precedents are being actively monitored to prevent conversational drift and fallacious premises."}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="verisphere-comments-section" style={{ marginTop: '3rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>Rational Dialogues ({objPostState.comments?.length || 0})</h3>
                
                {objPostState.comments?.length === 0 ? (
                    <p className="verisphere-empty-comments">No arguments presented yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {objPostState.comments.map(objComment => (
                        <CommentThread 
                            key={objComment.id} 
                            comment={objComment}
                            level={0}
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

                <div className="verisphere-add-comment">
                    <h4>Contribute to the Dialogue</h4>
                    <form onSubmit={handleCommentSubmit} className="verisphere-comment-form">
                        <textarea 
                            placeholder="Disagree and support with grace." 
                            value={strNewCommentState}
                            onChange={(e) => setStrNewCommentState(e.target.value)}
                            required
                            className="verisphere-textarea"
                        />
                        <div className="verisphere-form-actions">
                            {!boolIsLoggedInState ? (
                                <p className="verisphere-login-warning">Please use the main site navigation to log in before participating.</p>
                            ) : (
                                <button 
                                    type="submit" 
                                    disabled={boolIsSubmittingState} 
                                    className="verisphere-btn-outline"
                                    style={{
                                        background: 'rgba(128, 128, 128, 0.15)',
                                        color: 'var(--v2-text-main)',
                                        borderColor: 'var(--glass-border)',
                                        padding: '8px 20px',
                                        fontSize: '0.9rem',
                                        marginLeft: '16px'
                                    }}
                                >
                                    {boolIsSubmittingState ? 'Submitting...' : 'Submit Argument'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PostDetailPage;

