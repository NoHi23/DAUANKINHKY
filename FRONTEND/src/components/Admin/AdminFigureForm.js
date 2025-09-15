import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AdminForm.css';

const AdminFigureForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [figure, setFigure] = useState({
        name: '', period: '', bio: '', mainImage: '', podcast: [], gallery: []
    });

    useEffect(() => {
        if (isEditing) {
            api.get(`/figures/${id}`).then(res => setFigure(res.data));
        }
    }, [id, isEditing]);

    const handleChange = (e) => setFigure({ ...figure, [e.target.name]: e.target.value });

    // ... (Viết thêm các hàm handle cho podcast và gallery nếu cần)

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/figures/${id}`, figure);
            } else {
                await api.post('/figures', figure);
            }
            alert('Lưu thành công!');
            navigate('/admin/figures');
        } catch (error) {
            alert('Có lỗi xảy ra!');
        }
    };

    return (
        <div className="admin-page">
            <h2>{isEditing ? 'Sửa thông tin' : 'Thêm nhân vật mới'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label>Tên nhân vật</label>
                    <input type="text" name="name" value={figure.name} onChange={handleChange} required/>
                </div>
                <div className="form-group">
                    <label>Thời kỳ</label>
                    <input type="text" name="period" value={figure.period} onChange={handleChange} required/>
                </div>
                <div className="form-group">
                    <label>Ảnh đại diện (URL)</label>
                    <input type="text" name="mainImage" value={figure.mainImage} onChange={handleChange} required/>
                </div>
                <div className="form-group">
                    <label>Tiểu sử</label>
                    <textarea name="bio" value={figure.bio} onChange={handleChange}></textarea>
                </div>
                {/* Các trường cho podcast và gallery có thể được thêm ở đây */}
                <button type="submit" className="admin-submit-btn">Lưu</button>
            </form>
        </div>
    );
};
export default AdminFigureForm;