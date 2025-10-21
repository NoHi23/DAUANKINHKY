import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './ProductDetailPage.css';
import { CartContext } from '../../context/CartContext';
import { notifySuccess, notifyError } from '../../services/notificationService';

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const { id } = useParams();
  const { addItemToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        const productData = response.data;
        setProduct(productData);

        if (productData && productData.images && productData.images.length > 0) {
          setSelectedImage(productData.images[0]);
        }

        if (productData.stock < 1) {
          setQuantity(0);
        }
      } catch (err) {
        setError('Không tìm thấy sản phẩm.');
        notifyError('Không tìm thấy sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (amount) => {
    if (!product || product.stock <= 0) return;
    setQuantity(prev => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      if (newQuantity > product.stock) {
        notifyError(`Chỉ còn ${product.stock} sản phẩm trong kho.`);
        return product.stock;
      }
      return newQuantity;
    });
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) {
      notifyError('Sản phẩm đã hết hàng!');
      return;
    }
    if (quantity > product.stock) {
      notifyError(`Số lượng yêu cầu vượt quá số lượng tồn kho (${product.stock}).`);
      return;
    }
    const wasAdded = await addItemToCart(id, quantity);
    if (wasAdded) {
      notifySuccess(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <div className="loading-message">Đang tải chi tiết sản phẩm...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-detail-container">
      <div className="product-main-view">
        <div className="product-gallery">
          <div className="main-image-container">
            <img src={selectedImage || '/placeholder.jpg'} alt={product.name} className="main-image" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-container">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className={`thumbnail-image ${image === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="product-purchase-info">
          <h1>{product.name}</h1>
          <p className="price">{formatPrice(product.price)}</p>
          <p className="description">{product.description}</p>
          {isOutOfStock ? (
            <p className="out-of-stock-message">Hết hàng</p>
          ) : (
            <>
              <div className="quantity-selector">
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>+</button>
              </div>
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                Thêm vào giỏ hàng
              </button>
            </>
          )}
        </div>
      </div>
      {product.historicalFigure && (
        <div className="historical-figure-section">
          <h2>Giai thoại lịch sử</h2>
          <div className="figure-content">
            <img src={product.historicalFigure.mainImage} alt={product.historicalFigure.name} />
            <div className="figure-bio">
              <h3>{product.historicalFigure.name}</h3>
              <p className="period">Thời kỳ: {product.historicalFigure.period}</p>

              <div className="bio"  dangerouslySetInnerHTML={{ __html: product.historicalFigure.bio }}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductDetailPage;