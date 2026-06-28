import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchPosts } from '../api/verisphereApi';
import { updateUserProfile } from '../api/userApi';
import PostCard from '../components/PostCard';
import '../styles/VeriSphere.css';

// Helper to format ISO dates safely
const formatDate = (iso) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return isNaN(d) ? 'N/A' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

function ProfilePage({ authHook }) {
  const { objUserState, setObjUserState, boolIsLoggedInState, strTokenState } = authHook || useAuth();
  const [arrUserPosts, setArrUserPosts]       = useState([]);
  const [boolIsLoadingPosts, setBoolIsLoadingPosts] = useState(true);
  const [boolIsEditing, setBoolIsEditing]     = useState(false);
  const [boolIsSaving, setBoolIsSaving]       = useState(false);
  const [objEditForm, setObjEditForm]         = useState({ first_name: '', last_name: '', strBio: '', strProfilePicUrl: '' });
  const TABS = ['Overview', 'Activity', 'Settings'];
  const [activeTab, setActiveTab]             = useState(TABS[0]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (objUserState) {
      setObjEditForm({
        first_name:       objUserState.first_name       || '',
        last_name:        objUserState.last_name        || '',
        strBio:           objUserState.strBio           || '',
        strProfilePicUrl: objUserState.strProfilePicUrl || '',
      });
    }
  }, [objUserState]);

  useEffect(() => {
    const load = async () => {
      if (!objUserState) { setBoolIsLoadingPosts(false); return; }
      try {
        const posts = await fetchPosts();
        setArrUserPosts(posts.filter(p => p.strAuthorUsername === objUserState.username));
      } catch (e) {
        console.error('Failed to fetch user posts', e);
      } finally {
        setBoolIsLoadingPosts(false);
      }
    };
    load();
  }, [objUserState]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image too large – max 2 MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setObjEditForm(prev => ({ ...prev, strProfilePicUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setBoolIsSaving(true);
    try {
      const updated = await updateUserProfile(objEditForm, strTokenState);
      setObjUserState(updated);
      setBoolIsEditing(false);
    } catch (e) {
      console.error('Profile update failed', e);
      alert('Could not save profile – please try again');
    } finally {
      setBoolIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setBoolIsEditing(false);
    setObjEditForm({
      first_name:       objUserState.first_name       || '',
      last_name:        objUserState.last_name        || '',
      strBio:           objUserState.strBio           || '',
      strProfilePicUrl: objUserState.strProfilePicUrl || '',
    });
  };

  if (!boolIsLoggedInState || !objUserState) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--v2-text-main)' }}>
        <h2 style={{ margin: '0 0 12px' }}>Access Denied</h2>
        <p style={{ color: 'var(--v2-text-muted)', margin: 0 }}>Please log in to view your profile.</p>
      </div>
    );
  }

  const avatarUrl = boolIsEditing ? objEditForm.strProfilePicUrl : objUserState.strProfilePicUrl;
  const displayName = (objUserState.first_name || objUserState.last_name)
    ? `${objUserState.first_name || ''} ${objUserState.last_name || ''}`.trim()
    : objUserState.username;
  const role = objUserState.is_superuser ? 'Admin' : (objUserState.is_staff ? 'Staff' : 'User');

  // ─── Shared style tokens ───────────────────────────────────────────────────
  const card = {
    background:          'var(--glass-bg)',
    border:              '1px solid var(--glass-border)',
    borderRadius:        '12px',
    padding:             '20px 24px',
  };

  const labelStyle = {
    fontSize:      '0.75rem',
    fontWeight:    600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color:         'var(--v2-text-muted)',
    marginBottom:  '12px',
  };

  const inputStyle = {
    flex:        1,
    background:  'var(--glass-bg)',
    border:      '1px solid var(--glass-border)',
    color:       'var(--v2-text-main)',
    borderRadius:'8px',
    padding:     '8px 12px',
    fontFamily:  'inherit',
    fontSize:    '0.95rem',
    outline:     'none',
  };

  const btnBase = {
    padding:     '7px 16px',
    borderRadius:'8px',
    fontFamily:  'inherit',
    fontSize:    '0.82rem',
    fontWeight:  500,
    cursor:      'pointer',
    transition:  'opacity 0.15s',
  };

  // ─── Banner ────────────────────────────────────────────────────────────────
  const renderBanner = () => (
    <div
      className="vs-profile-banner"
      style={{
        borderBottom: '1px solid var(--glass-border)',
        padding:      '24px 36px',
        display:      'flex',
        alignItems:   'center',
        gap:          '20px',
        position:     'relative',
      }}
      aria-label="Profile banner"
    >
      {/* Action buttons */}
      <div style={{ position: 'absolute', top: '20px', right: '28px', display: 'flex', gap: '8px' }}>
        {boolIsEditing ? (
          <>
            <button
              onClick={cancelEdit}
              style={{ ...btnBase, border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--v2-text-muted)' }}
              aria-label="Cancel edit"
            >Cancel</button>
            <button
              onClick={handleSaveProfile}
              disabled={boolIsSaving}
              style={{ ...btnBase, border: 'none', background: 'var(--v2-text-main)', color: 'var(--v2-bg, #0f172a)' }}
              aria-label="Save profile"
            >{boolIsSaving ? 'Saving…' : 'Save'}</button>
          </>
        ) : (
          <button
            onClick={() => setBoolIsEditing(true)}
            style={{ ...btnBase, border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--v2-text-main)' }}
            aria-label="Edit profile"
          >Edit Profile</button>
        )}
      </div>

      {/* Avatar */}
      <div
        onClick={() => boolIsEditing && fileInputRef.current?.click()}
        style={{
          width:       '64px',
          height:      '64px',
          borderRadius:'10px',
          flexShrink:  0,
          background:  avatarUrl ? `url(${avatarUrl}) center/cover` : 'var(--glass-border)',
          border:      '1px solid var(--glass-border)',
          display:     'flex',
          alignItems:  'center',
          justifyContent: 'center',
          fontSize:    '26px',
          fontWeight:  600,
          color:       'var(--v2-text-muted)',
          cursor:      boolIsEditing ? 'pointer' : 'default',
          position:    'relative',
          userSelect:  'none',
        }}
        aria-label="User avatar"
      >
        {!avatarUrl && objUserState.username.charAt(0).toUpperCase()}
        {boolIsEditing && (
          <div style={{ position:'absolute', inset:0, borderRadius:'10px', background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'#fff', letterSpacing:'0.06em' }}>
            UPLOAD
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} aria-label="Upload profile picture" />

      {/* Text info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {boolIsEditing ? (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
            <input type="text" value={objEditForm.first_name} placeholder="First name"
              onChange={e => setObjEditForm({ ...objEditForm, first_name: e.target.value })}
              style={inputStyle} aria-label="First name" />
            <input type="text" value={objEditForm.last_name} placeholder="Last name"
              onChange={e => setObjEditForm({ ...objEditForm, last_name: e.target.value })}
              style={inputStyle} aria-label="Last name" />
          </div>
        ) : (
          <h2 style={{ margin: '0 0 3px', fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif", color: 'var(--v2-text-main)', fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} aria-label="User full name">
            {displayName}
          </h2>
        )}

        <p style={{ margin: '0 0 8px', color: 'var(--v2-text-muted)', fontSize: '0.82rem' }} aria-label="Username">
          @{objUserState.username}
        </p>

        {/* Role + joined — always on one row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
          <span
            style={{
              display:     'inline-block',
              padding:     '2px 8px',
              borderRadius:'6px',
              border:      '1px solid var(--glass-border)',
              background:  'var(--glass-bg)',
              color:       'var(--v2-text-muted)',
              fontSize:    '0.75rem',
              fontWeight:  600,
              letterSpacing:'0.05em',
              whiteSpace:  'nowrap',
            }}
            aria-label="User role"
          >{role}</span>
          <span style={{ color: 'var(--v2-text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }} aria-label="Join date">
            Joined {formatDate(objUserState.date_joined)}
          </span>
        </div>
      </div>
    </div>
  );

  // ─── Tab bar ───────────────────────────────────────────────────────────────
  const renderTabBar = () => (
    <div
      className="vs-profile-tabs"
      style={{ display: 'flex', padding: '0 36px', borderBottom: '1px solid var(--glass-border)' }}
      aria-label="Profile page tabs"
    >
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          aria-pressed={activeTab === tab}
          style={{
            padding:      '12px 18px',
            border:       'none',
            borderBottom: activeTab === tab ? '2px solid var(--v2-text-main)' : '2px solid transparent',
            background:   'transparent',
            color:        activeTab === tab ? 'var(--v2-text-main)' : 'var(--v2-text-muted)',
            fontFamily:   "'Space Grotesk', sans-serif",
            fontSize:     '0.85rem',
            fontWeight:   activeTab === tab ? 600 : 400,
            cursor:       'pointer',
            transition:   'color 0.15s, border-color 0.15s',
          }}
        >{tab}</button>
      ))}
    </div>
  );

  // ─── Overview ──────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="vs-profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '20px' }} aria-label="Overview tab content">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Bio */}
        <div style={card} aria-label="About me card">
          <p style={{ ...labelStyle, margin: '0 0 12px' }}>About Me</p>
          {boolIsEditing ? (
            <textarea
              value={objEditForm.strBio}
              onChange={e => setObjEditForm({ ...objEditForm, strBio: e.target.value })}
              placeholder="Tell the community about your expertise…"
              style={{ ...inputStyle, width: '100%', minHeight: '90px', resize: 'vertical', boxSizing: 'border-box', flex: 'none' }}
              aria-label="Bio textarea"
            />
          ) : (
            <p style={{ color: 'var(--v2-text-muted)', lineHeight: '1.6', margin: 0, fontSize: '0.9rem' }} aria-label="User biography">
              {objUserState.strBio || 'No biography provided yet.'}
            </p>
          )}
        </div>

        {/* Account details */}
        <div style={card} aria-label="Account details">
          <p style={{ ...labelStyle, margin: '0 0 12px' }}>Account Details</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
            <span style={{ color: 'var(--v2-text-muted)', fontSize: '0.88rem' }}>Email</span>
            <span style={{ color: 'var(--v2-text-main)', fontSize: '0.88rem' }}>{objUserState.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <span style={{ color: 'var(--v2-text-muted)', fontSize: '0.88rem' }}>Status</span>
            <span style={{ color: 'var(--v2-text-main)', fontSize: '0.88rem', fontWeight: 600 }}>
              {objUserState.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div>
        <div style={card} aria-label="Statistics card">
          <p style={{ ...labelStyle, margin: '0 0 12px' }}>Statistics</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--v2-text-muted)', fontSize: '0.88rem' }}>Posts</span>
            <span style={{ color: 'var(--v2-text-main)', fontSize: '1.1rem', fontWeight: 700 }}>
              {boolIsLoadingPosts ? '—' : arrUserPosts.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Activity ──────────────────────────────────────────────────────────────
  const renderActivity = () => (
    <div className="vs-profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '20px' }} aria-label="Activity tab content">
      <div>
        <p style={{ ...labelStyle, margin: '0 0 16px' }}>Your Posts</p>
        {boolIsLoadingPosts ? (
          <div className="verisphere-empty-state">Loading…</div>
        ) : arrUserPosts.length === 0 ? (
          <div className="verisphere-empty-state">
            <p>You haven't posted anything yet.</p>
          </div>
        ) : (
          <div className="verisphere-post-list">
            {arrUserPosts.map(p => <PostCard key={p.id} objPost={p} />)}
          </div>
        )}
      </div>
      <div>
        <div style={card} aria-label="Activity stats">
          <p style={{ ...labelStyle, margin: '0 0 12px' }}>Statistics</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--v2-text-muted)', fontSize: '0.88rem' }}>Total Posts</span>
            <span style={{ color: 'var(--v2-text-main)', fontSize: '1.1rem', fontWeight: 700 }}>
              {boolIsLoadingPosts ? '—' : arrUserPosts.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Settings ──────────────────────────────────────────────────────────────
  const renderSettings = () => (
    <div style={card} aria-label="Settings tab content">
      <p style={{ ...labelStyle, margin: '0 0 12px' }}>Account Settings</p>
      <p style={{ color: 'var(--v2-text-muted)', lineHeight: '1.6', margin: 0, fontSize: '0.9rem' }}>
        Password change, two‑factor authentication, and notification preferences coming soon.
      </p>
    </div>
  );

  // ─── Root ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ color: 'var(--v2-text-main)', fontFamily: "'Inter', sans-serif" }}>
      {renderBanner()}
      {renderTabBar()}
      <div className="vs-profile-content" style={{ padding: '24px 36px', maxWidth: '960px' }}>
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Activity' && renderActivity()}
        {activeTab === 'Settings' && renderSettings()}
      </div>
    </div>
  );
}

export default ProfilePage;
