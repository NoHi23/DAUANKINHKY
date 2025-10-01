import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import { CartContext } from '../../context/CartContext';
import { notifySuccess } from '../../services/notificationService';
import './ProductCard.css';

const ProductCard = ({ product }) => {

    const { addItemToCart } = useContext(CartContext);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isSuccess = await addItemToCart(product._id, 1);

        if (isSuccess) {
            notifySuccess(`Đã thêm "${product.name}" vào giỏ hàng!`);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="product-card">
            <Link to={`/products/${product._id}`}>
                <div className="product-image-wrapper">
                    <img src={product.images[0] || 'placeholder.jpg'} alt={product.name} className="product-image" />
                    <button className="add-to-cart-hover-btn" onClick={handleAddToCart}>
                        <i className="fa-solid fa-cart-plus"></i> Thêm vào giỏ
                    </button>
                </div>
                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">{formatPrice(product.price)}</p>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;