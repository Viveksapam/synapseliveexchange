import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../hooks/useAuth';
import { fetchPosts } from '../api/verisphereApi';
import { updateUserProfile } from '../../../api/userApi';
import ProfileBanner from '../components/ProfileBanner';
import ProfileOverview from '../components/ProfileOverview';
import ProfileActivity from '../components/ProfileActivity';
import { profileCardStyle, profileLabelStyle } from '../components/ProfileStyles';
import '../styles/VeriSphere.css';

const TABS = ['Overview', 'Activity', 'Settings'];
const EMPTY_FORM = { first_name: '', last_name: '', strBio: '', strProfilePicUrl: '' };

const buildForm = (user) => user ? {
  first_name: user.first_name || '',
  last_name: user.last_name || '',
  strBio: user.strBio || '',
  strProfilePicUrl: user.strProfilePicUrl || '',
} : EMPTY_FORM;

const ProfilePage = ({ authHook }) => {
  const fallbackAuth = useAuth();
  const { objUserState, setObjUserState, boolIsLoggedInState, strTokenState } = authHook || fallbackAuth;

  const [arrUserPostsState, setArrUserPostsState] = useState([]);
  const [boolIsLoadingPostsState, setBoolIsLoadingPostsState] = useState(true);
  const [boolIsEditingState, setBoolIsEditingState] = useState(false);
  const [boolIsSavingState, setBoolIsSavingState] = useState(false);
  const [objEditFormState, setObjEditFormState] = useState(EMPTY_FORM);
  const [strActiveTabState, setStrActiveTabState] = useState(TABS[0]);

  useEffect(() => {
    setObjEditFormState(buildForm(objUserState));
  }, [objUserState]);

  useEffect(() => {
    if (!objUserState) { setBoolIsLoadingPostsState(false); return; }
    fetchPosts()
      .then((arrPosts) => setArrUserPostsState(arrPosts.filter((p) => p.strAuthorUsername === objUserState.username)))
      .catch((objErr) => console.error('Failed to fetch user posts', objErr))
      .finally(() => setBoolIsLoadingPostsState(false));
  }, [objUserState]);

  const handleSaveProfile = async () => {
    setBoolIsSavingState(true);
    try {
      const objUpdated = await updateUserProfile(objEditFormState, strTokenState);
      setObjUserState(objUpdated);
      setBoolIsEditingState(false);
    } catch (objErr) {
      console.error('Profile update failed', objErr);
      alert('Could not save profile – please try again');
    } finally {
      setBoolIsSavingState(false);
    }
  };

  const handlePostCreated = () => {
    setBoolIsLoadingPostsState(true);
    fetchPosts()
      .then((arrPosts) => setArrUserPostsState(arrPosts.filter((p) => p.strAuthorUsername === objUserState.username)))
      .catch((objErr) => console.error('Failed to refresh posts', objErr))
      .finally(() => setBoolIsLoadingPostsState(false));
  };

  if (!boolIsLoggedInState || !objUserState) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--v2-text-main)' }}>
        <h2 style={{ margin: '0 0 12px' }}>Access Denied</h2>
        <p style={{ color: 'var(--v2-text-muted)', margin: 0 }}>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ color: 'var(--v2-text-main)', fontFamily: "'Inter', sans-serif" }}>
      <ProfileBanner
        user={objUserState}
        isEditing={boolIsEditingState}
        editForm={objEditFormState}
        setEditForm={setObjEditFormState}
        isSaving={boolIsSavingState}
        onSave={handleSaveProfile}
        onCancel={() => { setBoolIsEditingState(false); setObjEditFormState(buildForm(objUserState)); }}
        onStartEdit={() => setBoolIsEditingState(true)}
      />

      <div className="vs-profile-tabs" style={{ display: 'flex', padding: '0 36px', borderBottom: '1px solid var(--glass-border)' }}>
        {TABS.map((strTab) => (
          <button
            key={strTab}
            onClick={() => setStrActiveTabState(strTab)}
            style={{
              padding: '12px 18px', border: 'none',
              borderBottom: strActiveTabState === strTab ? '2px solid var(--v2-text-main)' : '2px solid transparent',
              background: 'transparent',
              color: strActiveTabState === strTab ? 'var(--v2-text-main)' : 'var(--v2-text-muted)',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.85rem',
              fontWeight: strActiveTabState === strTab ? 600 : 400,
              cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {strTab}
          </button>
        ))}
      </div>

      <div className="vs-profile-content" style={{ padding: '24px 36px', maxWidth: '960px' }}>
        {strActiveTabState === 'Overview' && (
          <ProfileOverview
            user={objUserState}
            isEditing={boolIsEditingState}
            editForm={objEditFormState}
            setEditForm={setObjEditFormState}
            postCount={arrUserPostsState.length}
            isLoadingPosts={boolIsLoadingPostsState}
          />
        )}
        {strActiveTabState === 'Activity' && (
          <ProfileActivity arrPosts={arrUserPostsState} boolIsLoading={boolIsLoadingPostsState} onPostCreated={handlePostCreated} />
        )}
        {strActiveTabState === 'Settings' && (
          <div style={profileCardStyle}>
            <p style={{ ...profileLabelStyle, margin: '0 0 12px' }}>Account Settings</p>
            <p style={{ color: 'var(--v2-text-muted)', lineHeight: '1.6', margin: 0, fontSize: '0.9rem' }}>
              Password change, two-factor authentication, and notification preferences coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

ProfilePage.propTypes = {
  authHook: PropTypes.object,
};

export default ProfilePage;
