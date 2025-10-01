import React, { useState, useContext } from 'react';
import './Navbar.css';
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Thêm useNavigate
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
  const isUserAdmin = user && (user.role === 'admin' || user.role === 'moderator');

  const handleLogout = () => {
    logout();
    navigate('/login'); // Chuyển về trang đăng nhập sau khi logout
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  const userMenuItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sản phẩm', path: '/products' },
    { name: 'Dòng thời gian', path: '/figures' },
    { name: 'Cộng đồng', path: '/blog' },
    { name: 'Liên hệ', path: '/contact' }
  ];

  const adminMenuItems = [
    { name: 'Cộng đồng', path: '/blog' },
    { name: 'Quản lý Đơn hàng', path: '/admin/orders' },
    { name: 'Quản lý Sản phẩm', path: '/admin/products' },
    { name: 'Quản lý Nhân vật', path: '/admin/figures' },
  ];
  const superAdminMenuItems = [
    { name: 'Quản lý Người dùng', path: '/admin/users' },
    { name: 'Quản lý Mã giảm giá', path: '/admin/coupons' }
  ];

  let menuItems = userMenuItems;
  if (isUserAdmin) {
    menuItems = [...adminMenuItems];
    if (user.role === 'admin') {
      menuItems.push(...superAdminMenuItems);
    }
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/DAUANKINHKY.png" alt="Logo" />
          <img src="/TEXT_DAUANKINHKY1.png" alt="Text" />
        </Link>
      </div>

      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <i className="fa-solid fa-bars"></i>
      </div>

      <div
        className={`menu-overlay ${menuOpen ? 'show' : ''}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* Sửa lại cách render menu để dùng NavLink cho đẹp */}
      <ul className={`nav-links ${menuOpen ? 'show' : ''}`}>
        {menuItems.map(item => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={handleLinkClick}
            >
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="contact">
        {!isUserAdmin && (
          <>
            <div className="hotline">
              <span><strong><i className="fa-solid fa-phone"></i> Hotline: 039 292 0491</strong></span>
            </div>
            <i className="fa-solid fa-magnifying-glass"></i>
            <i className="fa-regular fa-heart"></i>
            <Link to="/cart" className="cart-icon-wrapper">
              <i className="fa-solid fa-bag-shopping"></i>
              {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </Link>
          </>
        )}

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


                {user.role === 'admin' && (
                  <>
                    <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                  </>
                )}

                {user.role === 'moderator' && (
                  <>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}>Tài khoản của tôi</Link>
                    <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                  </>
                )}

                {user.role === 'user' && ( 
                  <>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}>Tài khoản của tôi</Link>
                    <Link to="/order-history" onClick={() => setUserMenuOpen(false)}>Lịch sử mua hàng</Link>
                    <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                  </>
                )}

              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setUserMenuOpen(false)}>Đăng nhập</Link>
                <Link to="/register" onClick={() => setUserMenuOpen(false)}>Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
