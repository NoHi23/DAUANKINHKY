
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { notifySuccess, notifyError } from '../../services/notificationService';
import './AdminCommon.css'; // Dùng lại file CSS chung
import OrderDetailModal from './OrderDetailModal';
import FullScreenLoader from '../Common/FullScreenLoader';

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const response = await api.get('/orders/all');
        setOrders(response.data);
      } catch (error) {
        notifyError("Lỗi khi tải danh sách đơn hàng.");
        console.error("Fetch orders error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      notifySuccess('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      notifyError('Cập nhật thất bại.');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const statusTranslations = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đã gửi hàng',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy'
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <div className="content-card">
        <div className="content-header">
          <h2>Quản lý Đơn hàng</h2>
        </div>
        <div className="content-body">
          <table className="content-table">
            <thead>
              <tr>
                <th>Mã ĐH</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái ĐH</th>
                <th>Ngày đặt</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map(order => (
                  <tr key={order._id}>
                    <td><code className="coupon-code">#{order._id.slice(-6).toUpperCase()}</code></td>
                    <td>{order.user?.name || 'Không có dữ liệu'}</td>
                    <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${order.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}`}>
                        {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                      </span>
                    </td>
                    <td>
                      <div className="role-select-wrapper">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`role-select status-${order.status}`}
                        >
                          {orderStatuses.map(status => (
                            <option key={status} value={status}>
                              {statusTranslations[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleViewDetails(order)} className="btn-view" title="Xem chi tiết">
                          <i className="fa-solid fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && <OrderDetailModal order={selectedOrder} onClose={handleCloseModal} />}
    </>
  );
};

export default AdminOrderList;