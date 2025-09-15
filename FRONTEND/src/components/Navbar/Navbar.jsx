import React, { useState, useContext } from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('Trang chủ');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false); // <<-- 1. STATE MỚI
  const { user, logout } = useContext(AuthContext); // Lấy user và hàm logout từ context
  const { cart } = useContext(CartContext); // Lấy cart từ context
  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Chuyển về trang đăng nhập sau khi logout
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
    setMenuOpen(false);
  };

  const menuItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sản phẩm', path: '/products' },
    { name: 'Dòng thời gian', path: '/figures' },
    { name: 'Cộng đồng', path: '/blog' },
    { name: 'Liên hệ', path: '/contact' }
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
        {/* ... phần menu mobile giữ nguyên ... */}
        {menuItems.map(item => (
          <li key={item.path}> {/* <<-- 2. Sửa key={item} thành key={item.path} để tránh warning */}
            <Link
              to={item.path}
              className={activeLink === item.name ? 'active' : ''}
              onClick={() => handleLinkClick(item.name)}
            >
              {item.name}
            </Link>
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
        <div
          className="user-icon-wrapper"
          onMouseEnter={() => setUserMenuOpen(true)}
          onMouseLeave={() => setUserMenuOpen(false)}
        >
          <i className="fa-regular fa-user"></i>
          <div className={`user-menu ${userMenuOpen ? 'active' : ''}`}>
            {user ? (
              <>
                <div className="user-menu-greeting">Chào, {user.name}</div>
                <Link to="/profile" onClick={() => setUserMenuOpen(false)}>Tài khoản của tôi</Link>
                <Link to="/order-history" onClick={() => setUserMenuOpen(false)}>Lịch sử mua hàng</Link>
                <button onClick={handleLogout} className="logout-btn">Đăng xuất</button> {/* <<-- 4. ĐỔI THÀNH BUTTON */}
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setUserMenuOpen(false)}>Đăng nhập</Link>
                <Link to="/register" onClick={() => setUserMenuOpen(false)}>Đăng ký</Link>
              </>
            )}
          </div>
        </div>
        {/* Yêu thích ẩn hẳn hoặc giữ tùy ý */}
        <i className="fa-regular fa-heart"></i>
        <Link to="/cart" className="cart-icon-wrapper">
          <i className="fa-solid fa-bag-shopping"></i>
          {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
