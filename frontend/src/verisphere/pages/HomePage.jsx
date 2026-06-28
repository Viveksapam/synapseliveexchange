import React, { useEffect, useState } from 'react';
import { fetchPosts } from '../api/verisphereApi';
import PostCard from '../components/PostCard';
import CommunityList from '../components/CommunityList';
import CreatePostForm from '../components/CreatePostForm';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import '../styles/VeriSphere.css';

function HomePage({ authHook }) {
    const [arrPostsState, setArrPostsState] = useState([]);
    const [boolIsLoadingState, setBoolIsLoadingState] = useState(true);
    const { trackEvent } = useActivityTracker();

    const loadPosts = async () => {
        try {
            const data = await fetchPosts();
            setArrPostsState(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setBoolIsLoadingState(false);
        }
    };

    useEffect(() => {
        loadPosts();
        trackEvent('verisphere_home_view');
    }, []);

    if (boolIsLoadingState) return (
        <div className="verisphere-loading">
            Loading truths…
        </div>
    );

    return (
        <div className="verisphere-home">
            {/* ── Main feed layout ── */}
            <div className="verisphere-layout-grid" style={{ paddingTop: '20px' }}>
                <div className="verisphere-main-content">
                    {/* Header */}
                    <div style={{ padding: '0 0 20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '24px' }}>
                        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.8rem', margin: '0 0 4px 0', color: 'var(--v2-text-main)' }}>The Sphere</h2>
                        <p style={{ color: 'var(--v2-text-muted)', margin: 0, fontSize: '0.9rem' }}>The rational public square for verified truths.</p>
                    </div>
                    <CreatePostForm onPostCreated={loadPosts} />

                    {arrPostsState.length === 0 ? (
                        <div className="verisphere-empty-state">
                            <p>No posts yet. Be the first to start a rational discussion!</p>
                        </div>
                    ) : (
                        <div className="verisphere-post-list">
                            {arrPostsState.map(objPost => (
                                <PostCard
                                    key={objPost.id}
                                    objPost={objPost}
                                    authHook={authHook}
                                    onView={() => trackEvent('post_view', { post_id: objPost.id, title: objPost.title })}
                                />
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

export default HomePage;

