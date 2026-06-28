import apiClient from './apiClient';

export const registerUser = async (userData) => {
  return await apiClient.post('/auth/register', userData);
};

export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  
  return await apiClient.post('/auth/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export const fetchUserProfile = async (token) => {
  return await apiClient.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const updateUserProfile = async (userData, token) => {
  return await apiClient.put('/auth/profile', userData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const verifyEmail = async (token) => {
  return await apiClient.post('/auth/verify-email', { token });
};
