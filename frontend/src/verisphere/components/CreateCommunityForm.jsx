import React, { useState } from 'react';
import { postCreateCommunity } from '../api/verisphereApi';
import { useAuth } from '../../hooks/useAuth';

function CreateCommunityForm({ onCommunityCreated }) {
    const { boolIsLoggedInState, strTokenState } = useAuth();
    
    const [strNameState, setStrNameState] = useState('');
    const [strDescriptionState, setStrDescriptionState] = useState('');
    const [boolIsSubmittingState, setBoolIsSubmittingState] = useState(false);
    const [boolIsExpandedState, setBoolIsExpandedState] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!boolIsLoggedInState || !strNameState.trim()) return;
        
        setBoolIsSubmittingState(true);
        try {
            await postCreateCommunity({
                strName: strNameState.toLowerCase().replace(/\s+/g, '-'),
                strDescription: strDescriptionState
            }, strTokenState);
            
            setStrNameState('');
            setStrDescriptionState('');
            setBoolIsExpandedState(false);
            
            if (onCommunityCreated) {
                onCommunityCreated();
            }
        } catch (error) {
            console.error("Failed to create community", error);
            alert("Failed to create forum. Ensure you are logged in and the name is unique.");
        } finally {
            setBoolIsSubmittingState(false);
        }
    };

    if (!boolIsLoggedInState) return null;

    return (
        <div className="verisphere-community-card" style={{ marginTop: '1rem', border: '1px dashed rgba(88, 166, 255, 0.4)' }}>
            <h3 
                onClick={() => setBoolIsExpandedState(!boolIsExpandedState)}
                style={{ cursor: 'pointer', margin: 0, fontSize: '0.9rem', color: '#58a6ff' }}
            >
                + Create New Forum
            </h3>
            
            {boolIsExpandedState && (
                <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                    <input 
                        type="text"
                        placeholder="Forum name (e.g. quantum-physics)"
                        value={strNameState}
                        onChange={(e) => setStrNameState(e.target.value)}
                        required
                        className="verisphere-textarea"
                        style={{ height: 'auto', padding: '8px', fontSize: '0.8rem', marginBottom: '0.5rem' }}
                    />
                    <textarea 
                        placeholder="Brief description..." 
                        value={strDescriptionState}
                        onChange={(e) => setStrDescriptionState(e.target.value)}
                        className="verisphere-textarea"
                        style={{ height: '60px', fontSize: '0.8rem' }}
                    />
                    <button type="submit" disabled={boolIsSubmittingState} className="verisphere-btn-primary" style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}>
                        {boolIsSubmittingState ? 'Creating...' : 'Create Forum'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default CreateCommunityForm;

