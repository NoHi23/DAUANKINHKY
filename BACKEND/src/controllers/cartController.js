const Cart = require('../models/cart');
const Product = require('../models/product');

// @desc    Lấy thông tin giỏ hàng
// @route   GET /api/cart
// @access  Private (User)
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/cart/items
// @access  Private (User)
exports.addItemToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        const product = await Product.findById(productId);

        if (!product || !product.isActive) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        if (product.stockQuantity < quantity) {
            return res.status(400).json({ message: 'Không đủ số lượng sản phẩm trong kho' });
        }
        
        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            // Nếu có, cập nhật số lượng
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Nếu chưa, thêm mới
            cart.items.push({ product: productId, quantity });
        }
        
        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate('items.product'); // Lấy lại cart với thông tin product đầy đủ
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/cart/items/:productId
// @access  Private (User)
exports.removeItemFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const cart = await Cart.findOneAndUpdate(
            { user: req.user.id },
            { $pull: { items: { product: productId } } },
            { new: true }
        ).populate('items.product');

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};


exports.updateCartItemQuantity = async (req, res) => {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity < 1) {
        return res.status(400).json({ message: 'Số lượng phải lớn hơn hoặc bằng 1.' });
    }

    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng.' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            const updatedCart = await Cart.findById(cart._id).populate('items.product');
            return res.status(200).json(updatedCart);
        } else {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
