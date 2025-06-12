const { supabase } = require('../config/db');
const axios = require('axios');

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
    const { name, description, location, star_rating } = req.body;

    // Check if hotel with same name and location already exists
    const { data: existingHotels, error: findError } = await supabase
      .from('hotels')
      .select('*')
      .eq('name', name)
      .eq('location', location);
    if (findError) throw findError;
    if (existingHotels && existingHotels.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Hotel with this name already exists in this location'
      });
    }

    // Insert new hotel
    const { data: hotel, error } = await supabase
      .from('hotels')
      .insert([
        {
          name,
          description,
          location,
          star_rating,
          created_by: req.user.id
        }
      ])
      .select()
      .single();
    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Hotel added successfully',
      data: { hotel }
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
    let query = supabase.from('hotels').select('*', { count: 'exact' });

    if (location) query = query.ilike('location', `%${location}%`);
    if (name) query = query.ilike('name', `%${name}%`);
    if (star) query = query.eq('star_rating', parseInt(star));

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const from = (pageNumber - 1) * limitNumber;
    const to = from + limitNumber - 1;
    query = query.range(from, to);

    const { data: hotels, count, error } = await query;
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Hotels retrieved successfully',
      data: {
        hotels,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil((count || 0) / limitNumber),
          totalHotels: count || 0,
          hasNextPage: pageNumber < Math.ceil((count || 0) / limitNumber),
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
    const { data: hotel, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error || !hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Get rooms for this hotel
    const { data: rooms, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotel.id)
      .eq('is_available', true);
    if (roomError) throw roomError;

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
    const { data: hotel, error: findError } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (findError || !hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    const { data: updatedHotel, error } = await supabase
      .from('hotels')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      data: { hotel: updatedHotel }
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
    const { data: hotel, error: findError } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (findError || !hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed sample hotels
// @route   POST /api/hotels/seed
// @access  Public (for development)
const seedHotels = async (req, res, next) => {
  try {
    // Sample hotels to insert
    const sampleHotels = [
      {
        name: 'Grand Palace Hotel',
        description: 'Luxury hotel in the heart of the city',
        location: 'New Delhi',
        star_rating: 5,
        created_by: 'system',
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'],
        amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant'],
        rooms: [
          {
            type: 'Deluxe Room',
            price_per_night: 150,
            capacity: 2,
            amenities: ['WiFi', 'TV', 'Mini Bar']
          },
          {
            type: 'Suite',
            price_per_night: 300,
            capacity: 4,
            amenities: ['WiFi', 'TV', 'Mini Bar', 'Living Room']
          }
        ]
      },
      {
        name: 'Seaside Resort',
        description: 'Beautiful resort with ocean views',
        location: 'Mumbai',
        star_rating: 4,
        created_by: 'system',
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'],
        amenities: ['WiFi', 'Pool', 'Beach Access', 'Restaurant', 'Bar'],
        rooms: [
          {
            type: 'Ocean View Room',
            price_per_night: 200,
            capacity: 2,
            amenities: ['WiFi', 'TV', 'Ocean View']
          },
          {
            type: 'Family Suite',
            price_per_night: 400,
            capacity: 6,
            amenities: ['WiFi', 'TV', 'Ocean View', 'Kitchen']
          }
        ]
      },
      {
        name: 'Mountain View Lodge',
        description: 'Cozy lodge in the mountains',
        location: 'Bangalore',
        star_rating: 3,
        created_by: 'system',
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'],
        amenities: ['WiFi', 'Fireplace', 'Restaurant', 'Hiking Trails'],
        rooms: [
          {
            type: 'Standard Room',
            price_per_night: 100,
            capacity: 2,
            amenities: ['WiFi', 'TV', 'Mountain View']
          },
          {
            type: 'Cabin',
            price_per_night: 250,
            capacity: 4,
            amenities: ['WiFi', 'TV', 'Mountain View', 'Fireplace']
          }
        ]
      }
    ];

    // First, clear existing hotels
    const { error: deleteError } = await supabase
      .from('hotels')
      .delete()
      .neq('id', 0); // This will delete all hotels
    if (deleteError) throw deleteError;

    // Then insert sample hotels
    const { data: hotels, error } = await supabase
      .from('hotels')
      .insert(sampleHotels)
      .select();
    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Sample hotels seeded successfully',
      data: { hotels }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch live hotel data from a public API and store in Supabase
// @route   POST /api/hotels/fetch-live
// @access  Private (Admin only)
const fetchLiveHotels = async (req, res, next) => {
  try {
    // Replace with your actual API key and endpoint
    const apiKey = process.env.RAPIDAPI_KEY;
    const apiUrl = 'https://hotels4.p.rapidapi.com/locations/v3/search';

    const response = await axios.get(apiUrl, {
      params: {
        q: 'New York',
        locale: 'en_US',
        langid: '1033',
        siteid: '300000001'
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
      }
    });

    const hotels = response.data.suggestions[0].entities.map(hotel => ({
      name: hotel.name,
      description: `Hotel in ${hotel.name}`,
      location: hotel.name,
      star_rating: Math.floor(Math.random() * 5) + 1, // Random star rating
      created_by: req.user.id
    }));

    // Insert fetched hotels into Supabase
    const { data, error } = await supabase
      .from('hotels')
      .insert(hotels)
      .select();
    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Live hotel data fetched and stored successfully',
      data: { hotels: data }
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
  deleteHotel,
  seedHotels,
  fetchLiveHotels
};
