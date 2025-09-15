const Coupon = require('../models/coupon');

// @desc    Tạo mã giảm giá mới
// @route   POST /api/coupons
// @access  Admin
exports.createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, expiryDate } = req.body;
        
        // Chuyển code thành chữ hoa để tránh trùng lặp (VD: 'sale10' và 'SALE10')
        const uppercaseCode = code.toUpperCase();

        const existingCoupon = await Coupon.findOne({ code: uppercaseCode });
        if(existingCoupon) {
            return res.status(409).json({ message: 'Mã giảm giá này đã tồn tại.' });
        }

        const coupon = await Coupon.create({ 
            code: uppercaseCode, 
            discountType, 
            discountValue, 
            expiryDate 
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Lấy tất cả mã giảm giá
// @route   GET /api/coupons
// @access  Admin
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Xóa một mã giảm giá
// @route   DELETE /api/coupons/:id
// @access  Admin
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
        }
        res.status(200).json({ message: 'Xóa mã giảm giá thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    API cho người dùng kiểm tra và áp dụng mã giảm giá
// @route   POST /api/coupons/apply
// @access  Private (User)
exports.applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
             return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá.' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Mã giảm giá không hợp lệ.' });
        }

        // Kiểm tra mã còn hoạt động và chưa hết hạn
        if (!coupon.isActive || new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Mã giảm giá đã hết hạn hoặc không còn hoạt động.' });
        }

        // Trả về thông tin mã để frontend xử lý tính toán
        res.status(200).json({
            message: 'Áp dụng mã giảm giá thành công!',
            coupon
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};