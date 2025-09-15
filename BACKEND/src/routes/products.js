const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getAllProductsAdmin, getProductsByFigure } = require('../controllers/productController');
const { verifyToken, authorize } = require('../middleware/authorization');
const reviewRouter = require('./reviews'); // Import review router

// Chuyển hướng các route /:productId/reviews sang reviewRouter
router.use('/:productId/reviews', reviewRouter);

router.post('/', verifyToken, authorize('admin', 'moderator'), createProduct);
router.put('/:id', verifyToken, authorize('admin', 'moderator'), updateProduct);
router.delete('/:id', verifyToken, authorize('admin'), deleteProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/all', verifyToken, authorize('admin'), getAllProductsAdmin);
router.get('/figure/:figureId', getProductsByFigure);

module.exports = router;