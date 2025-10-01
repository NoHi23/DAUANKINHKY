// src/pages/Blog/PostItem.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { notifySuccess, notifyError } from '../../services/notificationService';
import { showConfirmDialog } from '../../services/confirmationService';

// Hàm tính thời gian tương đối
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

    // State cho chức năng Like
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes.length);

    // State cho chức năng Comment
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [comments, setComments] = useState(post.comments || []);
    const [newComment, setNewComment] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false); // State báo đang tải comments
    const [hasFetchedComments, setHasFetchedComments] = useState(false);
    // Kiểm tra xem user hiện tại đã like bài viết này chưa
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
        // Cập nhật giao diện tạm thời
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        try {
            // *** ĐỂ LƯU VĨNH VIỄN, BẠN CẦN XÂY DỰNG API VÀ BỎ COMMENT DÒNG DƯỚI ***
            await api.put(`/posts/${post._id}/like`);
        } catch (error) {
            // Nếu gọi API lỗi, trả lại trạng thái cũ
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
            notifyError("Đã có lỗi xảy ra.");
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) {
            notifyError("Bạn cần đăng nhập để bình luận!");
            return;
        }

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

            setComments(prevComments =>
                prevComments.map(c => (c._id === tempId ? savedComment : c))
            );
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
            setHasFetchedComments(true); // Đánh dấu là đã fetch thành công
        } catch (error) {
            notifyError("Không thể tải các bình luận.");
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleToggleComments = () => {
        const nextVisibility = !commentsVisible;
        setCommentsVisible(nextVisibility);

        // Nếu chuẩn bị hiển thị và chưa fetch lần nào thì mới gọi API
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
                {user && user._id === post.author._id && (
                    <div className="post-options">
                        <i className="fa-solid fa-ellipsis"></i>
                        <div className="options-dropdown">
                            <button onClick={handleDelete}>Xóa bài viết</button>
                        </div>
                    </div>
                )}
            </div>
            <div className="post-body">
                <p>{post.content}</p>
            </div>

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
                                                    <p>{comment.content}</p>
                                                </div>
                                                {/* Thêm timestamp cho comment */}
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
                                        placeholder="Viết bình luận..." style={{width:"80%"}}
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