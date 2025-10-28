// components/Checkout/PaymentSuccessPage.jsx

import React, { useState } from 'react';
import api from '../../services/api';
import { notifySuccess, notifyError } from '../../services/notificationService';
import { useSearchParams, useNavigate } from 'react-router-dom'; // (SỬA) Thêm useNavigate
import axios from 'axios'; // (SỬA) 1. Import axios để gọi Cloudinary
import './PaymentStatus.css';
import FullScreenLoader from '../Common/FullScreenLoader';

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // (SỬA) Dùng navigate

    const onFileChange = e => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith('image/')) return notifyError('Vui lòng chọn file ảnh');
        if (f.size > 5 * 1024 * 1024) return notifyError('Kích thước tối đa 5MB');
        setFile(f);

        // Thu hồi URL cũ (nếu có) trước khi tạo cái mới
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(URL.createObjectURL(f));
    };

    // (SỬA) 2. Viết lại hoàn toàn hàm handleUpload theo logic của code mẫu
    const handleUpload = async () => {
        if (!file) return notifyError('Chưa chọn ảnh');

        setLoading(true);

        // --- BƯỚC 1: Tải ảnh lên Cloudinary ---
        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', file);
        cloudinaryForm.append('upload_preset', 'dakk_unsigned_preset');

        let secure_url;
        try {
            const cloudinaryRes = await axios.post(
                'https://api.cloudinary.com/v1_1/dpnycqrxe/image/upload', // Lấy từ code mẫu
                cloudinaryForm
            );
            secure_url = cloudinaryRes.data.secure_url;

        } catch (uploadError) {
            console.error("Lỗi Cloudinary:", uploadError);
            notifyError('Tải ảnh lên dịch vụ đám mây thất bại.');
            setLoading(false); // Dừng lại ở đây
            return;
        }

        // --- BƯỚC 2: Gửi URL về backend của bạn để lưu ---
        if (!secure_url) {
            notifyError('Không nhận được URL từ Cloudinary.');
            setLoading(false);
            return;
        }

        try {
            // (SỬA) 3. Gửi JSON chứa URL về backend, thay vì FormData
            await api.post(`/orders/${orderId}/upload-bill`, {
                billImage: secure_url
            });

            notifySuccess('Đã gửi ảnh bill. Đang chờ xác minh từ Admin.');
            setFile(null);
            setPreview(null);

            // (SỬA) Dùng navigate để chuyển trang
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            console.error("Lỗi lưu vào backend:", err);
            notifyError('Lưu URL biên lai thất bại. Vui lòng thử lại.');
        } finally {
            // finally sẽ luôn chạy, đảm bảo tắt loading
            setLoading(false);
        }
    };


    return (
        // (SỬA) 4. Bọc component bằng Fragment <> để đặt Loader
        <>
            <FullScreenLoader loading={loading} />
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
                            // (SỬA) 5. Cải thiện logic disabled và text
                            disabled={loading || !file}
                        >
                            {loading ? 'Đang tải...' : 'Gửi ảnh bill'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}