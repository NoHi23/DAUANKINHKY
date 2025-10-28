
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
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedBillImage, setSelectedBillImage] = useState(null);

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

  const handleOpenBillModal = (imageUrl) => {
    setSelectedBillImage(imageUrl);
    setIsBillModalOpen(true);
  };

  const handleCloseBillModal = () => {
    setIsBillModalOpen(false);
    setSelectedBillImage(null);
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

  const handleVerify = async (orderId, verified) => {
    try {
      await api.put(`/orders/${orderId}/verify-bill`, {
        verified,
        note: verified ? '' : 'Thanh toán không hợp lệ'
      });
      notifySuccess('Cập nhật xác minh thành công!');
      setOrders(orders.map(order =>
        order._id === orderId
          ? { ...order, billVerified: verified, paymentStatus: verified ? 'paid' : 'failed' }
          : order
      ));
    } catch (err) {
      console.error(err);
      notifyError('Xác minh thất bại');
    }
  };

  const billModalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1050, // Đảm bảo nó nổi lên trên modal chi tiết (nếu có)
    },
    content: {
      position: 'relative',
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    },
    image: {
      maxWidth: '90vw',
      maxHeight: '80vh',
      objectFit: 'contain',
      display: 'block',
    },
    closeButton: {
      position: 'absolute',
      top: '-15px',
      right: '-15px',
      background: '#fff',
      border: '2px solid #333',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#333',
      cursor: 'pointer',
      lineHeight: '26px', // Căn giữa dấu 'X'
      padding: 0,
    },
    downloadButton: {
      display: 'inline-block',
      marginTop: '15px',
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: '#fff',
      textDecoration: 'none',
      borderRadius: '5px',
      fontWeight: 'bold',
    }
  };

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
                <th>Bill</th>
                <th>Verify</th>
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
                      {order.billImage ? (
                        <img
                          src={order.billImage}
                          alt="bill"
                          style={{ width: 50, borderRadius: 4, cursor: 'pointer' }}
                          onClick={() => handleOpenBillModal(order.billImage)}
                          title="Nhấn để xem to"
                        />
                      ) : (
                        'Chưa upload'
                      )}
                    </td>
                    <td>
                      {!order.billVerified && order.billImage ? (
                        <>
                          <button onClick={() => handleVerify(order._id, true)} className="btn-verify">✅</button>
                          <button onClick={() => handleVerify(order._id, false)} className="btn-reject">❌</button>
                        </>
                      ) : order.billVerified ? (
                        'Đã xác minh'
                      ) : (
                        'Chưa upload'
                      )}
                    </td>
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
      {isBillModalOpen && (
        <div style={billModalStyles.overlay} onClick={handleCloseBillModal}>
          <div style={billModalStyles.content} onClick={(e) => e.stopPropagation()}>
            <button style={billModalStyles.closeButton} onClick={handleCloseBillModal}>&times;</button>
            <img src={selectedBillImage} alt="Bill chi tiết" style={billModalStyles.image} />
            <a
              href={selectedBillImage}
              download={`bill_order_${selectedBillImage.slice(-10)}.jpg`} // Tạo tên file download
              target="_blank"
              rel="noopener noreferrer"
              style={billModalStyles.downloadButton}
            >
              <i className="fa-solid fa-download"></i> Tải xuống
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminOrderList;