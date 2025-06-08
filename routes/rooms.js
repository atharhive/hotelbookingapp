const express = require('express');
const {
  addRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/isAdmin');
const { validateRoom } = require('../middlewares/validateRequest');

const router = express.Router();

// Public routes
router.get('/', getRooms);
router.get('/:id', getRoomById);

// Protected routes (Admin only)
router.post('/', protect, isAdmin, validateRoom, addRoom);
router.put('/:id', protect, isAdmin, updateRoom);
router.delete('/:id', protect, isAdmin, deleteRoom);

module.exports = router;
