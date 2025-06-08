const express = require('express');
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  getBookingById
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/isAdmin');
const { validateBooking } = require('../middlewares/validateRequest');

const router = express.Router();

// Protected routes
router.post('/', protect, validateBooking, createBooking);
router.get('/', protect, getUserBookings);
router.get('/all', protect, isAdmin, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
