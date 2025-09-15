import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import './BlogPage.css';
import PostItem from './PostItem'; // <<-- THÊM MỚI

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const { user } = useContext(AuthContext);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post('/posts', { content });
      setContent('');
      fetchPosts(); // Tải lại danh sách bài viết
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
    }
  };

  return (
    <div className="blog-container">
      <h1>Cộng đồng</h1>
      {user && (
        <form onSubmit={handleCreatePost} className="create-post-form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bạn đang nghĩ gì?"
          ></textarea>
          <button type="submit">Đăng bài</button>
        </form>
      )}
      <div className="post-list">
        {posts.map(post => (
          <PostItem key={post._id} post={post} /> // <<-- THAY ĐỔI
        ))}
      </div>
    </div>
  );
};

export default BlogPage;