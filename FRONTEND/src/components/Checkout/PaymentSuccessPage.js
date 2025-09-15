import React from 'react';
import { Link } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentSuccessPage = () => {
    return (
        <div className="payment-status-container">
            <i className="fa-solid fa-circle-check success-icon"></i>
            <h2>Thanh toán thành công!</h2>
            <p>Đơn hàng của bạn đã được ghi nhận và đang được xử lý.</p>
            <div className="button-group">
                <Link to="/order-history" className="status-button">Xem lịch sử đơn hàng</Link>
                <Link to="/products" className="status-button secondary">Tiếp tục mua sắm</Link>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;