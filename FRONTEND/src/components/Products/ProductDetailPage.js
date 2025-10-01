import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './ProductDetailPage.css';
import { useContext } from 'react'; // Đảm bảo đã import useContext
import { CartContext } from '../../context/CartContext';
import { notifySuccess, notifyError, notifyInfo } from '../../services/notificationService';
import { showConfirmDialog } from '../../services/confirmationService';

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const { addItemToCart } = useContext(CartContext);
  const [addedMessage, setAddedMessage] = useState('');

  const handleAddToCart = async () => {
    await addItemToCart(id, quantity);
    notifySuccess('Đã thêm sản phẩm vào giỏ hàng!');
    setTimeout(() => setAddedMessage(''), 3000); // Ẩn thông báo sau 3 giây
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        notifyError('Không tìm thấy sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]); // useEffect sẽ chạy lại nếu ID trên URL thay đổi

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount)); // Số lượng không được nhỏ hơn 1
  };

  // Định dạng giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <div className="loading-message">Đang tải chi tiết sản phẩm...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return null;

  return (
    <div className="product-detail-container">
      <div className="product-main-view">
        <div className="product-gallery">
          <img src={product.images[0] || '/placeholder.jpg'} alt={product.name} />
        </div>
        <div className="product-purchase-info">
          <h1>{product.name}</h1>
          <p className="price">{formatPrice(product.price)}</p>
          <p className="description">{product.description}</p>
          <div className="quantity-selector">
            <button onClick={() => handleQuantityChange(-1)}>-</button>
            <input type="number" value={quantity} readOnly />
            <button onClick={() => handleQuantityChange(1)}>+</button>
          </div>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Phần thông tin về nhân vật lịch sử */}
      <div className="historical-figure-section">
        <h2>Giai thoại lịch sử</h2>
        <div className="figure-content">
          <img src={product.historicalFigure.mainImage} alt={product.historicalFigure.name} />
          <div>
            <h3>{product.historicalFigure.name}</h3>
            <p className="period">Thời kỳ: {product.historicalFigure.period}</p>
            <p className="bio">{product.historicalFigure.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;