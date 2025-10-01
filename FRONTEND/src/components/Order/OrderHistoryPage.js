import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './OrderHistoryPage.css';
import { notifySuccess, notifyError, notifyInfo } from '../../services/notificationService';
import { showConfirmDialog } from '../../services/confirmationService';
import FullScreenLoader from '../Common/FullScreenLoader';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data);
            } catch (error) {
                console.error("Lỗi khi tải lịch sử đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) return <FullScreenLoader/>;

    return (
        <div className="order-history-container">
            <h1>Lịch sử mua hàng</h1>
            {orders.length === 0 ? (
                <p>Bạn chưa có đơn hàng nào.</p>
            ) : (
                orders.map(order => (
                    <div key={order._id} className="order-card">
                        <div className="order-header">
                            <span>Mã đơn hàng: {order._id}</span>
                            <span className={`status status-${order.status}`}>{order.status}</span>
                        </div>
                        <div className="order-body">
                            {order.items.map(item => (
                                <div key={item.product._id} className="order-item">
                                    <span>{item.product.name} (x{item.quantity})</span>
                                    <span>{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="order-footer">
                            <strong>Tổng cộng: {formatPrice(order.totalAmount)}</strong>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default OrderHistoryPage;