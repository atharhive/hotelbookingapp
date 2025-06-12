import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to subscribe to booking changes
export const subscribeToBookings = (callback) => {
  return supabase
    .channel('custom-all-bookings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings'
      },
      (payload) => {
        console.log('Change received!', payload);
        callback(payload);
      }
    )
    .subscribe();
};

// Function to subscribe to room availability changes
export const subscribeToRooms = (callback) => {
  return supabase
    .channel('custom-all-rooms')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms'
      },
      (payload) => {
        console.log('Room change received!', payload);
        callback(payload);
      }
    )
    .subscribe();
};

// Function to subscribe to hotel changes
export const subscribeToHotels = (callback) => {
  return supabase
    .channel('custom-all-hotels')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hotels'
      },
      (payload) => {
        console.log('Hotel change received!', payload);
        callback(payload);
      }
    )
    .subscribe();
};

export default supabase; 