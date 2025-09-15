import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        // MoMo trả về resultCode
        const resultCode = searchParams.get('resultCode');
        if (resultCode === '0') {
            setStatus('success');
        } else if (resultCode) {
            setStatus('fail');
        }
        // Bạn có thể thêm logic kiểm tra param của VNPAY ở đây
    }, [searchParams]);

    if (status === 'loading') {
        return <div>Đang xử lý...</div>;
    }

    if (status === 'fail') {
        return <div className="payment-status-container">...Nội dung trang thất bại...</div>
    }

    return (
        <div className="payment-status-container">
            <i className="fa-solid fa-circle-check success-icon"></i>
            <h2>Thanh toán thành công!</h2>
            {/* ... */}
        </div>
    );
};

export default PaymentResultPage;