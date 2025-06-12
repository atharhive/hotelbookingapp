 const { supabase } = require('./config/db');
require('dotenv').config();

async function seedDatabase() {
  try {
    // Sample hotels to insert
    const sampleHotels = [
      {
        name: 'Grand Palace Hotel',
        description: 'Luxury hotel in the heart of the city',
        location: 'New Delhi',
        star_rating: 5
      },
      {
        name: 'Seaside Resort',
        description: 'Beautiful resort with ocean views',
        location: 'Mumbai',
        star_rating: 4
      },
      {
        name: 'Mountain View Lodge',
        description: 'Cozy lodge in the mountains',
        location: 'Bangalore',
        star_rating: 3
      }
    ];

    // Insert hotels
    const { data: hotels, error } = await supabase
      .from('hotels')
      .insert(sampleHotels)
      .select();

    if (error) throw error;

    console.log('Database seeded successfully!');
    console.log('Inserted hotels:', hotels);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();