const express = require('express');
const router = express.Router();
const { createCoupon, getAllCoupons, deleteCoupon, applyCoupon } = require('../controllers/couponController');
const { verifyToken, authorize } = require('../middleware/authorization');

router.post('/apply', verifyToken, applyCoupon); // Cho người dùng
router.post('/', verifyToken, authorize('admin'), createCoupon);
router.get('/', verifyToken, authorize('admin'), getAllCoupons);
router.delete('/:id', verifyToken, authorize('admin'), deleteCoupon);

module.exports = router;