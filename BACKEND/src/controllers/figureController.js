const HistoricalFigure = require('../models/historicalFigure');
const Product = require('../models/product');

// @desc    Tạo một nhân vật lịch sử mới
// @route   POST /api/figures
// @access  Admin, Moderator
exports.createFigure = async (req, res) => {
    try {
        const { name, period, bio, mainImage, podcast, gallery } = req.body;
        const figure = await HistoricalFigure.create({ name, period, bio, mainImage, podcast, gallery });
        res.status(201).json(figure);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Lấy tất cả nhân vật lịch sử
// @route   GET /api/figures
// @access  Public
exports.getAllFigures = async (req, res) => {
    try {
        const figures = await HistoricalFigure.find();
        res.status(200).json(figures);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Lấy thông tin chi tiết một nhân vật
// @route   GET /api/figures/:id
// @access  Public
exports.getFigureById = async (req, res) => {
    try {
        const figure = await HistoricalFigure.findById(req.params.id);
        if (!figure) {
            return res.status(404).json({ message: 'Không tìm thấy nhân vật' });
        }
        res.status(200).json(figure);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Cập nhật thông tin nhân vật
// @route   PUT /api/figures/:id
// @access  Admin, Moderator
exports.updateFigure = async (req, res) => {
    try {
        const updatedFigure = await HistoricalFigure.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedFigure) {
            return res.status(404).json({ message: 'Không tìm thấy nhân vật' });
        }
        res.status(200).json(updatedFigure);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Xóa một nhân vật
// @route   DELETE /api/figures/:id
// @access  Admin
exports.deleteFigure = async (req, res) => {
    try {
        // **Lưu ý quan trọng**: Cần xử lý các sản phẩm liên quan trước khi xóa.
        // Ví dụ: không cho xóa nếu vẫn còn sản phẩm, hoặc set sản phẩm đó thành inactive.
        const products = await Product.find({ historicalFigure: req.params.id });
        if (products.length > 0) {
            return res.status(400).json({ message: 'Không thể xóa nhân vật này vì vẫn còn sản phẩm liên quan.' });
        }

        const figure = await HistoricalFigure.findByIdAndDelete(req.params.id);
        if (!figure) {
            return res.status(404).json({ message: 'Không tìm thấy nhân vật' });
        }
        res.status(200).json({ message: 'Xóa nhân vật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};