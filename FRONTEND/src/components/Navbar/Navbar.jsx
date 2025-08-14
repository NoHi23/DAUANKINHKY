import React, { useState } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('Trang chủ');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkClick = (link) => {
    setActiveLink(link);
    setMenuOpen(false); // đóng menu sau khi chọn
  };

  const menuItems = [
    'Trang chủ',
    'Giới thiệu',
    'Sản phẩm',
    'Blog',
    'Liên hệ',
    'Kiểm tra đơn hàng'
  ];

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="DAUANKINHKY.png" alt="Logo" />
          <img src="TEXT_DAUANKINHKY1.png" alt="Text" />
        </Link>
      </div>

      {/* Nút Hamburger */}
      <div
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <i className="fa-solid fa-bars"></i>
      </div>

      {/* Overlay */}
      <div
        className={`menu-overlay ${menuOpen ? 'show' : ''}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* Menu Links */}
      <ul className={`nav-links ${menuOpen ? 'show' : ''}`}>
        <li className="mobile-only account-menu">
          <i className="fa-regular fa-user"></i> Tài khoản
          <div className="sub-menu">
            <a href="/profile">Tài khoản</a>
            <a href="/logout">Đăng xuất</a>
          </div>
        </li>
        {menuItems.map(item => (
          <li key={item}>
            <a
              href="#"
              className={activeLink === item ? 'active' : ''}
              onClick={() => handleLinkClick(item)}
            >
              {item}
            </a>
          </li>
        ))}
      </ul>

      {/* Contact icons */}
      <div className="contact">
        <div className="hotline">
          <span><strong><i className="fa-solid fa-phone"></i> Hotline: 0922222016</strong></span>
        </div>
        <i className="fa-solid fa-magnifying-glass"></i>
        {/* Icon user sẽ ẩn khi mobile */}
        <i className="fa-regular fa-user"></i>
        {/* Yêu thích ẩn hẳn hoặc giữ tùy ý */}
        <i className="fa-regular fa-heart"></i>
        <i className="fa-solid fa-bag-shopping"></i>
      </div>
    </nav>
  );
};

export default Navbar;
