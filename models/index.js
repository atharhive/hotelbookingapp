const User = require('./User');
const Hotel = require('./Hotel');
const Room = require('./Room');
const Booking = require('./Booking');

// Define associations
User.hasMany(Hotel, { foreignKey: 'createdBy', as: 'hotels' });
Hotel.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Hotel.hasMany(Room, { foreignKey: 'hotelId', as: 'rooms' });
Room.belongsTo(Hotel, { foreignKey: 'hotelId', as: 'hotel' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Room.hasMany(Booking, { foreignKey: 'roomId', as: 'bookings' });
Booking.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

Hotel.hasMany(Booking, { foreignKey: 'hotelId', as: 'bookings' });
Booking.belongsTo(Hotel, { foreignKey: 'hotelId', as: 'hotel' });

module.exports = {
  User,
  Hotel,
  Room,
  Booking
};