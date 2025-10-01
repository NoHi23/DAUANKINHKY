const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, likePost, deletePost, getPostById } = require('../controllers/postController');
const { createComment, getPostComments } = require('../controllers/commentController');
const { verifyToken } = require('../middleware/authorization');

// Tất cả các route trong file này đều yêu cầu đăng nhập
router.use(verifyToken);

// Routes cho Posts
router.route('/')
    .post(createPost)
    .get(getAllPosts);
router.route('/:id')
    .get(getPostById) // <<-- THÊM MỚI
    .delete(deletePost);
router.put('/:id/like', likePost);

// Routes cho Comments của một Post
router.route('/:postId/comments')
    .post(createComment)
    .get(getPostComments);

    
module.exports = router;