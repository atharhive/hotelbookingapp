const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel ID is required']
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['single', 'double', 'deluxe', 'suite', 'family'],
    trim: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Room Service', 'Bathtub', 'Safe', 'Coffee Maker', 'Gym Access'],
    trim: true
  }],
  maxGuests: {
    type: Number,
    required: [true, 'Maximum guests is required'],
    min: [1, 'Maximum guests must be at least 1'],
    max: [10, 'Maximum guests cannot exceed 10']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  bedType: {
    type: String,
    enum: ['single', 'double', 'queen', 'king'],
    required: [true, 'Bed type is required']
  },
  size: {
    type: Number, // in square meters
    min: [10, 'Room size must be at least 10 square meters']
  }
}, {
  timestamps: true
});

// Compound index to ensure unique room numbers per hotel
roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

// Index for search optimization
roomSchema.index({ hotelId: 1, roomType: 1, pricePerNight: 1 });
roomSchema.index({ amenities: 1 });

module.exports = mongoose.model('Room', roomSchema);
