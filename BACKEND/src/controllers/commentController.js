const Comment = require('../models/comment');
const Post = require('../models/post');

// @desc    Tạo bình luận mới
// @route   POST /api/posts/:postId/comments
// @access  Private (User)
exports.createComment = async (req, res) => {
    const { content } = req.body;
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
        }

        const comment = await Comment.create({
            post: postId,
            author: req.user.id,
            content
        });
        
        await comment.populate('author', 'name avatar');
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Lấy tất cả bình luận của một bài viết
// @route   GET /api/posts/:postId/comments
// @access  Private (User)
exports.getPostComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('author', 'name avatar')
            .sort({ createdAt: 'asc' }); // Sắp xếp cũ nhất lên đầu
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Xóa một bình luận
// @route   DELETE /api/comments/:id
// @access  Private (Author, Admin)
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Không tìm thấy bình luận.' });
        }
        
        // Chỉ chủ bình luận hoặc admin mới được xóa
        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này.' });
        }

        await comment.deleteOne();
        res.status(200).json({ message: 'Đã xóa bình luận thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};