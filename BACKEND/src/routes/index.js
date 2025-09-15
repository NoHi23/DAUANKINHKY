const express = require('express');
const router = express.Router();
const usersRouter = require('./users.js');
const figureRoutes = require('./figures.js');
const productRoutes = require('./products.js');
const cartRoutes = require('./cart.js');
const orderRoutes = require('./orders.js');
const reviewRoutes = require('./reviews.js');
const couponRoutes = require('./coupons.js');
const postRoutes = require('./posts.js');      
const commentRoutes = require('./comments.js');

router.use('/api/users', usersRouter);
router.use('/api/figures', figureRoutes);
router.use('/api/products', productRoutes);
router.use('/api/cart', cartRoutes);
router.use('/api/orders', orderRoutes);
router.use('/api/reviews', reviewRoutes);
router.use('/api/coupons', couponRoutes);
router.use('/api/posts', postRoutes);       
router.use('/api/comments', commentRoutes); 

module.exports = router;