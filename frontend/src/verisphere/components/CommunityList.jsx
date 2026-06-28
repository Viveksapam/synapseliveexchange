import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCommunities } from '../api/verisphereApi';

import CreateCommunityForm from './CreateCommunityForm';

function CommunityList() {
    const [arrCommunitiesState, setArrCommunitiesState] = useState([]);
    const [boolIsLoadingState, setBoolIsLoadingState] = useState(true);

    const loadCommunities = async () => {
        try {
            const data = await fetchCommunities();
            setArrCommunitiesState(data);
        } catch (error) {
            console.error("Error fetching communities:", error);
        } finally {
            setBoolIsLoadingState(false);
        }
    };

    useEffect(() => {
        loadCommunities();
    }, []);

    if (boolIsLoadingState) return <div className="verisphere-sidebar-box">Loading forums...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="verisphere-sidebar-box" style={{ background: 'var(--glass-bg)', padding: '0', overflow: 'hidden' }}>
                <h3 style={{ padding: '20px 20px 10px', fontSize: '1.2rem', margin: 0, borderBottom: '1px solid var(--glass-border)' }}>Discover Communities</h3>
                {arrCommunitiesState.length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--v2-text-muted)' }}>No communities yet.</p>
                ) : (
                    <ul className="verisphere-community-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        {arrCommunitiesState.map(community => (
                            <li key={community.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <Link 
                                    to={`/verisphere/community/${community.id}`} 
                                    className="community-link"
                                    style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        padding: '16px 20px', 
                                        color: 'var(--v2-text-main)', 
                                        textDecoration: 'none',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>{community.strName}</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--v2-text-muted)' }}>
                                        {community.strDescription || `${community.member_count} members`}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <div className="verisphere-sidebar-box" style={{ background: 'var(--glass-bg)' }}>
                <h3 style={{ fontSize: '1.2rem', marginTop: 0 }}>Start a Community</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--v2-text-muted)', marginBottom: '16px' }}>Can't find what you're looking for? Create a new space for rational discussion.</p>
                <CreateCommunityForm onCommunityCreated={loadCommunities} />
            </div>
        </div>
    );
}

export default CommunityList;

