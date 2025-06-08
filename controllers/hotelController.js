const { Hotel, User, Room } = require('../models');

// @desc    Add new hotel
// @route   POST /api/hotels
// @access  Private (Admin only)
// Sample request body:
// {
//   "name": "Grand Palace Hotel",
//   "description": "Luxury hotel in the heart of the city",
//   "location": "New Delhi",
//   "starRating": 5,
//   "amenities": ["WiFi", "Pool", "Spa", "Gym"],
//   "address": "123 Main Street, New Delhi",
//   "phone": "+91-11-12345678",
//   "email": "info@grandpalace.com"
// }
const addHotel = async (req, res, next) => {
  try {
    const { name, description, location, starRating, amenities, address, phone, email } = req.body;

    // Check if hotel with same name and location already exists
    const existingHotel = await Hotel.findOne({ where: { name, location } });
    if (existingHotel) {
      return res.status(400).json({
        success: false,
        message: 'Hotel with this name already exists in this location'
      });
    }

    const hotel = await Hotel.create({
      name,
      description,
      location,
      starRating,
      amenities,
      address,
      phone,
      email,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Hotel added successfully',
      data: {
        hotel
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hotels with filters
// @route   GET /api/hotels
// @access  Public
// Query parameters: location, name, star, page, limit
const getHotels = async (req, res, next) => {
  try {
    const { location, name, star, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const where = { isActive: true };
    
    if (location) {
      where.location = { [require('sequelize').Op.iLike]: `%${location}%` };
    }
    
    if (name) {
      where.name = { [require('sequelize').Op.iLike]: `%${name}%` };
    }
    
    if (star) {
      where.starRating = parseInt(star);
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    // Get total count for pagination
    const total = await Hotel.count({ where });
    
    // Get hotels with pagination
    const hotels = await Hotel.findAll({
      where,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']],
      offset,
      limit: limitNumber
    });

    res.status(200).json({
      success: true,
      message: 'Hotels retrieved successfully',
      data: {
        hotels,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(total / limitNumber),
          totalHotels: total,
          hasNextPage: pageNumber < Math.ceil(total / limitNumber),
          hasPrevPage: pageNumber > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    if (!hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Hotel is no longer available'
      });
    }

    // Get rooms for this hotel
    const rooms = await Room.find({ hotelId: hotel._id, isAvailable: true });

    res.status(200).json({
      success: true,
      message: 'Hotel details retrieved successfully',
      data: {
        hotel,
        rooms
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Admin only)
const updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      data: {
        hotel: updatedHotel
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Admin only)
const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Soft delete - mark as inactive
    await Hotel.findByIdAndUpdate(req.params.id, { isActive: false });

    // Also mark all rooms of this hotel as unavailable
    await Room.updateMany(
      { hotelId: req.params.id },
      { isAvailable: false }
    );

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel
};
