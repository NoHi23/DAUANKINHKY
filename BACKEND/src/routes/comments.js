const express = require('express');
const router = express.Router();
const { deleteComment } = require('../controllers/commentController');
const { verifyToken } = require('../middleware/authorization');

router.delete('/:id', verifyToken, deleteComment);

module.exports = router;