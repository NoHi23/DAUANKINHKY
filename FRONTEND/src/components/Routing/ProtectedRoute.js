import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Sửa lại để nhận một mảng các vai trò được phép
const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useContext(AuthContext);

    // 1. Vẫn kiểm tra đăng nhập
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Nếu có danh sách allowedRoles và vai trò của user không nằm trong đó -> từ chối
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />; // Chuyển về trang chủ nếu không có quyền
    }

    return <Outlet />;
};

export default ProtectedRoute;