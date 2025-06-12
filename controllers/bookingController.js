const { supabase } = require('../config/db');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { hotel_id, room_id, check_in, check_out, total_price } = req.body;
    const user_id = req.user.id;

    // Check if room is available
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('is_available')
      .eq('id', room_id)
      .single();
    if (roomError || !room || !room.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for booking'
      });
    }

    // Insert booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([
        {
          user_id,
          hotel_id,
          room_id,
          check_in,
          check_out,
          total_price,
          status: 'confirmed'
        }
      ])
      .select()
      .single();
    if (error) throw error;

    // Mark room as unavailable
    await supabase
      .from('rooms')
      .update({ is_available: false })
      .eq('id', room_id);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for a user
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: { bookings }
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
    const user_id = req.user.id;
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', user_id)
      .single();
    if (error || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking details retrieved successfully',
      data: { booking }
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
    const user_id = req.user.id;
    // Find booking
    const { data: booking, error: findError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', user_id)
      .single();
    if (findError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking status
    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    // Mark room as available again
    await supabase
      .from('rooms')
      .update({ is_available: true })
      .eq('id', booking.room_id);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};

