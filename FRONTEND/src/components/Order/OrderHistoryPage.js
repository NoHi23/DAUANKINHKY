import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './OrderHistoryPage.css';
import { notifySuccess, notifyError } from '../../services/notificationService';
import FullScreenLoader from '../Common/FullScreenLoader';

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

    // (MỚI) Hàm reset toàn bộ state upload/preview
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

    // (ĐÃ SỬA) Hàm này giờ CHỈ KIỂM TRA VÀ MỞ PREVIEW
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

    // (ĐÃ SỬA) Hàm này THỰC SỰ TẢI LÊN (upload)
    const handleConfirmUpload = async () => {
        if (!fileToUpload || !selectedOrderIdForUpload) {
            notifyError("Lỗi: Không tìm thấy tệp hoặc ID đơn hàng.");
            fullReset();
            return;
        }

        const orderId = selectedOrderIdForUpload;
        setUploadingOrderId(orderId); // Bắt đầu loading (cho nút trong modal)

        const form = new FormData();
        form.append('billImage', fileToUpload);

        try {
            // 1. CHỈ GỌI API, không dùng data trả về
            await api.post(`/orders/${orderId}/upload-bill`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            notifySuccess('Cập nhật biên lai thành công!');
            
            // 2. GỌI LẠI fetchOrders() để lấy dữ liệu mới nhất (bao gồm cả paymentReceiptUrl)
            await fetchOrders();

        } catch (err) {
            notifyError('Upload thất bại. Vui lòng thử lại.');
            console.error("Lỗi khi upload bill:", err);
        } finally {
            fullReset(); // 3. Dọn dẹp tất cả state (bao gồm cả tắt loading)
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
                    const hasBill = order.paymentReceiptUrl && order.paymentReceiptUrl !== '';
                    const isPending = (order.status || '').toLowerCase() === 'pending';
                    const isProcessing = (order.status || '').toLowerCase() === 'processing';
                    
                    // Chúng ta không cần state 'isLoading' riêng nữa
                    // vì modal 'Xác nhận' đã xử lý việc loading
                    
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
                                            onClick={() => setPreviewImageUrl(order.billImage)}
                                        >
                                            <i className="fa-solid fa-receipt"></i> Xem biên lai
                                        </button>
                                    )}

                                    {/* 2. Luôn hiển thị "Upload/Update" nếu là PENDING hoặc PROCESSING */}
                                    {(isPending) && (
                                        <button
                                            className="upload-bill-btn"
                                            onClick={() => handleTriggerUpload(order._id)}
                                            // Không cần 'disabled' ở đây nữa
                                        >
                                            <i className="fa-solid fa-upload"></i>
                                            
                                            {/* SỬA LỖI LOGIC TEXT: Dựa vào hasBill */}
                                            {hasBill ? 'Cập nhật' : 'Tải lên hoặc cập nhật lại biên lai'}
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