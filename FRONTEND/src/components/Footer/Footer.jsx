import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section logo-section">
          <img src="DAUANKINHKY.png" alt="Dấu Ấn Kinh Kỳ Logo" />
          {" "}
          <img src="TEXT_DAUANKINHKY1.png" alt="Dấu Ấn Kinh kỳ" />
          <p>
            GIỚI THIỆU VỀ CÔNG TY...
          </p>
        </div>
        <div className="footer-section">
          <h3>Giới thiệu</h3>
          <ul>
            <li>Về chúng tôi</li>
            <li>Điều khoản và điều kiện</li>
            <li>Chính sách riêng tư</li>
            <li>Hướng dẫn sử dụng</li>
            <li>Hình thức thanh toán</li>
            <li>Liên hệ</li>
            <li>Hotline: 0922222016</li>
            <li>Email: info@DAUANKINHKY.com</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Điểm đến</h3>
          <ul>
            <li>Vĩnh Long</li>
            <li>Vĩnh Lan Hà</li>
            <li>Đảo Cát Bà</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Du thuyền</h3>
          <ul>
            <li>Blog</li>
            <li>Quy định chung về lưu trú</li>
            <li>Câu hỏi thường gặp</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Bản quyền © 2024 Mixiviu.</p>
        <img src="path-to-baothanhbao-logo.png" alt="Bảo Thạnh Bảo Logo" />
      </div>
    </footer>
  );
};

export default Footer;