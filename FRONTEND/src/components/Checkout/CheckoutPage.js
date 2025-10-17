import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './CheckoutPage.css';
import { notifySuccess, notifyError, notifyInfo } from '../../services/notificationService';

const QRCodeModal = ({ qrData, onConfirm, onClose }) => {
    if (!qrData) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(qrData.description);
        notifySuccess('Đã sao chép nội dung chuyển khoản!');
    };

    return (
        <div className="qr-modal-overlay">
            <div className="qr-modal-content">
                <h2>Quét mã để thanh toán</h2>
                <p>Sử dụng App ngân hàng hoặc ví điện tử để quét mã dưới đây.</p>

                <img src={qrData.qrImageUrl} alt="VietQR Code" className="qr-code-image" />

                <h3>
                    Tổng tiền:{' '}
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                        qrData.amount
                    )}
                </h3>

                <div className="qr-info">
                    <span>Nội dung chuyển khoản (bắt buộc):</span>
                    <strong onClick={copyToClipboard} style={{ cursor: 'pointer' }}>
                        {qrData.description} 📋
                    </strong>
                </div>

                <p className="note">
                    Vui lòng giữ nguyên nội dung chuyển khoản để đơn hàng được xác nhận nhanh nhất.
                </p>

                <div className="qr-modal-buttons">
                    <button onClick={onConfirm} className="confirm-btn">
                        Tôi đã chuyển khoản
                    </button>
                    <button onClick={onClose} className="close-modal-btn">
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    const { cart, fetchCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id: orderIdFromParams } = useParams();
    const location = useLocation();

    const [formData, setFormData] = useState({
        shippingAddress: '',
        phone: '',
        paymentMethod: 'COD'
    });

    const [qrData, setQrData] = useState(null);
    const [orderId, setOrderId] = useState(orderIdFromParams || null);

    // Điền sẵn thông tin user
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                shippingAddress: user.address || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    // Nếu vào /checkout/vietqr/:id
    useEffect(() => {
        const fetchQR = async () => {
            if (!orderIdFromParams) return;

            // Nếu có state từ navigate, dùng luôn
            if (location.state?.qrData) {
                setQrData(location.state.qrData);
                setOrderId(orderIdFromParams);
                return;
            }

            try {
                const res = await api.get(`/orders/${orderIdFromParams}/qr`);
                setQrData(res.data.qrData);
                setOrderId(orderIdFromParams);
            } catch (err) {
                notifyError(err.response?.data?.message || 'Không thể tải QR code');
            }
        };
        fetchQR();
    }, [orderIdFromParams, location.state]);

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const response = await api.post('/orders', formData);
            await fetchCart();

            const newOrderId = response.data.order._id;
            const qrData = response.data.qrData || null; // <-- thêm dòng này để tránh undefined

            if (formData.paymentMethod === 'COD') {
                notifySuccess('Đặt hàng thành công!');
                navigate('/order-history');
            } else if (formData.paymentMethod === 'VIETQR') {
                // Dùng state để tránh fetch lại
                navigate(`/checkout/vietqr/${newOrderId}`, { state: { qrData } });
            }
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            notifyError(error.response?.data?.message || 'Đặt hàng thất bại.');
        }
    };


    const handleConfirmPayment = async () => {
        if (!orderId) return;
        try {
            await api.post(`/orders/${orderId}/confirm-payment`);
            notifySuccess('Thanh toán thành công!');
            setQrData(null);
            navigate(`/payment-success?orderId=${orderId}`);
        } catch (error) {
            notifyError('Xác nhận thanh toán thất bại!');
        }
    };

    const handleCloseModal = () => {
        setQrData(null);
        notifyInfo('Bạn đã hủy thanh toán VietQR.');
    };

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="checkout-container">
                <h2>Không có sản phẩm nào để thanh toán.</h2>
            </div>
        );
    }

    const subTotal = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const formatPrice = price =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);

    return (
        <>
            <QRCodeModal
                qrData={qrData}
                onConfirm={handleConfirmPayment}
                onClose={handleCloseModal}
            />

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
                                    value="VIETQR"
                                    checked={formData.paymentMethod === 'VIETQR'}
                                    onChange={handleChange}
                                />
                                Chuyển khoản qua VietQR
                            </label>
                        </div>
                    </div>

                    <div className="order-summary">
                        <h2>Tóm tắt đơn hàng</h2>
                        {cart.items.map(item => (
                            <div key={item.product._id} className="summary-item">
                                <span>
                                    {item.product.name} x {item.quantity}
                                </span>
                                <span>{formatPrice(item.product.price * item.quantity)}</span>
                            </div>
                        ))}
                        <div className="summary-total">
                            <span>Tổng cộng</span>
                            <span>{formatPrice(subTotal)}</span>
                        </div>
                        <button type="submit" className="place-order-btn">
                            Hoàn tất đơn hàng
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};

export default CheckoutPage;
