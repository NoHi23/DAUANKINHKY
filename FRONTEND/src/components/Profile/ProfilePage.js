import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './ProfilePage.css';
import { notifySuccess, notifyError, notifyInfo } from '../../services/notificationService';
import { showConfirmDialog } from '../../services/confirmationService';
const ProfilePage = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                phone: user.phone,
                address: user.address,
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            notifySuccess('Cập nhật thông tin thành công!');
        } catch (error) {
            notifyError('Cập nhật thất bại. Vui lòng thử lại.');
        }
    };

    if (!user) {
        notifyInfo('Vui lòng đăng nhập để xem trang này.');
    }

    return (
        <div className="profile-container">
            <h1>Thông tin cá nhân</h1>
            <div className="profile-content">
                <div className="profile-avatar">
                    <img src={user.avatar} alt="Avatar" />
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                </div>
                <form className="profile-form" onSubmit={handleSubmit}>
                    {message && <p className="update-message">{message}</p>}
                    <div className="form-group">
                        <label htmlFor="name">Họ và tên</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Địa chỉ</label>
                        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} />
                    </div>
                    <button type="submit">Lưu thay đổi</button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;