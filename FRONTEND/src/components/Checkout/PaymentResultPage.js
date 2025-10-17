import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './PaymentStatus.css';
import api from '../../services/api';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const navigate = useNavigate();

    useEffect(() => {
        const resultCode = searchParams.get('resultCode');
        const orderId = searchParams.get('orderId');

        if (orderId && resultCode) {
            api.put(`/orders/${orderId}/payment`, {
                resultCode
            })
                .then(res => {
                    if (resultCode === '0') {
                        setStatus('success');
                        setTimeout(() => navigate(`/payment-success?orderId=${orderId}`), 1500);
                    } else {
                        setStatus('fail');
                        setTimeout(() => navigate('/payment-fail'), 1500);
                    }
                })
                .catch(() => {
                    setStatus('fail');
                    setTimeout(() => navigate('/payment-fail'), 1500);
                });
        } else {
            setStatus('fail');
            setTimeout(() => navigate('/payment-fail'), 1500);
        }
    }, [searchParams, navigate]);

    return (
        <div className="payment-status-container">
            <h2>Đang xử lý kết quả thanh toán...</h2>
            <p>Vui lòng chờ trong giây lát.</p>
        </div>
    );
};

export default PaymentResultPage;
