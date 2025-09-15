import React, { useContext } from 'react'; // Thêm useContext
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

const AdminLayout = () => {
  const { user } = useContext(AuthContext); // Lấy thông tin user đang đăng nhập

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h3>Admin Panel</h3>
        <nav>
          <NavLink to="/admin/orders">Quản lý Đơn hàng</NavLink>
          <NavLink to="/admin/products">Quản lý Sản phẩm</NavLink>
          <NavLink to="/admin/figures">Quản lý Nhân vật</NavLink>

          {/* Chỉ Admin mới thấy các mục này */}
          {user && user.role === 'admin' && (
            <>
              <NavLink to="/admin/users">Quản lý Người dùng</NavLink>
              <NavLink to="/admin/coupons">Quản lý Mã giảm giá</NavLink>
            </>
          )}
        </nav>
      </aside>
      <main className="admin-main-content">
        <Outlet /> {/* Đây là nơi nội dung của các trang con sẽ hiển thị */}
      </main>
    </div>
  );
};
export default AdminLayout;