const express = require('express');
const {
  addHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  seedHotels,
  fetchLiveHotels
} = require('../controllers/hotelController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/isAdmin');
const { validateHotel } = require('../middlewares/validateRequest');

const router = express.Router();

// Public routes
router.get('/', getHotels);

// Search hotels by location, checkin, checkout, adults
router.get('/search', async (req, res) => {
  try {
    const { location, checkin, checkout, adults } = req.query;
    // Fetch hotels from Supabase
    let query = req.app.get('supabase').from('hotels').select('*');
    if (location) query = query.ilike('location', `%${location}%`);
    // You can add more filters for checkin, checkout, adults if your schema supports it
    const { data: hotels, error } = await query;
    if (error) throw error;
    res.json({
      success: true,
      data: {
        hotels: (hotels || []).slice(1),
        destination: {
          name: location || 'Unknown',
          country: ''
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', getHotelById);

// Protected routes (Admin only)
router.post('/', protect, isAdmin, validateHotel, addHotel);
router.put('/:id', protect, isAdmin, updateHotel);
router.delete('/:id', protect, isAdmin, deleteHotel);

// Development routes (no auth required)
router.post('/seed', seedHotels);
router.post('/fetch-live', fetchLiveHotels);

module.exports = router;
