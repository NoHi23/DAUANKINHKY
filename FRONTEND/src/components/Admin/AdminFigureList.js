// src/pages/Admin/Figures/AdminFigureList.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { notifySuccess, notifyError } from '../../services/notificationService';
import { showConfirmDialog } from '../../services/confirmationService'; // Sử dụng dialog đẹp hơn
import './AdminCommon.css'; // Sẽ tạo file CSS chung cho các trang admin

const AdminFigureList = () => {
    const [figures, setFigures] = useState([]);
    const [loading, setLoading] = useState(true); // Thêm state cho loading

    useEffect(() => {
        const fetchFigures = async () => {
            try {
                const res = await api.get('/figures');
                setFigures(res.data);
            } catch (error) {
                notifyError('Không thể tải danh sách nhân vật.');
            } finally {
                setLoading(false); // Dừng loading sau khi fetch xong
            }
        };
        fetchFigures();
    }, []);

    const handleDelete = async (id, name) => {
        // Sử dụng SweetAlert2 thay cho window.confirm
        const result = await showConfirmDialog({
            title: `Bạn chắc chắn muốn xóa?`,
            text: `Nhân vật "${name}" sẽ bị xóa vĩnh viễn. Hành động này có thể ảnh hưởng đến các sản phẩm liên quan.`,
            icon: 'warning',
            confirmButtonText: 'Vâng, xóa nó!',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/figures/${id}`);
                notifySuccess(`Đã xóa thành công nhân vật "${name}"`);
                setFigures(figures.filter(f => f._id !== id));
            } catch (error) {
                notifyError(error.response?.data?.message || 'Xóa thất bại');
            }
        }
    };

    if (loading) {
        return <div className="content-card"><h2>Đang tải dữ liệu...</h2></div>;
    }

    return (
        <div className="content-card">
            <div className="content-header">
                <h2>Quản lý Nhân vật lịch sử</h2>
                <Link to="/admin/figures/new" className="add-new-btn">
                    <i className="fa-solid fa-plus"></i>
                    <span>Thêm nhân vật</span>
                </Link>
            </div>
            <div className="content-body">
                <table className="content-table">
                    <thead>
                        <tr>
                            <th>Tên nhân vật</th>
                            <th>Thời kỳ</th>
                            <th style={{ width: '150px', textAlign: 'center' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {figures.length > 0 ? (
                            figures.map(figure => (
                                <tr key={figure._id}>
                                    <td>{figure.name}</td>
                                    <td>{figure.period}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link to={`/admin/figures/edit/${figure._id}`} className="btn-edit" title="Chỉnh sửa">
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(figure._id, figure.name)} 
                                                className="btn-delete"
                                                title="Xóa"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="empty-state">
                                    Chưa có nhân vật nào. <Link to="/admin/figures/new">Thêm ngay!</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminFigureList;