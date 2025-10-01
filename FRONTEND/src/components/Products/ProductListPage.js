import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ProductCard from './ProductCard';
import './ProductListPage.css';
import { notifySuccess, notifyError, notifyInfo } from '../../services/notificationService';
import { showConfirmDialog } from '../../services/confirmationService';
import FullScreenLoader from '../Common/FullScreenLoader';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await api.get('/products');
                setProducts(response.data);
            } catch (err) {
                notifyError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần khi component mount

    if (loading) return <FullScreenLoader />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="product-list-container">
            <h1>Tất cả sản phẩm</h1>
            <div className="product-grid">
                {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductListPage;