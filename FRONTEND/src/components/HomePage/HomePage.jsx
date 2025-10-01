import React, { useState, useEffect, useContext } from 'react'; // Thêm useContext
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../Products/ProductCard';
import './HomePage.css';
import { CartContext } from '../../context/AuthContext'; // Import CartContext
import { notifySuccess, notifyError, notifyInfo } from '../../services/notificationService';
import { showConfirmDialog } from '../../services/confirmationService';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error("Không thể tải sản phẩm nổi bật:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="homepage">
      <section className="hero-section">
        <video className="hero-video" autoPlay loop muted playsInline>
          <source src="/PVCDAKK.mp4" type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video.
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-subheading">Một di sản trong tầm tay</span>
          <h1>Dấu Ấn Kinh Kỳ</h1>
          <p>Mỗi chiếc hộp là một cánh cửa đưa bạn về với những giai thoại lịch sử hào hùng.</p>
          <Link to="/products" className="hero-button">
            <span>Khám phá ngay</span>{' '}
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>

      <section className="featured-products-section">
        <h2 className="section-title">Sản phẩm nổi bật</h2>
        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="concept-section">
        <div className="concept-content">
          <h2>Hơn cả một sản phẩm</h2>
          <p>Chúng tôi không chỉ bán những vật phẩm, chúng tôi mang đến những câu chuyện. Mỗi "Blink Box" được chế tác tỉ mỉ, đi kèm với podcast và nội dung độc quyền, giúp bạn thực sự sống lại những khoảnh khắc vàng son của lịch sử.</p>
            
          <Link to="/figures" className="concept-button">Tìm hiểu các nhân vật <i className="fas fa-arrow-right"></i></Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;