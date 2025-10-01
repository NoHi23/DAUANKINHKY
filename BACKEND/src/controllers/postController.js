const Post = require('../models/post');
const Comment = require('../models/comment');

// @desc    Tạo một bài viết mới
// @route   POST /api/posts
// @access  Private (User)
exports.createPost = async (req, res) => {
    const { content, image } = req.body;
    try {
        const post = await Post.create({
            content,
            image,
            author: req.user.id
        });
        // Populate để lấy thông tin author ngay khi tạo xong
        await post.populate('author', 'name avatar');
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Lấy tất cả bài viết (feed)
// @route   GET /api/posts
// @access  Private (User)
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'name avatar') // Giữ nguyên
            // --- THÊM DÒNG NÀY ---
            .populate('comments.author', 'name avatar') // Lấy cả thông tin người bình luận
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
// @desc    Thích hoặc bỏ thích một bài viết
// @route   PUT /api/posts/:id/like
// @access  Private (User)
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        // Kiểm tra xem user đã thích bài viết này chưa
        if (post.likes.includes(req.user.id)) {
            // Nếu đã thích -> Bỏ thích
            await post.updateOne({ $pull: { likes: req.user.id } });
            res.status(200).json({ message: 'Đã bỏ thích bài viết.' });
        } else {
            // Nếu chưa thích -> Thích
            await post.updateOne({ $push: { likes: req.user.id } });
            res.status(200).json({ message: 'Đã thích bài viết.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};


// @desc    Xóa một bài viết
// @route   DELETE /api/posts/:id
// @access  Private (Author, Admin)
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        // Chỉ chủ bài viết hoặc admin mới được xóa
        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bài viết này.' });
        }

        // Xóa tất cả comment liên quan trước khi xóa post
        await Comment.deleteMany({ post: req.params.id });
        await post.deleteOne();

        res.status(200).json({ message: 'Đã xóa bài viết thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'name avatar');
        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId;
        const authorId = req.user.id; // Lấy từ token qua middleware verifyToken

        if (!content) {
            return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        const newComment = {
            content,
            author: authorId
        };

        post.comments.push(newComment);
        await post.save();

        // Populate thông tin author để trả về client hiển thị avatar, tên
        await post.populate('comments.author', 'name avatar');

        // Trả về đúng định dạng mà frontend đang mong đợi
        res.status(201).json({ comments: post.comments });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};


// @desc    Lấy tất cả bình luận của một bài viết
// @route   GET /api/posts/:postId/comments
// @access  Private (User)
exports.getPostComments = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('comments.author', 'name avatar');

        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        res.status(200).json(post.comments);

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};