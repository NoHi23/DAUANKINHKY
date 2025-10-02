const HistoricalFigure = require('../models/historicalFigure');
const Product = require('../models/product');

// @desc    Tạo một nhân vật lịch sử mới
// @route   POST /api/figures
// @access  Admin, Moderator
// Thay thế hàm createFigure cũ của bạn bằng hàm này

exports.createFigure = async (req, res) => {
    try {
        // Lấy tất cả dữ liệu frontend gửi lên
        // Lưu ý: Tôi đã gộp cả giải pháp từ lần trước (sửa description -> bio, era -> period) vào đây
        const { name, description, era, images, podcast } = req.body;

        // --- BƯỚC QUAN TRỌNG: ĐỊNH DẠNG LẠI DỮ LIỆU ---

        // 1. Xử lý mảng `images` để tách ra mainImage và gallery
        const mainImage = images && images.length > 0 ? images[0] : null;
        const gallery = images && images.length > 1 ? images.slice(1) : [];

        // 2. Xử lý chuỗi `podcast` để tạo cấu trúc đúng với Schema
        let podcastData = [];
        if (podcast) { // Chỉ xử lý nếu có link podcast được gửi lên
            podcastData.push({
                title: `Podcast về ${name}`, // Tạm dùng tên nhân vật làm tiêu đề
                audioUrl: podcast,         // Đây là URL string từ frontend
                // duration: 0 // Trường này không bắt buộc trong schema, có thể bỏ qua
            });
        }

        // --- KẾT THÚC BƯỚC ĐỊNH DẠNG ---

        // 3. Gọi .create với dữ liệu đã được định dạng lại chính xác
        const figure = await HistoricalFigure.create({
            name: name,
            period: era,         // Dùng 'era' cho trường 'period'
            bio: description,    // Dùng 'description' cho trường 'bio'
            mainImage: mainImage,
            gallery: gallery,
            podcast: podcastData // Sử dụng biến đã được định dạng
        });

        res.status(201).json(figure);

    } catch (error) {
        console.error("CREATE FIGURE ERROR:", error); // Log lỗi chi tiết để dễ debug
        // Trả về lỗi chi tiết hơn nếu có thể
        res.status(500).json({ message: 'Lỗi server khi tạo nhân vật mới.', error: error.message });
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
        const { name, description, era, images, podcast } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (era) updateData.period = era;
        if (description) updateData.bio = description;

        if (images) {
            updateData.mainImage = images.length > 0 ? images[0] : null;
            updateData.gallery = images.length > 1 ? images.slice(1) : [];
        }

        if (podcast) {
            updateData.podcast = [{
                title: `Podcast về ${name || 'nhân vật'}`,
                audioUrl: podcast
            }];
        } else if (podcast === '' || podcast === null) {
            updateData.podcast = [];
        }

        const updatedFigure = await HistoricalFigure.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedFigure) {
            return res.status(404).json({ message: 'Không tìm thấy nhân vật' });
        }

        res.status(200).json(updatedFigure);

    } catch (error) {
        console.error("UPDATE FIGURE ERROR:", error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật nhân vật.', error: error.message });
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