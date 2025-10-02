// src/components/Common/FileUpload.js
import React, { useState } from 'react';
import axios from 'axios';
import { notifyError } from '../../services/notificationService';
import './FileUpload.css'; // Chúng ta sẽ tạo file CSS này ngay sau đây

const FileUpload = ({ onUploadSuccess, uploadPreset, label, fileType = 'video' }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const cloudName = 'dpnycqrxe'; // Cloud name của bạn

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/${fileType}/upload`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentCompleted);
                    },
                }
            );
            onUploadSuccess(response.data.secure_url); // Trả về URL của file đã upload
        } catch (error) {
            console.error('Upload Error:', error);
            notifyError('Tải file thất bại. Vui lòng thử lại.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="file-upload-container">
            <label>{label}</label>
            <div className="upload-area">
                <input
                    type="file"
                    id="file-input"
                    onChange={handleFileChange}
                    disabled={uploading}
                    accept="video/*, audio/*" // Chấp nhận cả video và audio
                />
                <label htmlFor="file-input" className={`upload-btn ${uploading ? 'disabled' : ''}`}>
                    <i className="fa-solid fa-cloud-arrow-up"></i> Chọn file
                </label>
                {fileName && !uploading && <span className="file-name">Đã chọn: {fileName}</span>}
            </div>
            {uploading && (
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}>
                        {progress}%
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;