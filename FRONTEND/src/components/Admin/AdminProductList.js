
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { notifyError } from '../../services/notificationService';
import './AdminCommon.css'; 

const AdminProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products/all');
                setProducts(response.data);
            } catch (error) {
                notifyError('Tải danh sách sản phẩm thất bại.');
                console.error("Fetch products error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getStockStatus = (quantity) => {
        if (quantity === 0) {
            return <span className="stock-badge stock-out-of-stock">Hết hàng</span>;
        }
        if (quantity < 10) {
            return <span className="stock-badge stock-low">Sắp hết</span>;
        }
        return <span className="stock-badge stock-in-stock">Còn hàng</span>;
    };

    if (loading) {
        return <div className="content-card"><h2>Đang tải danh sách sản phẩm...</h2></div>;
    }

    return (
        <div className="content-card">
            <div className="content-header">
                <h2>Quản lý Sản phẩm</h2>
                <Link to="/admin/products/new" className="add-new-btn">
                    <i className="fa-solid fa-plus"></i>
                    <span>Thêm sản phẩm</span>
                </Link>
            </div>

            <div className="content-body">
                <table className="content-table">
                    <thead>
                        <tr>
                            <th style={{ width: '10%' }}>Hình ảnh</th>
                            <th style={{ width: '35%' }}>Tên sản phẩm</th>
                            <th>Giá bán</th>
                            <th>Kho</th>
                            <th>Trạng thái</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <img 
                                            src={product.images[0] || '/placeholder.jpg'} 
                                            alt={product.name} 
                                            className="product-thumbnail" 
                                        />
                                    </td>
                                    <td className="product-name-cell">{product.name}</td>
                                    <td>{formatPrice(product.price)}</td>
                                    <td>
                                        {product.stockQuantity} - {getStockStatus(product.stockQuantity)}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${product.isActive ? 'status-active' : 'status-expired'}`}>
                                            {product.isActive ? 'Đang bán' : 'Đã ẩn'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link to={`/admin/products/edit/${product._id}`} className="btn-edit" title="Chỉnh sửa">
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </Link>
                                            {/* Bạn có thể thêm nút xóa (ẩn) ở đây nếu cần */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="empty-state">
                                    Chưa có sản phẩm nào. <Link to="/admin/products/new">Thêm ngay!</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProductList;