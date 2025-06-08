const express = require('express');
const {
  addHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/isAdmin');
const { validateHotel } = require('../middlewares/validateRequest');

const router = express.Router();

// Public routes
router.get('/', getHotels);
router.get('/:id', getHotelById);

// Protected routes (Admin only)
router.post('/', protect, isAdmin, validateHotel, addHotel);
router.put('/:id', protect, isAdmin, updateHotel);
router.delete('/:id', protect, isAdmin, deleteHotel);

module.exports = router;
