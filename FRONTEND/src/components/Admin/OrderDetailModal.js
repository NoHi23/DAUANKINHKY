import React from 'react';
import './AdminCommon.css'; // Dùng chung CSS

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const statusTranslations = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đã gửi hàng',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chi tiết đơn hàng <code className="coupon-code">#{order._id.slice(-6).toUpperCase()}</code></h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <div className="order-details-grid">
            <div className="detail-section">
              <h4><i className="fa-solid fa-user"></i> Thông tin khách hàng</h4>
              <p><strong>Tên:</strong> {order.user?.name}</p>
              <p><strong>Email:</strong> {order.user?.email}</p>
              <p><strong>Điện thoại:</strong> {order.shippingAddress?.phone}</p>
              <p><strong>Địa chỉ giao hàng:</strong> {order.shippingAddress?.address}</p>
            </div>
            <div className="detail-section">
              <h4><i className="fa-solid fa-file-invoice-dollar"></i> Thông tin đơn hàng</h4>
              <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
              <p><strong>Trạng thái ĐH:</strong> <span className={`status-badge status-${order.status}`}>{statusTranslations[order.status]}</span></p>
              <p><strong>Thanh toán:</strong> <span className={`status-badge ${order.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}`}>{order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}</span></p>
              <p><strong>Tổng tiền:</strong> <strong style={{ color: '#dc3545' }}>{formatPrice(order.totalAmount)}</strong></p>
            </div>
          </div>

          <div className="detail-section">
            <h4><i className="fa-solid fa-box-open"></i> Các sản phẩm</h4>
            <table className="content-table">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.product._id}>
                    <td>
                      <div className="user-cell">
                        <img src={item.product.images?.[0] || '/placeholder.jpg'} alt={item.product.name} className="product-thumbnail" />                                                <span>{item.product.name}</span>
                      </div>
                    </td>
                    <td>x {item.quantity}</td>
                    <td>{formatPrice(item.price)}</td>
                    <td>{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;