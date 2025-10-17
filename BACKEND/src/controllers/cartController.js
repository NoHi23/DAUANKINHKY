const Cart = require('../models/cart');
const Product = require('../models/product');

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart) {
            const newCart = new Cart({ user: req.user.id, items: [] });
            await newCart.save();
            return res.status(200).json(newCart);
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.addItemToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ user: req.user.id });
        const product = await Product.findById(productId);

        if (!product || !product.isActive) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        const newQuantity = itemIndex > -1 ? cart.items[itemIndex].quantity + quantity : quantity;

        if (product.stockQuantity < newQuantity) {
            return res.status(400).json({ message: 'Không đủ số lượng sản phẩm trong kho' });
        }

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = newQuantity;
            cart.items[itemIndex].addedAt = new Date();
        } else {
            cart.items.push({ product: productId, quantity, addedAt: new Date() });
        }

        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

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

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
        }
        if (product.stockQuantity < quantity) {
            return res.status(400).json({ message: `Chỉ còn ${product.stockQuantity} sản phẩm trong kho.` });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].addedAt = new Date();
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