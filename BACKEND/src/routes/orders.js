const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, updateOrderStatus, vnpayReturn, createPaymentUrl, getAllOrders, createMomoUrl, momoIpn } = require('../controllers/orderController');
const { verifyToken, authorize } = require('../middleware/authorization');

router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getMyOrders);
router.get('/all', verifyToken, authorize('admin','moderator'), getAllOrders);

router.get('/:id', verifyToken, getOrderById);
router.put('/:id/status', verifyToken, authorize('admin', 'moderator'), updateOrderStatus);
router.post('/create-payment-url', verifyToken, createPaymentUrl);
router.get('/vnpay-return', vnpayReturn);
router.post('/create-momo-url', verifyToken, createMomoUrl);
router.post('/momo-ipn', momoIpn);
module.exports = router;