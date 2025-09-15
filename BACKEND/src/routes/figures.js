const express = require('express');
const router = express.Router();
const { createFigure, getAllFigures, getFigureById, updateFigure, deleteFigure } = require('../controllers/figureController');
const { verifyToken, authorize } = require('../middleware/authorization');

router.post('/', verifyToken, authorize('admin', 'moderator'), createFigure);
router.put('/:id', verifyToken, authorize('admin', 'moderator'), updateFigure);
router.delete('/:id', verifyToken, authorize('admin'), deleteFigure);
router.get('/', getAllFigures);
router.get('/:id', getFigureById);

module.exports = router;