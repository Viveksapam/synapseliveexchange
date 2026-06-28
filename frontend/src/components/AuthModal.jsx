import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { verifyEmail } from '../api/userApi';
import './AuthModal.css';

const AuthModal = ({ onClose, useAuthHook }) => {
  const { handleLogin, handleRegister } = useAuthHook;
  const [viewState, setViewState] = useState('login'); // 'login', 'register', 'verify'
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (viewState === 'login') {
        await handleLogin(username, password);
        onClose();
      } else if (viewState === 'register') {
        await handleRegister({ username, email, password });
        // Automatically login after successful registration
        await handleLogin(username, password);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (viewState === 'login') return 'Welcome Back';
    if (viewState === 'register') return 'Create Account';
    return 'Verify Email';
  };

  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    if (viewState === 'login') return 'Login';
    if (viewState === 'register') return 'Register';
    return 'Verify Code';
  };

  return createPortal(
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}><X size={24} /></button>
        <h2>{getTitle()}</h2>
        
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-error" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>{success}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {viewState !== 'verify' && (
            <input 
              type="text" 
              name="username"
              id="username"
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          )}
          {viewState === 'register' && (
            <input 
              type="email" 
              name="email"
              id="email"
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          )}
          {viewState !== 'verify' && (
            <input 
              type="password" 
              name="password"
              id="password"
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          )}
          {viewState === 'verify' && (
            <input 
              type="text" 
              name="otp"
              id="otp"
              placeholder="6-Digit Code" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required 
              maxLength={6}
              style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '20px' }}
            />
          )}
          <button type="submit" disabled={isLoading}>
            {getButtonText()}
          </button>
        </form>
        
        {viewState !== 'verify' && (
          <p className="auth-toggle" onClick={() => {
            setViewState(viewState === 'login' ? 'register' : 'login');
            setError('');
            setSuccess('');
          }}>
            {viewState === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;

