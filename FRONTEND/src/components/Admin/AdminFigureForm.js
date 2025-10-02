// src/components/Admin/AdminFigureForm.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import './AdminCommon.css'; // Dùng lại CSS chung
import FullScreenLoader from '../Common/FullScreenLoader'; // Giả sử đường dẫn này đúng
import { notifySuccess, notifyError } from '../../services/notificationService'; // Giả sử đường dẫn này đúng
import FileUpload from '../Common/FileUpload'; // <-- 1. Import component mới

const AdminFigureForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    // 1. Thêm 'podcast' vào state ban đầu
    const [figure, setFigure] = useState({
        name: '',
        description: '',
        era: '',
        images: [],
        podcast: '', // Thêm trường podcast
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const fetchFigureData = async () => {
            if (isEditing) {
                setIsProcessing(true);
                try {
                    const res = await api.get(`/figures/${id}`);
                    // Đảm bảo state được cập nhật đúng nếu dữ liệu trả về thiếu trường
                    setFigure({
                        name: res.data.name || '',
                        description: res.data.bio || '', // Hoặc res.data.bio tùy vào API
                        era: res.data.period || '',                 // Hoặc res.data.period tùy vào API
                        images: res.data.images || [],
                        podcast: (res.data.podcast && res.data.podcast.length > 0) ? res.data.podcast[0].audioUrl : ''
                    });
                } catch (error) {
                    notifyError("Lỗi khi tải dữ liệu nhân vật.");
                    navigate('/admin/figures');
                } finally {
                    setIsProcessing(false);
                }
            }
        };
        fetchFigureData();
    }, [id, isEditing, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFigure(prev => ({ ...prev, [name]: value }));
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
            setFigure(prev => ({ ...prev, images: [...prev.images, ...uploadedImageUrls] }));
            notifySuccess(`Đã tải lên thành công ${uploadedImageUrls.length} ảnh!`);
        } catch (error) {
            notifyError('Tải một hoặc nhiều ảnh thất bại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const removeImage = (indexToRemove) => {
        setFigure(prev => ({
            ...prev, images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

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
            // Dữ liệu 'figure' bây giờ đã có trường podcast
            if (isEditing) {
                await api.put(`/figures/${id}`, figure);
                notifySuccess('Cập nhật nhân vật thành công!');
            } else {
                await api.post('/figures', figure);
                notifySuccess('Thêm nhân vật thành công!');
            }
            navigate('/admin/figures');
        } catch (error) {
            const message = error.response?.data?.message || 'Đã có lỗi xảy ra khi lưu thông tin nhân vật.';
            notifyError(message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <FullScreenLoader loading={isProcessing} />
            <div className="content-card">
                <div className="content-header">
                    <h2>{isEditing ? `Chỉnh sửa: ${figure.name}` : 'Thêm nhân vật mới'}</h2>
                    <Link to="/admin/figures" className="back-btn">
                        <i className="fa-solid fa-arrow-left"></i> Quay lại
                    </Link>
                </div>

                <div className="content-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-columns-container">
                            <div className="form-column-main">
                                <div className="form-group">
                                    <label>Tên nhân vật</label>
                                    <input type="text" name="name" value={figure.name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Tiểu sử / Mô tả</label>
                                    <textarea name="description" value={figure.description} onChange={handleChange} rows="8"></textarea>
                                </div>
                            </div>
                            <div className="form-column-aside">
                                <div className="form-group">
                                    <label>Thời kỳ</label>
                                    <input type="text" name="era" value={figure.era} onChange={handleChange} placeholder="Ví dụ: Nhà Trần, Triều Nguyễn..." />
                                </div>
                                {/* 2. Thêm ô nhập liệu cho Podcast */}
                                <div className="form-group">
                                    <FileUpload
                                        label="File Podcast (Video/Audio)"
                                        uploadPreset="dakk_unsigned_preset" // Preset của bạn
                                        onUploadSuccess={(url) => {
                                            // 3. Cập nhật state với URL nhận được
                                            setFigure(prev => ({ ...prev, podcast: url }));
                                            // Bạn cũng có thể hiển thị thông báo thành công ở đây
                                        }}
                                    />
                                    {/* Hiển thị link sau khi đã upload thành công */}
                                    {figure.podcast && (
                                        <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                                            <p style={{ margin: 0, fontWeight: 'bold' }}>Đã tải lên:</p>
                                            <a href={figure.podcast} target="_blank" rel="noopener noreferrer">
                                                {figure.podcast}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="image-upload-section">
                            <label>Hình ảnh (Chân dung, tượng...)</label>
                            <div
                                className={`image-dropzone ${isDragging ? 'dragging' : ''}`}
                                onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver} onDrop={handleDrop}
                            >
                                <input id="file-upload" type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} style={{ display: 'none' }} />
                                <label htmlFor="file-upload" className="dropzone-inner">
                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                    <span>Kéo và thả ảnh vào đây, hoặc nhấn để chọn ảnh</span>
                                    <small>Hỗ trợ nhiều ảnh cùng lúc</small>
                                </label>
                            </div>
                            <div className="image-previews-grid">
                                {figure.images.map((img, index) => (
                                    <div key={index} className="image-preview-item">
                                        <img src={img} alt={`Preview ${index + 1}`} />
                                        <button type="button" className="remove-image-btn" onClick={() => removeImage(index)}>&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="add-new-btn" disabled={isProcessing}>
                                <i className="fa-solid fa-save"></i>
                                {isProcessing ? 'Đang xử lý...' : (isEditing ? 'Tạo nhân vật' : 'Lưu thay đổi')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdminFigureForm;