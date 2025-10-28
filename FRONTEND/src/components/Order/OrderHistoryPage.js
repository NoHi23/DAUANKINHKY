// src/pages/User/OrderHistoryPage.js (Giả sử đường dẫn)

import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './OrderHistoryPage.css';
import { notifySuccess, notifyError } from '../../services/notificationService';
import FullScreenLoader from '../Common/FullScreenLoader';
import axios from 'axios'; // (SỬA) 1. Import axios trần để gọi Cloudinary (giống code mẫu)

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho việc upload
    const [uploadingOrderId, setUploadingOrderId] = useState(null);
    const [selectedOrderIdForUpload, setSelectedOrderIdForUpload] = useState(null);
    const fileInputRef = useRef(null);

    // State cho việc xem ảnh bill (modal)
    const [previewImageUrl, setPreviewImageUrl] = useState(null);

    // State cho việc XEM TRƯỚC (preview) KHI UPLOAD
    const [fileToUpload, setFileToUpload] = useState(null);
    const [tempPreviewUrl, setTempPreviewUrl] = useState(null);

    // Hàm fetch data (tách riêng để có thể gọi lại)
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders');
            setOrders(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Lỗi khi tải lịch sử đơn hàng:", error);
            notifyError("Không thể tải lịch sử đơn hàng.");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Hàm reset toàn bộ state upload/preview
    const fullReset = () => {
        if (tempPreviewUrl) {
            URL.revokeObjectURL(tempPreviewUrl); // Thu hồi URL để giải phóng bộ nhớ
        }
        setFileToUpload(null);
        setTempPreviewUrl(null);
        setSelectedOrderIdForUpload(null);
        setUploadingOrderId(null); // Đảm bảo tắt loading
        if (fileInputRef.current) {
            fileInputRef.current.value = null; // Reset input tệp
        }
    };

    // Kích hoạt cửa sổ chọn tệp
    const handleTriggerUpload = (orderId) => {
        setSelectedOrderIdForUpload(orderId); // Lưu ID đơn hàng
        fileInputRef.current.click();
    };

    // Hàm này CHỈ KIỂM TRA VÀ MỞ PREVIEW (giữ nguyên, đã đúng)
    const handleFileSelected = (e) => {
        const file = e.target.files[0];
        const orderId = selectedOrderIdForUpload; // Lấy ID đã lưu

        if (!file || !orderId) {
            fullReset(); // Reset nếu người dùng hủy
            return;
        }

        // --- VALIDATION ---
        if (!file.type.startsWith('image/')) {
            notifyError('Vui lòng chọn file ảnh');
            fullReset();
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            notifyError('Kích thước ảnh tối đa 5MB');
            fullReset();
            return;
        }

        // --- THIẾT LẬP PREVIEW ---
        setFileToUpload(file);
        setTempPreviewUrl(URL.createObjectURL(file));
    };

    // (SỬA) 2. Hàm này được viết lại hoàn toàn theo logic của code mẫu
    const handleConfirmUpload = async () => {
        if (!fileToUpload || !selectedOrderIdForUpload) {
            notifyError("Lỗi: Không tìm thấy tệp hoặc ID đơn hàng.");
            fullReset();
            return;
        }

        const orderId = selectedOrderIdForUpload;
        setUploadingOrderId(orderId); // Bắt đầu loading (cho nút trong modal)

        // --- BƯỚC 1: Tải ảnh lên Cloudinary (giống code mẫu) ---
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('upload_preset', 'dakk_unsigned_preset'); // Lấy từ code mẫu

        let secure_url;
        try {
            const cloudinaryRes = await axios.post(
                'https://api.cloudinary.com/v1_1/dpnycqrxe/image/upload', // Lấy từ code mẫu
                formData
            );
            secure_url = cloudinaryRes.data.secure_url; // Lấy URL trả về
        } catch (uploadError) {
            notifyError('Tải ảnh lên Cloudinary thất bại.');
            console.error("Lỗi Cloudinary:", uploadError);
            setUploadingOrderId(null); // Tắt loading
            // Không reset full() để người dùng có thể thử lại
            return;
        }

        // --- BƯỚC 2: Gửi URL về backend của bạn để lưu ---
        if (secure_url) {
            try {
                // Gửi URL về backend. 
                // Backend của bạn cần chấp nhận JSON вида { billImageUrl: "http://..." }
                // tại endpoint này.
                await api.post(`/orders/${orderId}/upload-bill`, { 
                    billImage: secure_url 
                });

                notifySuccess('Cập nhật biên lai thành công!');
                
                // GỌI LẠI fetchOrders() để lấy dữ liệu mới nhất
                await fetchOrders();

            } catch (err) {
                notifyError('Lưu URL biên lai thất bại. Vui lòng thử lại.');
                console.error("Lỗi khi lưu URL vào backend:", err);
            } finally {
                fullReset(); // 3. Dọn dẹp tất cả state (bao gồm cả tắt loading)
            }
        } else {
             notifyError('Không nhận được URL từ Cloudinary.');
             fullReset();
        }
    };

    // Chỉ hiển thị loading xoay tròn khi tải trang lần đầu
    if (loading && orders.length === 0) return <FullScreenLoader />;

    return (
        <div className="order-history-container">
            {/* Input tệp ẩn */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                style={{ display: 'none' }}
                accept="image/*"
            />

            {/* Modal xem ảnh ĐÃ UPLOAD */}
            {previewImageUrl && (
                <div className="image-preview-modal" onClick={() => setPreviewImageUrl(null)}>
                    <img src={previewImageUrl} alt="Xem trước biên lai" />
                </div>
            )}

            {/* (MỚI) Modal xem trước KHI UPLOAD */}
            {tempPreviewUrl && (
                <div className="image-preview-modal">
                    <div className="preview-content">
                        <img src={tempPreviewUrl} alt="Xem trước ảnh tải lên" />
                        <div className="preview-actions">
                            <button
                                className="btn-cancel"
                                onClick={fullReset}
                                disabled={uploadingOrderId} // Vô hiệu hóa khi đang tải
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-confirm"
                                onClick={handleConfirmUpload}
                                disabled={uploadingOrderId} // Vô hiệu hóa khi đang tải
                            >
                                {uploadingOrderId ? 'Đang tải...' : 'Xác nhận & Tải lên'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1>Lịch sử mua hàng</h1>
            {orders.length === 0 ? (
                <p>Bạn chưa có đơn hàng nào.</p>
            ) : (
                orders.map(order => {
                    // Định nghĩa các biến trạng thái cho dễ đọc
                    const hasBill = order.billImage && order.billImage !== '';
                    const isPending = (order.status || '').toLowerCase() === 'pending';
                    const isProcessing = (order.status || '').toLowerCase() === 'processing';
                    
                    return (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <span>Mã đơn hàng: #{order._id.slice(-6).toUpperCase()}</span>
                                <span className={`status status-${(order.status || '').toLowerCase()}`}>
                                    {order.status || 'Chưa rõ'}
                                </span>
                            </div>
                            <div className="order-body">
                                {(order.items || []).map((item, index) => (
                                    <div key={item.product?._id || item._id || index} className="order-item">
                                        <span>{item.product?.name || '[Sản phẩm đã xóa]'} (x{item.quantity})</span>
                                        <span>{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="order-footer">
                                <strong>Tổng cộng: {formatPrice(order.totalAmount)}</strong>
                                <div className="order-actions">
                                    {/* 1. Luôn hiển thị "Xem" nếu CÓ bill */}
                                    {hasBill && (
                                        <button
                                            className="view-bill-link"
                                            // (SỬA) 3. Lỗi logic: Dùng 'paymentReceiptUrl' 
                                            // thay vì 'billImage'
                                            onClick={() => setPreviewImageUrl(order.billImage)}
                                        >
                                            <i className="fa-solid fa-receipt"></i> Xem biên lai
                                        </button>
                                    )}

                                    {/* 2. Hiển thị "Upload/Update" nếu là PENDING hoặc PROCESSING */}
                                    {/* (SỬA) 4. Lỗi logic: Phải là (isPending || isProcessing)
                                        như comment của bạn */}
                                    {(isPending || isProcessing) && (
                                        <button
                                            className="upload-bill-btn"
                                            onClick={() => handleTriggerUpload(order._id)}
                                        >
                                            <i className="fa-solid fa-upload"></i>
                                            {/* Sửa text cho gọn */}
                                            {hasBill ? 'Cập nhật biên lai' : 'Tải lên biên lai'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default OrderHistoryPage;