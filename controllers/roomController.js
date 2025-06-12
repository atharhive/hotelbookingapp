const { supabase } = require('../config/db');

// @desc    Add new room
// @route   POST /api/rooms
// @access  Private (Admin only)
const addRoom = async (req, res, next) => {
  try {
    const { hotel_id, room_type, price_per_night, max_guests, amenities, is_available } = req.body;

    // Check if hotel exists
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id')
      .eq('id', hotel_id)
      .single();
    if (hotelError || !hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Insert new room
    const { data: room, error } = await supabase
      .from('rooms')
      .insert([
        {
          hotel_id,
          room_type,
          price_per_night,
          max_guests,
          amenities,
          is_available: is_available !== undefined ? is_available : true
        }
      ])
      .select()
      .single();
    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Room added successfully',
      data: { room }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rooms with filters
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res, next) => {
  try {
    const { hotel_id, room_type, is_available, page = 1, limit = 10 } = req.query;
    let query = supabase.from('rooms').select('*', { count: 'exact' });

    if (hotel_id) query = query.eq('hotel_id', hotel_id);
    if (room_type) query = query.ilike('room_type', `%${room_type}%`);
    if (is_available !== undefined) query = query.eq('is_available', is_available === 'true');

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const from = (pageNumber - 1) * limitNumber;
    const to = from + limitNumber - 1;
    query = query.range(from, to);

    const { data: rooms, count, error } = await query;
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Rooms retrieved successfully',
      data: {
        rooms,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil((count || 0) / limitNumber),
          totalRooms: count || 0,
          hasNextPage: pageNumber < Math.ceil((count || 0) / limitNumber),
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
    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error || !room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room details retrieved successfully',
      data: { room }
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
    const { data: room, error: findError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (findError || !room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const { data: updatedRoom, error } = await supabase
      .from('rooms')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: { room: updatedRoom }
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
    const { data: room, error: findError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (findError || !room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;

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
