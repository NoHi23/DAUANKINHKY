// src/components/Auth/RegisterPage.js

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css'; // Dùng chung file CSS với trang Login
import { notifySuccess, notifyError } from '../../services/notificationService';
import FullScreenLoader from '../../components/Common/FullScreenLoader';
import posterImage from '../../assets/POSTER.png'; // Import ảnh nền

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', address: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            notifyError('Mật khẩu phải có ít nhất 8 ký tự.');
            return;
        }
        setIsLoading(true);
        try {
            let avatarUrl = '';
            if (avatarFile) {
                const uploadData = new FormData();
                uploadData.append('file', avatarFile);
                uploadData.append('upload_preset', 'dakk_unsigned_preset');
                const uploadRes = await axios.post(
                    'https://api.cloudinary.com/v1_1/dpnycqrxe/image/upload',
                    uploadData
                );
                avatarUrl = uploadRes.data.secure_url;
            }
            const finalData = { ...formData, avatar: avatarUrl };
            await register(finalData);
            notifySuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 409) {
                notifyError('Email này đã được sử dụng.');
            } else {
                notifyError('Đã có lỗi xảy ra. Vui lòng thử lại.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <FullScreenLoader loading={isLoading} />
            
            {/* --- Cột bên trái - Hình ảnh & Thông điệp --- */}
            <div className="login-image-panel" style={{ backgroundImage: `url(${posterImage})` }}>
                <div className="welcome-message">
                    <h1>Gia nhập cộng đồng</h1>
                    <p>Tạo tài khoản để bắt đầu hành trình khám phá và sở hữu những di sản độc đáo của Kinh Kỳ.</p>
                </div>
            </div>

            {/* --- Cột bên phải - Form đăng ký --- */}
            <div className="login-form-panel">
                <div className="auth-form-container">
                    <div className="logo-container">
                        <img src="/DAUANKINHKY.png" alt="Logo Dấu Ấn Kinh Kỳ" />
                    </div>
                    <h2>Tạo Tài Khoản Mới</h2>
                    
                    <form onSubmit={handleSubmit} className="auth-form">
                        
                        {/* Avatar Upload */}
                        <div className="avatar-upload-group">
                            <input type="file" id="avatar" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            <div className="avatar-preview-circle" onClick={() => document.getElementById('avatar').click()}>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Xem trước avatar" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        <i className="fa-solid fa-camera"></i>
                                        <span>Chọn ảnh</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Các trường input khác */}
                        <div className="input-group">
                            <i className="fa-solid fa-user"></i>
                            <input type="text" name="name" placeholder="Họ và tên" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <i className="fa-solid fa-envelope"></i>
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <i className="fa-solid fa-lock"></i>
                            <input type="password" name="password" placeholder="Mật khẩu (ít nhất 8 ký tự)" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <i className="fa-solid fa-phone"></i>
                            <input type="tel" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                             <i className="fa-solid fa-location-dot"></i>
                            <input type="text" name="address" placeholder="Địa chỉ" value={formData.address} onChange={handleChange} required />
                        </div>

                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
                        </button>
                        
                        <p className="auth-switch">
                            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;