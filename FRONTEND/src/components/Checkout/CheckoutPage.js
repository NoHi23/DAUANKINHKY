import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './CheckoutPage.css';
import { notifySuccess, notifyError } from '../../services/notificationService'; 

const CheckoutPage = () => {
    const { cart, fetchCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        shippingAddress: '',
        phone: '',
        paymentMethod: 'COD' // Giá trị mặc định
    });

    // Tự động điền thông tin nếu user đã có
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                shippingAddress: user.address || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.paymentMethod === 'COD') {
                await api.post('/orders', { ...formData, paymentMethod: 'COD' });
                notifySuccess('Đặt hàng thành công!');
                await fetchCart();
                navigate('/order-history');
            } else if (formData.paymentMethod === 'VNPAY') {
                const response = await api.post('/orders/create-payment-url', formData);
                window.location.href = response.data.paymentUrl;
            } else if (formData.paymentMethod === 'MOMO') { 
                const response = await api.post('/orders/create-momo-url', formData);
                window.location.href = response.data.paymentUrl;
            }
        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            notifyError('Đặt hàng thất bại, vui lòng thử lại.');
        }
    };

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="checkout-container">
                <h2>Không có sản phẩm nào để thanh toán.</h2>
            </div>
        );
    }

    const subTotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <form className="checkout-container" onSubmit={handleSubmit}>
            <h1>Thanh toán</h1>
            <div className="checkout-content">
                <div className="shipping-info">
                    <h2>Thông tin giao hàng</h2>
                    <div className="form-group">
                        <label htmlFor="shippingAddress">Địa chỉ nhận hàng</label>
                        <input
                            type="text"
                            id="shippingAddress"
                            name="shippingAddress"
                            value={formData.shippingAddress}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <h2>Phương thức thanh toán</h2>
                    <div className="payment-methods">
                        <label>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="COD"
                                checked={formData.paymentMethod === 'COD'}
                                onChange={handleChange}
                            />
                            Thanh toán khi nhận hàng (COD)
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="VNPAY"
                                checked={formData.paymentMethod === 'VNPAY'}
                                onChange={handleChange}
                            />
                            Thanh toán qua VNPAY
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="MOMO"
                                checked={formData.paymentMethod === 'MOMO'}
                                onChange={handleChange}
                            />
                            Thanh toán qua Momo
                        </label>
                    </div>
                </div>
                <div className="order-summary">
                    <h2>Tóm tắt đơn hàng</h2>
                    {cart.items.map(item => (
                        <div key={item.product._id} className="summary-item">
                            <span>{item.product.name} x {item.quantity}</span>
                            <span>{formatPrice(item.product.price * item.quantity)}</span>
                        </div>
                    ))}
                    <div className="summary-total">
                        <span>Tổng cộng</span>
                        <span>{formatPrice(subTotal)}</span>
                    </div>
                    <button type="submit" className="place-order-btn">Hoàn tất đơn hàng</button>
                </div>
            </div>
        </form>
    );
};

export default CheckoutPage;