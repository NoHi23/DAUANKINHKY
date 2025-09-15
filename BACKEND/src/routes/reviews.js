const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams để lấy được :productId
const { createReview, getProductReviews, deleteReview } = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authorization');

// Tương ứng với /api/products/:productId/reviews
router.route('/')
  .get(getProductReviews)
  .post(verifyToken, createReview);

// Tương ứng với /api/reviews/:id (dùng để xóa)
router.delete('/:id', verifyToken, deleteReview);

module.exports = router;