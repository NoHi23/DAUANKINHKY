import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './PostItem.css';

const PostItem = ({ post }) => {
    const { user } = useContext(AuthContext);
    
    // State để cập nhật UI ngay lập tức
    const [likes, setLikes] = useState(post.likes);
    const [isLiked, setIsLiked] = useState(post.likes.includes(user?.id));

    const handleLike = async () => {
        if (!user) return alert('Vui lòng đăng nhập để thích bài viết.');

        try {
            // Cập nhật UI trước để tạo cảm giác nhanh mượt
            setIsLiked(!isLiked);
            if (isLiked) {
                setLikes(likes.filter(likeId => likeId !== user.id));
            } else {
                setLikes([...likes, user.id]);
            }

            // Gọi API
            await api.put(`/posts/${post._id}/like`);
        } catch (error) {
            console.error("Lỗi khi thích bài viết:", error);
            // Nếu có lỗi, đảo ngược lại trạng thái UI
            setIsLiked(!isLiked);
            setLikes(post.likes);
        }
    };

    return (
        <div className="post-item">
            <div className="post-author">
                <img src={post.author.avatar} alt={post.author.name} />
                <span>{post.author.name}</span>
            </div>
            <Link to={`/posts/${post._id}`} className="post-content-link">
                <p className="post-content">{post.content}</p>
            </Link>
            <div className="post-actions">
                <button onClick={handleLike} className={`like-button ${isLiked ? 'liked' : ''}`}>
                    <i className={isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                    {likes.length} Thích
                </button>
                {/* Link đến trang chi tiết */}
                <Link to={`/posts/${post._id}`} className="comment-link">
                    <i className="fa-regular fa-comment"></i> Bình luận
                </Link>
            </div>
        </div>
    );
};

export default PostItem;