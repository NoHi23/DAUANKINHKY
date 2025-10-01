import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AdminForm.css';
import axios from 'axios';
import FullScreenLoader from '../Common/FullScreenLoader';

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [product, setProduct] = useState({
        name: '',
        sku: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        images: [],
        historicalFigure: '',
        isActive: true,
    });
    const [historicalFigures, setHistoricalFigures] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const fetchFigures = async () => {
            const response = await api.get('/figures');
            setHistoricalFigures(response.data);
        };
        fetchFigures();

        if (isEditing) {
            const fetchProduct = async () => {
                const response = await api.get(`/products/${id}`);
                setProduct({ ...response.data, images: response.data.images || [] });
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

    const handleImageUpload = async (files) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const uploadPromises = Array.from(files).map(file => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'dakk_unsigned_preset');
            return axios.post('https://api.cloudinary.com/v1_1/dpnycqrxe/image/upload', formData);
        });

        try {
            const responses = await Promise.all(uploadPromises);
            const uploadedImageUrls = responses.map(res => res.data.secure_url);
            setProduct(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedImageUrls],
            }));
        } catch (error) {
            console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
            alert('Tải một hoặc nhiều ảnh thất bại. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleImageUpload(files);
            e.dataTransfer.clearData();
        }
    };
    const removeImage = (indexToRemove) => {
        setProduct(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
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
            navigate('/admin/products');
        } catch (error) {
            console.error("Lỗi khi lưu sản phẩm:", error);
            alert('Đã có lỗi xảy ra.');
        }
    };

    return (
        <div className="admin-form-container">
            <FullScreenLoader loading={isUploading} />
            <div className="form-header">
                <h2>{isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                    <div className="form-group grid-col-span-2">
                        <label htmlFor="name">Tên sản phẩm</label>
                        <input id="name" type="text" name="name" value={product.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">Giá</label>
                        <input id="price" type="number" name="price" value={product.price} onChange={handleChange} required min="0" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="stockQuantity">Số lượng kho</label>
                        <input id="stockQuantity" type="number" name="stockQuantity" value={product.stockQuantity} onChange={handleChange} required min="0" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="sku">SKU</label>
                        <input id="sku" type="text" name="sku" value={product.sku} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="historicalFigure">Nhân vật lịch sử</label>
                        <select id="historicalFigure" name="historicalFigure" value={product.historicalFigure} onChange={handleChange} required>
                            <option value="">-- Chọn nhân vật --</option>
                            {historicalFigures.map(figure => (
                                <option key={figure._id} value={figure._id}>{figure.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group grid-col-span-2">
                        <label htmlFor="description">Mô tả</label>
                        <textarea id="description" name="description" value={product.description} onChange={handleChange}></textarea>
                    </div>

                    <div className="form-group grid-col-span-2">
                        <label>Hình ảnh</label>
                        <div className="image-previews">
                            {product.images.map((img, index) => (
                                <div key={index} className="image-preview-item">
                                    <img src={img} alt={`Preview ${index + 1}`} />
                                    <button type="button" className="remove-image-btn" onClick={() => removeImage(index)}>
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                        <label
                            htmlFor="file-upload"
                            className={`custom-file-upload ${isDragging ? 'dragging' : ''}`}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <i className="fa fa-cloud-upload"></i> Chọn hoặc kéo thả ảnh
                        </label>
                        <input
                            id="file-upload"
                            className="file-input"
                            type="file"
                            multiple
                            onChange={(e) => handleImageUpload(e.target.files)}
                            accept="image/*"
                            disabled={isUploading}
                        />
                    </div>

                    <div className="form-group-checkbox grid-col-span-2">
                        <input type="checkbox" id="isActive" name="isActive" checked={product.isActive} onChange={handleChange} />
                        <label htmlFor="isActive">
                            Đang hoạt động (Hiển thị sản phẩm trên trang web)
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="admin-cancel-btn" onClick={() => navigate('/admin/products')}>
                        Hủy
                    </button>
                    <button type="submit" className="admin-submit-btn" disabled={isUploading}>
                        {isUploading ? 'Đang xử lý...' : (isEditing ? 'Lưu thay đổi' : 'Tạo sản phẩm')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductForm;