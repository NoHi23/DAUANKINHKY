import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Admin.css'; // CSS chung cho trang admin

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const response = await api.get('/orders/all');
      setOrders(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      // Cập nhật lại state để UI thay đổi ngay lập tức
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert('Cập nhật thất bại.');
    }
  };

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];


  return (
    <div className="admin-page">
      <h2>Quản lý Đơn hàng</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã Đơn hàng</th>
            <th>Người mua</th>
            <th>Tổng tiền</th>
            <th>Trạng thái TT</th>
            <th>Trạng thái ĐH</th>
            <th>Ngày đặt</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id.slice(-6)}...</td> {/* Rút gọn ID */}
              <td>{order.user?.name || 'N/A'}</td>
              <td>{new Intl.NumberFormat('vi-VN').format(order.totalAmount)} VND</td>
              <td>{order.paymentStatus}</td>
              <td>
                {/* <<-- THAY THẾ TEXT BẰNG DROPDOWN -->> */}
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className={`status-select status-${order.status}`}
                >
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderList;