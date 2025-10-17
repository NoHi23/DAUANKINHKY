import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { notifySuccess, notifyError } from '../../services/notificationService';
import { showConfirmDialog } from '../../services/confirmationService';

const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return "Vừa xong";
};

const PostItem = ({ post, onPostDeleted }) => {
    const { user } = useContext(AuthContext);

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes.length);

    const [commentsVisible, setCommentsVisible] = useState(false);
    const [comments, setComments] = useState(post.comments || []);
    const [newComment, setNewComment] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [hasFetchedComments, setHasFetchedComments] = useState(false);

    useEffect(() => {
        setComments(post.comments || []);
    }, [post.comments]);

    useEffect(() => {
        if (user && post.likes.includes(user._id)) {
            setIsLiked(true);
        } else {
            setIsLiked(false);
        }
    }, [user, post.likes]);

    const handleLike = async () => {
        if (!user) {
            notifyError("Bạn cần đăng nhập để thích bài viết!");
            return;
        }

        const originalIsLiked = isLiked;
        const originalLikeCount = likeCount;

        setIsLiked(!originalIsLiked);
        setLikeCount(originalIsLiked ? originalLikeCount - 1 : originalLikeCount + 1);

        try {
            await api.put(`/posts/${post._id}/like`);
        } catch (error) {
            setIsLiked(originalIsLiked);
            setLikeCount(originalLikeCount);
            notifyError("Đã có lỗi xảy ra.");
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        const tempId = Date.now().toString();
        const tempComment = {
            _id: tempId,
            content: newComment,
            author: { _id: user._id, name: user.name, avatar: user.avatar },
            createdAt: new Date().toISOString()
        };

        setComments(prevComments => [...prevComments, tempComment]);
        setNewComment('');

        try {
            const response = await api.post(`/posts/${post._id}/comments`, { content: newComment });
            const savedComment = response.data;
            setComments(prevComments => prevComments.map(c => (c._id === tempId ? savedComment : c)));
        } catch (error) {
            notifyError("Bình luận thất bại.");
            setComments(prevComments => prevComments.filter(c => c._id !== tempComment._id));
        }
    };

    const handleDelete = async () => {
        const result = await showConfirmDialog({ text: "Bạn có chắc muốn xóa bài viết này?" });
        if (result.isConfirmed) {
            try {
                await api.delete(`/posts/${post._id}`);
                notifySuccess("Đã xóa bài viết");
                if (onPostDeleted) onPostDeleted(post._id);
            } catch (error) {
                notifyError("Xóa thất bại");
            }
        }
    };

    const fetchComments = async () => {
        setIsLoadingComments(true);
        try {
            const response = await api.get(`/posts/${post._id}/comments`);
            setComments(response.data);
            setHasFetchedComments(true);
        } catch (error) {
            notifyError("Không thể tải các bình luận.");
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleToggleComments = () => {
        const nextVisibility = !commentsVisible;
        setCommentsVisible(nextVisibility);
        if (nextVisibility && !hasFetchedComments) {
            fetchComments();
        }
    };

    return (
        <div className="post-card card">
            <div className="post-header">
                <img src={post.author.avatar || '/default-avatar.png'} alt={post.author.name} className="author-avatar" />
                <div className="author-info">
                    <span className="author-name">{post.author.name}</span>
                    <span className="post-timestamp">{timeSince(post.createdAt)}</span>
                </div>
                {user && (user._id === post.author._id || user.role === 'admin' || user.role === 'moderator') && (
                    <div className="post-options">
                        <i className="fa-solid fa-ellipsis"></i>
                        <div className="options-dropdown">
                            <button onClick={handleDelete}>Xóa bài viết</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content }} />

            <div className="post-stats">
                {likeCount > 0 && <span><i className="fa-solid fa-heart"></i> {likeCount}</span>}
            </div>

            <div className="post-footer">
                <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                    <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
                    <span>Thích</span>
                </button>
                <button className="action-btn" onClick={handleToggleComments}>
                    <i className="fa-regular fa-comment"></i>
                    <span>Bình luận</span>
                </button>
            </div>

            {commentsVisible && (
                <div className="comment-section">
                    {isLoadingComments ? (
                        <div className="loading-comments">Đang tải bình luận...</div>
                    ) : (
                        <>
                            <div className="comment-list">
                                {comments.length > 0 ? (
                                    comments.map(comment => (
                                        <div key={comment._id} className="comment">
                                            <img src={comment.author.avatar || '/default-avatar.png'} alt={comment.author.name} className="author-avatar" />
                                            <div className="comment-body">
                                                <div className="comment-content">
                                                    <span className="author-name">{comment.author.name}</span>
                                                    <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                                                </div>
                                                <span className="comment-timestamp">{timeSince(comment.createdAt)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-comments">Chưa có bình luận nào.</p>
                                )}
                            </div>
                            {user && (
                                <form className="comment-form" onSubmit={handleCommentSubmit}>
                                    <img src={user.avatar || '/default-avatar.png'} alt={user.name} className="author-avatar" />
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Viết bình luận..."
                                    />
                                    <button type="submit">Gửi</button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostItem;