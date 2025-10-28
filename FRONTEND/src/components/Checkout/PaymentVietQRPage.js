import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { notifySuccess, notifyError } from '../../services/notificationService';
import './PaymentVietQRPage.css';
import FullScreenLoader from '../Common/FullScreenLoader';

const VietQRPaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQr = async () => {
      try {
        const res = await api.get(`/orders/${orderId}/vietqr`);
        setQrData(res.data.qrData);
        
      } catch (error) {
        notifyError('Không thể tải QR code.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQr();
  }, [orderId]);

  const handleConfirmPayment = async () => {
    try {
      await api.put(`/orders/${orderId}/confirm-payment`);
      notifySuccess('Thanh toán thành công!');
      navigate(`/payment-success?orderId=${orderId}`);
    } catch (error) {
      notifyError('Xác nhận thanh toán thất bại!');
    }
  };

  if (loading) return <FullScreenLoader />;
  if (!qrData) return <p style={{ textAlign: 'center', marginTop: '50px' }}>QR code không tồn tại.</p>;

  return (
    <div className="vietqr-container">
      <h2>Thanh toán VietQR</h2>
      <img src={qrData.qrImageUrl} alt="VietQR Code" className="qr-code-image" />
      <h3>Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(qrData.amount)}</h3>
      <div className="qr-info">
        <span>Nội dung chuyển khoản:</span>
        <strong>{qrData.description}</strong>
      </div>
      <button className="confirm-btn" onClick={handleConfirmPayment}>
        Tôi đã chuyển khoản
      </button>
    </div>
  );
};

export default VietQRPaymentPage;
