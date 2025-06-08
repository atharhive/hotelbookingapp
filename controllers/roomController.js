const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// @desc    Add room to hotel
// @route   POST /api/rooms
// @access  Private (Admin only)
// Sample request body:
// {
//   "hotelId": "64a5f8c8b1234567890abcde",
//   "roomType": "deluxe",
//   "roomNumber": "101",
//   "pricePerNight": 2500,
//   "amenities": ["WiFi", "AC", "TV"],
//   "maxGuests": 2,
//   "description": "Deluxe room with city view",
//   "bedType": "queen",
//   "size": 25
// }
const addRoom = async (req, res, next) => {
  try {
    const { hotelId, roomType, roomNumber, pricePerNight, amenities, maxGuests, description, bedType, size } = req.body;

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    if (!hotel.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add rooms to inactive hotel'
      });
    }

    // Check if room number already exists in this hotel
    const existingRoom = await Room.findOne({ hotelId, roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists in this hotel'
      });
    }

    const room = await Room.create({
      hotelId,
      roomType,
      roomNumber,
      pricePerNight,
      amenities,
      maxGuests,
      description,
      bedType,
      size
    });

    const populatedRoom = await Room.findById(room._id).populate('hotelId', 'name location');

    res.status(201).json({
      success: true,
      message: 'Room added successfully',
      data: {
        room: populatedRoom
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rooms with filters
// @route   GET /api/rooms
// @access  Public
// Query parameters: hotelId, roomType, priceMin, priceMax, amenities, maxGuests, page, limit
const getRooms = async (req, res, next) => {
  try {
    const { 
      hotelId, 
      roomType, 
      priceMin, 
      priceMax, 
      amenities, 
      maxGuests, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build filter object
    const filter = { isAvailable: true };

    if (hotelId) {
      filter.hotelId = hotelId;
    }

    if (roomType) {
      filter.roomType = roomType;
    }

    if (priceMin || priceMax) {
      filter.pricePerNight = {};
      if (priceMin) filter.pricePerNight.$gte = parseInt(priceMin);
      if (priceMax) filter.pricePerNight.$lte = parseInt(priceMax);
    }

    if (amenities) {
      const amenitiesArray = amenities.split(',').map(item => item.trim());
      filter.amenities = { $in: amenitiesArray };
    }

    if (maxGuests) {
      filter.maxGuests = { $gte: parseInt(maxGuests) };
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination
    const total = await Room.countDocuments(filter);

    // Get rooms with pagination
    const rooms = await Room.find(filter)
      .populate('hotelId', 'name location starRating')
      .sort({ pricePerNight: 1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      message: 'Rooms retrieved successfully',
      data: {
        rooms,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(total / limitNumber),
          totalRooms: total,
          hasNextPage: pageNumber < Math.ceil(total / limitNumber),
          hasPrevPage: pageNumber > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hotelId', 'name location starRating address phone email');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (!room.isAvailable) {
      return res.status(404).json({
        success: false,
        message: 'Room is not available'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room details retrieved successfully',
      data: {
        room
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin only)
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // If updating room number, check for duplicates
    if (req.body.roomNumber && req.body.roomNumber !== room.roomNumber) {
      const existingRoom = await Room.findOne({ 
        hotelId: room.hotelId, 
        roomNumber: req.body.roomNumber 
      });
      
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'Room number already exists in this hotel'
        });
      }
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('hotelId', 'name location starRating');

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: {
        room: updatedRoom
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin only)
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room has any active bookings
    const activeBookings = await Booking.find({
      roomId: req.params.id,
      status: 'confirmed',
      endDate: { $gte: new Date() }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active bookings'
      });
    }

    // Soft delete - mark as unavailable
    await Room.findByIdAndUpdate(req.params.id, { isAvailable: false });

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom
};
