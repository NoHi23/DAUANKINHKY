import React from 'react';
import { Link } from 'react-router-dom';
import './PaymentStatus.css'; // Dùng chung CSS với trang Success

const PaymentFailPage = () => {
    return (
        <div className="payment-status-container">
            <i className="fa-solid fa-circle-xmark fail-icon"></i>
            <h2>Thanh toán thất bại!</h2>
            <p>Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.</p>
            <div className="button-group">
                <Link to="/cart" className="status-button secondary">Quay lại giỏ hàng</Link>
                <Link to="/" className="status-button">Về trang chủ</Link>
            </div>
        </div>
    );
};

export default PaymentFailPage;