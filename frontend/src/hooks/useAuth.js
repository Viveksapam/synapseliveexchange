import { useState, useEffect } from 'react';
import { loginUser, registerUser, fetchUserProfile } from '../api/userApi';

export const useAuth = () => {
  const [strTokenState, setStrTokenState] = useState(() => localStorage.getItem('access_token'));
  const [boolIsLoggedInState, setBoolIsLoggedInState] = useState(!!strTokenState);
  const [objUserState, setObjUserState] = useState(null);

  useEffect(() => {
    setBoolIsLoggedInState(!!strTokenState);
    if (strTokenState) {
      localStorage.setItem('access_token', strTokenState);
      fetchUserProfile(strTokenState).then(user => {
        setObjUserState(user);
      }).catch(() => {
        // Token invalid or expired
        handleLogout();
      });
    } else {
      localStorage.removeItem('access_token');
      setObjUserState(null);
    }
  }, [strTokenState]);

  const handleLogin = async (username, password) => {
    const data = await loginUser(username, password);
    setStrTokenState(data.access_token);
    return data;
  };

  const handleRegister = async (userData) => {
    const data = await registerUser(userData);
    return data;
  };

  const handleLogout = () => {
    setStrTokenState(null);
  };

  return {
    strTokenState,
    boolIsLoggedInState,
    objUserState,
    setObjUserState,
    handleLogin,
    handleRegister,
    handleLogout
  };
};

