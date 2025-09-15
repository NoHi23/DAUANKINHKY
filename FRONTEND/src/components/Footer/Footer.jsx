import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* === Cột 1: Logo và Mạng xã hội === */}
        <div className="footer-section about">
          <div className="footer-logo">
            <img src="/DAUANKINHKY.png" alt="Dấu Ấn Kinh Kỳ Logo" />
            <img src="/TEXT_DAUANKINHKY1.png" alt="Dấu Ấn Kinh Kỳ" />
          </div>
          <p>
            Khám phá lịch sử qua những vật phẩm độc đáo. Mỗi sản phẩm là một câu chuyện, một dấu ấn không thể phai mờ.
          </p>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            <a href="#" aria-label="Tiktok"><i className="fab fa-tiktok"></i></a>
          </div>
        </div>

        {/* === Cột 2: Về Chúng Tôi === */}
        <div className="footer-section links">
          <h3>Về Chúng Tôi</h3>
          <ul>
            <li><Link to="/about">Câu chuyện thương hiệu</Link></li>
            <li><Link to="/figures">Dòng thời gian Ký Ức</Link></li>
            <li><Link to="/blog">Cộng đồng</Link></li>
            <li><Link to="/contact">Liên hệ</Link></li>
          </ul>
        </div>

        {/* === Cột 3: Hỗ Trợ Khách Hàng === */}
        <div className="footer-section links">
          <h3>Hỗ Trợ Khách Hàng</h3>
          <ul>
            <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
            <li><Link to="/shipping-policy">Chính sách giao hàng</Link></li>
            <li><Link to="/return-policy">Chính sách đổi trả</Link></li>
            <li><Link to="/payment-methods">Hình thức thanh toán</Link></li>
          </ul>
        </div>

        {/* === Cột 4: Kết Nối & Đăng ký nhận tin === */}
        <div className="footer-section contact-subscribe">
          <h3>Kết Nối Với Chúng Tôi</h3>
          <p><i className="fas fa-map-marker-alt"></i> Từ Sơn, Bắc Ninh, Việt Nam</p>
          <p><i className="fas fa-phone"></i> Hotline: 0922.222.016</p>
          <p><i className="fas fa-envelope"></i> Email: info@dauankinhky.com</p>
          <div className="subscribe-form">
            <input type="email" placeholder="Nhập email của bạn..." />
            <button>Đăng ký</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Bản quyền © 2025 Dấu Ấn Kinh Kỳ. Đã đăng ký bản quyền.</p>
        {/* Thêm các icon thanh toán được chấp nhận */}
        <div className="payment-icons">
          <i className="fab fa-cc-visa"></i>
          <i className="fab fa-cc-mastercard"></i>
          <img src="/momo-logo.png" alt="Momo" style={{ height: '20px' }} />
          <img src="/vnpay-logo.png" alt="VNPAY" style={{ height: '20px' }} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;