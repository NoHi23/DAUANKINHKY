// src/pages/Admin/Products/AdminProductForm.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import './AdminCommon.css'; // Dùng lại CSS chung
import FullScreenLoader from '../../components/Common/FullScreenLoader';
import { notifySuccess, notifyError } from '../../services/notificationService';

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [product, setProduct] = useState({
        name: '', sku: '', description: '', price: 0, stockQuantity: 0,
        images: [], historicalFigure: '', isActive: true,
    });
    const [historicalFigures, setHistoricalFigures] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false); // Gộp loading và uploading
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsProcessing(true);
            try {
                const figuresPromise = api.get('/figures');
                if (isEditing) {
                    const productPromise = api.get(`/products/${id}`);
                    const [figuresRes, productRes] = await Promise.all([figuresPromise, productPromise]);
                    setHistoricalFigures(figuresRes.data);
                    setProduct({ ...productRes.data, images: productRes.data.images || [] });
                } else {
                    const figuresRes = await api.get('/figures');
                    setHistoricalFigures(figuresRes.data);
                }
            } catch (error) {
                notifyError("Lỗi khi tải dữ liệu.");
            } finally {
                setIsProcessing(false);
            }
        };
        fetchData();
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageUpload = async (files) => {
        if (!files || files.length === 0) return;
        setIsProcessing(true);
        const uploadPromises = Array.from(files).map(file => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'dakk_unsigned_preset');
            return axios.post('https://api.cloudinary.com/v1_1/dpnycqrxe/image/upload', formData);
        });
        try {
            const responses = await Promise.all(uploadPromises);
            const uploadedImageUrls = responses.map(res => res.data.secure_url);
            setProduct(prev => ({ ...prev, images: [...prev.images, ...uploadedImageUrls] }));
            notifySuccess(`Đã tải lên thành công ${uploadedImageUrls.length} ảnh!`);
        } catch (error) {
            notifyError('Tải một hoặc nhiều ảnh thất bại.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const removeImage = (indexToRemove) => {
        setProduct(prev => ({
            ...prev, images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };
    
    // --- Drag & Drop Handlers ---
    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) handleImageUpload(files);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            if (isEditing) {
                await api.put(`/products/${id}`, product);
                notifySuccess('Cập nhật sản phẩm thành công!');
            } else {
                await api.post('/products', product);
                notifySuccess('Thêm sản phẩm thành công!');
            }
            navigate('/admin/products');
        } catch (error) {
            notifyError('Đã có lỗi xảy ra khi lưu sản phẩm.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <FullScreenLoader loading={isProcessing} />
            <div className="content-card">
                <div className="content-header">
                    <h2>{isEditing ? `Chỉnh sửa: ${product.name}` : 'Thêm sản phẩm mới'}</h2>
                    <Link to="/admin/products" className="back-btn">
                        <i className="fa-solid fa-arrow-left"></i> Quay lại
                    </Link>
                </div>

                <div className="content-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-columns-container">
                            {/* Cột chính */}
                            <div className="form-column-main">
                                <div className="form-group">
                                    <label>Tên sản phẩm</label>
                                    <input type="text" name="name" value={product.name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Mô tả</label>
                                    <textarea name="description" value={product.description} onChange={handleChange} rows="8"></textarea>
                                </div>
                            </div>
                            {/* Cột phụ */}
                            <div className="form-column-aside">
                                <div className="form-group">
                                    <label>Nhân vật lịch sử</label>
                                    <select name="historicalFigure" value={product.historicalFigure} onChange={handleChange} required>
                                        <option value="">-- Chọn nhân vật --</option>
                                        {historicalFigures.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>SKU (Mã sản phẩm)</label>
                                    <input type="text" name="sku" value={product.sku} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Giá (VND)</label>
                                    <input type="number" name="price" value={product.price} onChange={handleChange} required min="0" />
                                </div>
                                <div className="form-group">
                                    <label>Số lượng kho</label>
                                    <input type="number" name="stockQuantity" value={product.stockQuantity} onChange={handleChange} required min="0" />
                                </div>
                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <div className="toggle-switch-wrapper">
                                        <label className="toggle-switch">
                                            <input type="checkbox" name="isActive" checked={product.isActive} onChange={handleChange} />
                                            <span className="slider"></span>
                                        </label>
                                        <span>{product.isActive ? 'Đang bán' : 'Tạm ẩn'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Khu vực Upload ảnh */}
                        <div className="image-upload-section">
                            <label>Hình ảnh sản phẩm</label>
                            <div 
                                className={`image-dropzone ${isDragging ? 'dragging' : ''}`}
                                onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver} onDrop={handleDrop}
                            >
                                <input id="file-upload" type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} style={{display: 'none'}} />
                                <label htmlFor="file-upload" className="dropzone-inner">
                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                    <span>Kéo và thả ảnh vào đây, hoặc nhấn để chọn ảnh</span>
                                    <small>Hỗ trợ nhiều ảnh cùng lúc</small>
                                </label>
                            </div>
                            <div className="image-previews-grid">
                                {product.images.map((img, index) => (
                                    <div key={index} className="image-preview-item">
                                        <img src={img} alt={`Preview ${index + 1}`} />
                                        <button type="button" className="remove-image-btn" onClick={() => removeImage(index)}>&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Nút bấm */}
                        <div className="form-actions">
                            <button type="submit" className="add-new-btn" disabled={isProcessing}>
                                <i className="fa-solid fa-save"></i>
                                {isProcessing ? 'Đang xử lý...' : (isEditing ? 'Lưu thay đổi' : 'Tạo sản phẩm')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdminProductForm;