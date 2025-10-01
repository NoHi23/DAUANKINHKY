// src/pages/Admin/Coupons/AdminCouponList.js

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { showConfirmDialog } from '../../services/confirmationService';
import { notifySuccess, notifyError } from '../../services/notificationService';
import './AdminCommon.css'; // Dùng lại file CSS chung

const AdminCouponList = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiryDate: ''
    });

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/coupons');
            setCoupons(data);
        } catch (error) {
            notifyError('Không thể tải danh sách mã giảm giá.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleChange = (e) => {
        setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/coupons', newCoupon);
            notifySuccess('Tạo mã giảm giá thành công!');
            fetchCoupons(); // Tải lại danh sách
            // Reset form
            setNewCoupon({ code: '', discountType: 'percentage', discountValue: '', expiryDate: '' });
            e.target.reset();
        } catch (error) {
            notifyError(error.response?.data?.message || 'Tạo mã thất bại.');
        }
    };

    const handleDelete = async (couponId, couponCode) => {
        const result = await showConfirmDialog({
            title: `Bạn chắc chắn muốn xóa?`,
            text: `Mã giảm giá "${couponCode}" sẽ bị xóa vĩnh viễn.`,
            confirmButtonText: 'Vâng, xóa mã này!',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/coupons/${couponId}`);
                notifySuccess('Xóa thành công!');
                fetchCoupons();
            } catch (error) {
                notifyError('Xóa thất bại.');
            }
        }
    };

    // Hàm format giá trị giảm giá
    const formatDiscountValue = (type, value) => {
        if (type === 'percentage') {
            return `${value}%`;
        }
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="content-card">
            <div className="content-header">
                <h2>Quản lý Mã giảm giá</h2>
            </div>

            {/* Form tạo mới */}
            <div className="create-form-section">
                <h3>Tạo mã giảm giá mới</h3>
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                        <label htmlFor="code">Mã coupon</label>
                        <input id="code" type="text" name="code" placeholder="Vd: TET2025" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="discountType">Loại giảm giá</label>
                        <select id="discountType" name="discountType" value={newCoupon.discountType} onChange={handleChange}>
                            <option value="percentage">Phần trăm (%)</option>
                            <option value="fixed_amount">Số tiền cố định (VND)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="discountValue">Giá trị</label>
                        <input id="discountValue" type="number" name="discountValue" placeholder="Vd: 15 hoặc 50000" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="expiryDate">Ngày hết hạn</label>
                        <input id="expiryDate" type="date" name="expiryDate" onChange={handleChange} required />
                    </div>
                    <div className="form-group form-group-submit">
                        <button type="submit" className="add-new-btn">
                            <i className="fa-solid fa-plus"></i> Tạo mã
                        </button>
                    </div>
                </form>
            </div>


            {/* Bảng danh sách */}
            <div className="content-body">
                <table className="content-table">
                    <thead>
                        <tr>
                            <th>Mã</th>
                            <th>Giá trị giảm</th>
                            <th>Ngày hết hạn</th>
                            <th>Trạng thái</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="empty-state">Đang tải...</td></tr>
                        ) : coupons.length > 0 ? (
                            coupons.map(coupon => {
                                const isExpired = new Date(coupon.expiryDate) < new Date();
                                return (
                                    <tr key={coupon._id}>
                                        <td><code className="coupon-code">{coupon.code}</code></td>
                                        <td>{formatDiscountValue(coupon.discountType, coupon.discountValue)}</td>
                                        <td>{new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span className={`status-badge ${isExpired ? 'status-expired' : 'status-active'}`}>
                                                {isExpired ? 'Hết hạn' : 'Còn hạn'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button onClick={() => handleDelete(coupon._id, coupon.code)} className="btn-delete" title="Xóa">
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-state">
                                    Chưa có mã giảm giá nào. Hãy tạo một mã mới!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCouponList;