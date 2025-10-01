import React, { useContext } from 'react'; // Thêm useContext
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext
import { notifySuccess, notifyError, notifyInfo } from '../../services/notificationService';
import { showConfirmDialog } from '../../services/confirmationService';

const AdminLayout = () => {

  return (
    <div className="admin-layout">
      <main className="admin-main-content">
        <Outlet /> 
      </main>
    </div>
  );
};
export default AdminLayout;