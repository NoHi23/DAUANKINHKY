import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './ProfilePage.css';
import { notifySuccess, notifyError } from '../../services/notificationService';
// Giả sử bạn có component Loader
import FullScreenLoader from '../Common/FullScreenLoader'; 
// import { showConfirmDialog } from '../../services/confirmationService'; // (Không dùng)

const ProfilePage = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });
    // (Mới) Thêm state loading khi submit
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                // (Sửa lỗi) Thêm '|| ""' để tránh lỗi "controlled vs uncontrolled"
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true); // Bắt đầu loading
        try {
            await updateProfile(formData);
            notifySuccess('Cập nhật thông tin thành công!');
        } catch (error) {
            notifyError('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false); // Dừng loading
        }
    };

    // (SỬA LỖI CRASH & SPAM)
    // Thêm "Guard Clause": Nếu chưa có user, hiển thị Loading và thoát
    if (!user) {
        // notifyInfo('Vui lòng đăng nhập...'); // (Lỗi) Xóa dòng này
        return <FullScreenLoader loading={true} />; // Hiển thị loader
    }

    // Code bên dưới chỉ chạy khi 'user' chắc chắn tồn tại
    return (
        <div className="profile-page-wrapper">
            <div className="profile-container">
                <h1>Thông tin cá nhân</h1>
                <div className="profile-content card-shadow">
                    <div className="profile-avatar">
                        {/* (Sửa lỗi) Thêm ảnh dự phòng */}
                        <img src={user.avatar || '/default-avatar.png'} alt="Avatar" />
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                    </div>
                    
                    <form className="profile-form" onSubmit={handleSubmit}>
                        {/* (Đã xóa message state, dùng notify) */}
                        
                        <div className="form-group">
                            <label htmlFor="name">Họ và tên</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                placeholder="Chưa cập nhật"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="address">Địa chỉ</label>
                            <input 
                                type="text" 
                                id="address" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                placeholder="Chưa cập nhật"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn-submit" 
                            disabled={isProcessing} // (Mới)
                        >
                            {isProcessing ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;