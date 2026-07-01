import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPosts, fetchCommunityDetail, postJoinCommunity } from '../api/verisphereApi';
import { useAuth } from '../../../hooks/useAuth';
import PostCard from '../components/PostCard';
import CommunityList from '../components/CommunityList';
import CreatePostForm from '../components/CreatePostForm';
import '../styles/VeriSphere.css';

function CommunityPage({ authHook }) {
    const { id } = useParams();
    const fallbackAuth = useAuth();
    const objAuthHook = authHook || fallbackAuth;
    const { boolIsLoggedInState, strTokenState } = objAuthHook;
    const [objCommunityState, setObjCommunityState] = useState(null);
    const [arrPostsState, setArrPostsState] = useState([]);
    const [boolIsLoadingState, setBoolIsLoadingState] = useState(true);
    const [boolIsJoiningState, setBoolIsJoiningState] = useState(false);

    const handleJoinToggle = async () => {
        if (!boolIsLoggedInState) return;
        setBoolIsJoiningState(true);
        try {
            await postJoinCommunity(id, strTokenState);
            await loadCommunityData();
        } catch (error) {
            console.error('Failed to join/leave community', error);
        } finally {
            setBoolIsJoiningState(false);
        }
    };

    const loadCommunityData = async () => {
        setBoolIsLoadingState(true);
        try {
            const [communityData, postsData] = await Promise.all([
                fetchCommunityDetail(id),
                fetchPosts(id)
            ]);
            setObjCommunityState(communityData);
            setArrPostsState(postsData);
        } catch (error) {
            console.error("Error fetching community data:", error);
        } finally {
            setBoolIsLoadingState(false);
        }
    };

    useEffect(() => {
        loadCommunityData();
    }, [id]);

    if (boolIsLoadingState) return <div className="verisphere-loading">Loading Communities...</div>;
    if (!objCommunityState) return <div className="verisphere-empty-state">Forum not found.</div>;

    return (
        <div className="verisphere-home">
            {/* Enhanced Community Hero Design */}
            <div 
                className="verisphere-hero" 
                style={{ 
                    borderBottom: '1px solid rgba(88, 166, 255, 0.1)',
                    background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.05) 0%, rgba(88, 166, 255, 0.02) 100%)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '48px 24px'
                }}
            >
                {/* Decorative Background Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(88, 166, 255, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    zIndex: 0
                }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--v2-accent-primary) 0%, #2b5d8f 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(88, 166, 255, 0.3)'
                    }}>
                        {objCommunityState.strName.charAt(0).toUpperCase()}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a5d2ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {objCommunityState.strName}
                        </h2>
                        <p style={{ margin: '0 0 16px 0', color: 'var(--v2-text-secondary)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.5' }}>
                            {objCommunityState.strDescription || 'A VeriSphere community dedicated to rational discourse.'}
                        </p>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--v2-text-muted)' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3fb950', display: 'inline-block' }}></span>
                                {objCommunityState.member_count || 0} truth-seekers online
                            </div>
                            
                            {boolIsLoggedInState && (
                                <button
                                    onClick={handleJoinToggle}
                                    disabled={boolIsJoiningState}
                                    className="v2-btn v2-btn-primary"
                                    style={{ 
                                        padding: '6px 16px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.85rem',
                                        background: boolIsJoiningState ? 'transparent' : 'rgba(88, 166, 255, 0.1)',
                                        border: '1px solid rgba(88, 166, 255, 0.4)',
                                        color: 'var(--v2-accent-primary)'
                                    }}
                                >
                                    {boolIsJoiningState ? 'Updating...' : 'Join Forum'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="verisphere-layout-grid">
                <div className="verisphere-main-content">
                    <CreatePostForm numCommunityId={id} onPostCreated={loadCommunityData} />
                    
                    {arrPostsState.length === 0 ? (
                        <div className="verisphere-empty-state">
                            <p>No posts in this forum yet. Be the first to start a rational discussion!</p>
                        </div>
                    ) : (
                        <div className="verisphere-post-list">
                            {arrPostsState.map(objPost => (
                                <PostCard key={objPost.id} objPost={objPost} authHook={objAuthHook} />
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="verisphere-sidebar">
                    <CommunityList />
                </div>
            </div>
        </div>
    );
}

export default CommunityPage;

