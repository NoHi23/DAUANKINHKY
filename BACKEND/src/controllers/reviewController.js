const Review = require('../models/review');
const Product = require('../models/product');
const Order = require('../models/order');

// Hàm helper để cập nhật rating cho sản phẩm
async function updateProductRating(productId) {
    const reviews = await Review.find({ product: productId });
    if (reviews.length > 0) {
        const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
        const averageRating = totalRating / reviews.length;

        await Product.findByIdAndUpdate(productId, {
            averageRating: averageRating.toFixed(1), // Làm tròn đến 1 chữ số thập phân
            reviewCount: reviews.length,
        });
    } else {
        // Nếu không còn review nào, reset rating
        await Product.findByIdAndUpdate(productId, {
            averageRating: 0,
            reviewCount: 0,
        });
    }
}

// @desc    Tạo một đánh giá mới
// @route   POST /api/products/:productId/reviews
// @access  Private (User)
exports.createReview = async (req, res) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

    try {
        // 1. Kiểm tra người dùng đã mua sản phẩm này chưa
        // Chỉ những đơn hàng đã "delivered" mới được đánh giá
        const hasPurchased = await Order.findOne({
            user: userId,
            'items.product._id': productId,
            status: 'delivered'
        });

        if (!hasPurchased) {
            return res.status(403).json({ message: 'Bạn cần mua sản phẩm này trước khi đánh giá.' });
        }

        // 2. Kiểm tra người dùng đã đánh giá sản phẩm này chưa
        const existingReview = await Review.findOne({ product: productId, user: userId });
        if (existingReview) {
            return res.status(409).json({ message: 'Bạn đã đánh giá sản phẩm này rồi.' });
        }

        // 3. Tạo review mới
        const review = await Review.create({
            product: productId,
            user: userId,
            rating,
            comment,
        });

        // 4. Cập nhật lại rating trung bình và số lượng review của sản phẩm
        await updateProductRating(productId);

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Lấy tất cả đánh giá của một sản phẩm
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name avatar') // Lấy thêm tên và avatar của người đánh giá
            .sort({ createdAt: -1 });
            
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Xóa một đánh giá
// @route   DELETE /api/reviews/:id
// @access  Private (Author, Admin, Moderator)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        // Kiểm tra quyền: Hoặc là người viết review, hoặc là admin/moderator
        if (review.user.toString() !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này.' });
        }

        await review.deleteOne(); // Sử dụng deleteOne() thay cho findByIdAndDelete

        // Cập nhật lại rating của sản phẩm sau khi xóa
        await updateProductRating(review.product);

        res.status(200).json({ message: 'Xóa đánh giá thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};