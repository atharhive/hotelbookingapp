const { Booking, Room, Hotel, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
// Sample request body:
// {
//   "roomId": "64a5f8c8b1234567890abcde",
//   "startDate": "2024-02-15",
//   "endDate": "2024-02-18",
//   "guests": 2,
//   "specialRequests": "Late check-in requested"
// }
const createBooking = async (req, res, next) => {
  try {
    const { roomId, startDate, endDate, guests, specialRequests } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!roomId || !startDate || !endDate || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, start date, end date, and number of guests are required'
      });
    }

    // Check if room exists and is available
    const room = await Room.findByPk(roomId, {
      include: [{
        model: Hotel,
        as: 'hotel'
      }]
    });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for booking'
      });
    }

    // Check if hotel is active
    if (!room.hotel.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Hotel is not accepting bookings'
      });
    }

    // Validate guest count
    if (guests > room.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Room can accommodate maximum ${room.maxGuests} guests`
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      roomId,
      status: 'confirmed',
      $or: [
        {
          startDate: { $lte: start },
          endDate: { $gt: start }
        },
        {
          startDate: { $lt: end },
          endDate: { $gte: end }
        },
        {
          startDate: { $gte: start },
          endDate: { $lte: end }
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates'
      });
    }

    // Calculate total price
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.pricePerNight;

    // Create booking
    const booking = await Booking.create({
      userId,
      roomId,
      hotelId: room.hotelId._id,
      startDate: start,
      endDate: end,
      guests,
      specialRequests,
      totalPrice
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email')
      .populate('roomId', 'roomType roomNumber pricePerNight')
      .populate('hotelId', 'name location address');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: populatedBooking
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
const getUserBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    // Build filter
    const filter = { userId };
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count
    const total = await Booking.countDocuments(filter);

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate('roomId', 'roomType roomNumber pricePerNight amenities')
      .populate('hotelId', 'name location starRating address phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(total / limitNumber),
          totalBookings: total,
          hasNextPage: pageNumber < Math.ceil(total / limitNumber),
          hasPrevPage: pageNumber > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/all
// @access  Private (Admin only)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, hotelId, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (hotelId) {
      filter.hotelId = hotelId;
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count
    const total = await Booking.countDocuments(filter);

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('roomId', 'roomType roomNumber pricePerNight')
      .populate('hotelId', 'name location starRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      message: 'All bookings retrieved successfully',
      data: {
        bookings,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(total / limitNumber),
          totalBookings: total,
          hasNextPage: pageNumber < Math.ceil(total / limitNumber),
          hasPrevPage: pageNumber > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Check if booking has already started
    if (booking.startDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking that has already started'
      });
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('roomId', 'roomType roomNumber')
      .populate('hotelId', 'name location');

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking: updatedBooking
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('roomId', 'roomType roomNumber pricePerNight amenities bedType size')
      .populate('hotelId', 'name location starRating address phone email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.userId._id.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking details retrieved successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  getBookingById
};
