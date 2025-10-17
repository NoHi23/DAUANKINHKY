// components/Checkout/PaymentSuccessPage.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import { notifySuccess, notifyError } from '../../services/notificationService';
import { useSearchParams } from 'react-router-dom';
import './PaymentStatus.css';
import FullScreenLoader from '../Common/FullScreenLoader';
import { useNavigate } from 'react-router-dom';


export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFileChange = e => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith('image/')) return notifyError('Vui lòng chọn file ảnh');
        if (f.size > 5 * 1024 * 1024) return notifyError('Kích thước tối đa 5MB');
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };
    const handleUpload = async () => {
        if (!file) return notifyError('Chưa chọn ảnh');
        const form = new FormData();
        form.append('billImage', file);
        setLoading(true);
        try {
            await api.post(`/orders/${orderId}/upload-bill`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            notifySuccess('Đã gửi ảnh bill. Đang chờ xác minh từ Admin.');
            setFile(null);
            setPreview(null);
            // Chuyển về trang chủ sau 2 giây
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (err) {
            notifyError('Upload thất bại');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="payment-success-page">
            <div className="success-card">
                <h2 className="title"> Thanh toán thành công!</h2>
                <p className="subtitle">Cảm ơn bạn đã đặt hàng. Vui lòng gửi ảnh bill để admin xác minh.</p>

                <div className="upload-section">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        id="fileUpload"
                    />
                    {preview && <img src={preview} alt="preview" className="preview-image" />}
                    <button
                        className="upload-btn"
                        onClick={handleUpload}
                        disabled={loading}
                    >
                        {loading ? <FullScreenLoader /> : 'Gửi ảnh bill'}
                    </button>
                </div>
            </div>
        </div>
    );
}
