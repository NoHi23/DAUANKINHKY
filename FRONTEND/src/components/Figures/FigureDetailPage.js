import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../Products/ProductCard'; // Tái sử dụng ProductCard
import './FigurePage.css';
import FullScreenLoader from '../../components/Common/FullScreenLoader'; // Thêm Loader cho trải nghiệm tốt hơn

const FigureDetailPage = () => {
    const { id } = useParams();
    const [figure, setFigure] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const figurePromise = api.get(`/figures/${id}`);
                const productsPromise = api.get(`/products/figure/${id}`);

                const [figureRes, productsRes] = await Promise.all([figurePromise, productsPromise]);

                setFigure(figureRes.data);
                setRelatedProducts(productsRes.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang nhân vật:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);


    if (loading) return <FullScreenLoader loading={true} />;
    if (!figure) return <div>Không tìm thấy nhân vật.</div>;

    const mainPodcast = figure.podcast && figure.podcast.length > 0 ? figure.podcast[0] : null;

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
                {mainPodcast && (
                    <div className="podcast-section">
                        <h2>Podcast / Video nổi bật</h2>
                        <div className="video-player-wrapper">
                            <video
                                width="100%"
                                controls
                                src={mainPodcast.audioUrl}
                                title={mainPodcast.title}
                            >
                                Trình duyệt của bạn không hỗ trợ thẻ video.
                            </video>
                        </div>
                        <p className="podcast-title">{mainPodcast.title}</p>
                    </div>
                )}
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