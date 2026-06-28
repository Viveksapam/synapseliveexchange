import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPostReactions, postToggleReaction, postToggleFeatured } from '../api/verisphereApi';

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

function PostCard({ objPost, authHook }) {
    const navigate = useNavigate();
    const metrics = objPost.dictAiMetrics;
    const isAnalyzed = metrics && metrics.logical_soundness !== undefined;
    
    const { objUserState, strTokenState } = authHook || {};
    const isAdmin = objUserState && (objUserState.is_superuser || objUserState.is_staff);
    
    const [boolIsFeaturedState, setBoolIsFeaturedState] = useState(objPost.boolIsFeatured);

    // Generate some mock initial reactions based on the post ID to make them varied
    const initialReactions = {};
    if (objPost.id === 1004 || objPost.id === 'blog_1004') {
        initialReactions['❤️'] = 45;
        initialReactions['👽'] = 12;
        initialReactions['😂'] = 95;
        initialReactions['🤗'] = 18;
        initialReactions['👏'] = 27;
    } else if (objPost.id === 1002 || objPost.id === 'blog_1002') {
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
            const data = await fetchPostReactions(objPost.id);
            const combined = { ...initialReactions };
            for (const [emoji, count] of Object.entries(data.reactions)) {
                combined[emoji] = (combined[emoji] || 0) + count;
            }
            setReactions(combined);
            setUserReacted(data.user_reacted);
        };
        loadReactions();
    }, [objPost.id]);

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

    const handleReact = async (e, emoji) => {
        e.stopPropagation();
        
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
        const res = await postToggleReaction(objPost.id, emoji);
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

    // Function to get color based on verifiability
    const getVerifiableColor = (verifiable) => {
        if (!isAnalyzed || !verifiable) return '#30363d';
        const v = verifiable.toLowerCase();
        if (v === 'yes') return '#2ea043';
        if (v === 'partial') return '#d29922';
        if (v === 'no') return '#f85149';
        return '#8b949e'; // Opinion or Unknown
    };

    const scoreColor = getVerifiableColor(isAnalyzed ? metrics.verifiable : null);

    const handleCardClick = (e) => {
        if (e.target.closest('a') || e.target.closest('button') || e.target.closest('iframe')) {
            return;
        }
        navigate(`/verisphere/post/${objPost.id}`);
    };

    const handleToggleFeatured = async (e) => {
        e.stopPropagation();
        if (!isAdmin) return;
        
        const success = await postToggleFeatured(objPost.id, boolIsFeaturedState, strTokenState);
        if (success) {
            setBoolIsFeaturedState(!boolIsFeaturedState);
            alert(boolIsFeaturedState ? "Post removed from featured list." : "Post featured successfully!");
        } else {
            alert("Failed to toggle featured status. Please check your permissions.");
        }
    };

    return (
        <div className="verisphere-post-card" onClick={handleCardClick} style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
            <div className="vs-post-votes" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'flex-start',
                paddingTop: '0.5rem',
                gap: '1rem',
                minWidth: '70px'
            }}>
                {/* Engagement Points (Views) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} title="Engagement (Views)">
                    <span className="verisphere-vote-count" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{objPost.numUpvotes}</span>
                    <span className="verisphere-vote-label" style={{fontSize: '0.65rem', color: 'var(--v2-text-muted)', display: 'block', textAlign: 'center', marginTop: '2px'}}>Engagement</span>
                </div>

                {/* AI Verifiability Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', width: '100%' }}>
                    <div 
                        className="ai-score-badge" 
                        style={{
                            width: 'auto',
                            minWidth: '40px',
                            height: '40px',
                            padding: '0 8px',
                            borderRadius: '4px',
                            border: `1px solid ${scoreColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            color: isAnalyzed ? 'var(--v2-text-main)' : 'var(--v2-text-muted)',
                            backgroundColor: isAnalyzed ? `${scoreColor}20` : 'var(--glass-bg)',
                        }}
                        title={isAnalyzed ? `Verifiable: ${metrics.verifiable}` : "Unanalyzed"}
                    >
                        {isAnalyzed ? (metrics.verifiable ? metrics.verifiable.toUpperCase() : '?') : '?'}
                    </div>
                    <span style={{fontSize: '0.65rem', color: 'var(--v2-text-muted)', display: 'block', textAlign: 'center', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px'}}>Verifiable</span>
                </div>
            </div>
            <div className="verisphere-post-content">
                <div className="verisphere-post-meta">
                    <Link to={`/verisphere/community/${objPost.objCommunity || 'general'}`} className="verisphere-community-badge">{objPost.strCommunityName || 'General'}</Link>
                    <span className="verisphere-author-badge">Posted by {objPost.strAuthorUsername || 'user_' + objPost.objAuthor}</span>
                    <span className="verisphere-date">{new Date(objPost.created_at).toLocaleDateString()}</span>
                    {isAdmin && (
                        <button 
                            onClick={handleToggleFeatured} 
                            style={{ 
                                marginLeft: 'auto', 
                                background: boolIsFeaturedState ? '#d29922' : 'transparent',
                                color: boolIsFeaturedState ? '#161b22' : 'var(--v2-text-muted)',
                                border: `1px solid ${boolIsFeaturedState ? '#d29922' : 'var(--glass-border)'}`,
                                borderRadius: '12px',
                                padding: '2px 8px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {boolIsFeaturedState ? '⭐ Featured' : '☆ Feature'}
                        </button>
                    )}
                </div>
                <Link to={`/verisphere/post/${objPost.id}`} className="verisphere-post-title-link">
                    <h3 className="verisphere-post-title">{objPost.strTitle}</h3>
                </Link>
                
                {objPost.strMediaUrl && (
                    <div className="verisphere-media-container mb-2" style={{ marginTop: '1rem', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        {(objPost.strMediaUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) || objPost.strMediaUrl.includes('images.unsplash.com')) ? (
                            <img 
                                src={objPost.strMediaUrl} 
                                alt="Post media" 
                                style={{ width: '100%', maxHeight: '315px', objectFit: 'cover', display: 'block' }} 
                            />
                        ) : (
                            <iframe 
                                width="100%" 
                                src={normalizeEmbedUrl(objPost.strMediaUrl)} 
                                title="Media player" 
                                frameBorder="0" 
                                scrolling="no"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                style={{ 
                                    display: 'block', 
                                    overflow: 'hidden',
                                    ...(objPost.strMediaUrl.includes('instagram.com') 
                                        ? { maxWidth: '380px', margin: '0 auto', height: '550px' } 
                                        : { height: '350px' })
                                }}
                            ></iframe>
                        )}
                    </div>
                )}
                
                <p className="verisphere-post-preview">
                    {objPost.strContent.length > 200 
                        ? objPost.strContent.substring(0, 200) + '...' 
                        : objPost.strContent}
                </p>
                <div className="vs-post-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', position: 'relative' }}>
                    <div className="verisphere-reacts" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {topReactions.slice(0, 4).map(([emoji, count]) => (
                            <button
                                key={emoji}
                                onClick={(e) => handleReact(e, emoji)}
                                style={{
                                    background: userReacted[emoji] ? 'rgba(88, 166, 255, 0.15)' : 'var(--glass-bg)',
                                    border: userReacted[emoji] ? '1px solid #58a6ff' : '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    padding: '2px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: userReacted[emoji] ? '#58a6ff' : 'var(--v2-text-muted)',
                                    transition: 'all 0.2s',
                                    fontWeight: 'bold'
                                }}
                            >
                                <span>{emoji}</span> <span>{count}</span>
                            </button>
                        ))}

                        <button
                            onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }}
                            style={{
                                background: 'transparent',
                                border: '1px dashed var(--glass-border)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                padding: '2px 8px',
                                color: 'var(--v2-text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            {showPicker ? '-' : '+'}
                        </button>
                    </div>

                    {showPicker && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="verisphere-emoji-picker-grid"
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '0',
                                marginBottom: '8px',
                                background: 'var(--glass-bg)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                zIndex: 10,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                minWidth: '160px'
                            }}
                        >
                            {topReactions.length > 0 && (
                                <>
                                    <div style={{ gridColumn: '1 / -1', fontSize: '0.75rem', color: 'var(--v2-text-muted)', marginBottom: '2px', textAlign: 'left', paddingLeft: '4px' }}>Top in post</div>
                                    {topReactions.slice(0, 4).map(([emoji]) => (
                                        <button
                                            key={`top-${emoji}`}
                                            onClick={(e) => handleReact(e, emoji)}
                                            style={{
                                                background: userReacted[emoji] ? 'rgba(88, 166, 255, 0.2)' : 'transparent',
                                                border: 'none',
                                                fontSize: '1.2rem',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                borderRadius: '4px'
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
                                    onClick={(e) => handleReact(e, emoji)}
                                    style={{
                                        background: userReacted[emoji] ? 'rgba(88, 166, 255, 0.2)' : 'transparent',
                                        border: 'none',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px'
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    alert('Unlock custom emojis for 5 Diamonds! Support creators by unlocking a unique reaction.');
                                    setShowPicker(false);
                                }}
                                style={{
                                    gridColumn: '1 / -1',
                                    background: 'linear-gradient(135deg, #d29922, #e3b341)',
                                    color: '#161b22',
                                    border: 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    padding: '6px',
                                    borderRadius: '8px',
                                    marginTop: '4px'
                                }}
                            >
                                Custom Emoji
                            </button>
                        </div>
                    )}

                    {/* Enter Dialogue — pushed to the right of reactions */}
                    <Link
                        to={`/verisphere/post/${objPost.id}`}
                        className="verisphere-action-link"
                        style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
                    >
                        Enter Dialogue ({objPost.comments_count || 0})
                    </Link>
                </div>

                {/* Sources row — always on its own line below */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--v2-text-muted)', whiteSpace: 'nowrap' }}>
                        📚 {objPost.sources ? objPost.sources.length : 0} Sources
                    </span>
                    <Link
                        to={`/verisphere/post/${objPost.id}`}
                        className="verisphere-btn-outline"
                        style={{ padding: '2px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
                        + Add Source
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PostCard;

