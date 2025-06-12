require('dotenv').config();
const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create rate-limited axios instance
const http = rateLimit(axios.create(), { maxRPS: 1000 });

// Function to fetch hotels from RapidAPI
async function fetchHotelsFromRapidAPI(page = 1) {
    try {
        const response = await http.get('https://booking-com15.p.rapidapi.com/api/v1/hotels/getFilter', {
            params: {
                page: page,
                limit: 20,
                search_type: 'city',
                arrival_date: '2024-03-20',
                departure_date: '2024-03-25',
                adults: '1',
                children: '0',
                room_qty: '1',
                currency: 'USD'
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
            }
        });

        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching hotels:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

// Function to fetch hotel details
async function fetchHotelDetails(hotelId) {
    try {
        const response = await http.get(`https://booking-com15.p.rapidapi.com/api/v1/hotels/getHotelDetails`, {
            params: {
                hotel_id: hotelId,
                arrival_date: '2024-03-20',
                departure_date: '2024-03-25',
                adults: '1',
                children: '0',
                room_qty: '1',
                currency: 'USD'
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
            }
        });

        console.log('Hotel Details Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching hotel details:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

// Function to fetch nearby cities
async function fetchNearbyCities(latitude, longitude) {
    try {
        const response = await http.get('https://booking-com15.p.rapidapi.com/api/v1/hotels/getNearbyCities', {
            params: {
                latitude: latitude,
                longitude: longitude
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
            }
        });

        console.log('Nearby Cities Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching nearby cities:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

// Function to fetch hotel photos
async function fetchHotelPhotos(hotelId) {
    try {
        const response = await http.get(`https://booking-com15.p.rapidapi.com/api/v1/hotels/getHotelPhotos`, {
            params: {
                hotel_id: hotelId
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
            }
        });

        console.log('Hotel Photos Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching hotel photos:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

// Function to insert hotels into Supabase
async function insertHotelsIntoSupabase(hotels) {
    try {
        const { data, error } = await supabase
            .from('hotels')
            .insert(hotels)
            .select();

        if (error) {
            console.error('Error inserting hotels:', error);
            throw error;
        }

        console.log('Hotels inserted successfully:', data);
        return data;
    } catch (error) {
        console.error('Error in insertHotelsIntoSupabase:', error);
        throw error;
    }
}

// Main function to fetch and insert hotels
async function main() {
    try {
        // Fetch first page of hotels
        const hotelsData = await fetchHotelsFromRapidAPI(1);
        
        if (!hotelsData || !hotelsData.data || !hotelsData.data.hotels) {
            console.error('Invalid response format from API');
            return;
        }

        const hotels = hotelsData.data.hotels.map(hotel => ({
            name: hotel.hotel_name,
            description: hotel.hotel_info?.description || 'No description available',
            location: hotel.hotel_info?.address || 'Location not available',
            star_rating: hotel.hotel_info?.star_rating || 0,
            price_per_night: hotel.min_price || 0,
            image_url: hotel.main_photo_url || null,
            amenities: hotel.hotel_info?.amenities || [],
            latitude: hotel.latitude,
            longitude: hotel.longitude
        }));

        // Insert hotels into Supabase
        await insertHotelsIntoSupabase(hotels);

        console.log('Successfully fetched and inserted hotels');
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

// Run the main function
main(); 