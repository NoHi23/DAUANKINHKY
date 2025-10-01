import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AdminForm.css';
import { notifySuccess, notifyError, notifyInfo } from '../../services/notificationService';
import { showConfirmDialog } from '../../services/confirmationService';

const AdminCouponForm = () => {
    const navigate = useNavigate();
    const [coupon, setCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        expiryDate: ''
    });

    const handleChange = (e) => {
        setCoupon({ ...coupon, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/coupons', coupon);
            notifySuccess('Tạo mã giảm giá thành công!');
            navigate('/admin/coupons');
        } catch (error) {
            notifyError('Tạo mã thất bại. Mã có thể đã tồn tại.');
        }
    };

    return (
        <div className="admin-page">
            <h2>Tạo mã giảm giá mới</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label>Mã Coupon</label>
                    <input type="text" name="code" value={coupon.code} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Loại giảm giá</label>
                    <select name="discountType" value={coupon.discountType} onChange={handleChange}>
                        <option value="percentage">Phần trăm (%)</option>
                        <option value="fixed_amount">Số tiền cố định</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Giá trị</label>
                    <input type="number" name="discountValue" value={coupon.discountValue} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Ngày hết hạn</label>
                    <input type="date" name="expiryDate" value={coupon.expiryDate} onChange={handleChange} required />
                </div>
                <button type="submit" className="admin-submit-btn">Tạo mã</button>
            </form>
        </div>
    );
};

export default AdminCouponForm;