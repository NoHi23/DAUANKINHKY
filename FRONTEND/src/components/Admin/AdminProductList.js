import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await api.get('/products/all');
            setProducts(response.data);
        };
        fetchProducts();
    }, []);
    
    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Quản lý Sản phẩm</h2>
                <Link to="/admin/products/new" className="admin-add-btn">Thêm sản phẩm mới</Link>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng kho</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product._id}>
                            <td>{product.name}</td>
                            <td>{product.price}</td>
                            <td>{product.stockQuantity}</td>
                            <td>{product.isActive ? 'Đang bán' : 'Đã ẩn'}</td>
                            <td>
                                <Link to={`/admin/products/edit/${product._id}`}>Sửa</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminProductList;