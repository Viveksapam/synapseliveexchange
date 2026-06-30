import { useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, fetchUserProfile } from '../api/userApi';

const TOKEN_KEY = 'access_token';

const readToken = () => {
  try { return sessionStorage.getItem(TOKEN_KEY); }
  catch { return null; }
};

const writeToken = (strToken) => {
  try { strToken ? sessionStorage.setItem(TOKEN_KEY, strToken) : sessionStorage.removeItem(TOKEN_KEY); }
  catch { /* storage unavailable */ }
};

export const useAuth = () => {
  const [strTokenState, setStrTokenState] = useState(() => readToken());
  const [boolIsLoggedInState, setBoolIsLoggedInState] = useState(!!readToken());
  const [objUserState, setObjUserState] = useState(null);

  const handleLogout = useCallback(() => {
    setStrTokenState(null);
    setObjUserState(null);
    writeToken(null);
    setBoolIsLoggedInState(false);
  }, []);

  useEffect(() => {
    const boolHasToken = !!strTokenState;
    setBoolIsLoggedInState(boolHasToken);
    writeToken(strTokenState);
    if (!boolHasToken) { setObjUserState(null); return; }
    fetchUserProfile(strTokenState)
      .then(setObjUserState)
      .catch(handleLogout);
  }, [strTokenState, handleLogout]);

  const handleLogin = async (strUsername, strPassword) => {
    const data = await loginUser(strUsername, strPassword);
    setStrTokenState(data.access_token);
    return data;
  };

  const handleRegister = async (objUserData) => {
    return await registerUser(objUserData);
  };

  return {
    strTokenState, boolIsLoggedInState, objUserState,
    setObjUserState, handleLogin, handleRegister, handleLogout,
  };
};
