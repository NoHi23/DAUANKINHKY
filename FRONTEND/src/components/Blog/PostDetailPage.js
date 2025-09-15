import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import PostItem from './PostItem'; // Tái sử dụng PostItem để hiển thị bài viết
import './PostDetailPage.css';

const PostDetailPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const fetchPostAndComments = async () => {
        try {
            setLoading(true);
            const postRes = await api.get(`/posts/${id}`);
            setPost(postRes.data);
            const commentsRes = await api.get(`/posts/${id}/comments`);
            setComments(commentsRes.data);
        } catch (error) {
            console.error("Lỗi khi tải bài viết và bình luận:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostAndComments();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await api.post(`/posts/${id}/comments`, { content: newComment });
            setNewComment('');
            fetchPostAndComments(); // Tải lại để hiển thị bình luận mới
        } catch (error) {
            console.error("Lỗi khi gửi bình luận:", error);
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (!post) return <div>Không tìm thấy bài viết.</div>;

    return (
        <div className="post-detail-container">
            <Link to="/blog" className="back-to-blog">← Quay lại Blog</Link>
            <PostItem post={post} />
            <div className="comments-section">
                <h3>Bình luận</h3>
                {user && (
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Viết bình luận của bạn..."
                        />
                        <button type="submit">Gửi</button>
                    </form>
                )}
                <div className="comment-list">
                    {comments.map(comment => (
                        <div key={comment._id} className="comment-item">
                            <img src={comment.author.avatar} alt={comment.author.name} />
                            <div className="comment-content">
                                <strong>{comment.author.name}</strong>
                                <p>{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostDetailPage;