import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './CheckoutPage.css';
import { notifySuccess, notifyError, notifyInfo } from '../../services/notificationService';
import { showConfirmDialog } from '../../services/confirmationService';


const QRCodeModal = ({ qrData, onClose }) => {
    if (!qrData) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(qrData.description);
        notifySuccess('Đã sao chép mã đơn hàng!');
    };

    return (
        <div className="qr-modal-overlay">
            <div className="qr-modal-content">
                <h2>Quét mã để thanh toán</h2>
                <p>Sử dụng App ngân hàng hoặc Ví điện tử để quét mã QR dưới đây.</p>
                <img src={qrData.qrImageUrl} alt="VietQR Code" className="qr-code-image" />
                <h3>Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(qrData.amount)}</h3>
                <div className="qr-info">
                    <span>Nội dung chuyển khoản (bắt buộc):</span>
                    <strong onClick={copyToClipboard} style={{ cursor: 'pointer' }}>
                        {qrData.description} 📋
                    </strong>
                </div>
                <p className='note'>Vui lòng giữ nguyên nội dung chuyển khoản để đơn hàng được xác nhận nhanh nhất.</p>
                <button onClick={onClose} className="close-modal-btn">Tôi đã hiểu</button>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    const { cart, fetchCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        shippingAddress: '',
        phone: '',
        paymentMethod: 'COD'
    });

    // State để lưu thông tin QR và điều khiển modal
    const [qrData, setQrData] = useState(null);

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
            const response = await api.post('/orders', formData);

            if (formData.paymentMethod === 'COD') {
                notifySuccess('Đặt hàng thành công!');
                await fetchCart();
                navigate('/order-history');
            } else if (formData.paymentMethod === 'VIETQR') {
                // Lấy qrData từ response và hiển thị modal
                setQrData(response.data.qrData);
                await fetchCart(); // Xóa giỏ hàng
            }
        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            notifyError(error.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại.');
        }
    };

    // Hàm đóng modal và chuyển hướng
    const handleCloseModal = () => {
        setQrData(null);
        notifySuccess("Đơn hàng của bạn đã được ghi nhận. Vui lòng hoàn tất thanh toán.");
        navigate('/order-history');
    };

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="checkout-container">
                <h2>Không có sản phẩm nào để thanh toán.</h2>
            </div>
        );
    }

    const subTotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <>
            {/* Modal hiển thị mã QR */}
            <QRCodeModal qrData={qrData} onClose={handleCloseModal} />

            <form className="checkout-container" onSubmit={handleSubmit}>
                <h1>Thanh toán</h1>
                <div className="checkout-content">
                    <div className="shipping-info">
                        <h2>Thông tin giao hàng</h2>
                        <div className="form-group">
                            <label htmlFor="shippingAddress">Địa chỉ nhận hàng</label>
                            <input
                                type="text" id="shippingAddress" name="shippingAddress"
                                value={formData.shippingAddress} onChange={handleChange} required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                type="tel" id="phone" name="phone"
                                value={formData.phone} onChange={handleChange} required
                            />
                        </div>
                        <h2>Phương thức thanh toán</h2>
                        <div className="payment-methods">
                            <label>
                                <input
                                    type="radio" name="paymentMethod" value="COD"
                                    checked={formData.paymentMethod === 'COD'}
                                    onChange={handleChange}
                                />
                                Thanh toán khi nhận hàng (COD)
                            </label>
                            <label>
                                <input
                                    type="radio" name="paymentMethod" value="VIETQR"
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
        </>
    );
};


export default CheckoutPage;