const Product = require('../models/product');

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Admin, Moderator
exports.createProduct = async (req, res) => {
    try {
        // historicalFigure là ID của nhân vật lịch sử tương ứng
        const { name, sku, description, price, stockQuantity, images, historicalFigure } = req.body;
        const product = await Product.create({ name, sku, description, price, stockQuantity, images, historicalFigure });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
    try {
        // Gợi ý: Nên thêm logic phân trang (pagination) ở đây cho hiệu năng tốt hơn
        const products = await Product.find({ isActive: true }).populate('historicalFigure', 'name period');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Lấy chi tiết một sản phẩm
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('historicalFigure');
        // Bạn cũng có thể populate thêm reviews ở đây
        if (!product || !product.isActive) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Admin, Moderator
exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Xóa sản phẩm (thường là ẩn đi thay vì xóa cứng)
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = async (req, res) => {
    try {
        // Thay vì xóa, ta nên cập nhật `isActive = false` để giữ lại dữ liệu trong các đơn hàng cũ.
        const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json({ message: 'Sản phẩm đã được ẩn đi' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getAllProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find({}).populate('historicalFigure', 'name');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({error: error });
    }
};

exports.getProductsByFigure = async (req, res) => {
    try {
        const products = await Product.find({ historicalFigure: req.params.figureId, isActive: true });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};