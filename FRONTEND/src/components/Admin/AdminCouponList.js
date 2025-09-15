import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { showConfirmDialog } from '../../services/confirmationService'; // <<-- 1. IMPORT
import { notifySuccess, notifyError } from '../../services/notificationService'; 

const AdminCouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    expiryDate: ''
  });

  const fetchCoupons = async () => {
    const { data } = await api.get('/coupons');
    setCoupons(data);
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
      alert('Tạo mã giảm giá thành công!');
      fetchCoupons(); // Tải lại danh sách
    } catch (error) {
      alert('Tạo mã thất bại. Mã có thể đã tồn tại.');
    }
  };
  const handleDelete = async (couponId) => {
    const result = await showConfirmDialog({
      confirmButtonText: 'Vâng, xóa mã này!',
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/coupons/${couponId}`);
        notifySuccess('Xóa thành công!');
        fetchCoupons(); // Tải lại danh sách
      } catch (error) {
        notifyError('Xóa thất bại.'); 
      }
    }
  };

  return (
    <div className="admin-page">
      <h2>Quản lý Mã giảm giá</h2>

      {/* Form tạo mới */}
      <form onSubmit={handleSubmit} className="admin-form compact-form">
        <h3>Tạo mã mới</h3>
        <input type="text" name="code" placeholder="Mã coupon" onChange={handleChange} required />
        <select name="discountType" onChange={handleChange}>
          <option value="percentage">Phần trăm (%)</option>
          <option value="fixed_amount">Số tiền cố định</option>
        </select>
        <input type="number" name="discountValue" placeholder="Giá trị giảm" onChange={handleChange} required />
        <input type="date" name="expiryDate" onChange={handleChange} required />
        <button type="submit">Tạo</button>
      </form>

      {/* Bảng danh sách */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Loại</th>
            <th>Giá trị</th>
            <th>Ngày hết hạn</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map(coupon => (
            <tr key={coupon._id}>
              <td>{coupon.code}</td>
              <td>{coupon.discountType}</td>
              <td>{coupon.discountValue}</td>
              <td>{new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}</td>
              <td>
                <button onClick={() => handleDelete(coupon._id)} className="admin-delete-btn">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div >
  );
};

export default AdminCouponList;