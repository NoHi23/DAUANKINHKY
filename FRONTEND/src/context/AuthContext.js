import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Cài đặt: npm install jwt-decode

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra xem có token trong localStorage không khi app khởi động
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Thay vì giải mã token, hãy gọi API /profile để lấy thông tin user đầy đủ
          const response = await api.get('/users/profile');
          setUser(response.data); // <<-- Lấy user object đầy đủ từ API
        } catch (error) {
          // Token có thể đã hết hạn, xóa nó đi
          localStorage.removeItem('token');
          console.error("Token invalid, logging out.");
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return response;
  };

  const register = async (userData) => {
    return await api.post('/users/register', userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Đang tải...</div>; // Hoặc một spinner component
  }


  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      const { token, user: updatedUserData } = response.data;
      localStorage.setItem('token', token); // Cập nhật token mới
      setUser(updatedUserData); // Cập nhật state user
      return response;
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      throw error; // Ném lỗi ra để component có thể bắt
    }
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};