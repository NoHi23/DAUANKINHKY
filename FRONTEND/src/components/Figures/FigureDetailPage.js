import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../Products/ProductCard'; // Tái sử dụng ProductCard
import './FigurePage.css';

const FigureDetailPage = () => {
    const { id } = useParams();
    const [figure, setFigure] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const figureRes = await api.get(`/figures/${id}`);
            setFigure(figureRes.data);
            const productsRes = await api.get(`/products/figure/${id}`);
            setRelatedProducts(productsRes.data);
        };
        fetchData();
    }, [id]);

    if (!figure) return <div>Đang tải...</div>;

    return (
        <div className="figure-detail-container">
            <div className="figure-hero">
                <img src={figure.mainImage} alt={figure.name} />
                <h1>{figure.name}</h1>
                <p className="period">{figure.period}</p>
            </div>
            <div className="figure-detail-content">
                <p className="bio">{figure.bio}</p>
                {/* Phần Podcast có thể thêm ở đây */}
                <div className="related-products">
                    <h2>Sản phẩm liên quan</h2>
                    <div className="product-grid">
                         {relatedProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FigureDetailPage;