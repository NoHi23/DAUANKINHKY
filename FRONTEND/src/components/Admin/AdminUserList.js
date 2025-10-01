// src/pages/Admin/Users/AdminUserList.js

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { notifySuccess, notifyError } from '../../services/notificationService';
import './AdminCommon.css'; // Dùng lại file CSS chung

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const roles = ['admin', 'moderator', 'user']; 

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/users');
                setUsers(data);
            } catch (error) {
                notifyError("Không thể tải danh sách người dùng.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);
    
    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            notifySuccess('Cập nhật vai trò thành công');
        } catch (error) {
            notifyError('Cập nhật vai trò thất bại');
        }
    };

    if (loading) {
        return <div className="content-card"><h2>Đang tải danh sách người dùng...</h2></div>;
    }

    return (
        <div className="content-card">
            <div className="content-header">
                <h2>Quản lý Người dùng</h2>
            </div>

            <div className="content-body">
                <table className="content-table">
                    <thead>
                        <tr>
                            <th style={{ width: '45%' }}>Người dùng</th>
                            <th style={{ width: '35%' }}>Email</th>
                            <th style={{ width: '20%' }}>Vai trò</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-cell">
                                            <img 
                                                src={user.avatar || '/default-avatar.png'} 
                                                alt={user.name}
                                                className="user-avatar"
                                            />
                                            <span className="user-name">{user.name}</span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <div className="role-select-wrapper">
                                            <select 
                                                className={`role-select role-${user.role}`}
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            >
                                                {roles.map(r => (
                                                    <option key={r} value={r}>
                                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan="3" className="empty-state">
                                    Không tìm thấy người dùng nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUserList;