import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AdminForm.css'; // CSS dùng chung cho các form admin

const AdminProductForm = () => {
    const { id } = useParams(); // Lấy id từ URL, nếu có
    const navigate = useNavigate();
    const isEditing = Boolean(id); // Xác định đang sửa hay thêm mới

    const [product, setProduct] = useState({
        name: '',
        sku: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        images: [''], // Bắt đầu với một ảnh
        historicalFigure: '',
        isActive: true,
    });
    const [historicalFigures, setHistoricalFigures] = useState([]);

    useEffect(() => {
        // Lấy danh sách các nhân vật lịch sử để làm dropdown
        const fetchFigures = async () => {
            const response = await api.get('/figures');
            setHistoricalFigures(response.data);
        };
        fetchFigures();

        // Nếu là trang sửa, lấy thông tin sản phẩm
        if (isEditing) {
            const fetchProduct = async () => {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
            };
            fetchProduct();
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageChange = (index, value) => {
        const newImages = [...product.images];
        newImages[index] = value;
        setProduct(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setProduct(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/products/${id}`, product);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await api.post('/products', product);
                alert('Thêm sản phẩm thành công!');
            }
            navigate('/admin/products'); // Quay về trang danh sách
        } catch (error) {
            console.error("Lỗi khi lưu sản phẩm:", error);
            alert('Đã có lỗi xảy ra.');
        }
    };

    return (
        <div className="admin-page">
            <h2>{isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label>Tên sản phẩm</label>
                    <input type="text" name="name" value={product.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>SKU</label>
                    <input type="text" name="sku" value={product.sku} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Mô tả</label>
                    <textarea name="description" value={product.description} onChange={handleChange}></textarea>
                </div>
                <div className="form-group">
                    <label>Giá</label>
                    <input type="number" name="price" value={product.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Số lượng kho</label>
                    <input type="number" name="stockQuantity" value={product.stockQuantity} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Nhân vật lịch sử</label>
                    <select name="historicalFigure" value={product.historicalFigure} onChange={handleChange} required>
                        <option value="">-- Chọn nhân vật --</option>
                        {historicalFigures.map(figure => (
                            <option key={figure._id} value={figure._id}>{figure.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Hình ảnh (URL)</label>
                    {product.images.map((img, index) => (
                        <input
                            key={index}
                            type="text"
                            value={img}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            style={{ marginBottom: '10px' }}
                        />
                    ))}
                    <button type="button" onClick={addImageField}>Thêm ảnh</button>
                </div>
                <div className="form-group-checkbox">
                    <label>
                        <input type="checkbox" name="isActive" checked={product.isActive} onChange={handleChange} />
                        Đang hoạt động
                    </label>
                </div>
                <button type="submit" className="admin-submit-btn">
                    {isEditing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                </button>
            </form>
        </div>
    );
};

export default AdminProductForm;