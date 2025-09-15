import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const roles = ['user', 'moderator', 'admin'];

    useEffect(() => {
        const fetchUsers = async () => {
            const { data } = await api.get('/users');
            setUsers(data);
        };
        fetchUsers();
    }, []);
    
    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            alert('Cập nhật vai trò thành công');
        } catch (error) {
            alert('Cập nhật vai trò thất bại');
        }
    };

    return (
        <div className="admin-page">
            <h2>Quản lý Người dùng</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <select 
                                    value={user.role} 
                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                >
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUserList;