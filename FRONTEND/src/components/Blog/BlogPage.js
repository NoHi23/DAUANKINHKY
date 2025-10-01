// src/pages/Blog/BlogPage.js

import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import './BlogPage.css';
import PostItem from './PostItem';
import { notifySuccess, notifyError } from '../../services/notificationService';

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
        } catch (error) {
            console.error("Lỗi khi tải bài viết:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            notifyError("Vui lòng nhập nội dung bài viết!");
            return;
        }
        try {
            // Dòng này gọi API để lưu bài viết mới vào database
            await api.post('/posts', { content });
            setContent('');
            fetchPosts(); 
            notifySuccess("Đăng bài thành công!");
        } catch (error) {
            notifyError("Lỗi khi đăng bài.");
        }
    };
    
    // Hàm callback để xóa bài viết khỏi state mà không cần fetch lại
    const handlePostDeleted = (deletedPostId) => {
        setPosts(posts.filter(p => p._id !== deletedPostId));
    };

    return (
        <div className="blog-page-container">
            <div className="blog-layout">
                {/* --- CỘT TRÁI - SIDEBAR --- */}
                <aside className="blog-sidebar">
                    {user ? (
                        <div className="profile-card card">
                            <img src={user.avatar || '/default-avatar.png'} alt={user.name} />
                            <h3>{user.name}</h3>
                            <p>Chào mừng bạn đến với cộng đồng!</p>
                        </div>
                    ) : (
                         <div className="profile-card card">
                            <h3>Khách</h3>
                            <p>Hãy đăng nhập để tham gia thảo luận và chia sẻ nhé!</p>
                        </div>
                    )}
                </aside>

                {/* --- CỘT PHẢI - MAIN FEED --- */}
                <main className="blog-main-feed">
                    {user && (
                        <div className="create-post-card card">
                            <div className="create-post-header">
                                <img src={user.avatar || '/default-avatar.png'} alt={user.name} />
                                <p>Chào {user.name}, bạn đang nghĩ gì?</p>
                            </div>
                            <form onSubmit={handleCreatePost}>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Chia sẻ câu chuyện hoặc đặt câu hỏi..."
                                ></textarea>
                                <div className="create-post-actions">
                                    <button type="submit" className="post-submit-btn">Đăng bài</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="post-list">
                        {loading ? (
                            <p>Đang tải bài viết...</p>
                        ) : posts.length > 0 ? (
                            posts.map(post => (
                                <PostItem key={post._id} post={post} onPostDeleted={handlePostDeleted} />
                            ))
                        ) : (
                            <p>Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!</p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BlogPage;