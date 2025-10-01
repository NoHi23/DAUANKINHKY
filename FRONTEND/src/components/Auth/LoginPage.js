// src/pages/Login/LoginPage.js

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css';
import { notifySuccess, notifyError } from '../../services/notificationService';
import posterImage from '../../assets/POSTER.png';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(email, password);
            const loggedInUser = response.data.user;

            notifySuccess(`Chào mừng ${loggedInUser.name} đã quay trở lại!`);

            if (loggedInUser.role === 'admin' || loggedInUser.role === 'moderator') {
                navigate('/admin/orders');
            } else {
                navigate('/');
            }

        } catch (err) {
            notifyError('Email hoặc mật khẩu không chính xác.');
        }
    };

    return (
        <div className="login-page">
            {/* --- Cột bên trái - Hình ảnh & Thông điệp --- */}
            <div className="login-image-panel"  style={{ backgroundImage: `url(${posterImage})` }}>
                <div className="welcome-message">
                    <h1>Chào mừng trở lại!</h1>
                    <p>Khám phá di sản và những câu chuyện vượt thời gian cùng Dấu Ấn Kinh Kỳ.</p>
                </div>
            </div>

            {/* --- Cột bên phải - Form đăng nhập --- */}
            <div className="login-form-panel">
                <div className="auth-form-container">
                    <div className="logo-container">
                        <img src="/DAUANKINHKY.png" alt="Logo Dấu Ấn Kinh Kỳ" />
                    </div>
                    <h2>Đăng Nhập Tài Khoản</h2>
                    <p className="subtitle">Sử dụng tài khoản của bạn để tiếp tục</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <i className="fa-solid fa-envelope"></i>
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <i className="fa-solid fa-lock"></i>
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-options">
                            <a href="#" className="forgot-password">Quên mật khẩu?</a>
                        </div>
                        <button type="submit" className="btn-submit">Đăng Nhập</button>
                    </form>

                    <div className="social-login-divider">
                        <span>HOẶC ĐĂNG NHẬP VỚI</span>
                    </div>

                    <div className="social-login-buttons">
                        <button className="btn-social google">
                            <i className="fa-brands fa-google"></i> Google
                        </button>
                        <button className="btn-social facebook">
                            <i className="fa-brands fa-facebook-f"></i> Facebook
                        </button>
                    </div>

                    <p className="auth-switch">
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;