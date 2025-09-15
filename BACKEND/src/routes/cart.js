const express = require('express');
const router = express.Router();
const { getCart, addItemToCart, removeItemFromCart, updateCartItemQuantity } = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authorization');

router.use(verifyToken); // Áp dụng middleware cho tất cả route bên dưới

router.get('/', getCart);
router.post('/items', addItemToCart);
router.route('/items/:productId')
  .put(updateCartItemQuantity)
  .delete(removeItemFromCart);
  
module.exports = router;