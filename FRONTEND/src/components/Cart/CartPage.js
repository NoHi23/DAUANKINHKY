import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import './CartPage.css';

const CartPage = () => {
    const { cart, updateItemQuantity, removeItemFromCart } = useContext(CartContext);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="cart-container empty-cart">
                <h2>Giỏ hàng của bạn đang trống</h2>
                <Link to="/products" className="continue-shopping">Tiếp tục mua sắm</Link>
            </div>
        );
    }
    
    const subTotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <div className="cart-container">
            <h1>Giỏ hàng của bạn</h1>
            <div className="cart-content">
                <div className="cart-items">
                    {cart.items.map(item => (
                        <div key={item.product._id} className="cart-item">
                            <img src={item.product.images[0]} alt={item.product.name} />
                            <div className="item-details">
                                <h3>{item.product.name}</h3>
                                <p>{formatPrice(item.product.price)}</p>
                                <button onClick={() => removeItemFromCart(item.product._id)} className="remove-btn">Xóa</button>
                            </div>
                            <div className="item-quantity">
                                <button onClick={() => updateItemQuantity(item.product._id, item.quantity - 1)}>-</button>
                                <input type="text" value={item.quantity} readOnly />
                                <button onClick={() => updateItemQuantity(item.product._id, item.quantity + 1)}>+</button>
                            </div>
                            <div className="item-subtotal">
                                {formatPrice(item.product.price * item.quantity)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <h2>Tổng cộng</h2>
                    <div className="summary-row">
                        <span>Tạm tính</span>
                        <span>{formatPrice(subTotal)}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Thành tiền</span>
                        <span>{formatPrice(subTotal)}</span>
                    </div>
                    <Link to="/checkout" className="checkout-btn">Tiến hành thanh toán</Link>
                </div>
            </div>
        </div>
    );
};

export default CartPage;