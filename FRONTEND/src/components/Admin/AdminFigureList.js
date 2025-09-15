import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminFigureList = () => {
    const [figures, setFigures] = useState([]);

    useEffect(() => {
        api.get('/figures').then(res => setFigures(res.data));
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa nhân vật này? Việc này có thể gây lỗi nếu có sản phẩm đang liên kết.')) {
            try {
                await api.delete(`/figures/${id}`);
                alert('Xóa thành công');
                setFigures(figures.filter(f => f._id !== id));
            } catch (error) {
                alert(error.response.data.message || 'Xóa thất bại');
            }
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Quản lý Nhân vật lịch sử</h2>
                <Link to="/admin/figures/new" className="admin-add-btn">Thêm nhân vật mới</Link>
            </div>
            <table className="admin-table">
                <thead><tr><th>Tên</th><th>Thời kỳ</th><th>Hành động</th></tr></thead>
                <tbody>
                    {figures.map(figure => (
                        <tr key={figure._id}>
                            <td>{figure.name}</td>
                            <td>{figure.period}</td>
                            <td>
                                <Link to={`/admin/figures/edit/${figure._id}`}>Sửa</Link>
                                <button onClick={() => handleDelete(figure._id)} className="admin-delete-btn" style={{ marginLeft: '10px' }}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminFigureList;