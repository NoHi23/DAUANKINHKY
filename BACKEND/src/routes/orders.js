const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, updateOrderStatus, vnpayReturn, getVietQR, createPaymentUrl, getAllOrders, createMomoUrl, momoIpn, updateVietQRPaymentStatus, uploadVietQRBill, verifyBill, confirmPayment } = require('../controllers/orderController');
const { verifyToken, authorize } = require('../middleware/authorization');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


router.post('/', verifyToken, createOrder);
router.put('/:id/payment', updateVietQRPaymentStatus);
router.put('/:id/confirm-payment', verifyToken, confirmPayment);
router.post('/:id/upload-bill', upload.single('billImage'), uploadVietQRBill);
router.put('/:id/verify-bill', verifyToken, authorize('admin', 'moderator'), verifyBill);

router.get('/', verifyToken, getMyOrders);
router.get('/all', verifyToken, authorize('admin', 'moderator'), getAllOrders);

router.get('/:id', verifyToken, getOrderById);
router.put('/:id/status', verifyToken, authorize('admin', 'moderator'), updateOrderStatus);
router.post('/create-payment-url', verifyToken, createPaymentUrl);
router.get('/vnpay-return', vnpayReturn);
router.post('/create-momo-url', verifyToken, createMomoUrl);
router.post('/momo-ipn', momoIpn);
router.get('/:id/vietqr', verifyToken, getVietQR);

module.exports = router;